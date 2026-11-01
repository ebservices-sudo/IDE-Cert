import { Fragment } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, MapPin, Phone, ShieldCheck } from "lucide-react";
import { getProject, projects, STATUS } from "@/config/projects";
import { site } from "@/config/site";
import { coverPhoto, projectDrawings, projectPhotos } from "@/lib/projectPhotos";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { T } from "@/lib/i18n/T";
import { Photo } from "@/components/projects/Photo";
import { NoPhoto } from "@/components/projects/NoPhoto";
import { InView } from "@/components/projects/InView";
import { Gallery } from "@/components/projects/Gallery";
import { projectStats } from "@/components/projects/stats";
import "@/components/projects/projects.css";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const p = getProject((await params).slug);
  if (!p) return {};
  const cover = coverPhoto(p.slug);
  return {
    title: p.name,
    description: p.tagline.en,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: cover ? { images: [{ url: cover.src, width: cover.w, height: cover.h }] } : undefined,
  };
}

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

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const p = getProject((await params).slug);
  if (!p) notFound();
  const photos = projectPhotos(p.slug);
  const drawings = projectDrawings(p.slug);
  const others = projects.filter((o) => o.slug !== p.slug);

  return (
    <div className="pr">
      <section className="pr-hero" aria-labelledby="project-title">
        {photos[0] ? (
          <div className="pr-slides" aria-hidden="true">
            <div className="pr-slide" data-on="">
              <Photo photo={photos[0]} alt="" sizes="100vw" priority />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0"><NoPhoto className="h-full" label={false} /></div>
        )}
        <Container className="pr-hero-in pb-10 pt-24 sm:pb-14">
          <Link href="/projects" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-white/70 hover:text-white">
            <ArrowLeft aria-hidden className="size-3.5" />
            <T sq="Të gjitha projektet" en="All projects" />
          </Link>
          <p className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white/75">
            <span className={p.status === "built" ? "rounded-full bg-brand-strong px-2.5 py-1.5 font-semibold text-white" : "rounded-full border border-white/40 px-2.5 py-1.5 font-semibold text-white"}>
              <T sq={STATUS[p.status].sq} en={STATUS[p.status].en} />
            </span>
            <T sq={p.kind.sq} en={p.kind.en} />
            <span>· {p.year}</span>
          </p>
          <h1 id="project-title" className="pr-h1 font-display">
            <Words text={p.name} />
          </h1>
          <p className="mt-4 flex items-center gap-2 text-white/80">
            <MapPin aria-hidden className="size-4 text-brand" />
            <T sq={`${p.place.sq}, ${p.country.sq}`} en={`${p.place.en}, ${p.country.en}`} />
          </p>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85">
            <T sq={p.tagline.sq} en={p.tagline.en} />
          </p>
          <dl className="pr-stats mt-10 max-w-xl border-t border-white/15 pt-5">
            {projectStats(p).map((s) => (
              <div key={s.label.en}>
                <dt><T sq={s.label.sq} en={s.label.en} /></dt>
                <dd><T sq={s.value.sq} en={s.value.en} /></dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <InView className="lg:col-span-7">
            <p className="pr-up kicker text-brand-strong">
              <T sq="Rreth projektit" en="About the project" />
            </p>
            <p className="pr-up mt-4 text-lg leading-relaxed" style={{ "--i": 1 } as React.CSSProperties}>
              <T sq={p.intro.sq} en={p.intro.en} />
            </p>
            <h2 className="pr-up mt-12 font-display text-2xl" style={{ "--i": 2 } as React.CSSProperties}>
              <T sq="Projektimi inxhinierik" en="Engineering design" />
            </h2>
            <p className="pr-up mt-4 leading-relaxed text-muted" style={{ "--i": 3 } as React.CSSProperties}>
              <T sq={p.engineering.sq} en={p.engineering.en} />
            </p>
            <ul className="pr-up mt-6 flex flex-wrap gap-2" style={{ "--i": 4 } as React.CSSProperties}>
              {p.standards.map((s) => (
                <li key={s} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-mist px-3 py-1.5 text-sm font-semibold">
                  <ShieldCheck aria-hidden className="size-4 text-brand-strong" />
                  {s}
                </li>
              ))}
            </ul>
            {p.link && (
              <a href={p.link.href} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 font-semibold text-brand-strong hover:underline">
                {p.link.label}
                <ExternalLink aria-hidden className="size-4" />
              </a>
            )}
          </InView>

          <aside className="lg:col-span-5">
            <div className="rounded-2xl border border-line lg:sticky lg:top-28">
              <p className="kicker border-b border-line px-6 py-4 text-ink">
                <T sq="Të dhënat kryesore" en="Key data" />
              </p>
              <dl className="divide-y divide-line">
                {p.facts.map((f) => (
                  <div key={f.label.en} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-6 py-3.5 text-sm">
                    <dt className="text-muted"><T sq={f.label.sq} en={f.label.en} /></dt>
                    <dd className="font-semibold"><T sq={f.value.sq} en={f.value.en} /></dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </Container>
      </section>

      <section className="border-t border-line py-16 sm:py-20" aria-labelledby="photos-title">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <h2 id="photos-title" className="font-display text-[clamp(1.8rem,3.5vw,2.6rem)] leading-none">
              {p.status === "built" ? <T sq="Fotografi" en="Photos" /> : <T sq="Pamje nga projekti" en="Design views" />}
            </h2>
            {photos.length > 0 && <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">{photos.length}</p>}
          </div>
          <div className="mt-8">
            {photos.length > 0 ? <Gallery photos={photos} name={p.name} /> : <NoPhoto className="aspect-[21/9] rounded-2xl" />}
          </div>
        </Container>
      </section>

      {drawings.length > 0 && (
        <section className="border-t border-line bg-mist py-16 sm:py-20" aria-labelledby="drawings-title">
          <Container>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="kicker text-brand-strong">
                  <T sq="Projektimi inxhinierik" en="Engineering design" />
                </p>
                <h2 id="drawings-title" className="mt-3 font-display text-[clamp(1.8rem,3.5vw,2.6rem)] leading-none">
                  <T sq="Vizatime teknike" en="Technical drawings" />
                </h2>
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">{drawings.length}</p>
            </div>
            <div className="mt-8">
              <Gallery photos={drawings} name={p.name} drawings />
            </div>
          </Container>
        </section>
      )}

      <section className="border-t border-line bg-mist py-16 sm:py-20" aria-labelledby="more-title">
        <Container>
          <h2 id="more-title" className="font-display text-2xl">
            <T sq="Projekte të tjera" en="More projects" />
          </h2>
          <InView as="ul" className="mt-6 grid gap-5 md:grid-cols-3">
            {others.map((o, k) => {
              const c = coverPhoto(o.slug);
              return (
                <li key={o.slug} className="pr-up" style={{ "--i": k } as React.CSSProperties}>
                  <Link href={`/projects/${o.slug}`} className="pr-card group block overflow-hidden rounded-xl border border-line bg-white">
                    {c ? <Photo photo={c} alt="" sizes="(min-width: 768px) 33vw, 100vw" className="aspect-[16/10]" /> : <NoPhoto className="aspect-[16/10]" label={false} />}
                    <div className="p-5">
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-strong">
                        <T sq={STATUS[o.status].sq} en={STATUS[o.status].en} /> · {o.year}
                      </span>
                      <span className="mt-2 block font-display text-xl">{o.name}</span>
                      <span className="mt-1 block text-sm text-muted">
                        <T sq={`${o.place.sq}, ${o.country.sq}`} en={`${o.place.en}, ${o.country.en}`} />
                      </span>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                        <T sq="Shiko projektin" en="View project" />
                        <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </InView>

          <div className="mt-12 flex flex-col gap-6 rounded-2xl bg-ink p-8 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-2xl"><T sq="Keni një projekt në lartësi?" en="Planning something at height?" /></p>
              <p className="mt-2 text-muted-dark"><T sq="Projektim, inspektim dhe certifikim sipas EN 15567." en="Design, inspection and certification to EN 15567." /></p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/services#request"><T sq="Kërko ofertë" en="Request a quote" /></ButtonLink>
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
