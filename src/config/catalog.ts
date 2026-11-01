// The two shop worlds and their subcategories. Products reference these slugs
// (mainCategory + subcategory); URLs are /shop/{world}/{subcategory}.

export type WorldSlug = "sport" | "professional";

export type Subcategory = {
  slug: string;
  name: string;
  nameSq: string;
  blurb: string;
  blurbSq: string;
  /** Shown first in menus and on the home page tiles. */
  featured?: boolean;
};

export type World = {
  slug: WorldSlug;
  name: string;
  nameSq: string;
  tagline: string;
  taglineSq: string;
  /** Short label for tiles and kickers. */
  shortTagline: string;
  shortTaglineSq: string;
  description: string;
  descriptionSq: string;
  subcategories: Subcategory[];
};

export const worlds: World[] = [
  {
    slug: "sport",
    name: "Sport",
    nameSq: "Sport",
    taglineSq: "Ngjitje, alpinizëm, via ferrata dhe akull",
    shortTaglineSq: "Ngjitje · Alpinizëm · Akull",
    descriptionSq: "Litarë, rripa sigurie, helmeta, karabina dhe pajisje sigurimi për ngjitës, alpinistë dhe palestra ngjitjeje.",
    tagline: "Climbing, mountaineering, via ferrata and ice",
    shortTagline: "Climbing · Mountaineering · Ice",
    description:
      "Ropes, harnesses, helmets, carabiners and belay devices for climbers, mountaineers and climbing gyms.",
    subcategories: [
      { slug: "dynamic-ropes", name: "Dynamic ropes", nameSq: "Litarë dinamikë", blurbSq: "Litarë teke, gjysmë dhe binjakë për shkëmb, akull dhe palestër.", blurb: "Single, half and twin ropes for rock, ice and the gym.", featured: true },
      { slug: "harnesses", name: "Harnesses", nameSq: "Rripa sigurie", blurbSq: "Rripa për sport, alpinizëm, fëmijë dhe palestër.", blurb: "Sport, alpine, kids and gym harnesses.", featured: true },
      { slug: "helmets", name: "Helmets", nameSq: "Helmeta", blurbSq: "Helmeta për ngjitje dhe alpinizëm, plus pjesë këmbimi.", blurb: "Climbing and mountaineering helmets, plus spare parts.", featured: true },
      { slug: "carabiners-quickdraws", name: "Carabiners & quickdraws", nameSq: "Karabina dhe ekspresa", blurbSq: "Karabina me dhe pa bllokim, ekspresa dhe sete.", blurb: "Locking and snapgate carabiners, quickdraws and sets.", featured: true },
      { slug: "belay-devices", name: "Belay devices", nameSq: "Pajisje sigurimi", blurbSq: "Pajisje sigurimi me frenim ndihmës dhe të tipit tub.", blurb: "Assisted-braking and tube-style belay devices.", featured: true },
      { slug: "via-ferrata", name: "Via ferrata", nameSq: "Via ferrata", blurbSq: "Sete via ferrata dhe kite sigurimi.", blurb: "Via ferrata sets and belay kits.", featured: true },
      { slug: "static-rappel-lines", name: "Static & rappel lines", nameSq: "Litarë statikë dhe zbritjeje", blurbSq: "Litarë me shtrirje të ulët për zbritje, tërheqje dhe linja fikse.", blurb: "Low-stretch lines for rappelling, hauling and fixed lines." },
      { slug: "cords-webbing", name: "Cords & webbing", nameSq: "Kordona dhe shirita", blurbSq: "Kordon ndihmës dhe shirit në rrotulla dhe bobina.", blurb: "Accessory cord and webbing on coils and reels." },
      { slug: "slings", name: "Slings", nameSq: "Unaza", blurbSq: "Unaza të qepura, unaza ekspres dhe unaza për stacione.", blurb: "Sewn slings, express slings and belay station slings." },
      { slug: "ice-climbing", name: "Ice climbing", nameSq: "Ngjitje në akull", blurbSq: "Kazma akulli, krampona dhe pjesë këmbimi.", blurb: "Ice tools, crampons and spare parts." },
      { slug: "canyoning", name: "Canyoning", nameSq: "Kanioning", blurbSq: "Rripa, mbrojtëse ndenjëseje dhe çanta për kanioning.", blurb: "Canyoning harnesses, seat protectors and bags." },
      { slug: "route-setting", name: "Climbing wall & route setting", nameSq: "Mur ngjitjeje dhe rrugë", blurbSq: "Varëse, pika zbritjeje dhe vegla për ndërtimin e rrugëve.", blurb: "Hangers, lower-offs and route-setting gear." },
      { slug: "bags", name: "Bags & rope bags", nameSq: "Çanta dhe çanta litari", blurbSq: "Çanta litari, çanta tërheqjeje dhe organizues pajisjesh.", blurb: "Rope bags, haul bags and gear organisers." },
      { slug: "chalk-bouldering", name: "Chalk & bouldering", nameSq: "Magnez dhe boulder", blurbSq: "Dyshekë boulderi, çanta magnezi dhe magnez.", blurb: "Crash pads, chalk bags and chalk." },
      { slug: "clothing", name: "Clothing", nameSq: "Veshje", blurbSq: "Xhaketa, duks, bluza, pantallona dhe kapele.", blurb: "Jackets, hoodies, T-shirts, pants and caps." },
      { slug: "accessories", name: "Accessories", nameSq: "Aksesorë", blurbSq: "Thika, karabina pajisjesh, çanta të ndihmës së parë dhe më shumë.", blurb: "Knives, gear carabiners, first-aid kits and more." },
    ],
  },
  {
    slug: "professional",
    name: "Professional",
    nameSq: "Profesional",
    taglineSq: "Punë në lartësi, qasje me litar, shpëtim, kujdes i pemëve dhe parqe aventure",
    shortTaglineSq: "Punë në lartësi · Shpëtim · Pemë",
    descriptionSq: "Pajisje mbrojtëse personale kundër rënies nga lartësia për industrinë, qasjen me litar, ekipet e shpëtimit, arboristët dhe parqet aventure.",
    tagline: "Work at height, rope access, rescue, tree care and adventure parks",
    shortTagline: "Work at height · Rescue · Tree care",
    description:
      "Personal protective equipment against falls from height for industry, rope access, rescue teams, arborists and adventure parks.",
    subcategories: [
      { slug: "ropes", name: "Ropes & cords", nameSq: "Litarë dhe kordona", blurbSq: "Litarë statikë dhe dinamikë dhe kordon, në bobina ose të prerë sipas gjatësisë.", blurb: "Static and dynamic kernmantle ropes and cord, on spools or cut to length.", featured: true },
      { slug: "work-harnesses", name: "Work & fall-arrest harnesses", nameSq: "Rripa pune dhe kundër rënies", blurbSq: "Rripa trupi të plotë, ulëse dhe gjoksi për punë në lartësi.", blurb: "Full-body, sit and chest harnesses for work at height.", featured: true },
      { slug: "lanyards", name: "Lanyards & energy absorbers", nameSq: "Lidhëse dhe amortizues", blurbSq: "Lidhëse pozicionimi, lidhëse Y dhe amortizues energjie.", blurb: "Positioning lanyards, Y-lanyards and energy absorbers.", featured: true },
      { slug: "connectors", name: "Connectors", nameSq: "Lidhës", blurbSq: "Lidhës alumini dhe çeliku për punë dhe shpëtim.", blurb: "Aluminium and steel connectors for work and rescue.", featured: true },
      { slug: "descenders", name: "Descenders & rope adjusters", nameSq: "Zbritës dhe rregullues litari", blurbSq: "Pajisje për zbritje dhe rregullim në litar.", blurb: "Descenders and rope adjustment devices.", featured: true },
      { slug: "adventure-parks", name: "Adventure parks", nameSq: "Parqe aventure", blurbSq: "Smart Belay X, rripa, helmeta dhe doreza për parqe aventure.", blurb: "Smart Belay X, harnesses, helmets and gloves for adventure parks.", featured: true },
      { slug: "ropes-with-terminations", name: "Ropes with terminations", nameSq: "Litarë me përfundime", blurbSq: "Litarë statikë dhe për pemë me skaje të qepura ose të gërshetuara.", blurb: "Static and tree-care ropes with sewn or spliced ends." },
      { slug: "tree-care", name: "Tree care", nameSq: "Kujdesi i pemëve", blurbSq: "Litarë arboristësh, rripa, thumba dhe mbrojtëse lëvoreje.", blurb: "Arborist ropes, harnesses, spurs and cambium savers." },
      { slug: "ascenders", name: "Ascenders", nameSq: "Ngjitës në litar", blurbSq: "Ngjitës dore, gjoksi, këmbe dhe gjuri.", blurb: "Hand, chest, foot and knee ascenders." },
      { slug: "pulleys", name: "Pulleys & rigging", nameSq: "Rrotulla dhe sisteme", blurbSq: "Rrotulla, rrotullues, pllaka shpërndarëse dhe unaza.", blurb: "Pulleys, swivels, rigging plates and rings." },
      { slug: "anchors", name: "Anchors", nameSq: "Ankorime", blurbSq: "Unaza dhe rripa për pika ankorimi.", blurb: "Anchor slings and anchoring straps." },
      { slug: "rescue", name: "Rescue", nameSq: "Shpëtim", blurbSq: "Sisteme zbritjeje shpëtimi dhe pajisje shpëtimi.", blurb: "Rescue descent systems and rescue equipment." },
      { slug: "work-helmets", name: "Work helmets", nameSq: "Helmeta pune", blurbSq: "Helmeta pune dhe shpëtimi, vizore dhe aksesorë.", blurb: "Work and rescue helmets, visors and accessories." },
      { slug: "bags-transport", name: "Bags & transport", nameSq: "Çanta dhe transport", blurbSq: "Çanta litari, çanta shpine për PPE dhe ruajtje.", blurb: "Rope bags, PPE backpacks and storage." },
      { slug: "protection-accessories", name: "Edge protection & accessories", nameSq: "Mbrojtje skajesh dhe aksesorë", blurbSq: "Mbrojtëse litari dhe aksesorë pune.", blurb: "Rope protectors and work accessories." },
      { slug: "workwear-gloves", name: "Workwear & gloves", nameSq: "Veshje pune dhe doreza", blurbSq: "Doreza dhe veshje pune.", blurb: "Work gloves and workwear." },
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
