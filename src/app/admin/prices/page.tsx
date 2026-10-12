import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { resetPrices } from "@/actions/admin";
import { listImports, overrideMap } from "@/lib/prices/imports";
import { AdminHeader, Card, buttonCls, dateTime, table } from "@/components/admin/ui";
import { PriceUpload } from "@/components/admin/PriceUpload";

export const metadata: Metadata = { title: "Price lists" };


const STATUS: Record<string, string> = { draft: "Draft", published: "Live", superseded: "Replaced", discarded: "Discarded" };

export default async function AdminPrices({ searchParams }: PageProps<"/admin/prices">) {
  // Layouts do not protect pages (segments render independently): check here.
  await requireAdmin();
  const [imports, overrides, sp] = await Promise.all([listImports(), overrideMap(), searchParams]);
  return (
    <>
      <AdminHeader
        title="Price lists"
        description="Upload a new EDELRID price list to update shop prices. You review every change before it goes live."
      />
      {sp.reset && <p role="status" className="mb-6 rounded-lg border border-line bg-white p-3 text-sm font-medium">All price changes were removed — the shop uses the built-in 2026 price lists again.</p>}
      <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <Card title="Upload a price list">
          <PriceUpload />
        </Card>
        <div className="space-y-6">
          <Card title="Prices now">
            <p className="text-sm">
              {overrides.size ? (
                <>
                  <strong>{overrides.size}</strong> item prices differ from the built-in EDELRID 2026 price lists.
                </>
              ) : (
                "The shop uses the built-in EDELRID 2026 price lists."
              )}
            </p>
            {overrides.size > 0 && (
              <form action={resetPrices} className="mt-4">
                <button className={buttonCls.outline}>Remove all price changes</button>
              </form>
            )}
            <p className="mt-4 text-xs leading-relaxed text-muted">
              New products in a price list (item numbers the shop does not know yet) are listed in the comparison but not added automatically —
              they need product data from EDELRID first.
            </p>
          </Card>
        </div>
      </div>
      <h2 className="mb-3 mt-10 font-display text-lg">Uploads</h2>
      <div className={table.wrap}>
        <table className={table.table}>
          <thead className={table.thead}>
            <tr>
              <th className={table.th}>File</th>
              <th className={table.th}>Uploaded</th>
              <th className={table.th}>Rows</th>
              <th className={table.th}>Changed</th>
              <th className={table.th}>Status</th>
            </tr>
          </thead>
          <tbody className={table.tbody}>
            {imports.map((i) => (
              <tr key={i.id}>
                <td className={table.td}>
                  <Link href={`/admin/prices/${i.id}`} className="font-semibold hover:text-brand-strong">
                    {i.filename}
                  </Link>
                </td>
                <td className={table.td}>
                  {dateTime(i.createdAt)}
                  <span className="block text-xs text-muted">{i.createdBy}</span>
                </td>
                <td className={table.td}>{i.summary.rows}</td>
                <td className={table.td}>{i.summary.changed}</td>
                <td className={table.td}>{STATUS[i.status] ?? i.status}</td>
              </tr>
            ))}
            {!imports.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No uploads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
