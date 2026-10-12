import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { bankDetailsComplete } from "@/config/business";
import { shippingZones } from "@/config/shipping";
import { shop } from "@/config/site";
import { dashboardCounts, listOrders, listQuotes } from "@/lib/orders/queries";
import { StatusBadge, quoteStatusLabel } from "@/lib/orders/status";
import { AdminHeader, Card, Stat, dateTime, eur, table } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const [counts, orders, quotes] = await Promise.all([dashboardCounts(), listOrders({ limit: 8 }), listQuotes({ limit: 6 })]);
  const setup = [
    !bankDetailsComplete && "Bank details for proforma invoices (src/config/business.ts)",
    shippingZones.some((z) => z.rateCents == null) && "Shipping rates (src/config/shipping.ts) — until then shipping is set per order",
    !shop.leadTime && "Typical delivery time (src/config/site.ts → shop.leadTime)",
  ].filter(Boolean) as string[];

  return (
    <>
      <AdminHeader title="Dashboard" />
      {setup.length > 0 && (
        <div className="mb-8 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">Still to set up before launch</p>
            <ul className="mt-1 list-disc pl-5">
              {setup.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="New orders" value={counts.new_orders ?? 0} href="/admin/orders?status=received" tone={counts.new_orders ? "alert" : undefined} />
        <Stat label="Awaiting payment" value={counts.awaiting_payment ?? 0} href="/admin/orders?status=proforma_sent" />
        <Stat label="To order / ship" value={counts.to_fulfil ?? 0} href="/admin/orders?status=paid" />
        <Stat label="New quote requests" value={counts.new_quotes ?? 0} href="/admin/quotes" tone={counts.new_quotes ? "alert" : undefined} />
        <Stat label="Orders, last 30 days" value={eur(counts.revenue_30d ?? 0)} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[3fr_2fr]">
        <Card title="Latest orders" actions={<Link href="/admin/orders" className="text-xs font-semibold text-brand-strong hover:underline">All orders</Link>}>
          {orders.length ? (
            <div className="-m-5 overflow-x-auto">
              <table className={table.table}>
                <tbody className={table.tbody}>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className={table.td}>
                        <Link href={`/admin/orders/${o.id}`} className="font-semibold hover:text-brand-strong">
                          {o.number}
                        </Link>
                        <span className="block text-xs text-muted">{dateTime(o.createdAt)}</span>
                      </td>
                      <td className={table.td}>{o.company ?? o.name}</td>
                      <td className={table.td}>
                        <StatusBadge status={o.status} />
                      </td>
                      <td className={`${table.td} text-right font-semibold tabular-nums`}>{eur(o.totalCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted">No orders yet.</p>
          )}
        </Card>
        <Card title="Latest quote requests" actions={<Link href="/admin/quotes" className="text-xs font-semibold text-brand-strong hover:underline">All quotes</Link>}>
          {quotes.length ? (
            <ul className="-my-2 divide-y divide-line">
              {quotes.map((q) => (
                <li key={q.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0">
                    <Link href={`/admin/quotes/${q.id}`} className="font-semibold hover:text-brand-strong">
                      {q.number}
                    </Link>
                    <span className="block truncate text-xs text-muted">
                      {q.company ?? q.name} · {q.items.length} {q.items.length === 1 ? "item" : "items"}
                    </span>
                  </span>
                  <StatusBadge status={q.status} labels={quoteStatusLabel} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No quote requests yet.</p>
          )}
        </Card>
      </div>
    </>
  );
}
