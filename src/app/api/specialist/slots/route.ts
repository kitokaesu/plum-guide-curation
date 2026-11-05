import { NextResponse } from "next/server";
import {
  handleServiceError,
  readBody,
  requireApiSession,
  str,
} from "@/lib/api";
import { ServiceError } from "@/lib/booking-service";
import { parseISODate, startOfUTCDay } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export async function POST(request: Request) {
  const auth = await requireApiSession(["SPECIALIST"]);
  if ("response" in auth) return auth.response;

  const body = await readBody(request);
  const date = parseISODate(str(body.date));
  const time = str(body.time);

  try {
    if (!date) throw new ServiceError("Choose a valid inspection date.");
    if (!TIME_PATTERN.test(time)) {
      throw new ServiceError("Choose a start time for the inspection.");
    }
    if (date < startOfUTCDay(new Date())) {
      throw new ServiceError("Inspection slots cannot be in the past.");
    }

    const slotDatetime = new Date(`${date.toISOString().slice(0, 10)}T${time}:00.000Z`);
    if (slotDatetime.getTime() <= Date.now()) {
      throw new ServiceError("That time has already passed today. Choose a later slot.");
    }

    const duplicate = await prisma.inspectionSlot.findFirst({
      where: {
        specialistId: auth.session.id,
        slotDatetime,
        status: { not: "CANCELLED" },
      },
      select: { id: true },
    });
    if (duplicate) {
      throw new ServiceError("You already have a slot at that date and time.", 409);
    }

    const slot = await prisma.inspectionSlot.create({
      data: {
        specialistId: auth.session.id,
        slotDatetime,
        status: "AVAILABLE",
      },
      select: { id: true, slotDatetime: true, status: true },
    });

    return NextResponse.json(
      {
        slot: {
          id: slot.id,
          slotDatetime: slot.slotDatetime.toISOString(),
          status: slot.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleServiceError(error);
  }
}
