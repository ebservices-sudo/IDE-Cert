import "server-only";
import type { PriceUnit } from "@/lib/catalog/types";
import { getDb } from "@/lib/server/env";
import type { PricedLine } from "./pricing";

// Orders and quotes in Cloudflare D1 (schema: migrations/0001_orders_quotes.sql).

export const ORDER_STATUSES = ["received", "proforma_sent", "paid", "ordered", "shipped", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderLine = Pick<PricedLine, "sku" | "slug" | "name" | "optionsText" | "unit" | "qty" | "unitCents" | "lineCents">;

export type OrderRecord = {
  id: string;
  number: string;
  createdAt: string;
  status: OrderStatus;
  customerType: "private" | "company";
  name: string;
  email: string;
  phone: string;
  company: string | null;
  nui: string | null;
  vatNumber: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postalCode: string | null;
  country: string;
  zone: string;
  zoneName: string;
  shippingCents: number | null;
  paymentMethod: string;
  itemsCents: number;
  vatCents: number;
  totalCents: number;
  customerNotes: string | null;
  adminNotes?: string | null;
  userId?: string | null;
  proformaSentAt?: string | null;
  lines: OrderLine[];
};

export type QuoteItem = { sku: string; name: string; quantity: string; details: string };

export type QuoteRecord = {
  id: string;
  number: string;
  createdAt: string;
  status: "new" | "answered" | "won" | "lost";
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  nui: string | null;
  country: string;
  items: QuoteItem[];
  message: string | null;
  adminNotes?: string | null;
};

/** Next number in a yearly sequence: IDE-2026-00001, Q-2026-00001. */
async function nextNumber(db: D1Database, prefix: string, now: Date) {
  const year = now.getUTCFullYear();
  const key = `${prefix}-${year}`;
  const [, row] = await db.batch([
    db.prepare("INSERT OR IGNORE INTO counters (name, value) VALUES (?, 0)").bind(key),
    db.prepare("UPDATE counters SET value = value + 1 WHERE name = ? RETURNING value").bind(key),
  ]);
  const value = (row.results[0] as { value: number }).value;
  return `${prefix}-${year}-${String(value).padStart(5, "0")}`;
}

export async function createOrder(input: Omit<OrderRecord, "id" | "number" | "createdAt" | "status">): Promise<OrderRecord> {
  const db = await getDb();
  const now = new Date();
  const id = crypto.randomUUID();
  const number = await nextNumber(db, "IDE", now);
  const ts = now.toISOString();
  const order: OrderRecord = { ...input, id, number, createdAt: ts, status: "received" };
  await db.batch([
    db
      .prepare(
        `INSERT INTO orders (id, number, created_at, updated_at, status, customer_type, name, email, phone, company, nui, vat_number,
          address_line1, address_line2, city, postal_code, country, shipping_zone, shipping_cents, payment_method,
          items_cents, vat_cents, total_cents, currency, customer_notes, user_id)
         VALUES (?, ?, ?, ?, 'received', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'EUR', ?, ?)`,
      )
      .bind(
        id, number, ts, ts, order.customerType, order.name, order.email, order.phone, order.company, order.nui, order.vatNumber,
        order.addressLine1, order.addressLine2, order.city, order.postalCode, order.country, order.zone, order.shippingCents,
        order.paymentMethod, order.itemsCents, order.vatCents, order.totalCents, order.customerNotes, order.userId ?? null,
      ),
    ...order.lines.map((l) =>
      db
        .prepare(
          `INSERT INTO order_items (order_id, sku, slug, name, options, unit, qty, unit_price_cents, line_total_cents)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(id, l.sku, l.slug, l.name, l.optionsText, JSON.stringify(l.unit), l.qty, l.unitCents, l.lineCents),
    ),
  ]);
  return order;
}

export async function createQuote(input: Omit<QuoteRecord, "id" | "number" | "createdAt" | "status">): Promise<QuoteRecord> {
  const db = await getDb();
  const now = new Date();
  const id = crypto.randomUUID();
  const number = await nextNumber(db, "Q", now);
  const ts = now.toISOString();
  await db
    .prepare(
      `INSERT INTO quotes (id, number, created_at, updated_at, status, name, email, phone, company, nui, country, items, message)
       VALUES (?, ?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, number, ts, ts, input.name, input.email, input.phone, input.company, input.nui, input.country, JSON.stringify(input.items), input.message)
    .run();
  return { ...input, id, number, createdAt: ts, status: "new" };
}

export function parseUnit(raw: string): PriceUnit {
  try {
    return JSON.parse(raw) as PriceUnit;
  } catch {
    return { kind: "piece" };
  }
}
