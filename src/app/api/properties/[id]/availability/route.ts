import { NextResponse } from "next/server";
import {
  bool,
  handleServiceError,
  num,
  readBody,
  requireApiSession,
  str,
} from "@/lib/api";
import { ServiceError } from "@/lib/booking-service";
import { isoDate, parseISODate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiSession(["HOST", "ADMIN"]);
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const body = await readBody(request);

  const property = await prisma.property.findUnique({
    where: { id },
    select: { id: true, hostId: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }
  if (auth.session.role !== "ADMIN" && property.hostId !== auth.session.id) {
    return NextResponse.json(
      { error: "You do not have access to this listing." },
      { status: 403 }
    );
  }

  try {
    const date = parseISODate(str(body.date));
    if (!date) throw new ServiceError("Choose a valid calendar date.");

    const isAvailable = bool(body.isAvailable);
    const rawPrice = body.customPrice;
    let customPrice: number | null = null;

    if (rawPrice !== null && rawPrice !== undefined && rawPrice !== "") {
      const price = num(rawPrice);
      if (!Number.isFinite(price) || price <= 0 || price > 100000) {
        throw new ServiceError(
          "Enter a custom price between €1 and €100,000, or leave it blank."
        );
      }
      customPrice = price;
    }

    if (isAvailable) {
      const held = await prisma.booking.findFirst({
        where: {
          propertyId: property.id,
          status: "CONFIRMED",
          checkIn: { lte: date },
          checkOut: { gt: date },
        },
        select: { reference: true },
      });
      if (held) {
        return NextResponse.json(
          {
            error:
              "That night is held by a confirmed reservation. Cancel the booking first to reopen it.",
          },
          { status: 409 }
        );
      }
    }

    const row = await prisma.availabilityCalendar.upsert({
      where: { propertyId_date: { propertyId: property.id, date } },
      update: { isAvailable, customPrice },
      create: { propertyId: property.id, date, isAvailable, customPrice },
    });

    return NextResponse.json({
      day: {
        date: isoDate(row.date),
        isAvailable: row.isAvailable,
        customPrice: row.customPrice !== null ? Number(row.customPrice) : null,
        booked: false,
      },
    });
  } catch (error) {
    return handleServiceError(error);
  }
}
