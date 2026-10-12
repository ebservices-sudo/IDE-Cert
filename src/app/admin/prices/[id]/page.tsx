import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { discardPriceImport, publishPriceImport } from "@/actions/admin";
import { getImport } from "@/lib/prices/imports";
import { AdminHeader, Card, Stat, buttonCls, dateTime, eur, table } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Price list comparison" };

export default async function AdminPriceImport({ params, searchParams }: PageProps<"/admin/prices/[id]">) {
  const [data, sp] = await Promise.all([getImport((await params).id), searchParams]);
  if (!data) notFound();
  const { record, summary, diff } = data;
  const changed = [...diff.changed].sort((a, b) => Math.abs(b.newCents - b.oldCents) / b.oldCents - Math.abs(a.newCents - a.oldCents) / a.oldCents);

  return (
    <>
      <AdminHeader
        back={{ href: "/admin/prices", label: "Price lists" }}
        title={record.filename}
        description={`Uploaded ${dateTime(record.createdAt)} by ${record.createdBy}`}
        actions={
          record.status === "draft" ? (
            <>
              <form action={discardPriceImport}>
                <input type="hidden" name="id" value={record.id} />
                <button className={buttonCls.outline}>Discard</button>
              </form>
              <form action={publishPriceImport}>
                <input type="hidden" name="id" value={record.id} />
                <button className={buttonCls.primary} disabled={!summary.changed}>
                  Publish {summary.changed} price changes
                </button>
              </form>
            </>
          ) : undefined
        }
      />
      {sp.published && (
        <p role="status" className="mb-6 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm font-medium text-emerald-900">
          Published. The new prices are live in the shop, cart and checkout.
        </p>
      )}
      {record.status !== "draft" && !sp.published && (
        <p className="mb-6 rounded-lg border border-line bg-white p-3 text-sm">
          Status: <strong>{record.status}</strong>
          {record.publishedAt && ` · published ${dateTime(record.publishedAt)}`}
        </p>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Price changes" value={summary.changed} tone={summary.changed ? "alert" : undefined} />
        <Stat label="Unchanged" value={summary.unchanged} />
        <Stat label="Not in the shop" value={summary.unknown} />
        <Stat label="Shop items not in file" value={summary.missing} />
      </div>

      <Card title={`Price changes (${changed.length})`} className="mt-6">
        {changed.length ? (
          <div className="-m-5 max-h-[32rem] overflow-auto">
            <table className={table.table}>
              <thead className={`${table.thead} sticky top-0`}>
                <tr>
                  <th className={table.th}>Item</th>
                  <th className={`${table.th} text-right`}>RRP now</th>
                  <th className={`${table.th} text-right`}>New RRP</th>
                  <th className={`${table.th} text-right`}>Change</th>
                  <th className={`${table.th} text-right`}>Net now → new</th>
                </tr>
              </thead>
              <tbody className={table.tbody}>
                {changed.map((c) => {
                  const pct = ((c.newCents - c.oldCents) / c.oldCents) * 100;
                  return (
                    <tr key={c.sku}>
                      <td className={table.td}>
                        {c.name}
                        <span className="block font-mono text-xs text-muted">{c.sku}</span>
                      </td>
                      <td className={`${table.td} text-right tabular-nums`}>{eur(c.oldCents)}</td>
                      <td className={`${table.td} text-right font-semibold tabular-nums`}>{eur(c.newCents)}</td>
                      <td className={`${table.td} text-right tabular-nums ${pct > 0 ? "text-brand-strong" : pct < 0 ? "text-emerald-700" : "text-muted"}`}>
                        {pct === 0 ? "net only" : `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`}
                      </td>
                      <td className={`${table.td} text-right text-xs tabular-nums text-muted`}>
                        {c.oldNet != null ? eur(c.oldNet) : "–"} → {c.newNet != null ? eur(c.newNet) : "–"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">No price differences.</p>
        )}
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title={`Item numbers not in the shop (${diff.unknown.length})`}>
          <p className="mb-3 text-xs text-muted">New products or new colours/sizes. They need product data from EDELRID before they can be sold; the developer adds them with npm run catalog.</p>
          <ul className="max-h-80 space-y-1 overflow-auto text-sm">
            {diff.unknown.slice(0, 500).map((r) => (
              <li key={r.sku} className="flex justify-between gap-3">
                <span>
                  <span className="font-mono text-xs text-muted">{r.sku}</span> {r.name}
                </span>
                <span className="tabular-nums">{eur(r.rrpCents)}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title={`Shop items missing from the file (${diff.missing.length})`}>
          <p className="mb-3 text-xs text-muted">Possibly discontinued, or in another of EDELRID&apos;s lists (Sport, Safety, Adventure). They keep their current price.</p>
          <ul className="max-h-80 space-y-1 overflow-auto text-sm">
            {diff.missing.slice(0, 500).map((r) => (
              <li key={r.sku} className="flex justify-between gap-3">
                <span>
                  <span className="font-mono text-xs text-muted">{r.sku}</span> {r.name}
                </span>
                <span className="tabular-nums">{eur(r.cents)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
