import { NextResponse } from "next/server";
import {
  handleServiceError,
  num,
  readBody,
  requireApiSession,
  str,
} from "@/lib/api";
import { ServiceError } from "@/lib/booking-service";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiSession(["HOST", "ADMIN"]);
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const body = await readBody(request);
  const property = await prisma.property.findUnique({
    where: { id },
    select: { hostId: true },
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
    const data: { title?: string; nightlyRate?: number } = {};

    if (body.title !== undefined) {
      const title = str(body.title);
      if (title.length < 3) {
        throw new ServiceError("The listing title must be at least 3 characters.");
      }
      data.title = title;
    }

    if (body.nightlyRate !== undefined) {
      const rate = num(body.nightlyRate);
      if (!Number.isFinite(rate) || rate < 50 || rate > 100000) {
        throw new ServiceError("Set a nightly rate between €50 and €100,000.");
      }
      data.nightlyRate = rate;
    }

    if (Object.keys(data).length === 0) {
      throw new ServiceError("Nothing to update.");
    }

    const updated = await prisma.property.update({
      where: { id },
      data,
      select: { id: true, title: true, nightlyRate: true },
    });

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      nightlyRate: Number(updated.nightlyRate),
    });
  } catch (error) {
    return handleServiceError(error);
  }
}
