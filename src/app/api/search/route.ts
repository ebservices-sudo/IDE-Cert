import type { NextRequest } from "next/server";
import { getSubcategory } from "@/config/catalog";
import { getCatalog } from "@/lib/catalog/data";
import { buildListing } from "@/lib/catalog/listing";
import { productHref } from "@/lib/catalog/urls";
import { formatPriceRange } from "@/lib/format";

/** Instant suggestions for the header search. Full results live at /search. */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 100).trim();
  if (q.length < 2) return Response.json({ q, total: 0, items: [] });
  const { results, total } = buildListing((await getCatalog()).products, { q, sort: "relevance", filters: {}, page: 1 });
  const items = results.slice(0, 8).map((p) => ({
    name: p.name,
    href: productHref(p),
    image: p.images[0]?.src ?? null,
    price: formatPriceRange(p),
    category: getSubcategory(p.mainCategory, p.subcategory)?.name ?? "",
  }));
  return Response.json({ q, total, items }, { headers: { "Cache-Control": "public, max-age=300" } });
}
