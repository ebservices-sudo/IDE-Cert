import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { countryName } from "@/config/shipping";
import { listQuotes } from "@/lib/orders/queries";
import { StatusBadge, quoteStatusLabel } from "@/lib/orders/status";
import { AdminHeader, dateTime, table } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Quotes" };

/** Private, request-time page (see admin/layout.tsx). */
export const instant = false;

export default async function AdminQuotes({ searchParams }: PageProps<"/admin/quotes">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && sp.status in quoteStatusLabel ? sp.status : undefined;
  const quotes = await listQuotes({ status, limit: 200 });
  return (
    <>
      <AdminHeader title="Quote requests" description={`${quotes.length} shown`} />
      <nav aria-label="Filter by status" className="mb-5 flex flex-wrap gap-1.5">
        {[undefined, ...Object.keys(quoteStatusLabel)].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `/admin/quotes?status=${s}` : "/admin/quotes"}
            className={clsx("rounded-full border px-3 py-1 text-xs font-semibold", status === s ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40")}
          >
            {s ? quoteStatusLabel[s] : "All"}
          </Link>
        ))}
      </nav>
      <div className={table.wrap}>
        <table className={table.table}>
          <thead className={table.thead}>
            <tr>
              <th className={table.th}>Request</th>
              <th className={table.th}>Customer</th>
              <th className={table.th}>Products</th>
              <th className={table.th}>Status</th>
            </tr>
          </thead>
          <tbody className={table.tbody}>
            {quotes.map((q) => (
              <tr key={q.id} className="hover:bg-mist/60">
                <td className={table.td}>
                  <Link href={`/admin/quotes/${q.id}`} className="font-semibold hover:text-brand-strong">
                    {q.number}
                  </Link>
                  <span className="block text-xs text-muted">{dateTime(q.createdAt)}</span>
                </td>
                <td className={table.td}>
                  {q.company ?? q.name}
                  <span className="block text-xs text-muted">
                    {q.email} · {countryName(q.country)}
                  </span>
                </td>
                <td className={table.td}>
                  <span className="line-clamp-2">{q.items.map((i) => i.name || i.sku).join("; ")}</span>
                </td>
                <td className={table.td}>
                  <StatusBadge status={q.status} labels={quoteStatusLabel} />
                </td>
              </tr>
            ))}
            {!quotes.length && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted">
                  No quote requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
