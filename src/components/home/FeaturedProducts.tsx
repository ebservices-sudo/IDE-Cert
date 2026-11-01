import type { Product } from "@/lib/catalog/types";
import { ProductCard } from "@/components/product/ProductCard";
import { toCard } from "@/lib/catalog/cards";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { T } from "@/lib/i18n/T";

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <section className="border-t border-line py-16 sm:py-20" aria-labelledby="featured-title">
      <Container>
        <SectionHeading
          id="featured-title"
          kicker={<T sq="Të zgjedhura" en="Featured" />}
          title={<T sq="Pajisje të kërkuara" en="Popular equipment" />}
          action={{ href: "/shop", label: <T sq="Shiko dyqanin" en="Browse the shop" /> }}
        />
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard card={toCard(p)} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
