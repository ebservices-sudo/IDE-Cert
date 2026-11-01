import { getCatalog } from "@/lib/catalog/data";
import { JsonLd, organizationLd } from "@/components/seo/JsonLd";
import { EveryHeight } from "@/components/home/journey/EveryHeight";
import { WorldTiles } from "@/components/home/WorldTiles";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { IdeSection } from "@/components/home/IdeSection";
import { CertifySection } from "@/components/home/CertifySection";
import { LoadTest } from "@/components/home/LoadTest";
import { FounderSection } from "@/components/home/FounderSection";
import { ContactBand } from "@/components/home/ContactBand";

export default async function HomePage() {
  const catalog = await getCatalog();
  return (
    <>
      <JsonLd data={organizationLd()} />
      <EveryHeight />
      <WorldTiles />
      <FeaturedProducts products={catalog.featured(8)} />
      <IdeSection />
      <CertifySection />
      <LoadTest />
      <FounderSection />
      <ContactBand />
    </>
  );
}
