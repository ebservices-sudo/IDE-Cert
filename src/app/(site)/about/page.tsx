import type { Metadata } from "next";
import { ArrowRight, MapPin } from "lucide-react";
import { services } from "@/config/services";
import { site } from "@/config/site";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "About",
  description: `${site.legalName}, Prishtinë: inspection, design, engineering and certification, and EDELRID climbing and work-at-height equipment.`,
  alternates: { canonical: "/about" },
};

// TODO(content): company history, team and photos — requested from the client.
export default function AboutPage() {
  return (
    <>
      <PageHeader
        kicker="About"
        title="Engineers who sell safety equipment"
        description={`${site.legalName} is an engineering company in Prishtinë, Kosovo, led by ${site.owner}.`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <section className="py-16 sm:py-20" aria-labelledby="what-title">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="kicker text-brand-strong">What we do</p>
            <h2 id="what-title" className="mt-3 font-display text-3xl leading-tight">
              Inspection, design, engineering and certification
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed lg:col-span-7">
            <p>
              Our name says what we do: <strong>I</strong>nspection, <strong>D</strong>esign, <strong>E</strong>ngineering and{" "}
              <strong>Cert</strong>ification. That work is our core, and it shapes how we sell equipment.
            </p>
            <p className="text-muted">
              Alongside our services we supply the EDELRID range for climbing, mountaineering, work at height, rescue, tree care and adventure
              parks — ordered from EDELRID for each customer, with the standards, technical data and manufacturer documents on every product
              page.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-mist py-16 sm:py-20" aria-label="Disciplines">
        <Container>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <li key={s.anchor} className="rounded-xl border border-line bg-white p-6">
                <span aria-hidden className="font-display text-5xl leading-none text-brand">
                  {s.letter}
                </span>
                <h3 className="mt-5 font-display text-lg">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.summary}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 sm:py-20" aria-labelledby="facts-title">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 id="facts-title" className="font-display text-2xl">
              Company
            </h2>
            <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
              {[
                ["Name", site.legalName],
                ["Owner", site.owner],
                ["Address", `${site.address.street}, ${site.address.locality}, ${site.address.postalCode} ${site.address.city}, Kosovo`],
                ["Phone", site.phones.map((p) => p.display).join(" · ")],
                ["Email", site.email],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-4 py-3">
                  <dt className="text-muted">{k}</dt>
                  <dd className="col-span-2 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col justify-between gap-8 rounded-xl bg-ink p-8 text-white">
            <div>
              <MapPin aria-hidden className="size-6 text-brand" />
              <p className="mt-4 font-display text-2xl leading-snug">From Prishtinë to the whole region</p>
              <p className="mt-3 leading-relaxed text-muted-dark">
                We deliver across Kosovo and the Balkans, and work with companies, rescue teams, arborists, climbing gyms and adventure parks.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/contact">
                Contact us
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
              <ButtonLink href="/shop" variant="outline-light">
                Browse the shop
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
