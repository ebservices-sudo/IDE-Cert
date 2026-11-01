import type { Metadata } from "next";
import { ArrowRight, MapPin } from "lucide-react";
import { distribution, founder, mottos } from "@/config/founder";
import { Logo } from "@/components/brand/Logo";
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
        title={<T sq={mottos.safety.sq} en={mottos.safety.en} />}
        description={
          <T
            sq={`${site.legalName} është kompani inxhinierike në Prishtinë, Kosovë, e udhëhequr nga ${site.owner}.`}
            en={`${site.legalName} is an engineering company in Prishtinë, Kosovo, led by ${site.owner}.`}
          />
        }
        breadcrumbs={[{ label: <T sq="Ballina" en="Home" />, href: "/" }, { label: <T sq="Rreth nesh" en="About" /> }]}
      />

      <section className="py-16 sm:py-20" aria-labelledby="founder-title">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <aside className="lg:col-span-4">
            <div className="rounded-2xl bg-ink p-7 text-white lg:sticky lg:top-28">
              <Logo tone="light" className="h-10 w-auto" />
              <p className="mt-8 font-display text-2xl leading-tight">{founder.name}</p>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-brand">
                <T sq={founder.role.sq} en={founder.role.en} />
              </p>
              <p className="mt-3 text-sm text-muted-dark">
                <T sq={founder.position.sq} en={founder.position.en} />
              </p>
              <ul className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm">
                {founder.credentials.map((c) => (
                  <li key={c.title.en}>
                    <p className="font-semibold">
                      <T sq={c.title.sq} en={c.title.en} />
                    </p>
                    <p className="mt-0.5 text-muted-dark">
                      <T sq={c.text.sq} en={c.text.en} />
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-white/10 pt-6 font-display text-lg leading-snug text-brand">
                <T sq={`“${mottos.main.sq}”`} en={`“${mottos.main.en}”`} />
              </p>
            </div>
          </aside>
          <div className="lg:col-span-8">
            <p className="kicker text-brand-strong">
              <T sq="Themeluesi" en="The founder" />
            </p>
            <h2 id="founder-title" className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              {founder.name}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/85">
              <T sq={founder.intro.sq} en={founder.intro.en} />
            </p>
            <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2">
              {founder.highlights.map((g) => (
                <section key={g.title.en} className="border-t-2 border-ink pt-5">
                  <h3 className="kicker text-ink">
                    <T sq={g.title.sq} en={g.title.en} />
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {g.items.map((it) => (
                      <li key={it.en} className="flex gap-3 text-[15px] leading-relaxed">
                        <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-strong" />
                        <span>
                          <T sq={it.sq} en={it.en} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-ink py-16 text-white sm:py-20" aria-labelledby="dist-title">
        <div aria-hidden className="absolute inset-0 bg-grid-dark opacity-50" />
        <Container className="relative grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <p className="kicker text-brand">
              <T sq="Distribucioni" en="Distribution" />
            </p>
            <h2 id="dist-title" className="mt-3 font-display text-3xl leading-tight">
              <T sq="Distributor në Kosovë dhe Shqipëri" en="Distributor for Kosovo and Albania" />
            </h2>
            <p className="mt-4 leading-relaxed text-muted-dark">
              <T sq={distribution.text.sq} en={distribution.text.en} />
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-10 gap-y-4 lg:col-span-6 lg:justify-end">
            {distribution.brands.map((b) => (
              <li key={b} className="font-display text-[clamp(1.5rem,3vw,2.4rem)] uppercase text-white/90">
                {b}
              </li>
            ))}
          </ul>
        </Container>
      </section>

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
                  sq="Punojmë në Kosovë, Shqipëri dhe Ballkan me kompani, ekipe shpëtimi, arboristë, palestra ngjitjeje dhe parqe aventure."
                  en="We work across Kosovo, Albania and the Balkans with companies, rescue teams, arborists, climbing gyms and adventure parks."
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
