import "server-only";
import { baseProducts } from "@/lib/catalog/data";
import { baseNetPrice } from "@/lib/catalog/net-prices";
import { getDb } from "@/lib/server/env";

// Price-list imports from the admin panel. An import is analysed against the
// built-in catalogue, reviewed as a draft, then published as price_overrides.

export type ImportRow = { sku: string; name: string; rrpCents: number; netCents: number | null };

export type ImportSummary = {
  rows: number;
  changed: number;
  unchanged: number;
  /** Item numbers not in the shop catalogue (new products need a catalogue update). */
  unknown: number;
  /** Catalogue items missing from the file (possibly discontinued). */
  missing: number;
};

export type ImportDiff = {
  changed: { sku: string; name: string; oldCents: number; newCents: number; oldNet: number | null; newNet: number | null }[];
  unknown: ImportRow[];
  missing: { sku: string; name: string; cents: number }[];
};

type BaseItem = { name: string; cents: number; netCents: number | null };

const baseBySku: Map<string, BaseItem> = new Map(
  baseProducts.flatMap((p) =>
    p.variants.map((v) => {
      const net = baseNetPrice(v.sku);
      const options = [v.options.config, v.options.colour, v.options.length, v.options.size].filter(Boolean).join(" · ");
      return [v.sku, { name: options ? `${p.name} · ${options}` : p.name, cents: Math.round(v.price * 100), netCents: net ? Math.round(net.net * 100) : null }] as const;
    }),
  ),
);

export function diffRows(rows: ImportRow[]): { summary: ImportSummary; diff: ImportDiff } {
  const seen = new Set<string>();
  const diff: ImportDiff = { changed: [], unknown: [], missing: [] };
  let unchanged = 0;
  for (const r of rows) {
    seen.add(r.sku);
    const base = baseBySku.get(r.sku);
    if (!base) {
      diff.unknown.push(r);
      continue;
    }
    if (base.cents !== r.rrpCents || (r.netCents != null && base.netCents !== r.netCents)) {
      diff.changed.push({ sku: r.sku, name: base.name, oldCents: base.cents, newCents: r.rrpCents, oldNet: base.netCents, newNet: r.netCents });
    } else unchanged++;
  }
  for (const [sku, b] of baseBySku) if (!seen.has(sku)) diff.missing.push({ sku, name: b.name, cents: b.cents });
  return {
    summary: { rows: rows.length, changed: diff.changed.length, unchanged, unknown: diff.unknown.length, missing: diff.missing.length },
    diff,
  };
}

export async function saveImport(filename: string, createdBy: string, rows: ImportRow[]) {
  const db = await getDb();
  const id = crypto.randomUUID();
  const { summary } = diffRows(rows);
  const stmts = [
    db
      .prepare("INSERT INTO price_imports (id, created_at, created_by, filename, status, summary) VALUES (?, ?, ?, ?, 'draft', ?)")
      .bind(id, new Date().toISOString(), createdBy, filename, JSON.stringify(summary)),
    ...rows.map((r) =>
      db.prepare("INSERT OR REPLACE INTO price_import_rows (import_id, sku, name, rrp_cents, net_cents) VALUES (?, ?, ?, ?, ?)").bind(id, r.sku, r.name, r.rrpCents, r.netCents),
    ),
  ];
  // D1 batches are limited in size; insert in chunks.
  for (let i = 0; i < stmts.length; i += 400) await db.batch(stmts.slice(i, i + 400));
  return id;
}

export type ImportRecord = { id: string; createdAt: string; createdBy: string; filename: string; status: string; publishedAt: string | null; summary: ImportSummary };

export async function listImports(): Promise<ImportRecord[]> {
  const db = await getDb();
  const { results } = await db.prepare("SELECT * FROM price_imports ORDER BY created_at DESC LIMIT 50").all<Record<string, string | null>>();
  return results.map((r) => ({
    id: r.id!,
    createdAt: r.created_at!,
    createdBy: r.created_by!,
    filename: r.filename!,
    status: r.status!,
    publishedAt: r.published_at,
    summary: JSON.parse(r.summary!),
  }));
}

export async function getImport(id: string) {
  const db = await getDb();
  const [imp, rows] = await db.batch([
    db.prepare("SELECT * FROM price_imports WHERE id = ?").bind(id),
    db.prepare("SELECT sku, name, rrp_cents, net_cents FROM price_import_rows WHERE import_id = ?").bind(id),
  ]);
  const r = imp.results[0] as Record<string, string | null> | undefined;
  if (!r) return null;
  const importRows: ImportRow[] = (rows.results as { sku: string; name: string | null; rrp_cents: number; net_cents: number | null }[]).map((x) => ({
    sku: x.sku,
    name: x.name ?? "",
    rrpCents: x.rrp_cents,
    netCents: x.net_cents,
  }));
  const record: ImportRecord = {
    id: r.id!,
    createdAt: r.created_at!,
    createdBy: r.created_by!,
    filename: r.filename!,
    status: r.status!,
    publishedAt: r.published_at,
    summary: JSON.parse(r.summary!),
  };
  return { record, ...diffRows(importRows) };
}

/**
 * Applies this import to the items it contains: prices that differ from the
 * catalogue become overrides, prices equal to the catalogue clear any earlier
 * override. Items not in the file are left alone, so the Sport, Safety and
 * Adventure lists can be uploaded one after another.
 */
export async function publishImport(id: string) {
  const db = await getDb();
  const data = await getImport(id);
  if (!data || data.record.status !== "draft") throw new Error("Only draft imports can be published.");
  const now = new Date().toISOString();
  const { results } = await db.prepare("SELECT sku FROM price_import_rows WHERE import_id = ?").bind(id).all<{ sku: string }>();
  const changed = new Set(data.diff.changed.map((c) => c.sku));
  const backToList = results.map((r) => r.sku).filter((sku) => baseBySku.has(sku) && !changed.has(sku));
  const stmts = [
    ...backToList.map((sku) => db.prepare("DELETE FROM price_overrides WHERE sku = ?").bind(sku)),
    ...data.diff.changed.map((c) =>
      db
        .prepare("INSERT OR REPLACE INTO price_overrides (sku, rrp_cents, net_cents, import_id, updated_at) VALUES (?, ?, ?, ?, ?)")
        .bind(c.sku, c.newCents, c.newNet, id, now),
    ),
  ];
  for (let i = 0; i < stmts.length; i += 400) await db.batch(stmts.slice(i, i + 400));
  await db.prepare("UPDATE price_imports SET status = 'published', published_at = ? WHERE id = ?").bind(now, id).run();
  return data.diff.changed.length;
}

export async function discardImport(id: string) {
  const db = await getDb();
  await db.prepare("UPDATE price_imports SET status = 'discarded' WHERE id = ? AND status = 'draft'").bind(id).run();
}

/** Removes every published override: the shop falls back to the built-in price lists. */
export async function clearOverrides() {
  const db = await getDb();
  await db.batch([db.prepare("DELETE FROM price_overrides"), db.prepare("UPDATE price_imports SET status = 'superseded' WHERE status = 'published'")]);
}

export async function overrideMap() {
  const db = await getDb();
  const { results } = await db.prepare("SELECT sku, rrp_cents, net_cents FROM price_overrides").all<{ sku: string; rrp_cents: number; net_cents: number | null }>();
  return new Map(results.map((r) => [r.sku, { rrpCents: r.rrp_cents, netCents: r.net_cents }]));
}
