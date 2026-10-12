import "server-only";
import { zoneFor } from "@/config/shipping";
import { getDb } from "@/lib/server/env";
import { type OrderRecord, type OrderStatus, type QuoteRecord, parseUnit } from "./store";

// Read/update queries for the account and admin pages.

type OrderRow = {
  id: string;
  number: string;
  created_at: string;
  status: OrderStatus;
  customer_type: "private" | "company";
  name: string;
  email: string;
  phone: string;
  company: string | null;
  nui: string | null;
  vat_number: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postal_code: string | null;
  country: string;
  shipping_zone: string;
  shipping_cents: number | null;
  payment_method: string;
  items_cents: number;
  vat_cents: number;
  total_cents: number;
  customer_notes: string | null;
  admin_notes: string | null;
  user_id: string | null;
  proforma_sent_at: string | null;
};

export type OrderSummary = Pick<OrderRecord, "id" | "number" | "createdAt" | "status" | "name" | "email" | "company" | "country" | "totalCents" | "shippingCents"> & {
  itemCount: number;
};

const toOrder = (r: OrderRow, lines: OrderRecord["lines"] = []): OrderRecord => ({
  id: r.id,
  number: r.number,
  createdAt: r.created_at,
  status: r.status,
  customerType: r.customer_type,
  name: r.name,
  email: r.email,
  phone: r.phone,
  company: r.company,
  nui: r.nui,
  vatNumber: r.vat_number,
  addressLine1: r.address_line1,
  addressLine2: r.address_line2,
  city: r.city,
  postalCode: r.postal_code,
  country: r.country,
  zone: r.shipping_zone,
  zoneName: zoneFor(r.country)?.name ?? r.shipping_zone,
  shippingCents: r.shipping_cents,
  paymentMethod: r.payment_method,
  itemsCents: r.items_cents,
  vatCents: r.vat_cents,
  totalCents: r.total_cents,
  customerNotes: r.customer_notes,
  adminNotes: r.admin_notes,
  userId: r.user_id,
  proformaSentAt: r.proforma_sent_at,
  lines,
});

const SUMMARY_COLS = `o.id, o.number, o.created_at, o.status, o.name, o.email, o.company, o.country, o.total_cents, o.shipping_cents,
  (SELECT COUNT(*) FROM order_items i WHERE i.order_id = o.id) AS item_count`;

type SummaryRow = Pick<OrderRow, "id" | "number" | "created_at" | "status" | "name" | "email" | "company" | "country" | "total_cents" | "shipping_cents"> & {
  item_count: number;
};

const toSummary = (r: SummaryRow): OrderSummary => ({
  id: r.id,
  number: r.number,
  createdAt: r.created_at,
  status: r.status,
  name: r.name,
  email: r.email,
  company: r.company,
  country: r.country,
  totalCents: r.total_cents,
  shippingCents: r.shipping_cents,
  itemCount: r.item_count,
});

