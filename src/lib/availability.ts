import "server-only";

import { addDays, eachNight, isoDate, startOfUTCDay } from "./dates";
import { toNumber } from "./format";
import { prisma } from "./prisma";

export type BookingCalendar = {
  blocked: string[];
  prices: Record<string, number>;
  startISO: string;
  endISO: string;
};

/**
 * Availability for a property over the next `days` days.
 * A night is blocked if the host closed it, or a confirmed reservation covers it.
 */
export async function getBookingCalendar(
  propertyId: string,
  days = 400
): Promise<BookingCalendar> {
  const start = startOfUTCDay(new Date());
  const end = addDays(start, days);

  const [rows, bookings] = await Promise.all([
    prisma.availabilityCalendar.findMany({
      where: { propertyId, date: { gte: start, lt: end } },
      select: { date: true, isAvailable: true, customPrice: true },
    }),
    prisma.booking.findMany({
      where: {
        propertyId,
        status: "CONFIRMED",
        checkIn: { lt: end },
        checkOut: { gt: start },
      },
      select: { checkIn: true, checkOut: true },
    }),
  ]);

  const blocked = new Set<string>();
  const prices: Record<string, number> = {};

  for (const row of rows) {
    const key = isoDate(row.date);
    if (!row.isAvailable) blocked.add(key);
    if (row.customPrice !== null) prices[key] = toNumber(row.customPrice);
  }

  for (const booking of bookings) {
    for (const night of eachNight(booking.checkIn, booking.checkOut)) {
      blocked.add(isoDate(night));
    }
  }

  return {
    blocked: Array.from(blocked).sort(),
    prices,
    startISO: isoDate(start),
    endISO: isoDate(end),
  };
}

export type HostCalendarDay = {
  date: string;
  isAvailable: boolean;
  customPrice: number | null;
  booked: boolean;
};

/** Day-by-day calendar for the host availability manager. */
export async function getHostCalendar(propertyId: string, days = 365) {
  const start = startOfUTCDay(new Date());
  const end = addDays(start, days);

  const [rows, bookings] = await Promise.all([
    prisma.availabilityCalendar.findMany({
      where: { propertyId, date: { gte: start, lt: end } },
      select: { date: true, isAvailable: true, customPrice: true },
    }),
    prisma.booking.findMany({
      where: {
        propertyId,
        status: "CONFIRMED",
        checkIn: { lt: end },
        checkOut: { gt: start },
      },
      select: { checkIn: true, checkOut: true },
    }),
  ]);

  const rowMap = new Map(rows.map((row) => [isoDate(row.date), row]));
  const booked = new Set<string>();
  for (const booking of bookings) {
    for (const night of eachNight(booking.checkIn, booking.checkOut)) {
      booked.add(isoDate(night));
    }
  }

  const result: HostCalendarDay[] = [];
  for (let offset = 0; offset < days; offset += 1) {
    const date = isoDate(addDays(start, offset));
    const row = rowMap.get(date);
    result.push({
      date,
      isAvailable: row ? row.isAvailable : true,
      customPrice: row?.customPrice != null ? toNumber(row.customPrice) : null,
      booked: booked.has(date),
    });
  }

  return result;
}
