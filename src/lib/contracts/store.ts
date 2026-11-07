import "server-only";
import { randomToken } from "@/lib/auth/crypto";
import { nextNumber } from "@/lib/orders/store";
import { getDb } from "@/lib/server/env";

// Contracts in D1 (schema: migrations/0004_contracts.sql). Prices are net of VAT, in cents.

export const CONTRACT_KINDS = ["inspection", "certification", "design", "supply", "other"] as const;
export type ContractKind = (typeof CONTRACT_KINDS)[number];
export const CONTRACT_STATUSES = ["draft", "sent", "accepted", "cancelled"] as const;
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];
export type ContractLanguage = "sq" | "en";

export type ContractItem = { description: string; quantity: number; unit: string; unitCents: number };

export type ContractInput = {
  language: ContractLanguage;
  kind: ContractKind;
  sourceType: "quote" | "message" | "order" | null;
  sourceId: string | null;
  sourceNumber: string | null;
  clientName: string;
  clientCompany: string | null;
  clientNui: string | null;
  clientRepresentative: string | null;
  clientAddress: string | null;
  clientEmail: string;
  clientPhone: string | null;
  title: string;
  scope: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  items: ContractItem[];
  vatRate: number;
  paymentTerms: string;
  validityDays: number;
  specialTerms: string | null;
  nextInspectionDate: string | null;
  internalNotes: string | null;
};

export type Contract = ContractInput & {
  id: string;
  number: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  status: ContractStatus;
  sentAt: string | null;
  sentTo: string | null;
  viewedAt: string | null;
  acceptedAt: string | null;
  acceptedName: string | null;
};

export function contractTotals(c: Pick<Contract, "items" | "vatRate">) {
  const net = c.items.reduce((s, i) => s + Math.round(i.quantity * i.unitCents), 0);
  const vat = Math.round((net * c.vatRate) / 100);
  return { net, vat, total: net + vat };
}

/** Last day the client can accept a sent contract. */
export const acceptDeadline = (c: Pick<Contract, "sentAt" | "validityDays">) =>
  c.sentAt ? new Date(new Date(c.sentAt).getTime() + c.validityDays * 86_400_000) : null;

/** True once the acceptance period (plus a day of grace) has passed. */
export const acceptanceExpired = (c: Pick<Contract, "sentAt" | "validityDays">) => {
  const d = acceptDeadline(c);
  return d ? Date.now() > d.getTime() + 86_400_000 : false;
};

type Row = Record<string, string | number | null>;

const s = (v: unknown) => (v == null ? null : String(v));

function toContract(r: Row): Contract {
  let items: ContractItem[] = [];
  try {
    items = JSON.parse(String(r.items));
  } catch {}
  return {
    id: String(r.id),
    number: String(r.number),
    token: String(r.token),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
    status: r.status as ContractStatus,
    language: r.language === "en" ? "en" : "sq",
    kind: r.kind as ContractKind,
    sourceType: (r.source_type as Contract["sourceType"]) ?? null,
    sourceId: s(r.source_id),
    sourceNumber: s(r.source_number),
    clientName: String(r.client_name),
    clientCompany: s(r.client_company),
    clientNui: s(r.client_nui),
    clientRepresentative: s(r.client_representative),
    clientAddress: s(r.client_address),
    clientEmail: String(r.client_email),
    clientPhone: s(r.client_phone),
    title: String(r.title),
    scope: String(r.scope),
    location: s(r.location),
    startDate: s(r.start_date),
    endDate: s(r.end_date),
    items,
    vatRate: Number(r.vat_rate),
    paymentTerms: String(r.payment_terms),
    validityDays: Number(r.validity_days),
    specialTerms: s(r.special_terms),
    nextInspectionDate: s(r.next_inspection_date),
    internalNotes: s(r.internal_notes),
    sentAt: s(r.sent_at),
    sentTo: s(r.sent_to),
    viewedAt: s(r.viewed_at),
    acceptedAt: s(r.accepted_at),
    acceptedName: s(r.accepted_name),
  };
}

const COLUMNS = [
  ["language", "language"],
  ["kind", "kind"],
  ["source_type", "sourceType"],
  ["source_id", "sourceId"],
  ["source_number", "sourceNumber"],
  ["client_name", "clientName"],
  ["client_company", "clientCompany"],
  ["client_nui", "clientNui"],
  ["client_representative", "clientRepresentative"],
  ["client_address", "clientAddress"],
  ["client_email", "clientEmail"],
  ["client_phone", "clientPhone"],
  ["title", "title"],
  ["scope", "scope"],
  ["location", "location"],
  ["start_date", "startDate"],
  ["end_date", "endDate"],
  ["items", "items"],
  ["vat_rate", "vatRate"],
  ["payment_terms", "paymentTerms"],
  ["validity_days", "validityDays"],
  ["special_terms", "specialTerms"],
  ["next_inspection_date", "nextInspectionDate"],
  ["internal_notes", "internalNotes"],
] as const satisfies readonly (readonly [string, keyof ContractInput])[];

const values = (c: ContractInput) => COLUMNS.map(([, k]) => (k === "items" ? JSON.stringify(c.items) : (c[k] ?? null)));

