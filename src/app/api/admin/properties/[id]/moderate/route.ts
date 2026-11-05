import { NextResponse } from "next/server";
import {
  handleServiceError,
  readBody,
  requireApiSession,
  str,
} from "@/lib/api";
import { ServiceError } from "@/lib/booking-service";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiSession(["ADMIN"]);
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const body = await readBody(request);
  const action = str(body.action).toUpperCase();

  try {
    if (action !== "APPROVE" && action !== "REJECT") {
      throw new ServiceError("Choose whether to approve or reject this home.");
    }

    const property = await prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        plumScore: true,
        host: { select: { email: true } },
      },
    });

    if (!property) throw new ServiceError("Property not found.", 404);
    if (property.plumScore === null) {
      throw new ServiceError(
        "This home has not been inspected yet — there is no Plum Test score to review.",
        409
      );
    }

    const status = action === "APPROVE" ? "APPROVED" : "REJECTED";
    await prisma.property.update({ where: { id }, data: { status } });

    return NextResponse.json({
      ok: true,
      status,
      message:
        status === "APPROVED"
          ? `${property.title} is now live as a Plum Approved home.`
          : `${property.title} has been rejected. The host has been notified.`,
    });
  } catch (error) {
    return handleServiceError(error);
  }
}
