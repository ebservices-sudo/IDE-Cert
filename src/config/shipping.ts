// Delivery zones. Rates are not decided yet: while a zone's rate is null, the
// checkout says shipping is confirmed on the proforma invoice and the order
// total excludes shipping. Set rates in euro cents when decided.

export type ShippingZone = {
  id: "kosovo" | "balkans" | "eu";
  name: string;
  /** ISO 3166-1 alpha-2 codes (XK = Kosovo). */
  countries: string[];
  /** Flat rate in euro cents, or null = to be confirmed per order. */
  rateCents: number | null;
  /** Orders above this item total ship free (euro cents), or null. */
  freeFromCents: number | null;
  /** Shown at checkout for this zone. */
  note?: string;
};

export const shippingZones: ShippingZone[] = [
  {
    id: "kosovo",
    name: "Kosovo",
    countries: ["XK"],
    rateCents: null, // TODO(client): rate for Kosovo
    freeFromCents: null,
  },
  {
    id: "balkans",
    name: "Western Balkans",
    countries: ["AL", "MK", "ME", "RS", "BA"],
    rateCents: null, // TODO(client): rate for the Western Balkans
    freeFromCents: null,
    note: "Delivery outside Kosovo: we confirm shipping, customs and VAT on your proforma invoice.",
  },
  {
    id: "eu",
    name: "European Union",
    countries: [
      "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
      "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
    ],
    rateCents: null, // TODO(client): rate for the EU, or remove this zone
    freeFromCents: null,
    note: "Delivery outside Kosovo: we confirm shipping, customs and VAT on your proforma invoice.",
  },
];

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export function countryName(code: string) {
  if (code === "XK") return "Kosovo";
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/** Countries offered at checkout, Kosovo first, then the Balkans, then the EU (A–Z). */
export const checkoutCountries = shippingZones.flatMap((z) =>
  z.countries.map((code) => ({ code, name: countryName(code), zone: z.id })).sort((a, b) => a.name.localeCompare(b.name)),
);

export function zoneFor(country: string): ShippingZone | undefined {
  return shippingZones.find((z) => z.countries.includes(country));
}

/** Shipping for an order, or null when it is confirmed later. */
export function shippingCents(zone: ShippingZone, itemsCents: number): number | null {
  if (zone.rateCents == null) return null;
  if (zone.freeFromCents != null && itemsCents >= zone.freeFromCents) return 0;
  return zone.rateCents;
}
