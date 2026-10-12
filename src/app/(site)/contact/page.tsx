import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/config/site";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/forms/ContactForm";
import { ContactFormFromUrl } from "@/components/forms/ContactFormFromUrl";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${site.legalName} in Prishtinë: ${site.phones[0].display}, ${site.email}.`,
  alternates: { canonical: "/contact" },
};

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.address.street}, ${site.address.locality}, ${site.address.city}, Kosovo`)}`;

export default function ContactPage() {
  return (
    <>
      <PageHeader
        kicker="Contact"
        title="Talk to us"
        description="Questions about equipment, an order, or our services — call, email or use the form."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />
      <Container className="grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
        <div className="space-y-8 lg:col-span-4">
          <div>
            <h2 className="kicker text-muted">Phone</h2>
            <ul className="mt-3 space-y-2">
              {site.phones.map((p) => (
                <li key={p.href}>
                  <a href={p.href} className="inline-flex items-center gap-2.5 text-lg font-semibold hover:text-brand-strong">
                    <Phone aria-hidden className="size-4 text-brand-strong" />
                    {p.display}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="kicker text-muted">Email</h2>
            <a href={`mailto:${site.email}`} className="mt-3 inline-flex items-center gap-2.5 break-all text-lg font-semibold hover:text-brand-strong">
              <Mail aria-hidden className="size-4 shrink-0 text-brand-strong" />
              {site.email}
            </a>
          </div>
          <div>
            <h2 className="kicker text-muted">Address</h2>
            <address className="mt-3 flex gap-2.5 not-italic leading-relaxed">
              <MapPin aria-hidden className="mt-1 size-4 shrink-0 text-brand-strong" />
              <span>
                {site.legalName}
                <br />
                {site.address.street}
                <br />
                {site.address.locality}, {site.address.postalCode} {site.address.city}
                <br />
                {site.address.country}
              </span>
            </address>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-strong hover:underline">
              Open in Google Maps
              <ExternalLink aria-hidden className="size-3.5" />
            </a>
          </div>
          <div className="rounded-xl bg-mist p-5 text-sm leading-relaxed">
            <p className="font-semibold">Need a price for a custom rope length or a larger quantity?</p>
            <Link href="/quote" className="mt-1 inline-block font-semibold text-brand-strong hover:underline">
              Request a quote
            </Link>
          </div>
        </div>
        <div className="lg:col-span-8">
          <h2 className="font-display text-2xl">Send us a message</h2>
          <div className="mt-6">
            <Suspense fallback={<ContactForm />}>
              <ContactFormFromUrl />
            </Suspense>
          </div>
        </div>
      </Container>
    </>
  );
}

