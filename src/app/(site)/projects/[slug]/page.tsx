import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, MapPin, Phone, ShieldCheck } from "lucide-react";
import { getProject, projects, STATUS } from "@/config/projects";
import { site } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { T } from "@/lib/i18n/T";
import { ZipProfile } from "@/components/projects/ZipProfile";
import { ProjectStats } from "@/components/projects/ProjectStats";
import { Reveal } from "@/components/projects/Reveal";
import "@/components/projects/projects.css";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const p = getProject((await params).slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.tagline.en,
    alternates: { canonical: `/projects/${p.slug}` },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const p = getProject((await params).slug);
  if (!p) notFound();
  const others = projects.filter((o) => o.slug !== p.slug);

  return (
    <>
      <section className="pj-sec pj-page" aria-labelledby="project-title">
        <div className="pj-stage">
          <Reveal className="pj-panel">
            <div className="pj-copy">
              <Link href="/projects" className="pj-back">
                <ArrowLeft aria-hidden className="size-3.5" />
                <T sq="Projektet" en="Projects" />
              </Link>
              <p className="pj-meta">
                <span className={`pj-badge pj-${p.status}`}>
                  <T sq={STATUS[p.status].sq} en={STATUS[p.status].en} />
                </span>
                <span>
                  <T sq={p.kind.sq} en={p.kind.en} />
                </span>
                <span>{p.year}</span>
              </p>
              <h1 id="project-title" className="pj-name font-display">
                {p.name}
              </h1>
              <p className="pj-place">
                <MapPin aria-hidden className="size-4" />
                <T sq={`${p.place.sq}, ${p.country.sq}`} en={`${p.place.en}, ${p.country.en}`} />
              </p>
              <p className="pj-tag">
                <T sq={p.tagline.sq} en={p.tagline.en} />
              </p>
              <ProjectStats project={p} />
            </div>
            <div className="pj-visual">
              <ZipProfile project={p} idPrefix={`p-${p.slug}`} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="kicker text-brand-strong">
              <T sq="Rreth projektit" en="About the project" />
            </p>
            <p className="mt-4 text-lg leading-relaxed">
              <T sq={p.intro.sq} en={p.intro.en} />
            </p>
            <h2 className="mt-12 font-display text-2xl">
              <T sq="Projektimi inxhinierik" en="Engineering design" />
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              <T sq={p.engineering.sq} en={p.engineering.en} />
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
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
          </div>

          <aside className="lg:col-span-5">
            <div className="rounded-2xl border border-line lg:sticky lg:top-28">
              <p className="kicker border-b border-line px-6 py-4 text-ink">
                <T sq="Të dhënat kryesore" en="Key data" />
              </p>
              <dl className="divide-y divide-line">
                {p.facts.map((f) => (
                  <div key={f.label.en} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-6 py-3.5 text-sm">
                    <dt className="text-muted">
                      <T sq={f.label.sq} en={f.label.en} />
                    </dt>
                    <dd className="font-semibold">
                      <T sq={f.value.sq} en={f.value.en} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </Container>

        {p.photos.length > 0 && (
          <Container className="mt-16">
            <h2 className="font-display text-2xl">
              <T sq="Fotografi" en="Photos" />
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {p.photos.map((ph, i) => (
                <li key={ph.src} className={i === 0 ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : ""}>
                  <div className="relative aspect-[4/3] h-full overflow-hidden rounded-xl bg-mist">
                    <Image src={ph.src} alt={ph.alt.en} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                  </div>
                </li>
              ))}
            </ul>
          </Container>
        )}
      </section>

      <section className="border-t border-line bg-mist py-16 sm:py-20" aria-labelledby="more-title">
        <Container>
          <h2 id="more-title" className="font-display text-2xl">
            <T sq="Projekte të tjera" en="More projects" />
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/projects/${o.slug}`} className="group flex h-full flex-col rounded-xl border border-line bg-white p-6 transition-colors hover:border-ink/30">
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-strong">
                    <T sq={STATUS[o.status].sq} en={STATUS[o.status].en} /> · {o.year}
                  </span>
                  <span className="mt-3 font-display text-xl">{o.name}</span>
                  <span className="mt-1 text-sm text-muted">
                    <T sq={`${o.place.sq}, ${o.country.sq}`} en={`${o.place.en}, ${o.country.en}`} />
                  </span>
                  <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold">
                    <T sq="Shiko projektin" en="View project" />
                    <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-col gap-6 rounded-2xl bg-ink p-8 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-2xl">
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
    </>
  );
}
