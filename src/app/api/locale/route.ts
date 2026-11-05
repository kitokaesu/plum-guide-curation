import { NextResponse } from "next/server";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n";

/** Stores the chosen language for a year. Not sensitive: a UI preference. */
export async function POST(request: Request) {
  let locale: unknown;
  try {
    const body = (await request.json()) as { locale?: unknown };
    locale = body?.locale;
  } catch {
    locale = null;
  }

  if (!isLocale(locale)) {
    return NextResponse.json(
      { error: "Choose English or Portuguese." },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ ok: true, locale });
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
  });
  return response;
}
