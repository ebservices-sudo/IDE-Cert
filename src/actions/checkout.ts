"use server";

import { headers } from "next/headers";
import { site } from "@/config/site";
import { shippingCents, zoneFor } from "@/config/shipping";
import { FormReader, type FieldErrors } from "@/lib/forms";
import { enabledPaymentMethods } from "@/lib/payments";
import { priceCart, vatIncluded } from "@/lib/orders/pricing";
import { createOrder } from "@/lib/orders/store";
import { sendEmail, shopInbox } from "@/lib/server/email";
import { orderConfirmationEmail, orderNotificationEmail } from "@/lib/server/emails";
import { ServiceUnavailableError } from "@/lib/server/env";
import { verifyTurnstile } from "@/lib/server/turnstile";
import { getCurrentUser } from "@/lib/auth/session";

export type CheckoutState =
  | { status: "idle" }
  | { status: "error"; message: string; errors?: FieldErrors }
  | { status: "ok"; number: string; email: string };

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const f = new FormReader(formData);
  const customerType = f.oneOf("customerType", ["private", "company"] as const, "Customer type");
  const name = f.text("name", { required: true, max: 120, label: "Name" });
  const email = f.email("email");
  const phone = f.phone("phone");
  const company = f.text("company", { required: customerType === "company", max: 160, label: "Company name" });
  const nui = f.text("nui", { required: customerType === "company", max: 30, label: "NUI" });
  const vatNumber = f.text("vatNumber", { max: 30 });
  const addressLine1 = f.text("addressLine1", { required: true, max: 160, label: "Street address" });
  const addressLine2 = f.text("addressLine2", { max: 160 });
  const city = f.text("city", { required: true, max: 80, label: "City" });
  const postalCode = f.text("postalCode", { max: 20 });
  const country = f.text("country", { required: true, max: 2, label: "Country" });
  const paymentMethod = f.oneOf("paymentMethod", enabledPaymentMethods.map((m) => m.id), "Payment method");
  const customerNotes = f.longText("notes", { max: 1500 });
  f.checked("terms", "Please accept the terms of sale.");
  const zone = zoneFor(country);
  if (country && !zone) f.errors.country = "We do not deliver to this country yet. Please contact us.";

  let cartInput: { sku: string; qty: number }[] = [];
  try {
    const raw = JSON.parse(String(formData.get("cart") ?? "[]"));
    if (Array.isArray(raw)) cartInput = raw.filter((l) => typeof l?.sku === "string").map((l) => ({ sku: l.sku, qty: Number(l.qty) }));
  } catch {
    // handled below
  }
  const cart = await priceCart(cartInput);
  if (!cart.lines.length) return { status: "error", message: "Your cart is empty." };
  if (cart.unavailable.length) {
    return { status: "error", message: "Some items in your cart are no longer available. Please review your cart." };
  }

  if (!f.ok || !zone) {
    return { status: "error", message: "Please check the highlighted fields.", errors: f.errors };
  }

  const ip = (await headers()).get("cf-connecting-ip");
  if (!(await verifyTurnstile(formData.get("cf-turnstile-response") as string | null, ip))) {
    return { status: "error", message: "The spam check failed. Please try again." };
  }

  const ship = shippingCents(zone, cart.itemsCents);
  const totalCents = cart.itemsCents + (ship ?? 0);

  try {
    const user = await getCurrentUser();
    const order = await createOrder({
      userId: user?.id ?? null,
      customerType,
      name,
      email,
      phone,
      company: customerType === "company" ? company : null,
      nui: customerType === "company" ? nui : null,
      vatNumber: customerType === "company" && vatNumber ? vatNumber : null,
      addressLine1,
      addressLine2: addressLine2 || null,
      city,
      postalCode: postalCode || null,
      country,
      zone: zone.id,
      zoneName: zone.name,
      shippingCents: ship,
      paymentMethod,
      itemsCents: cart.itemsCents,
      vatCents: vatIncluded(totalCents),
      totalCents,
      customerNotes: customerNotes || null,
      lines: cart.lines.map(({ sku, slug, name, optionsText, unit, qty, unitCents, lineCents }) => ({
        sku, slug, name, optionsText, unit, qty, unitCents, lineCents,
      })),
    });
    const inbox = await shopInbox();
    const results = await Promise.all([
      sendEmail(orderConfirmationEmail(order)),
      sendEmail(orderNotificationEmail(order, inbox, `${site.url}/admin/orders/${order.id}`)),
    ]);
    for (const r of results) if (!r.ok) console.error(`Order ${order.number}: email failed`, r.error);
    return { status: "ok", number: order.number, email: order.email };
  } catch (e) {
    console.error("placeOrder failed", e);
    if (e instanceof ServiceUnavailableError) {
      return { status: "error", message: "Online ordering is temporarily unavailable. Please call or email us to order." };
    }
    return { status: "error", message: `Something went wrong. Please try again, or email ${site.email}.` };
  }
}
