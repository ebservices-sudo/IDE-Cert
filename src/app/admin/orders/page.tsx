import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { countryName } from "@/config/shipping";
import { listOrders } from "@/lib/orders/queries";
import { ORDER_STATUSES } from "@/lib/orders/store";
import { StatusBadge, orderStatusLabel } from "@/lib/orders/status";
import { AdminHeader, buttonCls, dateTime, eur, inputCls, table } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Orders" };

/** Private, request-time page (see admin/layout.tsx). */
export const instant = false;

export default async function AdminOrders({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && (ORDER_STATUSES as readonly string[]).includes(sp.status) ? sp.status : undefined;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const orders = await listOrders({ status, q: q || undefined, limit: 200 });

  return (
    <>
      <AdminHeader title="Orders" description={`${orders.length} shown`} />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter by status" className="flex flex-wrap gap-1.5">
          {[undefined, ...ORDER_STATUSES].map((s) => (
            <Link
              key={s ?? "all"}
              href={s ? `/admin/orders?status=${s}` : "/admin/orders"}
              aria-current={status === s ? "page" : undefined}
              className={clsx(
                "rounded-full border px-3 py-1 text-xs font-semibold",
                status === s ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40",
              )}
            >
              {s ? orderStatusLabel[s] : "All"}
            </Link>
          ))}
        </nav>
        <form className="flex gap-2" role="search">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Number, name, email, company" aria-label="Search orders" className={`${inputCls} h-10 w-64`} />
          <button className={buttonCls.outline}>Search</button>
        </form>
      </div>
      <div className={table.wrap}>
        <table className={table.table}>
          <thead className={table.thead}>
            <tr>
              <th className={table.th}>Order</th>
              <th className={table.th}>Customer</th>
              <th className={table.th}>Country</th>
              <th className={table.th}>Items</th>
              <th className={table.th}>Status</th>
              <th className={`${table.th} text-right`}>Total</th>
            </tr>
          </thead>
          <tbody className={table.tbody}>
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-mist/60">
                <td className={table.td}>
                  <Link href={`/admin/orders/${o.id}`} className="font-semibold hover:text-brand-strong">
                    {o.number}
                  </Link>
                  <span className="block text-xs text-muted">{dateTime(o.createdAt)}</span>
                </td>
                <td className={table.td}>
                  {o.company ?? o.name}
                  <span className="block text-xs text-muted">{o.email}</span>
                </td>
                <td className={table.td}>{countryName(o.country)}</td>
                <td className={table.td}>{o.itemCount}</td>
                <td className={table.td}>
                  <StatusBadge status={o.status} />
                </td>
                <td className={`${table.td} text-right font-semibold tabular-nums`}>
                  {eur(o.totalCents)}
                  {o.shippingCents == null && <span className="block text-xs font-normal text-muted">+ shipping</span>}
                </td>
              </tr>
            ))}
            {!orders.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
