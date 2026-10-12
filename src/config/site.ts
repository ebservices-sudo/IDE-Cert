// Company facts shown across the site. Change them here, not in components.

export const site = {
  name: "IDE Cert",
  legalName: "IDE Cert SH.P.K.",
  disciplines: ["Inspection", "Design", "Engineering", "Certification"],
  url: "https://ide-cert.com",
  owner: "Dr. sc. Shpetim Lajqi",
  phones: [
    { display: "+383 44 259 771", href: "tel:+38344259771" },
    { display: "+383 49 720 630", href: "tel:+38349720630" },
  ],
  // TODO: switch to info@ide-cert.com once the domain and Email Routing are live.
  email: "idecert.shpk@gmail.com",
  address: {
    street: "Odhise Paskali, Lagja Qendresa",
    locality: "Çagllavicë",
    postalCode: "10000",
    city: "Prishtinë",
    country: "Republic of Kosovo",
    countryCode: "XK",
  },
  deliveryNote: "Delivery across Kosovo and the Balkans",
} as const;

export const shop = {
  /** Kosovo VAT, included in all shown prices. */
  vatRate: 0.18,
  currency: "EUR",
  // TODO(client): typical lead time from order to delivery, e.g. "7–14 working days".
  // While null, product pages say the delivery date is confirmed after ordering.
  leadTime: null as string | null,
  /** Most metres of rope per cut-to-length line. Longer pieces go through a quote. */
  maxCutLength: 500,
} as const;

export const mainNav = [
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const legalNav = [
  { label: "Shipping & returns", href: "/shipping-returns" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
] as const;
