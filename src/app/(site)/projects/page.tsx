import { Fragment } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Phone } from "lucide-react";
import { projects, STATUS } from "@/config/projects";
import { site } from "@/config/site";
import { coverPhoto, projectPhotos } from "@/lib/projectPhotos";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { T } from "@/lib/i18n/T";
import { Photo } from "@/components/projects/Photo";
import { NoPhoto } from "@/components/projects/NoPhoto";
import { InView } from "@/components/projects/InView";
import { Slideshow } from "@/components/projects/Slideshow";
import { projectStats } from "@/components/projects/stats";
import "@/components/projects/projects.css";

export const metadata: Metadata = {
  title: "Projects",
  description: "Zip lines designed and engineered by IDE Cert in Albania and Kosovo: Përmet, Deçan, Dardhë and Theth, to EN 15567.",
  alternates: { canonical: "/projects" },
};

const totalKm = projects.reduce((s, p) => s + p.lengthM * p.lines, 0) / 1000;

function Words({ text }: { text: string }) {
  return (
    <span className="pr-words">
      {text.split(" ").map((w, i) => (
        <Fragment key={i}>
          <span>
            <span style={{ "--w": i } as React.CSSProperties}>{w}</span>
          </span>{" "}
        </Fragment>
      ))}
    </span>
  );
}

