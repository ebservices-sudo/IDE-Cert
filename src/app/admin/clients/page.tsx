import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listClients } from "@/lib/orders/queries";
import { AdminHeader, buttonCls, dateTime, inputCls, table } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Clients" };

export default async function AdminClients({ searchParams }: PageProps<"/admin/clients">) {
  // Layouts do not protect pages (segments render independently): check here.
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const clients = await listClients(q);
  const count = (n: number, one: string, many: string) => (n ? `${n} ${n === 1 ? one : many}` : null);

  return (
    <>
      <AdminHeader title="Clients" description="Everyone who sent a request, message or order, or received a contract. Newest contact first." />
      <form className="mb-5 flex gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Name, company or email" aria-label="Search clients" className={`${inputCls} h-10 max-w-sm`} />
        <button className={buttonCls.outline}>Search</button>
      </form>
      {clients.length ? (
        <div className={table.wrap}>
          <table className={table.table}>
            <thead className={table.thead}>
              <tr>
                <th className={table.th}>Client</th>
                <th className={table.th}>History</th>
                <th className={table.th}>Last contact</th>
                <th className={table.th} />
              </tr>
            </thead>
            <tbody className={table.tbody}>
              {clients.map((c) => (
                <tr key={c.email} className="hover:bg-mist/60">
                  <td className={table.td}>
                    <span className="font-semibold">{c.company || c.name}</span>
                    {c.company && <span className="block text-xs text-muted">{c.name}</span>}
                    <a href={`mailto:${c.email}`} className="block text-xs hover:text-brand-strong hover:underline">
                      {c.email}
                    </a>
                    {c.phone && <span className="block text-xs text-muted">{c.phone}</span>}
                  </td>
                  <td className={`${table.td} text-xs`}>
                    {[
                      count(c.quotes, "quote", "quotes"),
                      count(c.messages, "message", "messages"),
                      c.orders ? (
                        <Link key="o" href={`/admin/orders?q=${encodeURIComponent(c.email)}`} className="hover:text-brand-strong hover:underline">
                          {count(c.orders, "order", "orders")}
                        </Link>
                      ) : null,
                      c.contracts ? (
                        <Link key="c" href={`/admin/contracts?email=${encodeURIComponent(c.email)}`} className="font-semibold hover:text-brand-strong hover:underline">
                          {count(c.contracts, "contract", "contracts")}
                        </Link>
                      ) : null,
                    ]
                      .filter(Boolean)
                      .map((x, i) => (
                        <span key={i} className="mr-2 inline-block whitespace-nowrap">
                          {x}
                        </span>
                      ))}
                  </td>
                  <td className={`${table.td} whitespace-nowrap text-xs text-muted`}>{dateTime(c.lastContact)}</td>
                  <td className={`${table.td} text-right`}>
                    <a href={`mailto:${c.email}`} className="text-xs font-semibold text-brand-strong hover:underline">
                      Email
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">{q ? "No client matches that search." : "No clients yet."}</p>
      )}
    </>
  );
}
