import type { NextRequest } from "next/server";
import { getSubcategory } from "@/config/catalog";
import { getCatalog } from "@/lib/catalog/data";
import { productHref } from "@/lib/catalog/urls";

// Quick-view data for the shop explorer: GET /api/product?slug=swift-protect-eco-dry-8-9-mm
// Variants with current published prices (RRP incl. VAT) and photos per colour.

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") ?? "";
  const product = (await getCatalog()).getProduct(slug);
  if (!product) return Response.json({ error: "Unknown product" }, { status: 404 });
  return Response.json(
    {
      slug: product.slug,
      href: productHref(product),
      name: product.name,
      brand: product.brand,
      catName: getSubcategory(product.mainCategory, product.subcategory)?.name ?? "",
      shortDescription: product.shortDescription,
      chips: product.chips ?? [],
      images: product.images.map((i) => ({ src: i.src, alt: i.alt, colour: i.colour ?? null })),
      variants: product.variants.map((v) => ({ sku: v.sku, options: v.options, price: v.price, unit: v.unit, isNew: Boolean(v.isNew) })),
      quoteNotes: product.quoteNotes ?? [],
    },
    { headers: { "Cache-Control": "public, max-age=60" } },
  );
}
