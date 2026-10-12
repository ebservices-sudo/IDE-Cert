// Rules used by scripts/build-catalog.mjs: what to skip, where products are
// listed, how price-list names are turned into English product names, and how
// EDELRID's technical labels are shown. Edit here, then run `npm run catalog`.

/** Price-list sections that are not sold in the shop (POS / marketing material). */
export const excludedSections = [/^MARKETING/, /^MERCHANDISING/];

/** Price-list names that are not products (service fees go on the Services page). */
export const excludedItems = [/^9986\d{7}$/, /^9988\d{7}$/];

/** German words left in the EDELRID price lists → English. */
export const nameTranslations = [
  [/^Heißschneider u\. Schneide$/, "Hot Cutter with Blade"],
  [/^Ersatzschneide$/, "Spare Blade for Hot Cutter"],
  [/Einbindeschlaufe/, "Tie-In Loop"],
  [/^Materialkarabiner$/, "Gear Carabiner"],
  [/^Wurfleine\b/, "Throw Line"],
  [/^Stufenschlinge$/, "Etrier"],
  [/^PSA-Rucksack\b/, "PPE Backpack"],
  [/^Erste Hilfe Set$/, "First Aid Kit"],
  [/^Rope Tooth Einhandmesser$/, "Rope Tooth One-Hand Knife"],
  [/^Holster für /, "Holster for "],
  [/ mit Seilsack Liner$/, " with Rope Bag Liner"],
  [/^Wo /, "Women's "],
  [/^Me /, "Men's "],
];

/**
 * Corrections to price-list rows, keyed by item number. Only for obvious
 * transcription errors in the price list; each one is also listed in data/TODO.md.
 * Radialis Pro Adjust (Adventure list): colour/size text is swapped relative to
 * the colour code in the item number (…1380 = 138 oasis, …3290 = 329 icemint).
 * The item number is what is ordered from EDELRID, so it wins.
 */
export const rowOverrides = {
  "820460211380": { colour: "138 oasis", size: "L-XL" },
  "820460293290": { colour: "329 icemint", size: "XS-M" },
};

/** Display names where the price-list name is not a good product name. */
export const nameOverrides = {
  "X-P*e 12,3mm": "X-P*e 12.3 mm",
};

/** EDELRID technical labels → shop labels (values are never changed). */
export const specLabels = {
  "Schrinkage H20": "Shrinkage in water",
  "Lataral Eyelets": "Lateral eyelets",
  "Fmax. major axis": "Strength, major axis",
  "Fmax. minor axis": "Strength, minor axis",
  "Fmax. open": "Strength, gate open",
  "Weight per meter": "Weight per metre",
  "minimum breaking strength with standard sewn terminations": "Minimum breaking strength with sewn terminations",
  "max. waist size": "Max. waist size",
  "min. waist size": "Min. waist size",
  "max. leg loop circumference": "Max. leg loop circumference",
  "min. leg loop circumference": "Min. leg loop circumference",
  "max. descent distance": "Max. descent distance",
  "Rope Type": "Rope type",
};

/** Spec keys that become filters when a category has enough products using them. */
export const facetSpecs = ["Diameter", "Rope type", "Carabiner shape", "Closure", "Material"];

// --- Placement -------------------------------------------------------------
// place() returns where a price-list row is listed: [world, subcategory, primary].
// A product's main category is its first primary placement (in list order
// Sport → Safety → Adventure); every other placement becomes "also listed in".

const S = (sub, primary = true) => ["sport", sub, primary];
const P = (sub, primary = true) => ["professional", sub, primary];

const has = (name, re) => re.test(name);

