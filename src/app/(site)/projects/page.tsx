import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { projects, STATUS } from "@/config/projects";
import { Container } from "@/components/ui/Container";
import { T } from "@/lib/i18n/T";
import { ZipProfile } from "@/components/projects/ZipProfile";
import { ProjectStats } from "@/components/projects/ProjectStats";
import { Reveal } from "@/components/projects/Reveal";
import "@/components/projects/projects.css";

export const metadata: Metadata = {
  title: "Projects",
  description: "Zip lines designed and engineered by IDE Cert in Albania and Kosovo: Përmet, Deçan, Dardhë and Theth, to EN 15567.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <section className="pj-sec pj-page" aria-labelledby="projects-title">
      <div className="pj-stage">
        <Container>
          <Link href="/" className="pj-back">
            <ArrowLeft aria-hidden className="size-3.5" />
            <T sq="Ballina" en="Home" />
          </Link>
          <p className="pj-kick">
            <T sq="Projektet" en="Projects" />
          </p>
          <h1 id="projects-title" className="pj-title font-display">
            <T sq="Zipline të projektuara nga IDE Cert" en="Zip lines engineered by IDE Cert" />
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
            <T
              sq="Nga lugina e Thethit deri te lumi Vjosa: analiza strukturore, llogaritje të tensioneve të litarëve, ankorime, frenim dhe dokumentacion teknik sipas standardeve evropiane EN 15567."
              en="From the Theth valley to the Vjosa river: structural analysis, rope tension calculations, anchorages, braking and technical documentation to the European EN 15567 standards."
            />
          </p>
        </Container>
        <div className="pj-track">
          {projects.map((p, i) => (
            <Reveal key={p.slug} className="pj-panel" labelledBy={`pj-${p.slug}`}>
              <div className="pj-copy">
                <p className="pj-meta">
                  <span className="pj-idx">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`pj-badge pj-${p.status}`}>
                    <T sq={STATUS[p.status].sq} en={STATUS[p.status].en} />
                  </span>
                  <span>{p.year}</span>
                </p>
                <h2 id={`pj-${p.slug}`} className="pj-name font-display">
                  {p.name}
                </h2>
                <p className="pj-place">
                  <MapPin aria-hidden className="size-4" />
                  <T sq={`${p.place.sq}, ${p.country.sq}`} en={`${p.place.en}, ${p.country.en}`} />
                </p>
                <p className="pj-tag">
                  <T sq={p.tagline.sq} en={p.tagline.en} />
                </p>
                <ProjectStats project={p} />
                <Link href={`/projects/${p.slug}`} className="pj-cta">
                  <T sq="Shiko projektin" en="View project" />
                  <span className="sr-only">: {p.name}</span>
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </div>
              <div className="pj-visual">
                <ZipProfile project={p} idPrefix={`l-${p.slug}`} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
