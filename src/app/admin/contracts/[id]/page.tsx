import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Pencil } from "lucide-react";
import { changeContractStatus, deleteContract } from "@/actions/contracts";
import { requireAdmin } from "@/lib/auth/session";
import { contractDocumentHtml, formatDate, kindLabel } from "@/lib/contracts/document";
import { acceptDeadline, contractTotals, getContract } from "@/lib/contracts/store";
import { StatusBadge, contractStatusLabel } from "@/lib/orders/status";
import { requestOrigin } from "@/lib/server/origin";
import { AdminHeader, Card, buttonCls, dateTime, eur } from "@/components/admin/ui";
import { CopyLink, SendContractForm } from "@/components/admin/ContractActions";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Contract" };

const sourceHref = (type: string | null, id: string | null) =>
  type === "quote" ? `/admin/quotes/${id}` : type === "order" ? `/admin/orders/${id}` : type === "message" ? "/admin/messages" : null;

export default async function AdminContract({ params, searchParams }: PageProps<"/admin/contracts/[id]">) {
  // Layouts do not protect pages (segments render independently): check here.
  await requireAdmin();
  const c = await getContract((await params).id);
  if (!c) notFound();
  const sp = await searchParams;
  const link = `${await requestOrigin()}/kontrata/${c.token}`;
  const totals = contractTotals(c);
  const deadline = acceptDeadline(c);
  const src = sourceHref(c.sourceType, c.sourceId);

  const timeline = [
    { label: "Created", at: c.createdAt },
    c.sentAt && { label: `Sent to ${c.sentTo}`, at: c.sentAt },
    c.viewedAt && { label: "Opened by the client", at: c.viewedAt },
    c.acceptedAt && { label: `Accepted online by ${c.acceptedName}`, at: c.acceptedAt },
  ].filter(Boolean) as { label: string; at: string }[];

  return (
    <>
      <AdminHeader
        back={{ href: "/admin/contracts", label: "Contracts" }}
        title={`${c.number} · ${c.clientCompany || c.clientName}`}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            {kindLabel(c.kind)} · {c.language === "sq" ? "Shqip" : "English"} · {eur(totals.total)} incl. VAT
            <StatusBadge status={c.status} labels={contractStatusLabel} />
          </span>
        }
        actions={
          <>
            {c.status !== "accepted" && (
              <Link href={`/admin/contracts/${c.id}/edit`} className={buttonCls.outline}>
                <Pencil aria-hidden className="size-4" />
                Edit
              </Link>
            )}
            <a href={`${link}?print=1`} target="_blank" rel="noopener" className={buttonCls.outline}>
              Print / PDF
              <ExternalLink aria-hidden className="size-4" />
            </a>
          </>
        }
      />
      {sp.saved && (
        <p role="status" className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          Saved. Check the preview below, then send it to the client.
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 overflow-x-auto rounded-xl border border-line bg-[#f5f5f4] p-3 sm:p-6">
          <div className="mx-auto max-w-[720px] shadow-[0_10px_40px_-12px_rgba(0,0,0,0.25)]" dangerouslySetInnerHTML={{ __html: contractDocumentHtml(c) }} />
        </div>
        <div className="space-y-6">
          {c.status === "accepted" ? (
            <Card title="Accepted">
              <p className="text-sm">
                <strong>{c.acceptedName}</strong> accepted this contract online on {dateTime(c.acceptedAt!)}. It can no longer be edited.
              </p>
            </Card>
          ) : c.status === "cancelled" ? (
            <Card title="Cancelled">
              <p className="text-sm text-muted">The client can no longer accept this contract.</p>
              <form action={changeContractStatus} className="mt-3">
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="status" value="draft" />
                <button className={buttonCls.outline}>Reopen</button>
              </form>
            </Card>
          ) : (
            <Card title={c.sentAt ? "Send again" : "Send to the client"}>
              <SendContractForm id={c.id} email={c.clientEmail} alreadySent={Boolean(c.sentAt)} />
            </Card>
          )}
          <Card title="Progress">
            <ol className="space-y-3">
              {timeline.map((t) => (
                <li key={t.label} className="flex gap-3 text-sm">
                  <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-strong" />
                  <span>
                    {t.label}
                    <span className="block text-xs text-muted">{dateTime(t.at)}</span>
                  </span>
                </li>
              ))}
            </ol>
            {c.status === "sent" && deadline && <p className="mt-4 text-xs text-muted">The client can accept until {formatDate(deadline.toISOString())}.</p>}
            {c.sentAt && !c.viewedAt && c.status === "sent" && <p className="mt-2 text-xs text-muted">Not opened yet.</p>}
          </Card>
          <Card title="Client link">
            <p className="mb-3 text-xs text-muted">Private link to read, print and accept this contract. Share it on WhatsApp or Viber too if you like.</p>
            <CopyLink url={link} />
          </Card>
          <Card title="Details">
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted">Client</dt>
                <dd>
                  {c.clientName} · <a href={`mailto:${c.clientEmail}`} className="hover:text-brand-strong hover:underline">{c.clientEmail}</a>
                  {c.clientPhone && <span className="block">{c.clientPhone}</span>}
                </dd>
              </div>
              {src && (
                <div>
                  <dt className="text-xs text-muted">Made from</dt>
                  <dd>
                    <Link href={src} className="font-semibold hover:text-brand-strong hover:underline">
                      {c.sourceType === "quote" ? "Quote" : c.sourceType === "order" ? "Order" : "Message"} {c.sourceNumber ?? ""}
                    </Link>
                  </dd>
                </div>
              )}
              {c.nextInspectionDate && (
                <div>
                  <dt className="text-xs text-muted">Next inspection due</dt>
                  <dd>{formatDate(c.nextInspectionDate)}</dd>
                </div>
              )}
              {c.internalNotes && (
                <div>
                  <dt className="text-xs text-muted">Internal notes</dt>
                  <dd className="whitespace-pre-line">{c.internalNotes}</dd>
                </div>
              )}
            </dl>
          </Card>
          <div className="space-y-3">
            {c.status === "sent" && (
              <form action={changeContractStatus}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="status" value="cancelled" />
                <button className="text-sm font-semibold text-muted hover:text-brand-strong">Cancel contract (the client can no longer accept it)</button>
              </form>
            )}
            <DeleteButton
              action={deleteContract}
              id={c.id}
              label="Delete contract"
              warning={
                c.status === "accepted"
                  ? "The client accepted this contract. Deleting removes it and its acceptance record for good."
                  : c.status === "sent"
                    ? "Deleting also makes the client's link stop working. This cannot be undone."
                    : "This cannot be undone."
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}