export function place(list, section, name) {
  const sec = section.split("|")[1]?.trim().toUpperCase() ?? section.toUpperCase();

  if (list === "sport") {
    if (sec === "ROPES") return [S("dynamic-ropes")];
    if (sec === "STATIC ROPES") {
      if (has(name, /^Pintail/)) return [S("canyoning"), S("static-rappel-lines"), P("ropes", false)];
      if (has(name, /^(Rap Line|Guide Assist)/)) return [S("static-rappel-lines")];
      return [S("static-rappel-lines", false), P("ropes", false)];
    }
    if (sec === "ACCESSORY CORD") {
      if (has(name, /^(Heißschneider|Ersatzschneide)/)) return [S("accessories", false), P("protection-accessories", false)];
      return [S("cords-webbing")];
    }
    if (sec === "HARNESSES") {
      if (has(name, /^(Iguazu|Irupu|Seat Protector)/)) return [S("canyoning")];
      if (has(name, /^Agent/)) return [S("canyoning", false), S("harnesses", false)];
      return [S("harnesses")];
    }
    if (sec === "VIA FERRATA SETS") return [S("via-ferrata")];
    if (sec === "HELMETS") {
      if (has(name, /^Ultralight/)) return [S("helmets"), P("adventure-parks", false)];
      return [S("helmets")];
    }
    if (sec === "TAPES & SLINGS") {
      if (has(name, /^(PES Webbing|X-Tube 25mm)$/)) return [S("cords-webbing")];
      if (has(name, /^(Prostep|Aid Climber)/)) return [S("accessories")];
      if (has(name, /^Tool Safety Leash/)) return [S("accessories", false), P("protection-accessories", false)];
      return [S("slings")];
    }
    if (sec === "CARABINER & QUICKDRAWS") {
      if (has(name, /^(Jim |Spare Jim|Topper Station|Screwlink|Hudson Hammer|Holster für Hudson)/)) return [S("route-setting")];
      if (has(name, /^(Spoc|Flux|Neelix|Puck|Pike Rescue|Warp|Cupid Swivel)/)) return [S("accessories", false), P("pulleys", false)];
      if (has(name, /^Hand Cruiser/)) return [S("accessories", false), P("ascenders", false)];
      if (has(name, /^Steel HMS/)) return [P("connectors", false)];
      return [S("carabiners-quickdraws")];
    }
    if (sec === "BELAY DEVICES") return [S("belay-devices")];
    if (sec === "ICE CLIMBING") return [S("ice-climbing")];
    if (sec.startsWith("APPAREL")) {
      if (has(name, /Glove/)) return [S("clothing"), P("workwear-gloves", false)];
      return [S("clothing")];
    }
    if (sec === "TRANSPORT") {
      if (has(name, /^Setter/)) return [S("route-setting"), S("bags")];
      if (has(name, /^Canyoneer/)) return [S("canyoning"), S("bags")];
      return [S("bags")];
    }
    if (sec === "ACCESSORIES") {
      if (has(name, /Chalk|^Crux|^Mantle|^Sit Start|^Boulder Bag/)) return [S("chalk-bouldering")];
      if (has(name, /Canyoning/)) return [S("accessories"), S("canyoning", false)];
      return [S("accessories")];
    }
  }

  if (list === "safety") {
    if (sec === "STATIC ROPES" || sec === "DYNAMIC ROPES") return [P("ropes")];
    if (sec === "TREECARE ROPES") return [P("tree-care"), P("ropes", false)];
    if (sec === "ROPES WITH TERMINATIONS") {
      if (has(name, /^(Jacamar|Woodpecker|Bucco|X-P\*e|SE X-P\*e)/)) return [P("ropes-with-terminations"), P("tree-care", false)];
      return [P("ropes-with-terminations")];
    }
    if (sec === "ACCESSORY CORDS") {
      if (has(name, /^(Tibor|Hotline|Wurfleine)/)) return [P("tree-care")];
      return [P("ropes", false)];
    }
    if (sec === "ACCESSORIES" && has(section, /^Zubehör/)) {
      // The ropes-accessories table (protectors, retrieval cone, hot cutter).
      return [P("protection-accessories")];
    }
    if (sec === "HARNESSES") {
      if (has(name, /^Tree(Rex|Raptor)/)) return [P("tree-care"), P("work-harnesses", false)];
      if (has(name, /^Mountain Rescue/)) return [P("rescue"), P("work-harnesses", false)];
      if (has(name, /^Agent/)) return [P("work-harnesses", false)];
      return [P("work-harnesses")];
    }
    if (sec === "HARNESSES ACCESSORIES" || sec === "HARNESSES SPARE PARTS") {
      if (has(name, /^Tree(Rex|Raptor)|TreeRaptor|TreeRex/)) return [P("tree-care")];
      if (has(name, /^SM-Clip/)) return [P("work-harnesses", false)];
      return [P("work-harnesses")];
    }
    if (sec.startsWith("HELMETS")) {
      if (has(name, /^(Zodiac|Salathe|Shield|Spare Helmet (Padding|Headlamp) (Salathe|Shield|Zodiac))/)) return [P("work-helmets", false)];
      return [P("work-helmets")];
    }
    if (sec === "LANYARDS") {
      if (has(name, /^(Ancora|Multichain|Power Steel)/)) return [P("anchors")];
      if (has(name, /^(Adjustable Cambium Saver|Cambiumsaver|Tibor 8mm)/)) return [P("tree-care")];
      if (has(name, /Sling|X-Tube|G-Screamer/)) return [P("anchors", false)];
      return [P("lanyards")];
    }
    if (sec === "LANYARDS SPARE PARTS") {
      if (has(name, /Cupid/)) return [P("pulleys", false)];
      return [P("lanyards")];
    }
    if (sec === "HARDWARE CARABINER") return [P("connectors", false)];
    if (sec === "HARDWARE") {
      if (has(name, /^(Talon|Tree Cruiser|Spare Talon)/)) return [P("tree-care")];
      if (has(name, /^(Safe Descent|Defuser Rescue)/)) return [P("rescue"), P("descenders", false)];
      if (has(name, /^Rescue 8/)) return [P("descenders"), P("rescue", false)];
      if (has(name, /^(Pinch|Bud|Hannibal)/)) return [P("descenders", false)];
      if (has(name, /^Ombilix/)) return [P("lanyards")];
      if (has(name, /^(Fuse|Megawatt)/)) return [P("descenders")];
      if (has(name, /Cruiser/)) return [P("ascenders")];
      if (has(name, /^Pike Rescue/)) return [P("pulleys"), P("rescue", false)];
      return [P("pulleys")];
    }
    if (sec === "HARDWARE ACCESSORIES") return [P("ascenders")];
    if (sec === "TRANSPORT") return [P("bags-transport", !has(name, /^(Spring Bag|Setter|Lynn|Kurt|Pit)/))];
    if (sec === "ACCESSORIES") {
      if (has(name, /^(Clip Scissors|Holster for Clip Scissors|Dynosaw)/)) return [P("tree-care")];
      return [P("protection-accessories", false)];
    }
    if (sec === "APPAREL") {
      if (has(name, /^Grip Glove/)) return [P("workwear-gloves"), P("adventure-parks", false)];
      return [P("workwear-gloves", !has(name, /^(Wo|Me|Squamish|The Face|Lapnor|Corporate|Skinny|Work Glove|Easy Glider)/))];
    }
  }

  if (list === "adventure") {
    if (has(name, /^Safe Descent/)) return [P("adventure-parks", false)];
    if (has(name, /^(Ultralight|Fraggle|Cupid|Triangle|Steel HMS|Screwlink|Shockstop Pro|Spare Screw|Grip Glove)/)) return [P("adventure-parks", false)];
    return [P("adventure-parks")];
  }

  return [];
}

/** "Use" filter values derived from where a product is listed. */
export function useFor(world, sub) {
  if (world === "sport") return sub === "canyoning" ? "Canyoning" : sub === "ice-climbing" ? "Ice climbing" : "Climbing & mountaineering";
  if (sub === "tree-care") return "Tree care";
  if (sub === "adventure-parks") return "Adventure parks";
  if (sub === "rescue") return "Rescue";
  return "Work at height";
}
