import type { NextRequest } from "next/server";
import { getSubcategory, type WorldSlug } from "@/config/catalog";
import { toListingResult } from "@/lib/catalog/cards";
import { getCatalog } from "@/lib/catalog/data";
import { buildListing, parseListingState } from "@/lib/catalog/listing";

// Filtered, sorted listings for category and search pages:
// /api/listing?scope=sport/harnesses&colour=Night&sort=price-asc&page=2
// Without scope it searches the whole catalogue (search page).

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const params: Record<string, string | string[]> = {};
  for (const key of new Set(sp.keys())) {
    const all = sp.getAll(key);
    params[key] = all.length > 1 ? all : all[0];
  }
  const scope = sp.get("scope");
  const catalog = await getCatalog();
  let products = catalog.products;
  if (scope) {
    const [world, sub] = scope.split("/");
    if (!getSubcategory(world, sub)) return Response.json({ error: "Unknown category" }, { status: 404 });
    products = catalog.productsIn(world as WorldSlug, sub);
  }
  const state = parseListingState(params, scope ? "popular" : "relevance");
  const listing = buildListing(products, state, { categories: !scope });
  return Response.json(toListingResult(listing), { headers: { "Cache-Control": "public, max-age=60" } });
}
