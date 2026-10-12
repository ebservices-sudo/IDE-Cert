import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { worldHref, worlds } from "@/config/catalog";
import { categoryCounts } from "@/lib/catalog/data";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubcategoryGrid } from "@/components/shop/SubcategoryGrid";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Shop",
  description: "EDELRID climbing equipment and work-at-height PPE: ropes, harnesses, helmets, connectors and more.",
};

export default function ShopPage() {
  return (
    <>
      <PageHeader
        kicker="Shop"
        title="Equipment"
        description="The EDELRID range in two worlds: Sport for climbing and mountaineering, Professional for work at height, rescue, tree care and adventure parks."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
      />
      {worlds.map((world, i) => (
        <section key={world.slug} className={i % 2 ? "bg-mist py-14" : "py-14"} aria-labelledby={`${world.slug}-title`}>
          <Container>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="kicker text-brand-strong">{world.tagline}</p>
                <h2 id={`${world.slug}-title`} className="mt-3 font-display text-[clamp(1.5rem,7vw,2.25rem)] uppercase">
                  {world.name}
                </h2>
              </div>
              <ButtonLink href={worldHref(world.slug)} variant="dark">
                Shop {world.name}
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
            </div>
            <SubcategoryGrid world={world} counts={categoryCounts} />
          </Container>
        </section>
      ))}
    </>
  );
}
