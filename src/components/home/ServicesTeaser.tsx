import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { services } from "@/config/services";

export function ServicesTeaser() {
  return (
    <section className="bg-mist py-16 sm:py-20" aria-labelledby="services-title">
      <Container>
        <SectionHeading
          id="services-title"
          kicker="Services"
          title="Inspection, design, engineering and certification"
          description="IDE Cert is an engineering company first. Bring us equipment to inspect, a system to design or a product to certify."
          action={{ href: "/services", label: "All services" }}
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <li key={s.name}>
              <Link
                href={`/services#${s.anchor}`}
                className="group flex h-full flex-col rounded-xl border border-line bg-white p-6 transition-colors hover:border-ink/25"
              >
                <span aria-hidden className="font-display text-5xl leading-none text-brand">
                  {s.letter}
                </span>
                <h3 className="mt-6 font-display text-lg">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.summary}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold group-hover:text-brand-strong">
                  Learn more
                  <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <ButtonLink href="/services#request" variant="dark">
            Request an inspection or quote
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
