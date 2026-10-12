import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb, getEnv } from "@/lib/server/env";
import { randomToken, sha256 } from "./crypto";

// Cookie sessions stored in D1. The cookie holds a random token; the database
// keeps only its SHA-256.

const COOKIE = "idc_session";
const SESSION_DAYS = 30;

export type User = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  company: string | null;
  nui: string | null;
  role: "customer" | "admin";
  emailVerified: boolean;
};

type UserRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  company: string | null;
  nui: string | null;
  role: "customer" | "admin";
  email_verified_at: string | null;
};

export const toUser = (r: UserRow): User => ({
  id: r.id,
  email: r.email,
  name: r.name,
  phone: r.phone,
  company: r.company,
  nui: r.nui,
  role: r.role,
  emailVerified: Boolean(r.email_verified_at),
});

export async function createSession(userId: string) {
  const db = await getDb();
  const token = randomToken();
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 86_400_000);
  await db.batch([
    db.prepare("INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)").bind(await sha256(token), userId, now.toISOString(), expires.toISOString()),
    db.prepare("UPDATE users SET last_login_at = ? WHERE id = ?").bind(now.toISOString(), userId),
    db.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(now.toISOString()),
  ]);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    try {
      const db = await getDb();
      await db.prepare("DELETE FROM sessions WHERE id = ?").bind(await sha256(token)).run();
    } catch {
      // no database: the cookie is removed anyway
    }
  }
  jar.delete(COOKIE);
}

/** The signed-in user for this request, or null. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const env = await getEnv();
  if (!env.DB) return null;
  const row = await env.DB.prepare(
    `SELECT u.id, u.email, u.name, u.phone, u.company, u.nui, u.role, u.email_verified_at
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.expires_at > ?`,
  )
    .bind(await sha256(token), new Date().toISOString())
    .first<UserRow>();
  return row ? toUser(row) : null;
});

export async function requireUser(next = "/account") {
  const user = await getCurrentUser();
  if (!user) redirect(`/account/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin(next = "/admin") {
  const user = await getCurrentUser();
  if (!user) redirect(`/account/login?next=${encodeURIComponent(next)}`);
  if (user.role !== "admin") redirect("/account?denied=admin");
  return user;
}

/** Creates a one-time emailed token (email verification or password reset). */
export async function createAuthToken(userId: string, purpose: "verify_email" | "reset_password", hours: number) {
  const db = await getDb();
  const token = randomToken();
  const now = new Date();
  await db
    .prepare("INSERT INTO auth_tokens (id, user_id, purpose, created_at, expires_at) VALUES (?, ?, ?, ?, ?)")
    .bind(await sha256(token), userId, purpose, now.toISOString(), new Date(now.getTime() + hours * 3_600_000).toISOString())
    .run();
  return token;
}

/** Marks a token used and returns its user id, or null if invalid/expired/used. */
export async function consumeAuthToken(token: string, purpose: "verify_email" | "reset_password") {
  const db = await getDb();
  const now = new Date().toISOString();
  const row = await db
    .prepare("UPDATE auth_tokens SET used_at = ? WHERE id = ? AND purpose = ? AND used_at IS NULL AND expires_at > ? RETURNING user_id")
    .bind(now, await sha256(token), purpose, now)
    .first<{ user_id: string }>();
  return row?.user_id ?? null;
}
