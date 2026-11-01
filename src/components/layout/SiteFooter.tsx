import { SmoothLink } from "./SmoothLink";
import { Mail, MapPin, Phone } from "lucide-react";
import { subcategoryHref, worldHref, worlds } from "@/config/catalog";
import { legalNav, mainNav, site } from "@/config/site";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { T } from "@/lib/i18n/T";

// Reading the date during prerender must be cached under Cache Components.
function CurrentYear() {
  // Static pages are rebuilt on every deploy, which keeps the year current.
  return <>{new Date().getFullYear()}</>;
}

function FooterColumn({ title, links }: { title: React.ReactNode; links: { label: string; labelSq: string; href: string }[] }) {
  return (
    <div>
      <p className="kicker text-white">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <SmoothLink href={l.href} className="text-sm hover:text-white">
              <T sq={l.labelSq} en={l.label} />
            </SmoothLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const { address } = site;
  return (
    <footer className="bg-ink text-muted-dark">
      <Container className="grid gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo tone="light" className="h-12 w-auto" />
          <p className="mt-5 kicker text-white/70">
            <T sq="Inspektim · Dizajnim · Inxhinieri · Certifikim" en={site.disciplines.join(" · ")} />
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            <T
              sq="Pajisje EDELRID për ngjitje dhe punë në lartësi, si dhe shërbime inspektimi, dizajnimi, inxhinierie dhe certifikimi nga Prishtina."
              en="Climbing and work-at-height equipment from the EDELRID range, and inspection, design, engineering and certification services from Prishtinë."
            />
          </p>
          <ul className="mt-6 space-y-2.5 text-sm">
            <li className="flex gap-2.5">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>
                {address.street}, {address.locality}, {address.postalCode} {address.city}, <T sq="Republika e Kosovës" en={address.country} />
              </span>
            </li>
            {site.phones.map((p) => (
              <li key={p.href}>
                <a href={p.href} className="flex items-center gap-2.5 hover:text-white">
                  <Phone aria-hidden className="size-4" />
                  {p.display}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${site.email}`} className="flex items-center gap-2.5 hover:text-white">
                <Mail aria-hidden className="size-4" />
                {site.email}
              </a>
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 min-[360px]:grid-cols-2 sm:grid-cols-4 lg:col-span-8">
          {worlds.map((world) => (
            <FooterColumn
              key={world.slug}
              title={<T sq={world.nameSq} en={world.name} />}
              links={[
                ...world.subcategories
                  .filter((s) => s.featured)
                  .map((s) => ({ label: s.name, labelSq: s.nameSq, href: subcategoryHref(world.slug, s.slug) })),
                { label: `All ${world.name}`, labelSq: `Të gjitha: ${world.nameSq}`, href: worldHref(world.slug) },
              ]}
            />
          ))}
          <FooterColumn title={<T sq="Kompania" en="Company" />} links={[...mainNav]} />
          <FooterColumn title={<T sq="Ndihmë" en="Help" />} links={[...legalNav]} />
        </div>
      </Container>

      <div className="border-t border-ink-line">
        <Container className="flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {site.legalName}{" "}
            <T sq="Çmimet në EUR, me TVSH 18% për dorëzim në Kosovë." en="Prices in EUR, incl. 18% VAT for delivery in Kosovo." />
          </p>
          <p>
            <T sq="EDELRID është markë tregtare e EDELRID GmbH & Co. KG." en="EDELRID is a trademark of EDELRID GmbH & Co. KG." />
          </p>
        </Container>
      </div>
    </footer>
  );
}
