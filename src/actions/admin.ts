"use server";

import { refresh, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { bankDetailsComplete } from "@/config/business";
import { requireAdmin } from "@/lib/auth/session";
import { getOrder, updateMessageStatus, updateOrder, updateQuote } from "@/lib/orders/queries";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders/store";
import { clearOverrides, discardImport, publishImport, saveImport, type ImportRow } from "@/lib/prices/imports";
import { sendEmail } from "@/lib/server/email";
import { proformaEmail } from "@/lib/server/emails";

// Every action re-checks the session: server actions are public endpoints.

export type AdminState = { status: "idle" } | { status: "ok"; message: string } | { status: "error"; message: string };

export async function saveOrder(_prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = String(fd.get("id"));
  const status = String(fd.get("status")) as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) return { status: "error", message: "Unknown status." };
  const shippingRaw = String(fd.get("shipping") ?? "").trim().replace(",", ".");
  let shippingCents: number | null | undefined;
  if (shippingRaw === "") shippingCents = null;
  else {
    const n = Number(shippingRaw);
    if (!Number.isFinite(n) || n < 0 || n > 10000) return { status: "error", message: "Shipping must be an amount in euros, e.g. 7.50." };
    shippingCents = Math.round(n * 100);
  }
  await updateOrder(id, { status, adminNotes: String(fd.get("adminNotes") ?? "").slice(0, 4000), shippingCents });
  refresh();
  return { status: "ok", message: "Order saved." };
}

export async function sendProforma(_prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  if (!bankDetailsComplete) return { status: "error", message: "Add the bank details in src/config/business.ts first." };
  const order = await getOrder(String(fd.get("id")));
  if (!order) return { status: "error", message: "Order not found." };
  if (order.shippingCents == null) return { status: "error", message: "Enter and save the shipping cost first (0 for none)." };
  const r = await sendEmail(proformaEmail(order));
  if (!r.ok) return { status: "error", message: `Email failed: ${r.error}` };
  await updateOrder(order.id, {
    proformaSentAt: new Date().toISOString(),
    ...(order.status === "received" ? { status: "proforma_sent" as const } : {}),
  });
  refresh();
  return { status: "ok", message: `Proforma sent to ${order.email}.` };
}

export async function saveQuote(_prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const status = String(fd.get("status"));
  if (!["new", "answered", "won", "lost"].includes(status)) return { status: "error", message: "Unknown status." };
  await updateQuote(String(fd.get("id")), { status: status as "new", adminNotes: String(fd.get("adminNotes") ?? "").slice(0, 4000) });
  refresh();
  return { status: "ok", message: "Quote saved." };
}

export async function setMessageStatus(fd: FormData) {
  await requireAdmin();
  const status = String(fd.get("status"));
  if (["new", "answered", "archived"].includes(status)) await updateMessageStatus(String(fd.get("id")), status);
  refresh();
}

export async function createPriceImport(input: { filename: string; rows: ImportRow[] }): Promise<{ error: string } | never> {
  const admin = await requireAdmin();
  const rows = input.rows
    .filter((r) => /^\d{12}$/.test(r.sku) && Number.isInteger(r.rrpCents) && r.rrpCents > 0 && r.rrpCents < 10_000_000)
    .map((r) => ({
      sku: r.sku,
      name: String(r.name ?? "").slice(0, 200),
      rrpCents: r.rrpCents,
      netCents: Number.isInteger(r.netCents) && (r.netCents as number) > 0 ? r.netCents : null,
    }))
    .slice(0, 10_000);
  if (!rows.length) return { error: "No rows with a 12-digit item number and a price were found." };
  const id = await saveImport(input.filename.slice(0, 200), admin.email, rows);
  redirect(`/admin/prices/${id}`);
}

export async function publishPriceImport(fd: FormData) {
  await requireAdmin();
  await publishImport(String(fd.get("id")));
  // Product pages, listings and the cart read prices through the "prices" cache tag.
  revalidateTag("prices", { expire: 0 });
  redirect(`/admin/prices/${String(fd.get("id"))}?published=1`);
}

export async function discardPriceImport(fd: FormData) {
  await requireAdmin();
  await discardImport(String(fd.get("id")));
  redirect("/admin/prices");
}

export async function resetPrices() {
  await requireAdmin();
  await clearOverrides();
  revalidateTag("prices", { expire: 0 });
  redirect("/admin/prices?reset=1");
}
