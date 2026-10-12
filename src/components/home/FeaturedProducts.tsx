import type { Product } from "@/lib/catalog/types";
import { ProductCard } from "@/components/product/ProductCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <section className="border-t border-line py-16 sm:py-20" aria-labelledby="featured-title">
      <Container>
        <SectionHeading
          id="featured-title"
          kicker="Featured"
          title="Popular equipment"
          action={{ href: "/shop", label: "Browse the shop" }}
        />
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
