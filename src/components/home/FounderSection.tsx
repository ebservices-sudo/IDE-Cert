import Link from "next/link";
import { ArrowRight, Award, Gavel, GraduationCap, MapPin, Phone, ShieldCheck } from "lucide-react";
import { distribution, founder, mottos } from "@/config/founder";
import { site } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { T } from "@/lib/i18n/T";

// Who stands behind IDE Cert: the founder's credentials, the projects he has designed,
// and the brands IDE Cert distributes in Kosovo and Albania.

const ICONS = [Gavel, ShieldCheck, Award, GraduationCap];

export function FounderSection() {
  return (
    <section id="rreth-nesh" className="py-16 sm:py-24" aria-labelledby="founder-title">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="kicker text-brand-strong">
              <T sq="Kush qëndron pas IDE Cert" en="Who stands behind IDE Cert" />
            </p>
            <h2 id="founder-title" className="mt-4 font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.02]">
              {founder.name}
            </h2>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-brand-strong">
              <T sq={founder.role.sq} en={founder.role.en} />
            </p>
            <p className="mt-2 text-muted">
              <T sq={founder.position.sq} en={founder.position.en} />
            </p>
            <p className="mt-6 text-lg leading-relaxed">
              <T
                sq="Inxhinier mekanik me doktoratë nga Universiteti i Mariborit, që ka projektuar zipline dhe parqe aventure në Kosovë dhe Shqipëri dhe që inspekton kurse me litarë, vinça, ashensorë dhe teleferikë."
                en="A mechanical engineer with a doctorate from the University of Maribor, who has designed zip lines and adventure parks in Kosovo and Albania and inspects ropes courses, cranes, lifts and cable cars."
              />
            </p>
            <blockquote className="mt-8 border-l-4 border-brand pl-5 font-display text-xl leading-snug">
              <T sq={`“${mottos.main.sq}”`} en={`“${mottos.main.en}”`} />
            </blockquote>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/about" className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-3">
                <T sq="Biografia e plotë" en="Full biography" />
                <ArrowRight aria-hidden className="size-4" />
              </Link>
              <a href={site.phones[0].href} className="inline-flex h-11 items-center gap-2 rounded-md border border-ink/20 px-5 text-sm font-semibold hover:border-ink/50">
                <Phone aria-hidden className="size-4" />
                <T sq="Flisni me inxhinierin" en="Talk to the engineer" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
              {founder.credentials.map((c, i) => {
                const Icon = ICONS[i];
                return (
                  <li key={c.title.en} className="border-t-2 border-ink pt-5">
                    <Icon aria-hidden className="size-6 text-brand-strong" strokeWidth={1.75} />
                    <h3 className="mt-4 font-display text-lg leading-snug">
                      <T sq={c.title.sq} en={c.title.en} />
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      <T sq={c.text.sq} en={c.text.en} />
                    </p>
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 rounded-xl border border-line bg-mist p-6">
              <p className="kicker text-ink">
                <T sq="Projekte të projektuara" en="Projects designed" />
              </p>
              <div className="mt-4 space-y-4">
                <ProjectRow label={<T sq="Zipline" en="Zip lines" />} places={founder.projects.ziplines} />
                <ProjectRow label={<T sq="Parqe aventure" en="Adventure parks" />} places={founder.projects.parks} />
              </div>
              <p className="mt-4 text-sm text-muted">
                <T
                  sq="Plus vlerësime sigurie për parqe aventure, zipline, Via Ferrata dhe ura tibetiane."
                  en="Plus safety assessments for adventure parks, zip lines, via ferratas and Tibetan bridges."
                />
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-16 overflow-hidden rounded-2xl bg-ink px-6 py-10 text-white sm:px-10 lg:mt-20">
          <div aria-hidden className="absolute inset-0 bg-grid-dark opacity-50" />
          <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <p className="kicker text-brand">
                <T sq="Distributor në Kosovë dhe Shqipëri" en="Distributor for Kosovo and Albania" />
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-dark">
                <T sq={distribution.text.sq} en={distribution.text.en} />
              </p>
            </div>
            <ul className="flex flex-wrap items-center gap-x-10 gap-y-4 lg:col-span-7 lg:justify-end">
              {distribution.brands.map((b) => (
                <li key={b} className="font-display text-[clamp(1.4rem,3vw,2.2rem)] uppercase tracking-tight text-white/90">
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <p className="relative mt-8 border-t border-white/10 pt-6 font-display text-lg text-brand">
            <T sq={mottos.safety.sq} en={mottos.safety.en} />
          </p>
        </div>
      </Container>
    </section>
  );
}

function ProjectRow({ label, places }: { label: React.ReactNode; places: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-2 w-32 shrink-0 text-sm font-semibold">{label}</span>
      {places.map((p) => (
        <span key={p} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-sm">
          <MapPin aria-hidden className="size-3.5 text-brand-strong" />
          {p}
        </span>
      ))}
    </div>
  );
}
