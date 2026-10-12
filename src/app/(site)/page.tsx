import { getCatalog } from "@/lib/catalog/data";
import { Hero } from "@/components/home/Hero";
import { WorldTiles } from "@/components/home/WorldTiles";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { ServicesTeaser } from "@/components/home/ServicesTeaser";
import { TrustSection } from "@/components/home/TrustSection";
import { ContactBand } from "@/components/home/ContactBand";

export default async function HomePage() {
  const catalog = await getCatalog();
  return (
    <>
      <Hero />
      <WorldTiles />
      <FeaturedProducts products={catalog.featured(8)} />
      <ServicesTeaser />
      <TrustSection />
      <ContactBand />
    </>
  );
}
