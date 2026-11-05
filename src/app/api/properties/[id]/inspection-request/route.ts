import { NextResponse } from "next/server";
import {
  handleServiceError,
  readBody,
  requireApiSession,
  str,
} from "@/lib/api";
import { ServiceError } from "@/lib/booking-service";
import { getD1 } from "@/lib/d1";
import { formatDateTime } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiSession(["HOST"]);
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const body = await readBody(request);
  const slotId = str(body.slotId);

  if (!slotId) {
    return NextResponse.json(
      { error: "Choose an available inspection slot." },
      { status: 400 }
    );
  }

  try {
    const property = await prisma.property.findUnique({
      where: { id },
      select: { id: true, hostId: true, status: true, title: true },
    });
    if (!property) throw new ServiceError("Property not found.", 404);
    if (property.hostId !== auth.session.id) {
      throw new ServiceError("You do not have access to this listing.", 403);
    }
    if (property.status !== "DRAFT" && property.status !== "REJECTED") {
      throw new ServiceError(
        property.status === "APPROVED"
          ? "This home is already Plum Approved."
          : "A Plum Test is already scheduled for this home.",
        409
      );
    }

    const slot = await prisma.inspectionSlot.findUnique({
      where: { id: slotId },
      include: { specialist: { select: { fullName: true } } },
    });

    if (!slot) throw new ServiceError("That inspection slot no longer exists.", 404);
    if (slot.status !== "AVAILABLE" || slot.propertyId) {
      throw new ServiceError(
        "That slot has just been taken. Please choose another time.",
        409
      );
    }
    if (slot.slotDatetime.getTime() <= Date.now()) {
      throw new ServiceError("That slot is in the past. Please choose another time.", 409);
    }

    // Both writes execute as one atomic D1 batch. The property only moves to
    // INSPECTION_PENDING when the conditional slot claim actually succeeded.
    const db = await getD1();
    const results = await db.batch([
      db
        .prepare(
          `UPDATE "inspection_slots"
           SET "property_id" = ?, "status" = 'BOOKED'
           WHERE "id" = ? AND "status" = 'AVAILABLE' AND "property_id" IS NULL`
        )
        .bind(property.id, slot.id),
      db
        .prepare(
          `UPDATE "properties"
           SET "status" = 'INSPECTION_PENDING', "plum_score" = NULL
           WHERE "id" = ?
             AND EXISTS (
               SELECT 1 FROM "inspection_slots"
               WHERE "id" = ? AND "status" = 'BOOKED' AND "property_id" = ?
             )`
        )
        .bind(property.id, slot.id, property.id),
    ]);

    if ((results[0]?.meta.changes ?? 0) !== 1) {
      throw new ServiceError(
        "That slot has just been taken. Please choose another time.",
        409
      );
    }

    const result = {
      slotId: slot.id,
      specialist: slot.specialist.fullName,
      slotDatetime: slot.slotDatetime.toISOString(),
    };

    return NextResponse.json({
      ok: true,
      ...result,
      message: `Plum Test booked with ${result.specialist} for ${formatDateTime(result.slotDatetime)}.`,
    });
  } catch (error) {
    return handleServiceError(error);
  }
}
