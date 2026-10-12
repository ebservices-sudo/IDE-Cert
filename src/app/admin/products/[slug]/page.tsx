import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getSubcategory } from "@/config/catalog";
import { shop } from "@/config/site";
import { getBaseProduct } from "@/lib/catalog/data";
import { baseNetPrice } from "@/lib/catalog/net-prices";
import { productHref } from "@/lib/catalog/urls";
import { optionsText, unitLabel } from "@/lib/orders/pricing";
import { overrideMap } from "@/lib/prices/imports";
import { AdminHeader, Card, buttonCls, eur, table } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Product" };

export default async function AdminProduct({ params }: PageProps<"/admin/products/[slug]">) {
  const product = getBaseProduct((await params).slug);
  if (!product) notFound();
  const overrides = await overrideMap();

  return (
    <>
      <AdminHeader
        back={{ href: "/admin/products", label: "Products" }}
        title={product.name}
        description={`${getSubcategory(product.mainCategory, product.subcategory)?.name} · ${product.priceLists.join(", ")} price list`}
        actions={
          <>
            <Link href={productHref(product)} target="_blank" className={buttonCls.outline}>
              View in shop
              <ExternalLink aria-hidden className="size-4" />
            </Link>
            {product.source && (
              <a href={product.source.url} target="_blank" rel="noopener noreferrer" className={buttonCls.outline}>
                edelrid.com
                <ExternalLink aria-hidden className="size-4" />
              </a>
            )}
          </>
        }
      />
      <Card title="Items, prices and margin">
        <div className="-m-5 overflow-x-auto">
          <table className={table.table}>
            <thead className={table.thead}>
              <tr>
                <th className={table.th}>Item no.</th>
                <th className={table.th}>Options</th>
                <th className={`${table.th} text-right`}>RRP incl. VAT</th>
                <th className={`${table.th} text-right`}>Net (EDELRID)</th>
                <th className={`${table.th} text-right`}>Margin excl. VAT</th>
              </tr>
            </thead>
            <tbody className={table.tbody}>
              {product.variants.map((v) => {
                const o = overrides.get(v.sku);
                const rrp = o?.rrpCents ?? Math.round(v.price * 100);
                const baseNet = baseNetPrice(v.sku);
                const net = o?.netCents ?? (baseNet ? Math.round(baseNet.net * 100) : null);
                const exVat = rrp / (1 + shop.vatRate);
                const margin = net != null ? exVat - net : null;
                return (
                  <tr key={v.sku}>
                    <td className={`${table.td} font-mono text-xs`}>
                      {v.sku}
                      {v.isNew && <span className="ml-1.5 font-sans text-[10px] font-bold text-brand-strong">NEW</span>}
                    </td>
                    <td className={table.td}>{optionsText(v.options) || "–"}</td>
                    <td className={`${table.td} text-right tabular-nums`}>
                      {eur(rrp)} <span className="text-xs text-muted">/ {unitLabel(v.unit)}</span>
                      {o && <span className="block text-xs text-amber-700">list {eur(Math.round(v.price * 100))}</span>}
                    </td>
                    <td className={`${table.td} text-right tabular-nums`}>{net != null ? eur(net) : "–"}</td>
                    <td className={`${table.td} text-right tabular-nums`}>
                      {margin != null ? (
                        <>
                          {eur(Math.round(margin))} <span className="text-xs text-muted">({Math.round((margin / exVat) * 100)}%)</span>
                        </>
                      ) : (
                        "–"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card title="Official data">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">EDELRID product page</dt>
              <dd>{product.source ? "Yes" : <span className="text-brand-strong">Missing</span>}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Technical values</dt>
              <dd>{Object.keys(product.specs).length}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Certification</dt>
              <dd className="text-right">{product.certifications.join(", ") || <span className="text-brand-strong">none listed</span>}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Downloads</dt>
              <dd>{product.downloads.length}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Photos</dt>
              <dd>{product.images.length}</dd>
            </div>
          </dl>
        </Card>
        <Card title="How to change this product">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted">
            <li>Prices: upload a new EDELRID price list under Price lists.</li>
            <li>Category, name translations: scripts/catalog/rules.mjs, then npm run catalog.</li>
            <li>Specs, photos and downloads come from edelrid.com: npm run edelrid:fetch, then npm run catalog.</li>
          </ul>
        </Card>
      </div>
    </>
  );
}
