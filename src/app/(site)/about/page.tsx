import type { Metadata } from "next";
import { ArrowRight, MapPin } from "lucide-react";
import { services } from "@/config/services";
import { site } from "@/config/site";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { T } from "@/lib/i18n/T";

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
        kicker={<T sq="Rreth nesh" en="About" />}
        title={<T sq="Inxhinierë që shesin pajisje sigurie" en="Engineers who sell safety equipment" />}
        description={
          <T
            sq={`${site.legalName} është kompani inxhinierike në Prishtinë, Kosovë, e udhëhequr nga ${site.owner}.`}
            en={`${site.legalName} is an engineering company in Prishtinë, Kosovo, led by ${site.owner}.`}
          />
        }
        breadcrumbs={[{ label: <T sq="Ballina" en="Home" />, href: "/" }, { label: <T sq="Rreth nesh" en="About" /> }]}
      />

      <section className="py-16 sm:py-20" aria-labelledby="what-title">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="kicker text-brand-strong">
              <T sq="Çfarë bëjmë" en="What we do" />
            </p>
            <h2 id="what-title" className="mt-3 font-display text-3xl leading-tight">
              <T sq="Inspektim, dizajnim, inxhinieri dhe certifikim" en="Inspection, design, engineering and certification" />
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed lg:col-span-7">
            <p>
              <T
                sq={
                  <>
                    Emri ynë tregon çfarë bëjmë: <strong>I</strong>nspektim, <strong>D</strong>izajnim, <strong>E</strong>ngineering (inxhinieri) dhe{" "}
                    <strong>Cert</strong>ifikim. Kjo punë është thelbi ynë dhe e formëson mënyrën si shesim pajisjet.
                  </>
                }
                en={
                  <>
                    Our name says what we do: <strong>I</strong>nspection, <strong>D</strong>esign, <strong>E</strong>ngineering and{" "}
                    <strong>Cert</strong>ification. That work is our core, and it shapes how we sell equipment.
                  </>
                }
              />
            </p>
            <p className="text-muted">
              <T
                sq="Krahas shërbimeve, furnizojmë gamën EDELRID për ngjitje, alpinizëm, punë në lartësi, shpëtim, kujdes të pemëve dhe parqe aventure, të porositura nga EDELRID për çdo klient, me standardet, të dhënat teknike dhe dokumentet e prodhuesit në çdo faqe produkti."
                en="Alongside our services we supply the EDELRID range for climbing, mountaineering, work at height, rescue, tree care and adventure parks, ordered from EDELRID for each customer, with the standards, technical data and manufacturer documents on every product page."
              />
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
                <h3 className="mt-5 font-display text-lg">
                  <T sq={s.nameSq} en={s.name} />
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  <T sq={s.summarySq} en={s.summary} />
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 sm:py-20" aria-labelledby="facts-title">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 id="facts-title" className="font-display text-2xl">
              <T sq="Kompania" en="Company" />
            </h2>
            <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
              {[
                [<T key="n" sq="Emri" en="Name" />, site.legalName],
                [<T key="o" sq="Pronari" en="Owner" />, site.owner],
                [<T key="a" sq="Adresa" en="Address" />, `${site.address.street}, ${site.address.locality}, ${site.address.postalCode} ${site.address.city}, Kosovo`],
                [<T key="p" sq="Telefoni" en="Phone" />, site.phones.map((p) => p.display).join(" · ")],
                ["Email", site.email],
              ].map(([k, v], i) => (
                <div key={i} className="grid grid-cols-3 gap-4 py-3">
                  <dt className="text-muted">{k}</dt>
                  <dd className="col-span-2 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col justify-between gap-8 rounded-xl bg-ink p-8 text-white">
            <div>
              <MapPin aria-hidden className="size-6 text-brand" />
              <p className="mt-4 font-display text-2xl leading-snug">
                <T sq="Nga Prishtina në gjithë rajonin" en="From Prishtinë to the whole region" />
              </p>
              <p className="mt-3 leading-relaxed text-muted-dark">
                <T
                  sq="Dorëzojmë në Kosovë dhe Ballkan dhe punojmë me kompani, ekipe shpëtimi, arboristë, palestra ngjitjeje dhe parqe aventure."
                  en="We deliver across Kosovo and the Balkans, and work with companies, rescue teams, arborists, climbing gyms and adventure parks."
                />
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/contact">
                <T sq="Na kontaktoni" en="Contact us" />
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
              <ButtonLink href="/shop" variant="outline-light">
                <T sq="Shiko dyqanin" en="Browse the shop" />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