export async function createContract(input: ContractInput): Promise<Contract> {
  const db = await getDb();
  const now = new Date();
  const id = crypto.randomUUID();
  const number = await nextNumber(db, "KON", now);
  const ts = now.toISOString();
  await db
    .prepare(
      `INSERT INTO contracts (id, number, token, created_at, updated_at, status, ${COLUMNS.map(([c]) => c).join(", ")})
       VALUES (?, ?, ?, ?, ?, 'draft', ${COLUMNS.map(() => "?").join(", ")})`,
    )
    .bind(id, number, randomToken(), ts, ts, ...values(input))
    .run();
  return (await getContract(id))!;
}

export async function updateContract(id: string, input: ContractInput) {
  const db = await getDb();
  await db
    .prepare(`UPDATE contracts SET ${COLUMNS.map(([c]) => `${c} = ?`).join(", ")}, updated_at = ? WHERE id = ?`)
    .bind(...values(input), new Date().toISOString(), id)
    .run();
}

export async function getContract(id: string) {
  const db = await getDb();
  const row = await db.prepare("SELECT * FROM contracts WHERE id = ?").bind(id).first<Row>();
  return row ? toContract(row) : null;
}

export async function getContractByToken(token: string) {
  if (!/^[A-Za-z0-9_-]{20,}$/.test(token)) return null;
  const db = await getDb();
  const row = await db.prepare("SELECT * FROM contracts WHERE token = ?").bind(token).first<Row>();
  return row ? toContract(row) : null;
}

export async function listContracts(opts: { status?: string; email?: string; limit?: number } = {}) {
  const db = await getDb();
  const where: string[] = [];
  const binds: unknown[] = [];
  if (opts.status) {
    where.push("status = ?");
    binds.push(opts.status);
  }
  if (opts.email) {
    where.push("client_email = ?");
    binds.push(opts.email.toLowerCase());
  }
  const { results } = await db
    .prepare(`SELECT * FROM contracts ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY created_at DESC LIMIT ?`)
    .bind(...binds, opts.limit ?? 200)
    .all<Row>();
  return results.map(toContract);
}

/** Contracts linked to a quote, message or order. */
export async function contractsFor(sourceType: string, sourceId: string) {
  const db = await getDb();
  const { results } = await db
    .prepare("SELECT * FROM contracts WHERE source_type = ? AND source_id = ? ORDER BY created_at DESC")
    .bind(sourceType, sourceId)
    .all<Row>();
  return results.map(toContract);
}

export async function setContractStatus(id: string, status: ContractStatus) {
  const db = await getDb();
  await db.prepare("UPDATE contracts SET status = ?, updated_at = ? WHERE id = ?").bind(status, new Date().toISOString(), id).run();
}

export async function markContractSent(id: string, to: string) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db
    .prepare("UPDATE contracts SET status = CASE WHEN status = 'accepted' THEN status ELSE 'sent' END, sent_at = ?, sent_to = ?, updated_at = ? WHERE id = ?")
    .bind(now, to, now, id)
    .run();
}

export async function markContractViewed(id: string) {
  const db = await getDb();
  await db.prepare("UPDATE contracts SET viewed_at = ? WHERE id = ? AND viewed_at IS NULL").bind(new Date().toISOString(), id).run();
}

/** Records the client's online acceptance. Returns false if it was not open for acceptance. */
export async function acceptContract(id: string, name: string, ip: string | null) {
  const db = await getDb();
  const now = new Date().toISOString();
  const row = await db
    .prepare("UPDATE contracts SET status = 'accepted', accepted_at = ?, accepted_name = ?, accepted_ip = ?, updated_at = ? WHERE id = ? AND status = 'sent' RETURNING id")
    .bind(now, name, ip, now, id)
    .first();
  return Boolean(row);
}

export async function deleteDraftContract(id: string) {
  const db = await getDb();
  await db.prepare("DELETE FROM contracts WHERE id = ? AND status = 'draft'").bind(id).run();
}

/** Inspection contracts whose next periodic inspection falls within `days` (or is overdue). */
export async function upcomingInspections(days = 60) {
  const db = await getDb();
  const until = new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
  const { results } = await db
    .prepare(
      `SELECT * FROM contracts WHERE next_inspection_date IS NOT NULL AND next_inspection_date <= ? AND status IN ('sent', 'accepted')
       ORDER BY next_inspection_date LIMIT 50`,
    )
    .bind(until)
    .all<Row>();
  return results.map(toContract);
}

export async function contractCounts() {
  const db = await getDb();
  try {
    const row = await db
      .prepare(
        `SELECT
          (SELECT COUNT(*) FROM contracts WHERE status = 'draft') AS draft,
          (SELECT COUNT(*) FROM contracts WHERE status = 'sent') AS sent,
          (SELECT COUNT(*) FROM contracts WHERE status = 'accepted' AND accepted_at >= ?) AS accepted_30d`,
      )
      .bind(new Date(Date.now() - 30 * 86_400_000).toISOString())
      .first<Record<string, number>>();
    return row ?? {};
  } catch {
    return {}; // table missing until migration 0004 is applied
  }
}
