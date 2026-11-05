import { NextResponse } from "next/server";
import {
  handleServiceError,
  num,
  readBody,
  requireApiSession,
  str,
} from "@/lib/api";
import { ServiceError } from "@/lib/booking-service";
import { PLUM_PASS_SCORE } from "@/lib/constants";
import { getD1 } from "@/lib/d1";
import { d1Date } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiSession(["SPECIALIST", "ADMIN"]);
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const body = await readBody(request);
  const score = num(body.score);
  const notes = str(body.notes);

  try {
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      throw new ServiceError("Enter a Plum Test score between 0 and 100.");
    }
    if (notes.length < 10) {
      throw new ServiceError(
        "Add inspection notes of at least 10 characters so the host can act on them."
      );
    }

    const slot = await prisma.inspectionSlot.findUnique({
      where: { id },
      select: {
        id: true,
        specialistId: true,
        propertyId: true,
        status: true,
        property: { select: { id: true, title: true, hostId: true } },
      },
    });

    if (!slot) throw new ServiceError("Inspection not found.", 404);
    if (
      auth.session.role === "SPECIALIST" &&
      slot.specialistId !== auth.session.id
    ) {
      throw new ServiceError("You can only record your own inspections.", 403);
    }
    if (slot.status !== "BOOKED" || !slot.propertyId || !slot.property) {
      throw new ServiceError(
        "Only booked inspections can be completed. This one is not scheduled with a property.",
        409
      );
    }

    const nextStatus = score >= PLUM_PASS_SCORE ? "APPROVED" : "REJECTED";
    const roundedScore = Math.round(score * 10) / 10;

    const propertyId = slot.propertyId as string;
    const db = await getD1();
    const results = await db.batch([
      db
        .prepare(
          `UPDATE "inspection_slots"
           SET "status" = 'COMPLETED', "score" = ?, "report_notes" = ?, "completed_at" = ?
           WHERE "id" = ? AND "status" = 'BOOKED'`
        )
        .bind(roundedScore, notes, d1Date(new Date()), slot.id),
      db
        .prepare(
          `UPDATE "properties" SET "plum_score" = ?, "status" = ?
           WHERE "id" = ?
             AND EXISTS (
               SELECT 1 FROM "inspection_slots"
               WHERE "id" = ? AND "status" = 'COMPLETED' AND "score" = ?
             )`
        )
        .bind(roundedScore, nextStatus, propertyId, slot.id, roundedScore),
    ]);

    if ((results[0]?.meta.changes ?? 0) !== 1) {
      throw new ServiceError("This inspection has already been completed.", 409);
    }

    return NextResponse.json({
      ok: true,
      score: roundedScore,
      propertyStatus: nextStatus,
      message:
        nextStatus === "APPROVED"
          ? `Scored ${roundedScore}. The home has passed the Plum Test and is now approved.`
          : `Scored ${roundedScore}. The home fell below the ${PLUM_PASS_SCORE} pass mark and has been referred to the curation team.`,
    });
  } catch (error) {
    return handleServiceError(error);
  }
}
