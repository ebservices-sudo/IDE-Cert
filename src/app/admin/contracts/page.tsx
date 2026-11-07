import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { kindLabel } from "@/lib/contracts/document";
import { CONTRACT_STATUSES, contractTotals, listContracts } from "@/lib/contracts/store";
import { StatusBadge, contractStatusLabel } from "@/lib/orders/status";
import { AdminHeader, buttonCls, dateTime, eur, table } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Contracts" };

export default async function AdminContracts({ searchParams }: PageProps<"/admin/contracts">) {
  // Layouts do not protect pages (segments render independently): check here.
  await requireAdmin();
  const sp = await searchParams;
  const status = typeof sp.status === "string" && (CONTRACT_STATUSES as readonly string[]).includes(sp.status) ? sp.status : undefined;
  const email = typeof sp.email === "string" ? sp.email.slice(0, 200) : undefined;
  const contracts = await listContracts({ status, email });

  return (
    <>
      <AdminHeader
        title="Contracts"
        description={email ? `Contracts for ${email}` : "Built from requests or from scratch, sent by email and accepted online by the client."}
        actions={
          <Link href="/admin/contracts/new" className={buttonCls.primary}>
            <Plus aria-hidden className="size-4" />
            New contract
          </Link>
        }
      />
      {sp.deleted && <p className="mb-4 text-sm font-medium text-emerald-700">Contract deleted.</p>}
      <nav aria-label="Filter" className="mb-5 flex flex-wrap gap-1.5">
        {[undefined, ...CONTRACT_STATUSES].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `/admin/contracts?status=${s}` : "/admin/contracts"}
            className={clsx("rounded-full border px-3 py-1 text-xs font-semibold", status === s ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40")}
          >
            {s ? contractStatusLabel[s] : "All"}
          </Link>
        ))}
      </nav>
      {contracts.length ? (
        <div className={table.wrap}>
          <table className={table.table}>
            <thead className={table.thead}>
              <tr>
                <th className={table.th}>Contract</th>
                <th className={table.th}>Client</th>
                <th className={table.th}>Status</th>
                <th className={`${table.th} text-right`}>Total</th>
              </tr>
            </thead>
            <tbody className={table.tbody}>
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-mist/60">
                  <td className={table.td}>
                    <Link href={`/admin/contracts/${c.id}`} className="font-semibold hover:text-brand-strong">
                      {c.number}
                    </Link>
                    <span className="block text-xs text-muted">
                      {kindLabel(c.kind)} · {c.title}
                    </span>
                  </td>
                  <td className={table.td}>
                    {c.clientCompany || c.clientName}
                    <span className="block text-xs text-muted">{c.clientEmail}</span>
                  </td>
                  <td className={table.td}>
                    <StatusBadge status={c.status} labels={contractStatusLabel} />
                    <span className="mt-1 block text-xs text-muted">
                      {c.acceptedAt
                        ? `Accepted ${dateTime(c.acceptedAt)}`
                        : c.viewedAt
                          ? `Opened ${dateTime(c.viewedAt)}`
                          : c.sentAt
                            ? `Sent ${dateTime(c.sentAt)}`
                            : `Created ${dateTime(c.createdAt)}`}
                    </span>
                  </td>
                  <td className={`${table.td} text-right font-semibold tabular-nums`}>{eur(contractTotals(c).total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">
          <p>No contracts {status ? `with status “${contractStatusLabel[status]}”` : "yet"}.</p>
          <p className="mt-2">
            Open a quote request or a message and click <strong className="text-ink">Create contract</strong>, or{" "}
            <Link href="/admin/contracts/new" className="font-semibold text-brand-strong hover:underline">
              start one from scratch
            </Link>
            .
          </p>
        </div>
      )}
    </>
  );
}
