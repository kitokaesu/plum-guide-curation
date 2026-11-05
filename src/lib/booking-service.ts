import "server-only";

import {
  d1Date,
  eachNight,
  formatDate,
  isoDate,
  nightsBetween,
  parseISODate,
  startOfUTCDay,
} from "./dates";
import { getD1 } from "./d1";
import { toNumber } from "./format";
import { prisma } from "./prisma";
import {
  buildQuote,
  MAX_NIGHTS,
  priceForNight,
  refundFor,
} from "./pricing";

export class ServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ServiceError";
    this.status = status;
  }
}

function newId() {
  return crypto.randomUUID();
}

function newReference() {
  return `PLM-${newReferencePart()}`;
}

function newReferencePart() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 7).toUpperCase();
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export type CreatedBooking = {
  id: string;
  reference: string;
  total: number;
  nights: number;
};

/**
 * Creates a booking and claims every night atomically.
 *
 * Cloudflare D1 runs a batch as a single transaction, so the booking row and
 * its `booking_nights` rows commit together or not at all. The unique index on
 * (property_id, date) rejects a second guest racing for the same night, and a
 * trigger rejects nights the host has closed. No read-then-write gap remains.
 */
export async function createBooking(input: {
  propertyId: string;
  guestId: string;
  checkInISO: string;
  checkOutISO: string;
}): Promise<CreatedBooking> {
  const checkIn = parseISODate(input.checkInISO);
  const checkOut = parseISODate(input.checkOutISO);

  if (!checkIn || !checkOut) {
    throw new ServiceError("Please choose a valid check-in and check-out date.");
  }

  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) {
    throw new ServiceError("Your stay must include at least one night.");
  }
  if (nights > MAX_NIGHTS) {
    throw new ServiceError(
      `Stays are limited to ${MAX_NIGHTS} nights. Please contact our concierge for longer visits.`
    );
  }
  if (nights > 0 && checkIn < startOfUTCDay(new Date())) {
    throw new ServiceError("Check-in cannot be in the past.");
  }

  const property = await prisma.property.findUnique({
    where: { id: input.propertyId },
    select: { id: true, title: true, status: true, nightlyRate: true },
  });

  if (!property) throw new ServiceError("That home could not be found.", 404);
  if (property.status !== "APPROVED") {
    throw new ServiceError(
      "This home is not currently open for bookings — it is still completing the Plum Test.",
      409
    );
  }

  const baseRate = toNumber(property.nightlyRate);

  const calendar = await prisma.availabilityCalendar.findMany({
    where: {
      propertyId: property.id,
      date: { gte: checkIn, lt: checkOut },
    },
    select: { date: true, isAvailable: true, customPrice: true },
  });

  const closedNight = calendar.find((row) => !row.isAvailable);
  if (closedNight) {
    throw new ServiceError(
      `${formatDate(closedNight.date)} is no longer available. Please choose different dates.`,
      409
    );
  }

  const priceMap = new Map(
    calendar.map((row) => [isoDate(row.date), row.customPrice])
  );
  const nightList = eachNight(checkIn, checkOut).map(isoDate);
  const quote = buildQuote(nightList, (night) =>
    priceForNight(baseRate, toNumber(priceMap.get(night)))
  );

  const db = await getD1();
  const bookingId = newId();

  // A reference collision is vanishingly rare; retry once with a fresh code.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const reference = newReference();
    const statements = [
      db
        .prepare(
          `INSERT INTO "bookings"
             ("id", "reference", "property_id", "guest_id", "check_in", "check_out",
              "nights", "nightly_subtotal", "cleaning_fee", "service_fee",
              "total_price", "status", "created_at")
           SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?
           FROM "properties"
           WHERE "id" = ? AND "status" = 'APPROVED'`
        )
        .bind(
          bookingId,
          reference,
          property.id,
          input.guestId,
          d1Date(checkIn),
          d1Date(checkOut),
          quote.nights,
          quote.nightlySubtotal,
          quote.cleaningFee,
          quote.serviceFee,
          quote.total,
          d1Date(new Date()),
          property.id
        ),
      ...nightList.map((night) => {
        const date = parseISODate(night);
        if (!date) throw new ServiceError("Please choose valid dates.");
        return db
          .prepare(
            `INSERT INTO "booking_nights" ("id", "booking_id", "property_id", "date")
             VALUES (?, ?, ?, ?)`
          )
          .bind(newId(), bookingId, property.id, d1Date(date));
      }),
    ];

    try {
      await db.batch(statements);
      return {
        id: bookingId,
        reference,
        total: quote.total,
        nights: quote.nights,
      };
    } catch (error) {
      const message = errorMessage(error);
      if (message.includes("bookings.reference")) continue;
      if (message.includes("NIGHT_CLOSED")) {
        throw new ServiceError(
          "One of those nights has just been closed by the host. Please choose different dates.",
          409
        );
      }
      if (message.includes("booking_nights")) {
        throw new ServiceError(
          "Those dates have just been reserved by another guest. Please choose different dates.",
          409
        );
      }
      if (message.includes("FOREIGN KEY")) {
        throw new ServiceError(
          "This home is no longer open for bookings. Please choose another Plum home.",
          409
        );
      }
      throw error;
    }
  }

  throw new ServiceError(
    "We could not confirm that reservation. Please try again.",
    500
  );
}

