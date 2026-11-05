import { NextResponse } from "next/server";
import { handleServiceError, readBody, requireApiSession, str } from "@/lib/api";
import { createBooking } from "@/lib/booking-service";

export async function POST(request: Request) {
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;

  const body = await readBody(request);

  try {
    const booking = await createBooking({
      propertyId: str(body.propertyId),
      guestId: auth.session.id,
      checkInISO: str(body.checkIn),
      checkOutISO: str(body.checkOut),
    });
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return handleServiceError(error);
  }
}
