import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { getSubcategory } from "@/config/catalog";
import { baseProducts, catalogGeneratedAt } from "@/lib/catalog/data";
import { buildListing } from "@/lib/catalog/listing";
import type { Product } from "@/lib/catalog/types";
import { overrideMap } from "@/lib/prices/imports";
import { AdminHeader, buttonCls, inputCls, table } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Products" };

const FILTERS: Record<string, { label: string; test: (p: Product, overridden: boolean) => boolean }> = {
  all: { label: "All", test: () => true },
  "no-data": { label: "No EDELRID data", test: (p) => !p.source },
  "no-images": { label: "No photos", test: (p) => !p.images.length },
  "no-cert": { label: "No certification", test: (p) => Boolean(p.source) && !p.certifications.length },
  new: { label: "New 2026", test: (p) => Boolean(p.isNew) },
  overridden: { label: "Price changed in admin", test: (_p, o) => o },
};

export default async function AdminProducts({ searchParams }: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const filter = typeof sp.filter === "string" && sp.filter in FILTERS ? sp.filter : "all";
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const overrides = await overrideMap();
  const isOverridden = (p: Product) => p.variants.some((v) => overrides.has(v.sku));
  const searched = q ? buildListing(baseProducts, { q, sort: "relevance", filters: {}, page: 1 }).results : baseProducts;
  const rows = searched.filter((p) => FILTERS[filter].test(p, isOverridden(p)));
  const shown = rows.slice(0, 200);

  return (
    <>
      <AdminHeader
        title="Products"
        description={`${baseProducts.length} products from the EDELRID 2026 price lists · catalogue built ${catalogGeneratedAt}. Product data comes from the price lists and edelrid.com; see data/TODO.md for gaps.`}
      />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter" className="flex flex-wrap gap-1.5">
          {Object.entries(FILTERS).map(([key, f]) => (
            <Link
              key={key}
              href={`/admin/products?filter=${key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={clsx("rounded-full border px-3 py-1 text-xs font-semibold", filter === key ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40")}
            >
              {f.label}
            </Link>
          ))}
        </nav>
        <form className="flex gap-2" role="search">
          <input type="hidden" name="filter" value={filter} />
          <input name="q" defaultValue={q} placeholder="Name or item number" aria-label="Search products" className={`${inputCls} h-10 w-64`} />
          <button className={buttonCls.outline}>Search</button>
        </form>
      </div>
      <p className="mb-3 text-sm text-muted">
        {rows.length} products{rows.length > shown.length ? `, first ${shown.length} shown` : ""}
      </p>
      <div className={table.wrap}>
        <table className={table.table}>
          <thead className={table.thead}>
            <tr>
              <th className={table.th}>Product</th>
              <th className={table.th}>Category</th>
              <th className={table.th}>Items</th>
              <th className={table.th}>Data</th>
            </tr>
          </thead>
          <tbody className={table.tbody}>
            {shown.map((p) => (
              <tr key={p.id} className="hover:bg-mist/60">
                <td className={table.td}>
                  <Link href={`/admin/products/${p.slug}`} className="font-semibold hover:text-brand-strong">
                    {p.name}
                  </Link>
                  {p.isNew && <span className="ml-2 rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-strong">New</span>}
                </td>
                <td className={table.td}>
                  {getSubcategory(p.mainCategory, p.subcategory)?.name}
                  <span className="block text-xs capitalize text-muted">{p.mainCategory}</span>
                </td>
                <td className={table.td}>{p.variants.length}</td>
                <td className={table.td}>
                  <span className="flex flex-wrap gap-1 text-[11px] font-semibold">
                    <Flag ok={Boolean(p.source)} label="EDELRID data" />
                    <Flag ok={p.images.length > 0} label="Photos" />
                    <Flag ok={p.certifications.length > 0} label="Cert." />
                    {isOverridden(p) && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-900">Price changed</span>}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Flag({ ok, label }: { ok: boolean; label: string }) {
  return <span className={clsx("rounded px-1.5 py-0.5", ok ? "bg-emerald-100 text-emerald-900" : "bg-brand-soft text-brand-strong")}>{label}</span>;
}
