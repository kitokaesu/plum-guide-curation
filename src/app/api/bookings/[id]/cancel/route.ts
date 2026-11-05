import { NextResponse } from "next/server";
import {
  handleServiceError,
  readBody,
  requireApiSession,
  str,
} from "@/lib/api";
import { cancelBooking } from "@/lib/booking-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const body = await readBody(request);

  try {
    const result = await cancelBooking({
      bookingId: id,
      userId: auth.session.id,
      reason: str(body.reason),
      isAdmin: auth.session.role === "ADMIN",
    });
    return NextResponse.json(result);
  } catch (error) {
    return handleServiceError(error);
  }
}
