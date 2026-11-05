import { NextResponse } from "next/server";
import { handleServiceError, requireApiSession } from "@/lib/api";
import { ServiceError } from "@/lib/booking-service";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiSession(["SPECIALIST"]);
  if ("response" in auth) return auth.response;

  const { id } = await params;

  try {
    const slot = await prisma.inspectionSlot.findUnique({
      where: { id },
      select: { id: true, specialistId: true, status: true },
    });

    if (!slot) throw new ServiceError("Slot not found.", 404);
    if (slot.specialistId !== auth.session.id) {
      throw new ServiceError("You can only manage your own inspection slots.", 403);
    }
    if (slot.status !== "AVAILABLE") {
      throw new ServiceError(
        "Only open slots can be withdrawn. This one is already booked or completed.",
        409
      );
    }

    await prisma.inspectionSlot.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleServiceError(error);
  }
}
