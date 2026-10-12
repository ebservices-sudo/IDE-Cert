// The two shop worlds and their subcategories. Products reference these slugs
// (mainCategory + subcategory); URLs are /shop/{world}/{subcategory}.

export type WorldSlug = "sport" | "professional";

export type Subcategory = {
  slug: string;
  name: string;
  blurb: string;
  /** Shown first in menus and on the home page tiles. */
  featured?: boolean;
};

export type World = {
  slug: WorldSlug;
  name: string;
  tagline: string;
  /** Short label for tiles and kickers. */
  shortTagline: string;
  description: string;
  subcategories: Subcategory[];
};

export const worlds: World[] = [
  {
    slug: "sport",
    name: "Sport",
    tagline: "Climbing, mountaineering, via ferrata and ice",
    shortTagline: "Climbing · Mountaineering · Ice",
    description:
      "Ropes, harnesses, helmets, carabiners and belay devices for climbers, mountaineers and climbing gyms.",
    subcategories: [
      { slug: "dynamic-ropes", name: "Dynamic ropes", blurb: "Single, half and twin ropes for rock, ice and the gym.", featured: true },
      { slug: "harnesses", name: "Harnesses", blurb: "Sport, alpine, kids and gym harnesses.", featured: true },
      { slug: "helmets", name: "Helmets", blurb: "Climbing and mountaineering helmets, plus spare parts.", featured: true },
      { slug: "carabiners-quickdraws", name: "Carabiners & quickdraws", blurb: "Locking and snapgate carabiners, quickdraws and sets.", featured: true },
      { slug: "belay-devices", name: "Belay devices", blurb: "Assisted-braking and tube-style belay devices.", featured: true },
      { slug: "via-ferrata", name: "Via ferrata", blurb: "Via ferrata sets and belay kits.", featured: true },
      { slug: "static-rappel-lines", name: "Static & rappel lines", blurb: "Low-stretch lines for rappelling, hauling and fixed lines." },
      { slug: "cords-webbing", name: "Cords & webbing", blurb: "Accessory cord and webbing on coils and reels." },
      { slug: "slings", name: "Slings", blurb: "Sewn slings, express slings and belay station slings." },
      { slug: "ice-climbing", name: "Ice climbing", blurb: "Ice tools, crampons and spare parts." },
      { slug: "canyoning", name: "Canyoning", blurb: "Canyoning harnesses, seat protectors and bags." },
      { slug: "route-setting", name: "Climbing wall & route setting", blurb: "Hangers, lower-offs and route-setting gear." },
      { slug: "bags", name: "Bags & rope bags", blurb: "Rope bags, haul bags and gear organisers." },
      { slug: "chalk-bouldering", name: "Chalk & bouldering", blurb: "Crash pads, chalk bags and chalk." },
      { slug: "clothing", name: "Clothing", blurb: "Jackets, hoodies, T-shirts, pants and caps." },
      { slug: "accessories", name: "Accessories", blurb: "Knives, gear carabiners, first-aid kits and more." },
    ],
  },
  {
    slug: "professional",
    name: "Professional",
    tagline: "Work at height, rope access, rescue, tree care and adventure parks",
    shortTagline: "Work at height · Rescue · Tree care",
    description:
      "Personal protective equipment against falls from height for industry, rope access, rescue teams, arborists and adventure parks.",
    subcategories: [
      { slug: "ropes", name: "Ropes & cords", blurb: "Static and dynamic kernmantle ropes and cord, on spools or cut to length.", featured: true },
      { slug: "work-harnesses", name: "Work & fall-arrest harnesses", blurb: "Full-body, sit and chest harnesses for work at height.", featured: true },
      { slug: "lanyards", name: "Lanyards & energy absorbers", blurb: "Positioning lanyards, Y-lanyards and energy absorbers.", featured: true },
      { slug: "connectors", name: "Connectors", blurb: "Aluminium and steel connectors for work and rescue.", featured: true },
      { slug: "descenders", name: "Descenders & rope adjusters", blurb: "Descenders and rope adjustment devices.", featured: true },
      { slug: "adventure-parks", name: "Adventure parks", blurb: "Smart Belay X, harnesses, helmets and gloves for adventure parks.", featured: true },
      { slug: "ropes-with-terminations", name: "Ropes with terminations", blurb: "Static and tree-care ropes with sewn or spliced ends." },
      { slug: "tree-care", name: "Tree care", blurb: "Arborist ropes, harnesses, spurs and cambium savers." },
      { slug: "ascenders", name: "Ascenders", blurb: "Hand, chest, foot and knee ascenders." },
      { slug: "pulleys", name: "Pulleys & rigging", blurb: "Pulleys, swivels, rigging plates and rings." },
      { slug: "anchors", name: "Anchors", blurb: "Anchor slings and anchoring straps." },
      { slug: "rescue", name: "Rescue", blurb: "Rescue descent systems and rescue equipment." },
      { slug: "work-helmets", name: "Work helmets", blurb: "Work and rescue helmets, visors and accessories." },
      { slug: "bags-transport", name: "Bags & transport", blurb: "Rope bags, PPE backpacks and storage." },
      { slug: "protection-accessories", name: "Edge protection & accessories", blurb: "Rope protectors and work accessories." },
      { slug: "workwear-gloves", name: "Workwear & gloves", blurb: "Work gloves and workwear." },
    ],
  },
];

export function getWorld(slug: string): World | undefined {
  return worlds.find((w) => w.slug === slug);
}

export function getSubcategory(world: string, sub: string): Subcategory | undefined {
  return getWorld(world)?.subcategories.find((s) => s.slug === sub);
}

export function worldHref(world: WorldSlug) {
  return `/shop/${world}`;
}

export function subcategoryHref(world: WorldSlug, sub: string) {
  return `/shop/${world}/${sub}`;
}
