import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getWorld, worldHref, worlds } from "@/config/catalog";
import { categoryCounts, getCatalog } from "@/lib/catalog/data";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageHeaderSkeleton } from "@/components/layout/PageHeaderSkeleton";
import { ProductCard } from "@/components/product/ProductCard";
import { SubcategoryGrid } from "@/components/shop/SubcategoryGrid";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function generateStaticParams() {
  return worlds.map((w) => ({ world: w.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[world]">): Promise<Metadata> {
  const world = getWorld((await params).world);
  if (!world) return {};
  return {
    title: `EDELRID ${world.name} equipment`,
    description: world.description,
    alternates: { canonical: worldHref(world.slug) },
  };
}

export default function WorldPage({ params }: PageProps<"/shop/[world]">) {
  return (
    <Suspense fallback={<PageHeaderSkeleton />}>
      <WorldContent params={params} />
    </Suspense>
  );
}

async function WorldContent({ params }: Pick<PageProps<"/shop/[world]">, "params">) {
  const world = getWorld((await params).world);
  if (!world) notFound();
  const newProducts = (await getCatalog())
    .productsIn(world.slug)
    .filter((p) => p.isNew && p.images.length)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 8);

  return (
    <>
      <PageHeader
        kicker={world.tagline}
        title={world.name}
        description={world.description}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: world.name }]}
      >
        <p className="mt-5 text-sm text-muted-dark">
          <span className="font-semibold text-white tabular-nums">{categoryCounts[world.slug]}</span> EDELRID products
        </p>
      </PageHeader>
      <Container className="py-14">
        <h2 className="sr-only">Categories</h2>
        <SubcategoryGrid world={world} counts={categoryCounts} />
      </Container>
      {newProducts.length > 0 && (
        <section className="border-t border-line bg-mist py-16" aria-labelledby="new-title">
          <Container>
            <SectionHeading
              id="new-title"
              kicker="2026"
              title={`New in ${world.name}`}
              action={{ href: `/search?new=yes&world=${world.slug}`, label: "All new products" }}
            />
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {newProducts.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  );
}
