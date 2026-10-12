import "server-only";
import { getSecret } from "./env";

/**
 * Verifies a Cloudflare Turnstile token. Turnstile is optional: without
 * TURNSTILE_SECRET_KEY the check is skipped (with a warning in production)
 * so a missing secret never blocks orders.
 */
export async function verifyTurnstile(token: string | null, ip?: string | null): Promise<boolean> {
  const secret = await getSecret("TURNSTILE_SECRET_KEY");
  if (!secret) {
    if (process.env.NODE_ENV === "production") console.warn("TURNSTILE_SECRET_KEY is not set: spam protection is off.");
    return true;
  }
  if (!token) return false;
  const body = new FormData();
  body.set("secret", secret);
  body.set("response", token);
  if (ip) body.set("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}
