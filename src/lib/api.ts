import { NextResponse } from "next/server";
import { getSession } from "./auth";
import type { Role } from "./constants";
import type { SessionUser } from "./session-types";
import { ServiceError } from "./booking-service";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireApiSession(
  roles?: Role[]
): Promise<{ session: SessionUser } | { response: NextResponse }> {
  const session = await getSession();
  if (!session) {
    return {
      response: jsonError("Please sign in to continue.", 401),
    };
  }
  if (roles && !roles.includes(session.role)) {
    return {
      response: jsonError(
        "This action is not available for your account type.",
        403
      ),
    };
  }
  return { session };
}

export async function readBody(
  request: Request
): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function num(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Number.NaN;
}

export function bool(value: unknown): boolean {
  return value === true || value === "true";
}

export function safeNext(value: unknown, fallback = "/dashboard") {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : fallback;
}

export function handleServiceError(error: unknown) {
  if (error instanceof ServiceError) {
    return jsonError(error.message, error.status);
  }
  console.error(error);
  return jsonError("Something went wrong. Please try again.", 500);
}
