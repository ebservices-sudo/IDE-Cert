"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { site } from "@/config/site";
import { hashPassword, verifyPassword } from "@/lib/auth/crypto";
import { consumeAuthToken, createAuthToken, createSession, destroySession, getCurrentUser } from "@/lib/auth/session";
import { FormReader, type FieldErrors } from "@/lib/forms";
import { sendEmail } from "@/lib/server/email";
import { resetPasswordEmail, verifyEmailEmail } from "@/lib/server/emails";
import { getDb, ServiceUnavailableError } from "@/lib/server/env";
import { requestOrigin, safeNext } from "@/lib/server/origin";
import { verifyTurnstile } from "@/lib/server/turnstile";

export type AuthState = { status: "idle" } | { status: "error"; message: string; errors?: FieldErrors } | { status: "ok"; message: string };

const MIN_PASSWORD = 10;

function unavailable(e: unknown): AuthState {
  console.error(e);
  return {
    status: "error",
    message: e instanceof ServiceUnavailableError ? "Accounts are temporarily unavailable." : `Something went wrong. Please try again or email ${site.email}.`,
  };
}

async function spamCheck(fd: FormData) {
  const ip = (await headers()).get("cf-connecting-ip");
  return verifyTurnstile(fd.get("cf-turnstile-response") as string | null, ip);
}

export async function register(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const f = new FormReader(fd);
  const name = f.text("name", { required: true, max: 120, label: "Name" });
  const email = f.email("email");
  const password = String(fd.get("password") ?? "");
  const company = f.text("company", { max: 160 });
  if (password.length < MIN_PASSWORD) f.errors.password = `Use at least ${MIN_PASSWORD} characters.`;
  if (password.length > 200) f.errors.password = "Password is too long.";
  if (!f.ok) return { status: "error", message: "Please check the highlighted fields.", errors: f.errors };
  if (!(await spamCheck(fd))) return { status: "error", message: "The spam check failed. Please try again." };

  let userId: string;
  try {
    const db = await getDb();
    const exists = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (exists) {
      return { status: "error", message: "An account with this email already exists.", errors: { email: "Already registered — sign in or reset your password." } };
    }
    userId = crypto.randomUUID();
    await db
      .prepare("INSERT INTO users (id, email, name, company, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, 'customer', ?)")
      .bind(userId, email, name, company || null, await hashPassword(password), new Date().toISOString())
      .run();
    await createSession(userId);
    const token = await createAuthToken(userId, "verify_email", 48);
    const r = await sendEmail(verifyEmailEmail(email, name, `${await requestOrigin()}/account/verify?token=${token}`));
    if (!r.ok) console.error("verification email failed", r.error);
  } catch (e) {
    return unavailable(e);
  }
  redirect("/account?welcome=1");
}

export async function login(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const next = safeNext(fd.get("next"));
  if (!email || !password) return { status: "error", message: "Enter your email and password." };
  if (!(await spamCheck(fd))) return { status: "error", message: "The spam check failed. Please try again." };
  try {
    const db = await getDb();
    const row = await db.prepare("SELECT id, password_hash FROM users WHERE email = ?").bind(email).first<{ id: string; password_hash: string }>();
    // Verify against a dummy hash when the user does not exist, so timing does not reveal accounts.
    const ok = await verifyPassword(password, row?.password_hash ?? "pbkdf2$100000$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    if (!row || !ok) return { status: "error", message: "Email or password is not correct." };
    await createSession(row.id);
  } catch (e) {
    return unavailable(e);
  }
  redirect(next);
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function requestPasswordReset(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const f = new FormReader(fd);
  const email = f.email("email");
  if (!f.ok) return { status: "error", message: "Enter a valid email address.", errors: f.errors };
  if (!(await spamCheck(fd))) return { status: "error", message: "The spam check failed. Please try again." };
  try {
    const db = await getDb();
    const row = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first<{ id: string }>();
    if (row) {
      const token = await createAuthToken(row.id, "reset_password", 1);
      const r = await sendEmail(resetPasswordEmail(email, `${await requestOrigin()}/account/reset?token=${token}`));
      if (!r.ok) console.error("reset email failed", r.error);
    }
  } catch (e) {
    return unavailable(e);
  }
  // Same answer whether or not the account exists.
  return { status: "ok", message: "If an account exists for this email, we have sent a link to reset the password." };
}

export async function resetPassword(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const token = String(fd.get("token") ?? "");
  const password = String(fd.get("password") ?? "");
  if (password.length < MIN_PASSWORD) {
    return { status: "error", message: "Please check the highlighted fields.", errors: { password: `Use at least ${MIN_PASSWORD} characters.` } };
  }
  try {
    const userId = await consumeAuthToken(token, "reset_password");
    if (!userId) return { status: "error", message: "This reset link is invalid or has expired. Please request a new one." };
    const db = await getDb();
    // A working reset link proves access to the mailbox, so the email counts as verified.
    await db.batch([
      db.prepare("UPDATE users SET password_hash = ?, email_verified_at = COALESCE(email_verified_at, ?) WHERE id = ?").bind(await hashPassword(password), new Date().toISOString(), userId),
      db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId),
    ]);
    await createSession(userId);
  } catch (e) {
    return unavailable(e);
  }
  redirect("/account?reset=1");
}

export async function resendVerification(): Promise<AuthState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Please sign in." };
  if (user.emailVerified) return { status: "ok", message: "Your email is already confirmed." };
  try {
    const token = await createAuthToken(user.id, "verify_email", 48);
    const r = await sendEmail(verifyEmailEmail(user.email, user.name, `${await requestOrigin()}/account/verify?token=${token}`));
    if (!r.ok) console.error("verification email failed", r.error);
  } catch (e) {
    return unavailable(e);
  }
  return { status: "ok", message: `We have sent a new confirmation link to ${user.email}.` };
}
