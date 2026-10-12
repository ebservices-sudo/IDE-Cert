import "server-only";
import { turnstileSiteKey } from "@/config/turnstile";
import { getSecret } from "./env";

/**
 * Verifies a Cloudflare Turnstile token. Turnstile is optional: without both
 * the public site key (build) and TURNSTILE_SECRET_KEY (runtime) the check is
 * skipped, with a warning in production, so a misconfiguration never blocks orders.
 */
export async function verifyTurnstile(token: string | null, ip?: string | null): Promise<boolean> {
  const secret = await getSecret("TURNSTILE_SECRET_KEY");
  // No widget was built in (no site key) or no secret: skip, never block orders.
  if (!turnstileSiteKey || !secret) {
    if (process.env.NODE_ENV === "production") console.warn("Turnstile site key or secret missing: spam protection is off.");
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
