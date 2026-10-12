import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { countryName } from "@/config/shipping";
import { getCatalog } from "@/lib/catalog/data";
import { productHref } from "@/lib/catalog/urls";
import { getQuote } from "@/lib/orders/queries";
import { StatusBadge, quoteStatusLabel } from "@/lib/orders/status";
import { AdminHeader, Card, buttonCls, dateTime, eur, table } from "@/components/admin/ui";
import { QuoteEditor } from "@/components/admin/OrderForms";

export const metadata: Metadata = { title: "Quote request" };

/** Private, request-time page (see admin/layout.tsx). */
export const instant = false;

export default async function AdminQuote({ params }: PageProps<"/admin/quotes/[id]">) {
  const quote = await getQuote((await params).id);
  if (!quote) notFound();
  const { getVariant } = await getCatalog();
  const reply = `mailto:${quote.email}?subject=${encodeURIComponent(`Your quote request ${quote.number}`)}`;

  return (
    <>
      <AdminHeader
        back={{ href: "/admin/quotes", label: "Quotes" }}
        title={`Quote request ${quote.number}`}
        description={
          <span className="inline-flex items-center gap-2">
            {dateTime(quote.createdAt)} <StatusBadge status={quote.status} labels={quoteStatusLabel} />
          </span>
        }
        actions={
          <a href={reply} className={buttonCls.primary}>
            <Mail aria-hidden className="size-4" />
            Reply by email
          </a>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card title="Requested products">
            <div className="-m-5 overflow-x-auto">
              <table className={table.table}>
                <thead className={table.thead}>
                  <tr>
                    <th className={table.th}>Product</th>
                    <th className={table.th}>Quantity</th>
                    <th className={table.th}>Details</th>
                    <th className={`${table.th} text-right`}>Shop price</th>
                  </tr>
                </thead>
                <tbody className={table.tbody}>
                  {quote.items.map((i, n) => {
                    const known = i.sku ? getVariant(i.sku) : undefined;
                    return (
                      <tr key={`${i.sku}-${n}`}>
                        <td className={table.td}>
                          {known ? (
                            <Link href={`${productHref(known.product)}?sku=${i.sku}`} target="_blank" className="font-semibold hover:text-brand-strong hover:underline">
                              {i.name}
                            </Link>
                          ) : (
                            <span className="font-semibold">{i.name}</span>
                          )}
                          {i.sku && <span className="block font-mono text-xs text-muted">{i.sku}</span>}
                        </td>
                        <td className={table.td}>{i.quantity}</td>
                        <td className={table.td}>{i.details || "–"}</td>
                        <td className={`${table.td} text-right tabular-nums`}>{known ? eur(Math.round(known.variant.price * 100)) : "–"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          {quote.message && (
            <Card title="Message">
              <p className="whitespace-pre-line text-sm leading-relaxed">{quote.message}</p>
            </Card>
          )}
        </div>
        <div className="space-y-6">
          <Card title="Customer">
            <p className="font-semibold">{quote.name}</p>
            {quote.company && (
              <p className="text-sm">
                {quote.company}
                {quote.nui && ` · NUI ${quote.nui}`}
              </p>
            )}
            <p className="mt-2 text-sm">
              <a href={reply} className="hover:text-brand-strong hover:underline">
                {quote.email}
              </a>
              {quote.phone && <span className="block">{quote.phone}</span>}
            </p>
            <p className="mt-2 text-xs text-muted">Delivery to {countryName(quote.country)}</p>
          </Card>
          <Card title="Manage">
            <QuoteEditor id={quote.id} status={quote.status} adminNotes={quote.adminNotes ?? ""} />
          </Card>
        </div>
      </div>
    </>
  );
}