export default function ProjectsPage() {
  const slides = projects.map((p) => ({ name: p.name, photo: coverPhoto(p.slug) }));
  const hasPhotos = slides.some((s) => s.photo);

  return (
    <div className="pr">
      <section className="pr-hero" aria-labelledby="projects-title">
        {!hasPhotos && <div className="absolute inset-0"><NoPhoto className="h-full" label={false} /></div>}
        <Slideshow slides={slides}>
          <p className="pr-kick">
            <T sq={`Projektet · ${projects.length}`} en={`Projects · ${projects.length}`} />
          </p>
          <h1 id="projects-title" className="pr-h1 max-w-5xl font-display">
            <T sq={<Words text="Zipline që kemi projektuar dhe ndërtuar" />} en={<Words text="Zip lines we have designed and built" />} />
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
            <T
              sq="Nga lugina e Thethit deri te lumi Vjosa: analiza strukturore, tensionet e litarëve, ankorime, frenim dhe dokumentacion teknik sipas standardeve evropiane EN 15567."
              en="From the Theth valley to the Vjosa river: structural analysis, rope tensions, anchorages, braking and technical documentation to the European EN 15567 standards."
            />
          </p>
          <dl className="pr-stats mt-10 max-w-xl border-t border-white/15 pt-5">
            <div>
              <dt><T sq="Projekte" en="Projects" /></dt>
              <dd>{projects.length}</dd>
            </div>
            <div>
              <dt><T sq="Kabllo e projektuar" en="Cable designed" /></dt>
              <dd>{totalKm.toFixed(1)} km</dd>
            </div>
            <div>
              <dt><T sq="Vende" en="Countries" /></dt>
              <dd><T sq="Shqipëri · Kosovë" en="Albania · Kosovo" /></dd>
            </div>
          </dl>
        </Slideshow>
      </section>

      <section className="py-16 sm:py-24" aria-label="Projects">
        <Container className="space-y-24 sm:space-y-32">
          {projects.map((p, i) => {
            const photos = projectPhotos(p.slug);
            const cover = photos[0];
            const thumbs = photos.slice(1, 4);
            const flip = i % 2 === 1;
            return (
              <InView as="article" key={p.slug} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14" aria-labelledby={`pr-${p.slug}`}>
                <Link href={`/projects/${p.slug}`} className={`pr-card block lg:col-span-7 ${flip ? "lg:order-2" : ""}`} tabIndex={-1} aria-hidden="true">
                  <div className="pr-reveal pr-par">
                    {cover ? <Photo photo={cover} alt="" sizes="(min-width: 1024px) 58vw, 100vw" className="aspect-[4/3]" /> : <NoPhoto className="aspect-[4/3]" />}
                  </div>
                  {thumbs.length > 0 && (
                    <div className="mt-3 grid grid-cols-4 gap-3">
                      {thumbs.map((t, k) => (
                        <div key={t.src} className="pr-up overflow-hidden rounded-lg" style={{ "--i": k + 2 } as React.CSSProperties}>
                          <Photo photo={t} alt="" sizes="15vw" className="aspect-square" />
                        </div>
                      ))}
                      {photos.length > 4 && (
                        <div className="pr-up grid aspect-square place-items-center rounded-lg bg-ink font-display text-xl text-white" style={{ "--i": 5 } as React.CSSProperties}>
                          +{photos.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </Link>

                <div className={`lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
                  <p className="pr-up flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                    <span className="text-ink">{String(i + 1).padStart(2, "0")}</span>
                    <span className={p.status === "built" ? "rounded-full bg-brand-strong px-2.5 py-1.5 font-semibold text-white" : "rounded-full border border-ink/25 px-2.5 py-1.5 font-semibold text-ink"}>
                      <T sq={STATUS[p.status].sq} en={STATUS[p.status].en} />
                    </span>
                    <span>{p.year}</span>
                  </p>
                  <h2 id={`pr-${p.slug}`} className="pr-up mt-5 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[0.95]" style={{ "--i": 1 } as React.CSSProperties}>
                    {p.name}
                  </h2>
                  <p className="pr-up mt-4 flex items-center gap-2 text-muted" style={{ "--i": 2 } as React.CSSProperties}>
                    <MapPin aria-hidden className="size-4 text-brand-strong" />
                    <T sq={`${p.place.sq}, ${p.country.sq}`} en={`${p.place.en}, ${p.country.en}`} />
                  </p>
                  <p className="pr-up mt-5 text-lg leading-relaxed" style={{ "--i": 3 } as React.CSSProperties}>
                    <T sq={p.tagline.sq} en={p.tagline.en} />
                  </p>
                  <dl className="pr-stats pr-up mt-7 border-t border-line pt-5" style={{ "--i": 4 } as React.CSSProperties}>
                    {projectStats(p).map((s) => (
                      <div key={s.label.en}>
                        <dt><T sq={s.label.sq} en={s.label.en} /></dt>
                        <dd><T sq={s.value.sq} en={s.value.en} /></dd>
                      </div>
                    ))}
                  </dl>
                  <div className="pr-up mt-8 flex flex-wrap items-center gap-4" style={{ "--i": 5 } as React.CSSProperties}>
                    <ButtonLink href={`/projects/${p.slug}`} variant="dark">
                      <T sq="Shiko projektin" en="View project" />
                      <span className="sr-only">: {p.name}</span>
                      <ArrowRight aria-hidden className="size-4" />
                    </ButtonLink>
                    {photos.length > 0 && (
                      <span className="text-sm text-muted">
                        <T sq={`${photos.length} foto`} en={`${photos.length} photos`} />
                      </span>
                    )}
                  </div>
                </div>
              </InView>
            );
          })}
        </Container>
      </section>

      <section className="border-t border-line bg-mist py-16 sm:py-20">
        <Container>
          <div className="flex flex-col gap-6 rounded-2xl bg-ink p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <p className="font-display text-2xl sm:text-3xl">
                <T sq="Keni një projekt në lartësi?" en="Planning something at height?" />
              </p>
              <p className="mt-2 text-muted-dark">
                <T sq="Projektim, inspektim dhe certifikim sipas EN 15567." en="Design, inspection and certification to EN 15567." />
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/services#request">
                <T sq="Kërko ofertë" en="Request a quote" />
              </ButtonLink>
              <ButtonLink href={site.phones[0].href} variant="outline-light">
                <Phone aria-hidden className="size-4" />
                {site.phones[0].display}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
