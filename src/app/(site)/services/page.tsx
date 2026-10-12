import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Phone } from "lucide-react";
import { services, smartBelayServices } from "@/config/services";
import { site } from "@/config/site";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Services",
  description: "Inspection, design, engineering and certification by IDE Cert, Prishtinë — and Smart Belay servicing for adventure parks.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        kicker="Services"
        title="Inspection, design, engineering and certification"
        description="IDE Cert is an engineering company first. Bring us equipment to inspect, a system to design or a product to certify."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
      >
        <nav aria-label="Services" className="mt-8 flex flex-wrap gap-2">
          {services.map((s) => (
            <a key={s.anchor} href={`#${s.anchor}`} className="rounded-full border border-white/20 px-4 py-1.5 text-sm font-semibold hover:border-white/60">
              {s.name}
            </a>
          ))}
          <a href="#smart-belay" className="rounded-full border border-white/20 px-4 py-1.5 text-sm font-semibold hover:border-white/60">
            Smart Belay servicing
          </a>
        </nav>
      </PageHeader>

      {services.map((s, i) => (
        <section key={s.anchor} id={s.anchor} aria-labelledby={`${s.anchor}-title`} className={`scroll-mt-24 py-16 sm:py-20 ${i % 2 ? "bg-mist" : ""}`}>
          <Container className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <span aria-hidden className="font-display text-7xl leading-none text-brand sm:text-8xl">
                {s.letter}
              </span>
              <h2 id={`${s.anchor}-title`} className="mt-4 font-display text-3xl">
                {s.name}
              </h2>
            </div>
            <div className="lg:col-span-8">
              <p className="max-w-2xl text-lg leading-relaxed">{s.body}</p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-3 rounded-lg border border-line bg-white p-4 text-sm font-medium">
                    <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-strong" />
                    {p}
                  </li>
                ))}
              </ul>
              <a href="#request" className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold hover:text-brand-strong">
                Ask about {s.name.toLowerCase()}
                <ArrowRight aria-hidden className="size-4" />
              </a>
            </div>
          </Container>
        </section>
      ))}

      <section id="smart-belay" aria-labelledby="smart-belay-title" className="scroll-mt-24 bg-ink py-16 text-white sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="kicker text-brand">Adventure parks</p>
            <h2 id="smart-belay-title" className="mt-3 font-display text-3xl">
              Smart Belay servicing
            </h2>
            <p className="mt-4 leading-relaxed text-muted-dark">
              For parks running EDELRID Smart Belay and Smart Belay X, we arrange the periodic servicing with EDELRID. Prices on request,
              depending on the number of units. Spare parts are charged separately.
            </p>
            <Link href="/shop/professional/adventure-parks" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-brand">
              Smart Belay X and accessories
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
            {smartBelayServices.map((s) => (
              <li key={s} className="flex gap-3 rounded-lg border border-ink-line bg-ink-2 p-4 text-sm font-medium">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />
                {s}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section id="request" aria-labelledby="request-title" className="scroll-mt-24 py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="kicker text-brand-strong">Request</p>
            <h2 id="request-title" className="mt-3 font-display text-3xl">
              Request an inspection or a quote
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              Tell us what you need inspected, designed or certified — the equipment, the site and the timing. We reply by email.
            </p>
            <p className="mt-6 flex items-center gap-2 text-sm font-semibold">
              <Phone aria-hidden className="size-4 text-brand-strong" />
              <a href={site.phones[0].href} className="hover:text-brand-strong">
                {site.phones[0].display}
              </a>
            </p>
          </div>
          <div className="lg:col-span-8">
            <ContactForm topic="Inspection or other services" />
          </div>
        </Container>
      </section>
    </>
  );
}
