import { NextResponse } from "next/server";
import {
  handleServiceError,
  num,
  readBody,
  requireApiSession,
} from "@/lib/api";
import { ServiceError } from "@/lib/booking-service";
import { roundMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiSession(["ADMIN"]);
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const body = await readBody(request);
  const refundAmount = num(body.refundAmount);

  try {
    if (!Number.isFinite(refundAmount) || refundAmount < 0) {
      throw new ServiceError("Enter a refund amount of zero or more.");
    }

    const cancellation = await prisma.cancellation.findUnique({
      where: { id },
      select: {
        id: true,
        booking: { select: { totalPrice: true, reference: true } },
      },
    });

    if (!cancellation) throw new ServiceError("Cancellation not found.", 404);

    const total = Number(cancellation.booking.totalPrice);
    if (refundAmount > total) {
      throw new ServiceError(
        `The refund cannot exceed the booking total of €${total.toLocaleString("en-GB")}.`
      );
    }

    const updated = await prisma.cancellation.update({
      where: { id },
      data: {
        refundAmount: roundMoney(refundAmount),
        adminOverride: true,
      },
      select: { id: true, refundAmount: true },
    });

    return NextResponse.json({
      ok: true,
      refundAmount: Number(updated.refundAmount),
      message: `Refund for ${cancellation.booking.reference} updated to €${Number(
        updated.refundAmount
      ).toLocaleString("en-GB")}.`,
    });
  } catch (error) {
    return handleServiceError(error);
  }
}
