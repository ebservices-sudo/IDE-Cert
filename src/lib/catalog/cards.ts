import { formatPriceRange } from "@/lib/format";
import type { Facet, Listing, ListingState } from "./listing";
import { PAGE_SIZE } from "./listing";
import type { Product } from "./types";
import { productHref } from "./urls";

// What a product card needs — small enough to send to the browser for listings.

export type CardData = {
  id: string;
  href: string;
  name: string;
  brand: string;
  isNew: boolean;
  chips: string[];
  image: { src: string; alt: string } | null;
  price: string;
  colours: number;
};

export function toCard(p: Product): CardData {
  const image = p.images[0];
  return {
    id: p.id,
    href: productHref(p),
    name: p.name,
    brand: p.brand,
    isNew: Boolean(p.isNew),
    chips: p.chips ?? [],
    image: image ? { src: image.src, alt: image.alt } : null,
    price: formatPriceRange(p),
    colours: new Set(p.variants.map((v) => v.options.colour).filter(Boolean)).size,
  };
}

/** A listing page as JSON: the cards shown so far plus facets and state. */
export type ListingResult = { total: number; facets: Facet[]; state: ListingState; cards: CardData[] };

export function toListingResult(listing: Listing): ListingResult {
  return {
    total: listing.total,
    facets: listing.facets,
    state: listing.state,
    cards: listing.results.slice(0, listing.state.page * PAGE_SIZE).map(toCard),
  };
}
