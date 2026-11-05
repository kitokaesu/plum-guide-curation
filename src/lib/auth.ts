import "server-only";

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "./constants";
import type { SessionUser } from "./session-types";

export type { SessionUser };

const COOKIE_NAME = "plum_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function secretKey() {
  const secret =
    process.env.AUTH_SECRET ?? "plum-guide-local-development-secret-key-32";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: {
  id: string;
  fullName: string;
  email: string;
  role: string;
}) {
  const token = await new SignJWT({
    name: user.fullName,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub || typeof payload.name !== "string" || typeof payload.role !== "string") {
      return null;
    }
    return {
      id: payload.sub,
      name: payload.name,
      email: String(payload.email ?? ""),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export async function requireUser(nextPath?: string): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    const target = nextPath
      ? `/login?next=${encodeURIComponent(nextPath)}`
      : "/login";
    redirect(target);
  }
  return session;
}

export async function requireRole(role: Role): Promise<SessionUser> {
  const session = await requireUser();
  if (session.role !== role) redirect("/dashboard");
  return session;
}
