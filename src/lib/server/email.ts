import "server-only";
import { site } from "@/config/site";
import { getSecret } from "./env";

export type Email = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

/**
 * Sends through Resend when RESEND_API_KEY is set; otherwise prints the email
 * to the server console (local development). Never throws: a failed email must
 * not lose an order that is already saved.
 */
export async function sendEmail(email: Email): Promise<{ ok: boolean; id?: string; error?: string }> {
  const key = await getSecret("RESEND_API_KEY");
  const from = (await getSecret("MAIL_FROM")) ?? `${site.name} <shop@ide-cert.com>`;
  if (!key) {
    console.info(`\n[email:dev] To: ${[email.to].flat().join(", ")}\n[email:dev] Subject: ${email.subject}\n${email.text}\n`);
    return { ok: true, id: "dev" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email.to].flat(),
        subject: email.subject,
        html: email.html,
        text: email.text,
        reply_to: email.replyTo,
      }),
    });
    if (!res.ok) return { ok: false, error: `Resend ${res.status}: ${await res.text()}` };
    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function shopInbox() {
  return (await getSecret("SHOP_NOTIFY_EMAIL")) ?? site.email;
}