export async function listOrders(opts: { status?: string; q?: string; limit?: number; offset?: number } = {}) {
  const db = await getDb();
  const where: string[] = [];
  const binds: unknown[] = [];
  if (opts.status) {
    where.push("o.status = ?");
    binds.push(opts.status);
  }
  if (opts.q) {
    where.push("(o.number LIKE ? OR o.name LIKE ? OR o.email LIKE ? OR o.company LIKE ?)");
    const like = `%${opts.q}%`;
    binds.push(like, like, like, like);
  }
  const sql = `SELECT ${SUMMARY_COLS} FROM orders o ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
  const { results } = await db.prepare(sql).bind(...binds, opts.limit ?? 50, opts.offset ?? 0).all<SummaryRow>();
  return results.map(toSummary);
}

export async function listOrdersForUser(user: { id: string; email: string; emailVerified: boolean }) {
  const db = await getDb();
  const { results } = await db
    .prepare(`SELECT ${SUMMARY_COLS} FROM orders o WHERE o.user_id = ? OR (? = 1 AND o.email = ?) ORDER BY o.created_at DESC LIMIT 100`)
    .bind(user.id, user.emailVerified ? 1 : 0, user.email)
    .all<SummaryRow>();
  return results.map(toSummary);
}

export async function getOrder(id: string): Promise<OrderRecord | null> {
  const db = await getDb();
  const [o, items] = await db.batch([
    db.prepare("SELECT * FROM orders WHERE id = ?").bind(id),
    db.prepare("SELECT sku, slug, name, options, unit, qty, unit_price_cents, line_total_cents FROM order_items WHERE order_id = ? ORDER BY id").bind(id),
  ]);
  const row = o.results[0] as OrderRow | undefined;
  if (!row) return null;
  const lines = (items.results as { sku: string; slug: string; name: string; options: string; unit: string; qty: number; unit_price_cents: number; line_total_cents: number }[]).map((l) => ({
    sku: l.sku,
    slug: l.slug,
    name: l.name,
    optionsText: l.options,
    unit: parseUnit(l.unit),
    qty: l.qty,
    unitCents: l.unit_price_cents,
    lineCents: l.line_total_cents,
  }));
  return toOrder(row, lines);
}

export async function updateOrder(id: string, patch: { status?: OrderStatus; adminNotes?: string; shippingCents?: number | null; proformaSentAt?: string }) {
  const db = await getDb();
  const sets: string[] = ["updated_at = ?"];
  const binds: unknown[] = [new Date().toISOString()];
  if (patch.status) {
    sets.push("status = ?");
    binds.push(patch.status);
  }
  if (patch.adminNotes !== undefined) {
    sets.push("admin_notes = ?");
    binds.push(patch.adminNotes || null);
  }
  if (patch.shippingCents !== undefined) {
    // Shipping is VAT-inclusive like the item prices; recompute total and contained VAT.
    sets.push(
      "shipping_cents = ?",
      "total_cents = items_cents + COALESCE(?, 0)",
      "vat_cents = (items_cents + COALESCE(?, 0)) - CAST(ROUND((items_cents + COALESCE(?, 0)) / 1.18) AS INTEGER)",
    );
    binds.push(patch.shippingCents, patch.shippingCents, patch.shippingCents, patch.shippingCents);
  }
  if (patch.proformaSentAt) {
    sets.push("proforma_sent_at = ?");
    binds.push(patch.proformaSentAt);
  }
  await db.prepare(`UPDATE orders SET ${sets.join(", ")} WHERE id = ?`).bind(...binds, id).run();
}

type QuoteRow = {
  id: string;
  number: string;
  created_at: string;
  status: QuoteRecord["status"];
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  nui: string | null;
  country: string;
  items: string;
  message: string | null;
  admin_notes: string | null;
};

const toQuote = (r: QuoteRow): QuoteRecord => ({
  id: r.id,
  number: r.number,
  createdAt: r.created_at,
  status: r.status,
  name: r.name,
  email: r.email,
  phone: r.phone,
  company: r.company,
  nui: r.nui,
  country: r.country,
  items: (() => {
    try {
      return JSON.parse(r.items);
    } catch {
      return [];
    }
  })(),
  message: r.message,
  adminNotes: r.admin_notes,
});

export async function listQuotes(opts: { status?: string; limit?: number } = {}) {
  const db = await getDb();
  const { results } = await db
    .prepare(`SELECT * FROM quotes ${opts.status ? "WHERE status = ?" : ""} ORDER BY created_at DESC LIMIT ?`)
    .bind(...(opts.status ? [opts.status] : []), opts.limit ?? 100)
    .all<QuoteRow>();
  return results.map(toQuote);
}

export async function getQuote(id: string) {
  const db = await getDb();
  const row = await db.prepare("SELECT * FROM quotes WHERE id = ?").bind(id).first<QuoteRow>();
  return row ? toQuote(row) : null;
}

export async function updateQuote(id: string, patch: { status?: QuoteRecord["status"]; adminNotes?: string }) {
  const db = await getDb();
  await db
    .prepare("UPDATE quotes SET status = COALESCE(?, status), admin_notes = COALESCE(?, admin_notes), updated_at = ? WHERE id = ?")
    .bind(patch.status ?? null, patch.adminNotes ?? null, new Date().toISOString(), id)
    .run();
}

export type MessageRecord = { id: string; createdAt: string; topic: string; name: string; email: string; phone: string | null; company: string | null; message: string; status: string };

export async function listMessages(limit = 100): Promise<MessageRecord[]> {
  const db = await getDb();
  const { results } = await db.prepare("SELECT * FROM messages ORDER BY created_at DESC LIMIT ?").bind(limit).all<Record<string, string | null>>();
  return results.map((r) => ({
    id: r.id!,
    createdAt: r.created_at!,
    topic: r.topic!,
    name: r.name!,
    email: r.email!,
    phone: r.phone,
    company: r.company,
    message: r.message!,
    status: r.status!,
  }));
}

export async function updateMessageStatus(id: string, status: string) {
  const db = await getDb();
  await db.prepare("UPDATE messages SET status = ? WHERE id = ?").bind(status, id).run();
}

export async function dashboardCounts() {
  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM orders WHERE status = 'received') AS new_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'proforma_sent') AS awaiting_payment,
        (SELECT COUNT(*) FROM orders WHERE status IN ('paid', 'ordered')) AS to_fulfil,
        (SELECT COUNT(*) FROM quotes WHERE status = 'new') AS new_quotes,
        (SELECT COUNT(*) FROM messages WHERE status = 'new') AS new_messages,
        (SELECT COALESCE(SUM(total_cents), 0) FROM orders WHERE status NOT IN ('cancelled') AND created_at >= ?) AS revenue_30d`,
    )
    .bind(new Date(Date.now() - 30 * 86_400_000).toISOString())
    .first<Record<string, number>>();
  return row ?? {};
}
