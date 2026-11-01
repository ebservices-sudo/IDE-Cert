import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import { subcategoryHref, worldHref, worlds } from "@/config/catalog";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { T } from "@/lib/i18n/T";

export function WorldTiles() {
  return (
    <section id="dyqani" className="py-16 sm:py-20" aria-labelledby="worlds-title">
      <Container>
        <SectionHeading
          id="worlds-title"
          kicker={<T sq="Dyqani" en="Shop" />}
          action={{ href: "/shop", label: <T sq="Hyr në dyqan (635 produkte)" en="Enter the shop (635 products)" /> }}
          title={<T sq="Dy botë pajisjesh" en="Two worlds of equipment" />}
          description={
            <T
              sq="Pajisje për ngjitës dhe alpinistë te Sport; PPE e certifikuar për punë në lartësi, shpëtim, kujdes të pemëve dhe parqe aventure te Profesional."
              en="Gear for climbers and mountaineers in Sport; certified PPE for work at height, rescue, tree care and adventure parks in Professional."
            />
          }
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {worlds.map((world) => {
            const dark = world.slug === "professional";
            return (
              <article
                key={world.slug}
                className={clsx(
                  "flex min-w-0 flex-col rounded-xl p-6 sm:p-10",
                  dark ? "bg-ink text-white" : "bg-mist text-ink",
                )}
              >
                <p className={clsx("kicker", dark ? "text-brand" : "text-brand-strong")}><T sq={world.shortTaglineSq} en={world.shortTagline} /></p>
                {/* Fluid size: "PROFESSIONAL" in the wide display cut must fit a 320px phone. */}
                <h3 className="mt-4 font-display text-[clamp(1.5rem,7vw,3rem)] uppercase"><T sq={world.nameSq} en={world.name} /></h3>
                <p className={clsx("mt-4 max-w-md text-sm leading-relaxed", dark ? "text-muted-dark" : "text-muted")}>
                  <T sq={world.descriptionSq} en={world.description} />
                </p>
                <ul className="mt-8 grid gap-2 sm:grid-cols-2">
                  {world.subcategories
                    .filter((s) => s.featured)
                    .map((sub) => (
                      <li key={sub.slug}>
                        <Link
                          href={subcategoryHref(world.slug, sub.slug)}
                          className={clsx(
                            "group flex items-center justify-between gap-3 rounded-md border px-3.5 py-3 text-sm font-medium transition-colors",
                            dark
                              ? "border-ink-line hover:border-white/40 hover:bg-white/5"
                              : "border-line bg-white hover:border-ink/30",
                          )}
                        >
                          <T sq={sub.nameSq} en={sub.name} />
                          <ArrowUpRight
                            aria-hidden
                            className={clsx("size-4 shrink-0", dark ? "text-muted-dark" : "text-muted", "group-hover:text-brand")}
                          />
                        </Link>
                      </li>
                    ))}
                </ul>
                <ButtonLink
                  href={worldHref(world.slug)}
                  variant={dark ? "primary" : "dark"}
                  className="mt-10 self-start"
                >
                  <T sq={`Dyqani ${world.nameSq}`} en={`Shop ${world.name}`} />
                  <ArrowRight aria-hidden className="size-4" />
                </ButtonLink>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
