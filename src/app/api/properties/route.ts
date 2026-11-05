import { NextResponse } from "next/server";
import {
  handleServiceError,
  num,
  readBody,
  requireApiSession,
  str,
} from "@/lib/api";
import { ServiceError } from "@/lib/booking-service";
import { PROPERTY_IMAGE_CHOICES } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const auth = await requireApiSession(["HOST"]);
  if ("response" in auth) return auth.response;

  const body = await readBody(request);
  const title = str(body.title);
  const location = str(body.location);
  const description = str(body.description);
  const imageUrl = str(body.imageUrl);
  const nightlyRate = num(body.nightlyRate);
  const bedrooms = Math.round(num(body.bedrooms));
  const bathrooms = Math.round(num(body.bathrooms));
  const maxGuests = Math.round(num(body.maxGuests));

  try {
    if (title.length < 3) {
      throw new ServiceError("Give your home a title of at least 3 characters.");
    }
    if (location.length < 2) {
      throw new ServiceError("Where is the home located?");
    }
    if (!Number.isFinite(nightlyRate) || nightlyRate < 50 || nightlyRate > 100000) {
      throw new ServiceError("Set a nightly rate between €50 and €100,000.");
    }
    if (!Number.isInteger(bedrooms) || bedrooms < 1 || bedrooms > 30) {
      throw new ServiceError("Enter between 1 and 30 bedrooms.");
    }
    if (!Number.isInteger(bathrooms) || bathrooms < 1 || bathrooms > 30) {
      throw new ServiceError("Enter between 1 and 30 bathrooms.");
    }
    if (!Number.isInteger(maxGuests) || maxGuests < 1 || maxGuests > 60) {
      throw new ServiceError("Enter a guest capacity between 1 and 60.");
    }

    const allowedImage =
      PROPERTY_IMAGE_CHOICES.find((choice) => choice.url === imageUrl)?.url ??
      PROPERTY_IMAGE_CHOICES[0].url;

    const property = await prisma.property.create({
      data: {
        hostId: auth.session.id,
        title,
        location,
        description:
          description ||
          "A newly submitted home awaiting its Plum Test and listing copy.",
        tagline: "Awaiting its Plum Test inspection.",
        imageUrl: allowedImage.startsWith("https://")
          ? allowedImage
          : PROPERTY_IMAGE_CHOICES[0].url,
        nightlyRate,
        bedrooms,
        bathrooms,
        maxGuests,
        status: "DRAFT",
      },
      select: { id: true },
    });

    return NextResponse.json({ id: property.id }, { status: 201 });
  } catch (error) {
    return handleServiceError(error);
  }
}
