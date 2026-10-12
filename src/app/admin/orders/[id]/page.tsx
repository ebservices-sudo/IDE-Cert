import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, Printer } from "lucide-react";
import { bankDetailsComplete } from "@/config/business";
import { countryName } from "@/config/shipping";
import { getOrder } from "@/lib/orders/queries";
import { StatusBadge } from "@/lib/orders/status";
import { unitLabel } from "@/lib/orders/pricing";
import { AdminHeader, Card, buttonCls, dateTime, eur, table } from "@/components/admin/ui";
import { OrderEditor, ProformaButton } from "@/components/admin/OrderForms";

export const metadata: Metadata = { title: "Order" };


export default async function AdminOrder({ params }: PageProps<"/admin/orders/[id]">) {
  // Layouts do not protect pages (segments render independently): check here.
  await requireAdmin();
  const order = await getOrder((await params).id);
  if (!order) notFound();
  const proformaBlocked = !bankDetailsComplete
    ? "Add the bank details in src/config/business.ts to send proformas."
    : order.shippingCents == null
      ? "Enter and save the shipping cost first (0 if free)."
      : undefined;

  return (
    <>
      <AdminHeader
        back={{ href: "/admin/orders", label: "Orders" }}
        title={`Order ${order.number}`}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            {dateTime(order.createdAt)} <StatusBadge status={order.status} />
          </span>
        }
        actions={
          <Link href={`/admin/orders/${order.id}/proforma`} target="_blank" className={buttonCls.outline}>
            <Printer aria-hidden className="size-4" />
            Print proforma
          </Link>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card title="Items">
            <div className="-m-5 overflow-x-auto">
              <table className={table.table}>
                <thead className={table.thead}>
                  <tr>
                    <th className={table.th}>Product</th>
                    <th className={table.th}>Item no.</th>
                    <th className={`${table.th} text-right`}>Qty</th>
                    <th className={`${table.th} text-right`}>Unit price</th>
                    <th className={`${table.th} text-right`}>Total</th>
                  </tr>
                </thead>
                <tbody className={table.tbody}>
                  {order.lines.map((l) => (
                    <tr key={l.sku}>
                      <td className={table.td}>
                        <span className="font-semibold">{l.name}</span>
                        {l.optionsText && <span className="block text-xs text-muted">{l.optionsText}</span>}
                      </td>
                      <td className={`${table.td} font-mono text-xs`}>{l.sku}</td>
                      <td className={`${table.td} text-right tabular-nums`}>
                        {l.qty} {unitLabel(l.unit)}
                      </td>
                      <td className={`${table.td} text-right tabular-nums`}>{eur(l.unitCents)}</td>
                      <td className={`${table.td} text-right font-semibold tabular-nums`}>{eur(l.lineCents)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="text-sm">
                  <tr>
                    <td colSpan={4} className="px-4 pt-3 text-right text-muted">Items</td>
                    <td className="px-4 pt-3 text-right tabular-nums">{eur(order.itemsCents)}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-4 py-1 text-right text-muted">Shipping ({order.zoneName})</td>
                    <td className="px-4 py-1 text-right tabular-nums">{order.shippingCents == null ? <span className="text-brand-strong">not set</span> : eur(order.shippingCents)}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-4 py-1 text-right font-semibold">Total</td>
                    <td className="px-4 py-1 text-right font-semibold tabular-nums">{eur(order.totalCents)}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-4 pb-3 text-right text-xs text-muted">incl. VAT 18%</td>
                    <td className="px-4 pb-3 text-right text-xs text-muted tabular-nums">{eur(order.vatCents)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Customer">
              <p className="font-semibold">{order.name}</p>
              {order.customerType === "company" && (
                <p className="mt-1 text-sm">
                  {order.company}
                  <br />
                  NUI {order.nui}
                  {order.vatNumber && ` · VAT ${order.vatNumber}`}
                </p>
              )}
              <p className="mt-3 flex items-center gap-2 text-sm">
                <Mail aria-hidden className="size-4 text-muted" />
                <a href={`mailto:${order.email}?subject=${encodeURIComponent(`Your order ${order.number}`)}`} className="hover:text-brand-strong hover:underline">
                  {order.email}
                </a>
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm">
                <Phone aria-hidden className="size-4 text-muted" />
                <a href={`tel:${order.phone.replace(/[^\d+]/g, "")}`} className="hover:text-brand-strong hover:underline">
                  {order.phone}
                </a>
              </p>
              <p className="mt-3 text-xs text-muted">{order.userId ? "Has an account" : "Guest checkout"} · Payment: bank transfer</p>
            </Card>
            <Card title="Delivery address">
              <address className="text-sm not-italic leading-relaxed">
                {order.addressLine1}
                {order.addressLine2 && (
                  <>
                    <br />
                    {order.addressLine2}
                  </>
                )}
                <br />
                {[order.postalCode, order.city].filter(Boolean).join(" ")}
                <br />
                {countryName(order.country)}
              </address>
              {order.customerNotes && (
                <p className="mt-4 rounded-md bg-mist p-3 text-sm">
                  <span className="font-semibold">Customer note:</span> {order.customerNotes}
                </p>
              )}
            </Card>
          </div>
        </div>
        <div className="space-y-6">
          <Card title="Proforma invoice">
            <ProformaButton id={order.id} disabledReason={proformaBlocked} sentAt={order.proformaSentAt} />
          </Card>
          <Card title="Manage">
            <OrderEditor id={order.id} status={order.status} shippingCents={order.shippingCents} adminNotes={order.adminNotes ?? ""} />
          </Card>
        </div>
      </div>
    </>
  );
}
