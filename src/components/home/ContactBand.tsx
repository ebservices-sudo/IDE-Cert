import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { T } from "@/lib/i18n/T";

export function ContactBand() {
  const { address } = site;
  const cards = [
    {
      icon: Phone,
      key: "call",
      label: <T sq="Telefononi" en="Call" />,
      lines: site.phones.map((p) => ({ text: p.display, href: p.href })),
    },
    {
      icon: Mail,
      key: "email",
      label: "Email",
      lines: [{ text: site.email, href: `mailto:${site.email}` }],
    },
    {
      icon: MapPin,
      key: "visit",
      label: <T sq="Na vizitoni" en="Visit" />,
      lines: [
        { text: address.street },
        { text: `${address.locality}, ${address.postalCode} ${address.city}` },
      ],
    },
  ];

  return (
    <section className="border-t border-line bg-mist py-16 sm:py-20" aria-labelledby="contact-title">
      <Container className="grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-4">
          <p className="kicker text-brand-strong"><T sq="Kontakt" en="Contact" /></p>
          <h2 id="contact-title" className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
            <T sq="Flisni me IDE Cert" en="Talk to IDE Cert" />
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            <T
              sq="Pyetje për një produkt, porosi të madhe ose inspektim? Telefononi, shkruani ose na vizitoni në Çagllavicë."
              en="Questions about a product, a bulk order or an inspection? Call, write or visit us in Çagllavicë."
            />
          </p>
          <ButtonLink href="/contact" variant="dark" className="mt-7">
            <T sq="Na kontaktoni" en="Contact us" />
            <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3 lg:col-span-8">
          {cards.map(({ key, icon: Icon, label, lines }) => (
            <li key={key} className="rounded-xl border border-line bg-white p-6">
              <Icon aria-hidden className="size-5 text-brand-strong" />
              <p className="mt-4 kicker text-muted">{label}</p>
              <div className="mt-2 space-y-1 text-sm font-semibold">
                {lines.map((l) =>
                  "href" in l && l.href ? (
                    <a key={l.text} href={l.href} className="block break-words hover:text-brand-strong">
                      {l.text}
                    </a>
                  ) : (
                    <p key={l.text}>{l.text}</p>
                  ),
                )}
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
