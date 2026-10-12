"use server";

import { headers } from "next/headers";
import { CONTACT_TOPICS } from "@/config/contact";
import { site } from "@/config/site";
import { FormReader, type FieldErrors } from "@/lib/forms";
import { sendEmail, shopInbox } from "@/lib/server/email";
import { contactNotificationEmail } from "@/lib/server/emails";
import { getDb, ServiceUnavailableError } from "@/lib/server/env";
import { verifyTurnstile } from "@/lib/server/turnstile";

export type ContactState = { status: "idle" } | { status: "error"; message: string; errors?: FieldErrors } | { status: "ok" };

export async function sendContactMessage(_prev: ContactState, fd: FormData): Promise<ContactState> {
  const f = new FormReader(fd);
  const topic = f.oneOf("topic", CONTACT_TOPICS, "Topic");
  const name = f.text("name", { required: true, max: 120, label: "Name" });
  const email = f.email("email");
  const phone = f.phone("phone", false);
  const company = f.text("company", { max: 160 });
  const message = f.longText("message", { required: true, max: 4000, label: "Message" });
  if (!f.ok) return { status: "error", message: "Please check the highlighted fields.", errors: f.errors };

  const ip = (await headers()).get("cf-connecting-ip");
  if (!(await verifyTurnstile(fd.get("cf-turnstile-response") as string | null, ip))) {
    return { status: "error", message: "The spam check failed. Please try again." };
  }

  try {
    const db = await getDb();
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await db
      .prepare("INSERT INTO messages (id, created_at, topic, name, email, phone, company, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(id, createdAt, topic, name, email, phone || null, company || null, message)
      .run();
    const r = await sendEmail(contactNotificationEmail({ topic, name, email, phone, company, message }, await shopInbox(), `${site.url}/admin/messages`));
    if (!r.ok) console.error("contact email failed", r.error);
    return { status: "ok" };
  } catch (e) {
    console.error("sendContactMessage failed", e);
    return {
      status: "error",
      message:
        e instanceof ServiceUnavailableError
          ? `The form is temporarily unavailable. Please email ${site.email} or call ${site.phones[0].display}.`
          : `Something went wrong. Please email ${site.email}.`,
    };
  }
}
