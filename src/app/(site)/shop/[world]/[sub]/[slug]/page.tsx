import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ChevronRight, Download, ExternalLink } from "lucide-react";
import { getSubcategory, getWorld, subcategoryHref, worldHref } from "@/config/catalog";
import { baseProducts, getBaseProduct, getCatalog } from "@/lib/catalog/data";
import { isPpe, productFaqs } from "@/lib/catalog/faqs";
import { productHref } from "@/lib/catalog/urls";
import type { Download as DownloadT, Product } from "@/lib/catalog/types";
import { formatPrice, unitSuffix } from "@/lib/format";
import { ProductHero, ProductHeroFromUrl, type HeroProduct } from "@/components/product/ProductHero";
import { ProductCard } from "@/components/product/ProductCard";
import { toCard } from "@/lib/catalog/cards";
import { JsonLd, breadcrumbLd, productLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";

export function generateStaticParams() {
  return baseProducts.map((p) => ({ world: p.mainCategory, sub: p.subcategory, slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[world]/[sub]/[slug]">): Promise<Metadata> {
  const product = getBaseProduct((await params).slug);
  if (!product) return {};
  const sub = getSubcategory(product.mainCategory, product.subcategory);
  const description =
    product.shortDescription || `${product.name} by EDELRID. ${sub?.name ?? ""} from IDE Cert, Prishtinë. Delivery across Kosovo and the Balkans.`;
  return {
    title: `${product.name} – EDELRID ${sub?.name ?? ""}`.trim(),
    description,
    alternates: { canonical: productHref(product) },
    openGraph: {
      title: `EDELRID ${product.name}`,
      description,
      images: product.images[0] ? [{ url: product.images[0].src, alt: product.images[0].alt }] : undefined,
    },
  };
}

export default function ProductPage({ params }: PageProps<"/shop/[world]/[sub]/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: Pick<PageProps<"/shop/[world]/[sub]/[slug]">, "params">) {
  const { world, sub, slug } = await params;
  const catalog = await getCatalog();
  const product = catalog.getProduct(slug);
  if (!product) notFound();
  // One canonical URL per product. "Also listed in" URLs redirect in next.config.ts.
  if (product.mainCategory !== world || product.subcategory !== sub) notFound();

  const w = getWorld(product.mainCategory)!;
  const subcategory = getSubcategory(product.mainCategory, product.subcategory)!;
  const manual = product.downloads.find((d) => d.kind === "manual");
  const hero: HeroProduct = {
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    isNew: product.isNew,
    shortDescription: product.shortDescription,
    variants: product.variants,
    images: product.images,
    subcategoryName: subcategory.name,
    quoteNotes: product.quoteNotes ?? [],
    manualUrl: isPpe(product) ? manual?.url : undefined,
  };
  const related = catalog.getProducts(product.related);
  const faqs = productFaqs(product);

  return (
    <>
      <JsonLd data={productLd(product)} />
      <JsonLd
        data={breadcrumbLd([
          { name: "Shop", path: "/shop" },
          { name: w.name, path: worldHref(w.slug) },
          { name: subcategory.name, path: subcategoryHref(w.slug, subcategory.slug) },
          { name: product.name, path: productHref(product) },
        ])}
      />
      <div className="border-b border-line bg-mist">
        <Container>
          <nav aria-label="Breadcrumb" className="py-3">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
              {[
                { label: "Home", href: "/" },
                { label: "Shop", href: "/shop" },
                { label: w.name, href: worldHref(w.slug) },
                { label: subcategory.name, href: subcategoryHref(w.slug, subcategory.slug) },
              ].map((c) => (
                <li key={c.href} className="flex items-center gap-1.5">
                  <Link href={c.href} className="hover:text-ink">
                    {c.label}
                  </Link>
                  <ChevronRight aria-hidden className="size-3.5" />
                </li>
              ))}
              <li aria-current="page" className="font-medium text-ink">
                {product.name}
              </li>
            </ol>
          </nav>
        </Container>
      </div>

      <Container className="py-8 lg:py-12">
        <Suspense fallback={<ProductHero product={hero} initialSku={null} />}>
          <ProductHeroFromUrl product={hero} />
        </Suspense>
      </Container>

      <ProductDetails product={product} faqs={faqs} />

      {related.length > 0 && (
        <section className="border-t border-line bg-mist py-14" aria-labelledby="related-title">
          <Container>
            <h2 id="related-title" className="font-display text-2xl">
              More {subcategory.name.toLowerCase()}
            </h2>
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard card={toCard(p)} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  );
}

function ProductSkeleton() {
  return (
    <div aria-hidden>
      <div className="h-11 border-b border-line bg-mist" />
      <Container className="grid gap-8 py-8 lg:grid-cols-2 lg:gap-14 lg:py-12">
        <div className="aspect-square animate-pulse rounded-xl bg-mist" />
        <div className="space-y-4">
          <div className="h-4 w-40 animate-pulse rounded bg-mist" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-mist" />
          <div className="h-5 w-2/3 animate-pulse rounded bg-mist" />
          <div className="h-9 w-32 animate-pulse rounded bg-mist" />
          <div className="h-24 animate-pulse rounded bg-mist" />
          <div className="h-12 animate-pulse rounded bg-mist" />
        </div>
      </Container>
    </div>
  );
}

// --- details ---------------------------------------------------------------

function ProductDetails({ product, faqs }: { product: Product; faqs: ReturnType<typeof productFaqs> }) {
  const specs = Object.entries(product.specs);
  const sections = [
    { id: "overview", label: "Overview", show: Boolean(product.description || product.features.length) },
    { id: "technical", label: "Technical data", show: true },
    { id: "downloads", label: "Downloads", show: product.downloads.length > 0 },
    { id: "faq", label: "FAQ", show: faqs.length > 0 },
  ].filter((s) => s.show);

  return (
    <div className="border-t border-line">
      <nav aria-label="Product sections" className="sticky top-16 z-30 border-b border-line bg-white/95 backdrop-blur lg:top-[72px]">
        <Container>
          <ul className="-mx-1 flex gap-1 overflow-x-auto py-2 text-sm font-semibold">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block whitespace-nowrap rounded-md px-3 py-2 text-muted hover:bg-mist hover:text-ink">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      <Container className="py-12 lg:py-16">
        <div className="mx-auto max-w-4xl space-y-16">
          {!product.source && (
            <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
              <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-amber-600" />
              <p>
                EDELRID has not yet published the product page, technical data and user manual for this item online. We list it
                with the name, item numbers and prices from the EDELRID 2026 price list only.{" "}
                <Link href={`/contact?about=${encodeURIComponent(`EDELRID ${product.name} (item ${product.variants[0].sku}${product.variants.length > 1 ? " and variants" : ""})`)}`} className="font-semibold underline">
                  Ask us for the product sheet
                </Link>{" "}
                before ordering.
              </p>
            </div>
          )}

          {sections.some((s) => s.id === "overview") && (
            <section id="overview" aria-labelledby="overview-title" className="scroll-mt-36">
              <h2 id="overview-title" className="font-display text-2xl">
                Overview
              </h2>
              {product.description && (
                <div className="mt-5 space-y-4 text-base leading-relaxed text-ink/85">
                  {product.description.split("\n\n").map((para) => (
                    <p key={para}>{para}</p>
                  ))}
                </div>
              )}
              {product.features.length > 0 && (
                <>
                  <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted">Features</h3>
                  <ul className="mt-3 space-y-2.5">
                    {product.features.map((f) => (
                      <li key={f} className="flex gap-3 leading-relaxed">
                        <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-strong" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {(product.badges.length > 0 || product.technologies.length > 0) && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {[...product.badges, ...product.technologies].map((t) => (
                    <li key={t} className="rounded-full border border-line px-3 py-1 text-xs font-semibold">
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section id="technical" aria-labelledby="technical-title" className="scroll-mt-36">
            <h2 id="technical-title" className="font-display text-2xl">
              Technical data
            </h2>
            {product.certifications.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">Certification</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {product.certifications.map((c) => (
                    <li key={c} className="rounded-md bg-ink px-3 py-1.5 text-sm font-semibold text-white">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {specs.length > 0 ? (
              <table className="mt-6 w-full text-sm">
                <caption className="sr-only">Technical data for {product.name}</caption>
                <tbody className="divide-y divide-line border-y border-line">
                  {specs.map(([k, v]) => (
                    <tr key={k}>
                      <th scope="row" className="w-1/2 py-3 pr-4 text-left font-medium text-muted">
                        {k}
                      </th>
                      <td className="py-3 font-semibold">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="mt-5 text-sm text-muted">
                EDELRID does not publish technical data for this item online yet.{" "}
                <Link href={`/contact?about=${encodeURIComponent(`EDELRID ${product.name} (item ${product.variants[0].sku}${product.variants.length > 1 ? " and variants" : ""})`)}`} className="font-semibold text-brand-strong hover:underline">
                  Ask us
                </Link>{" "}
                for the product sheet.
              </p>
            )}
            {product.properties.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {product.properties.map((p) => (
                  <li key={p} className="rounded-full bg-mist px-3 py-1 text-xs font-semibold">
                    {p}
                  </li>
                ))}
              </ul>
            )}
            <VariantTable product={product} />
            {product.source && (
              <p className="mt-6 text-xs text-muted">
                Technical data, descriptions and photos: EDELRID GmbH &amp; Co. KG,{" "}
                <a href={product.source.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
                  edelrid.com
                </a>
                . Always follow the EDELRID user manual.
              </p>
            )}
          </section>

          {product.downloads.length > 0 && (
            <section id="downloads" aria-labelledby="downloads-title" className="scroll-mt-36">
              <h2 id="downloads-title" className="font-display text-2xl">
                Downloads
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {product.downloads.map((d) => (
                  <li key={d.url}>
                    <DownloadLink d={d} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {faqs.length > 0 && (
            <section id="faq" aria-labelledby="faq-title" className="scroll-mt-36">
              <h2 id="faq-title" className="font-display text-2xl">
                Questions about ordering
              </h2>
              <div className="mt-5 divide-y divide-line border-y border-line">
                {faqs.map((f) => (
                  <details key={f.question} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                      {f.question}
                      <span aria-hidden className="text-xl leading-none text-muted transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 leading-relaxed text-muted">{f.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>
      </Container>
    </div>
  );
}

const KIND_LABEL: Record<DownloadT["kind"], string> = {
  manual: "User manual",
  doc: "Certificate / inspection",
  datasheet: "Data sheet",
  other: "Document",
};

function DownloadLink({ d }: { d: DownloadT }) {
  return (
    <a
      href={d.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full items-start gap-3 rounded-lg border border-line p-4 transition-colors hover:border-ink/40"
    >
      <Download aria-hidden className="mt-0.5 size-5 shrink-0 text-brand-strong" />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-wider text-muted">{KIND_LABEL[d.kind]}</span>
        <span className="mt-1 block break-words font-semibold leading-snug group-hover:text-brand-strong">{d.label}</span>
      </span>
      <ExternalLink aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
      <span className="sr-only">(PDF, opens in a new tab)</span>
    </a>
  );
}

/** All item numbers with options and prices — useful for B2B buyers ordering by item number. */
function VariantTable({ product }: { product: Product }) {
  if (product.variants.length < 2) return null;
  const dims = (["config", "colour", "length", "size"] as const).filter((d) => product.variants.some((v) => v.options[d]));
  const label = { config: "Version", colour: "Colour", length: "Length", size: "Size" };
  return (
    <details className="group mt-8 rounded-lg border border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        All {product.variants.length} item numbers
        <span aria-hidden className="text-lg leading-none text-muted transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="overflow-x-auto border-t border-line">
        <table className="w-full min-w-[32rem] text-sm">
          <thead className="bg-mist text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-semibold">
                Item no.
              </th>
              {dims.map((d) => (
                <th key={d} scope="col" className="px-4 py-2.5 font-semibold">
                  {label[d]}
                </th>
              ))}
              <th scope="col" className="px-4 py-2.5 text-right font-semibold">
                Price
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {product.variants.map((v) => (
              <tr key={v.sku}>
                <td className="px-4 py-2.5 font-mono text-xs">
                  <Link href={`${productHref(product)}?sku=${v.sku}`} className="hover:text-brand-strong hover:underline">
                    {v.sku}
                  </Link>
                </td>
                {dims.map((d) => (
                  <td key={d} className="px-4 py-2.5">
                    {v.options[d] ?? "–"}
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                  {formatPrice(v.price)} {unitSuffix(v.unit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
