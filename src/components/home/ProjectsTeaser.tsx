import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { projects, STATUS } from "@/config/projects";
import { coverPhoto } from "@/lib/projectPhotos";
import { Container } from "@/components/ui/Container";
import { T } from "@/lib/i18n/T";
import { Photo } from "@/components/projects/Photo";
import { NoPhoto } from "@/components/projects/NoPhoto";
import { InView } from "@/components/projects/InView";
import "@/components/projects/projects.css";

// Home page: the projects as photo cards, leading to the Projects page.
export function ProjectsTeaser() {
  return (
    <section id="projektet" className="pr bg-ink py-16 text-white sm:py-24" aria-labelledby="projects-title">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="pr-kick"><T sq={`Projektet · ${projects.length}`} en={`Projects · ${projects.length}`} /></p>
            <h2 id="projects-title" className="mt-3 font-display text-[clamp(2rem,4vw,3.1rem)] leading-[1.02]">
              <T sq="Zipline që kemi projektuar dhe ndërtuar" en="Zip lines we have designed and built" />
            </h2>
          </div>
          <Link href="/projects" className="inline-flex items-center gap-2 border-b border-white/30 pb-1 text-sm font-semibold hover:border-brand">
            <T sq="Të gjitha projektet" en="All projects" />
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        <InView as="ul" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((p, i) => {
            const c = coverPhoto(p.slug);
            return (
              <li key={p.slug} className="pr-up" style={{ "--i": i } as React.CSSProperties}>
                <Link href={`/projects/${p.slug}`} className="pr-card group relative block overflow-hidden rounded-xl">
                  {c ? <Photo photo={c} alt="" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="aspect-[3/4]" /> : <NoPhoto className="aspect-[3/4]" label={false} />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span className={p.status === "built" ? "rounded-full bg-brand-strong px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]" : "rounded-full border border-white/40 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]"}>
                      <T sq={STATUS[p.status].sq} en={STATUS[p.status].en} />
                    </span>
                    <span className="mt-3 block font-display text-2xl leading-tight">{p.name}</span>
                    <span className="mt-1 flex items-center gap-2 text-sm text-white/75">
                      <T sq={`${p.place.sq}, ${p.country.sq}`} en={`${p.place.en}, ${p.country.en}`} />
                      <ArrowRight aria-hidden className="ml-auto size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </InView>
      </Container>
    </section>
  );
}