export type CancelledBooking = {
  refundAmount: number;
  refundPercent: number;
  cancellationId: string;
};

/**
 * Cancels a reservation, records the policy refund and releases every night in
 * one D1 batch. The unique cancellations.booking_id index makes a double
 * cancellation impossible, and the whole batch rolls back when it fires.
 */
export async function cancelBooking(input: {
  bookingId: string;
  userId: string;
  reason: string;
  isAdmin?: boolean;
}): Promise<CancelledBooking> {
  const reason = input.reason.trim();
  if (reason.length < 10) {
    throw new ServiceError(
      "Please tell us briefly why you are cancelling (at least 10 characters)."
    );
  }

  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    select: {
      id: true,
      guestId: true,
      propertyId: true,
      checkIn: true,
      checkOut: true,
      status: true,
      totalPrice: true,
      cancellation: { select: { id: true } },
    },
  });

  if (!booking) throw new ServiceError("Reservation not found.", 404);
  if (!input.isAdmin && booking.guestId !== input.userId) {
    throw new ServiceError("You do not have access to this reservation.", 403);
  }
  if (booking.status === "CANCELLED" || booking.cancellation) {
    throw new ServiceError("This reservation has already been cancelled.", 409);
  }
  if (booking.status !== "CONFIRMED") {
    throw new ServiceError("Only confirmed reservations can be cancelled.", 409);
  }

  const refund = refundFor(booking.checkIn, toNumber(booking.totalPrice));
  const cancellationId = newId();
  const nightDates = eachNight(booking.checkIn, booking.checkOut).map((night) =>
    d1Date(night)
  );
  const db = await getD1();

  const placeholders = nightDates.map(() => "?").join(", ");
  const statements = [
    db
      .prepare(
        `UPDATE "bookings" SET "status" = 'CANCELLED'
         WHERE "id" = ? AND "status" = 'CONFIRMED'`
      )
      .bind(booking.id),
    db
      .prepare(
        `INSERT INTO "cancellations"
           ("id", "booking_id", "cancelled_by", "reason", "refund_amount",
            "refund_percent", "admin_override", "created_at")
         SELECT ?, "id", ?, ?, ?, ?, 0, ?
         FROM "bookings"
         WHERE "id" = ? AND "status" = 'CANCELLED'`
      )
      .bind(
        cancellationId,
        input.userId,
        reason,
        refund.amount,
        refund.percent,
        d1Date(new Date()),
        booking.id
      ),
    db
      .prepare(
        `DELETE FROM "booking_nights"
         WHERE "booking_id" = ?
           AND EXISTS (
             SELECT 1 FROM "bookings" WHERE "id" = ? AND "status" = 'CANCELLED'
           )`
      )
      .bind(booking.id, booking.id),
    db
      .prepare(
        `UPDATE "availability_calendars" SET "is_available" = 1
         WHERE "property_id" = ? AND "date" IN (${placeholders})
           AND EXISTS (
             SELECT 1 FROM "bookings" WHERE "id" = ? AND "status" = 'CANCELLED'
           )`
      )
      .bind(booking.propertyId, ...nightDates, booking.id),
  ];

  try {
    const results = await db.batch(statements);
    const inserted = results[1]?.meta.changes ?? 0;
    if (inserted !== 1) {
      throw new ServiceError(
        "This reservation is no longer eligible for cancellation.",
        409
      );
    }
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    const message = errorMessage(error);
    if (message.includes("cancellations.booking_id")) {
      throw new ServiceError("This reservation has already been cancelled.", 409);
    }
    throw error;
  }

  return {
    refundAmount: refund.amount,
    refundPercent: refund.percent,
    cancellationId,
  };
}
