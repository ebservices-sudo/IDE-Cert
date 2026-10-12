import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { bankDetailsComplete } from "@/config/business";
import { getOrder } from "@/lib/orders/queries";
import { proformaHtml } from "@/lib/server/emails";
import { PrintButton } from "@/components/admin/PrintButton";

export const metadata: Metadata = { title: "Proforma" };

/** Private, request-time page (see admin/layout.tsx). */
export const instant = false;

/** Printable proforma (print → save as PDF). Same content as the emailed proforma. */
export default async function ProformaPrint({ params }: PageProps<"/admin/orders/[id]/proforma">) {
  const order = await getOrder((await params).id);
  if (!order) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-muted">
          {bankDetailsComplete ? "Print or save as PDF." : "Bank details are missing — add them in src/config/business.ts before sending."}
        </p>
        <PrintButton />
      </div>
      <article className="rounded-xl border border-line bg-white p-8 print:border-0 print:p-0">
        <p className="mb-6 font-display text-xl">
          IDE <span className="text-brand">CERT</span>
        </p>
        {/* Server-built HTML from order data; every value is escaped in proformaHtml(). */}
        <div dangerouslySetInnerHTML={{ __html: proformaHtml(order) }} />
      </article>
    </div>
  );
}
