"use server";

import { headers } from "next/headers";
import { site } from "@/config/site";
import { FormReader, type FieldErrors } from "@/lib/forms";
import { getCatalog } from "@/lib/catalog/data";
import { createQuote, type QuoteItem } from "@/lib/orders/store";
import { optionsText } from "@/lib/orders/pricing";
import { sendEmail, shopInbox } from "@/lib/server/email";
import { quoteConfirmationEmail, quoteNotificationEmail } from "@/lib/server/emails";
import { ServiceUnavailableError } from "@/lib/server/env";
import { verifyTurnstile } from "@/lib/server/turnstile";

export type QuoteState =
  | { status: "idle" }
  | { status: "error"; message: string; errors?: FieldErrors }
  | { status: "ok"; number: string; email: string };

export async function submitQuote(_prev: QuoteState, formData: FormData): Promise<QuoteState> {
  const f = new FormReader(formData);
  const name = f.text("name", { required: true, max: 120, label: "Name" });
  const email = f.email("email");
  const phone = f.phone("phone", false);
  const company = f.text("company", { max: 160 });
  const nui = f.text("nui", { max: 30 });
  const country = f.text("country", { required: true, max: 2, label: "Country" });
  const message = f.longText("message", { max: 3000 });

  const { getVariant } = await getCatalog();
  const items: QuoteItem[] = [];
  const skus = formData.getAll("itemSku");
  const names = formData.getAll("itemName");
  const quantities = formData.getAll("itemQty");
  const details = formData.getAll("itemDetails");
  for (let i = 0; i < Math.min(names.length, 30); i++) {
    const sku = String(skus[i] ?? "").trim();
    const known = /^\d{12}$/.test(sku) ? getVariant(sku) : undefined;
    const label = String(names[i] ?? "").trim().slice(0, 200);
    const item: QuoteItem = {
      sku: known ? sku : "",
      name: known ? [known.product.name, optionsText(known.variant.options)].filter(Boolean).join(" · ") : label,
      quantity: String(quantities[i] ?? "").trim().slice(0, 60),
      details: String(details[i] ?? "").trim().slice(0, 500),
    };
    if (item.name || item.sku) items.push(item);
  }
  if (!items.length) f.errors.items = "Add at least one product.";
  if (items.some((i) => !i.quantity)) f.errors.items = "Enter a quantity for each product.";

  if (!f.ok) return { status: "error", message: "Please check the highlighted fields.", errors: f.errors };

  const ip = (await headers()).get("cf-connecting-ip");
  if (!(await verifyTurnstile(formData.get("cf-turnstile-response") as string | null, ip))) {
    return { status: "error", message: "The spam check failed. Please try again." };
  }

  try {
    const quote = await createQuote({
      name,
      email,
      phone: phone || null,
      company: company || null,
      nui: nui || null,
      country,
      items,
      message: message || null,
    });
    const inbox = await shopInbox();
    const results = await Promise.all([
      sendEmail(quoteConfirmationEmail(quote)),
      sendEmail(quoteNotificationEmail(quote, inbox, `${site.url}/admin/quotes/${quote.id}`)),
    ]);
    for (const r of results) if (!r.ok) console.error(`Quote ${quote.number}: email failed`, r.error);
    return { status: "ok", number: quote.number, email: quote.email };
  } catch (e) {
    console.error("submitQuote failed", e);
    if (e instanceof ServiceUnavailableError) {
      return { status: "error", message: `Quote requests are temporarily unavailable. Please email ${site.email}.` };
    }
    return { status: "error", message: `Something went wrong. Please try again, or email ${site.email}.` };
  }
}
