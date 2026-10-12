import { site } from "@/config/site";
import { productHref } from "@/lib/catalog/urls";
import type { Product } from "@/lib/catalog/types";

// schema.org structured data. Only facts from the catalogue and site config.

export function JsonLd({ data }: { data: unknown }) {
  // "<" is escaped so the JSON cannot close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${site.url}/#organization`,
    name: site.legalName,
    alternateName: site.name,
    url: site.url,
    logo: `${site.url}/brand/ide-cert-logo.png`,
    email: site.email,
    telephone: site.phones.map((p) => p.display),
    founder: { "@type": "Person", name: site.owner },
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: `${site.address.locality}, ${site.address.city}`,
      postalCode: site.address.postalCode,
      addressCountry: site.address.countryCode,
    },
    areaServed: ["Kosovo", "Western Balkans", "European Union"],
  };
}

export function productLd(p: Product) {
  const url = `${site.url}${productHref(p)}`;
  const fixed = p.variants.filter((v) => v.unit.kind !== "metre");
  const pool = fixed.length ? fixed : p.variants;
  const prices = pool.map((v) => v.price);
  const gtin = p.variants.length === 1 ? p.variants[0].gtin : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `EDELRID ${p.name}`,
    url,
    sku: p.variants.length === 1 ? p.variants[0].sku : undefined,
    gtin13: gtin && gtin.length === 13 ? gtin : undefined,
    brand: { "@type": "Brand", name: "EDELRID" },
    description: p.shortDescription || p.description.split("\n")[0] || undefined,
    image: p.images.slice(0, 4).map((i) => `${site.url}${i.src}`),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: Math.min(...prices).toFixed(2),
      highPrice: Math.max(...prices).toFixed(2),
      offerCount: p.variants.length,
      // Ordered from EDELRID for each customer.
      availability: "https://schema.org/BackOrder",
      seller: { "@id": `${site.url}/#organization` },
    },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${site.url}${it.path}` })),
  };
}
