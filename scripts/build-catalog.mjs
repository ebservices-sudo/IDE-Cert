// Builds the shop catalogue from the EDELRID 2026 price lists and official
// EDELRID product data. Nothing technical is invented: specs, certifications,
// descriptions, downloads and photos come only from edelrid.com; prices,
// item numbers, colours and sizes only from the price lists. Whatever is
// missing is listed in data/TODO.md.
//
//   node scripts/pricelists/extract-pdf.mjs …   (price list PDF → CSV)
//   node scripts/edelrid/fetch-pages.mjs        (edelrid.com → .cache)
//   node scripts/edelrid/parse-pages.mjs        (.cache → data/edelrid/pages.json)
//   node scripts/build-catalog.mjs              (→ data/catalog/*.json, data/TODO.md)
//   node scripts/catalog/fetch-images.mjs       (→ public/products/*.webp)

import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  excludedItems,
  excludedSections,
  facetSpecs,
  nameOverrides,
  nameTranslations,
  place,
  rowOverrides,
  specLabels,
  useFor,
} from "./catalog/rules.mjs";

const LISTS = [
  ["sport", "data/pricelists/2026/sport.csv", "EDELRID Sport 2026 (temporary version 24.09.2025)"],
  ["safety", "data/pricelists/2026/safety.csv", "EDELRID Safety 2026 (temporary version 27.08.2025)"],
  ["adventure", "data/pricelists/2026/adventure.csv", "EDELRID Adventure 2026 (temporary version 03.09.2025)"],
];

// --- helpers ---------------------------------------------------------------

function parseCsv(text) {
  const lines = text.replace(/\r/g, "").trim().split("\n");
  const split = (line) => {
    const out = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q;
      } else if (ch === ";" && !q) { out.push(cur); cur = ""; } else cur += ch;
    }
    out.push(cur);
    return out;
  };
  const head = split(lines[0]);
  return lines.slice(1).map((l) => Object.fromEntries(split(l).map((v, i) => [head[i], v])));
}

const norm = (s) =>
  s.toLowerCase().replace(/(\d),(\d)/g, "$1.$2").replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss").replace(/[^a-z0-9*]+/g, "");

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/\*/g, "")
    .replace(/'s\b/g, "s")
    .replace(/(\d)[.,](\d)/g, "$1-$2")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const decimals = (s) => s.replace(/(\d),(\d)/g, "$1.$2");

function displayName(raw) {
  let n = nameOverrides[raw] ?? raw;
  for (const [re, to] of nameTranslations) n = n.replace(re, to);
  // "10,5mm" → "10.5 mm" with a non-breaking space so the unit never wraps alone.
  n = n.replace(/(\d),(\d)/g, "$1.$2").replace(/(\d)\s?mm\b/gi, "$1 mm");
  return n.replace(/\s+/g, " ").trim().replace(/(\d) mm\b/g, "$1 mm");
}

function colourOf(raw) {
  // "017 night" | "snow (047)" | "900 assorted colours" | ""
  let m = raw.match(/^(\d{3})\s+(.+)$/);
  if (m) return { code: m[1], name: m[2].trim() };
  m = raw.match(/^(.+?)\s*\((\d{3})\)$/);
  if (m) return { code: m[2], name: m[1].trim() };
  return raw ? { code: "", name: raw } : null;
}

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

function sizeText(raw) {
  const s = raw.trim();
  if (!s || s === "000" || s === "ONE SIZE") return "";
  return decimals(s)
    .replace(/^(\d+(?:\.\d+)?)\s?M$/, "$1 m")
    .replace(/^(\d+(?:\.\d+)?)\s?CM$/, "$1 cm")
    .replace(/^(\d+(?:\.\d+)?)\s?MM$/, "$1 mm")
    .replace(/^(\d+(?:\.\d+)?)\s?ML$/, "$1 ml")
    .replace(/^(\d+(?:\.\d+)?)\s?G$/, "$1 g")
    .replace(/^2X30 G$/, "2 × 30 g")
    .replace(/^SIZE (\d)$/, "Size $1")
    .replace(/^ONE SIZE$/, "One size")
    .replace(/^VARIO$/, "Vario");
}

function unitOf(row) {
  // Per-metre if either column says M (Powerstatic 11 snow 1 m prints "PC" in the RRP column).
  if (row.netUnit === "M" || row.rrpUnit === "M") return { kind: "metre" };
  const u = ["PA", "SET"].includes(row.netUnit) || /^PU/.test(row.netUnit) ? row.netUnit : row.rrpUnit || row.netUnit;
  if (u === "PA") return { kind: "pair" };
  if (u === "SET") return { kind: "set" };
  const pu = u.match(/^PU(\d+)$/);
  if (pu) return { kind: "pack", size: Number(pu[1]) };
  return { kind: "piece" };
}

// --- 1. price-list rows ----------------------------------------------------

const items = new Map(); // item → { row, seen: [{list, section, name}] }
const notes = [];
const batches = [];
const services = [];
const noRrp = [];
const conflicts = [];
const corrections = [];
let order = 0;

for (const [list, file] of LISTS) {
  for (const row of parseCsv(await readFile(file, "utf8"))) {
    row.list = list;
    row.order = order++;
    if (excludedSections.some((re) => re.test(row.section))) continue;
    if (/NOTE/.test(row.flags)) { notes.push(row); continue; }
    if (/^\d{5} batch/.test(row.item)) { batches.push(row); continue; }
    if (!/^\d{12}$/.test(row.item)) continue;
    if (excludedItems.some((re) => re.test(row.item))) { services.push(row); continue; }
    if (!row.rrp) { noRrp.push(row); continue; }
    if (rowOverrides[row.item]) {
      corrections.push(`${row.name} — item ${row.item}: price list says "${row.colour}" / "${row.size}"; shop uses "${rowOverrides[row.item].colour}" / "${rowOverrides[row.item].size}" to match the colour code in the item number. Please confirm with EDELRID.`);
      Object.assign(row, rowOverrides[row.item]);
    }
    const prev = items.get(row.item);
    if (prev) {
      prev.seen.push({ list, section: row.section, name: row.name });
      if (Number(prev.row.rrp) !== Number(row.rrp) || JSON.stringify(unitOf(prev.row)) !== JSON.stringify(unitOf(row))) {
        conflicts.push({ item: row.item, name: row.name, a: `${prev.row.list}: €${prev.row.rrp} / ${prev.row.rrpUnit}`, b: `${list}: €${row.rrp} / ${row.rrpUnit}` });
      }
      continue;
    }
    items.set(row.item, { row, seen: [{ list, section: row.section, name: row.name }] });
  }
}

// --- 2. EDELRID pages ------------------------------------------------------

const { pages, unavailable = [] } = JSON.parse(await readFile("data/edelrid/pages.json", "utf8"));
// Product pages listed by EDELRID that edelrid.com currently fails to serve, by URL slug.
const offline = new Map(unavailable.map((u) => [norm(u.url.split("/").pop()), u.url]));
const byArticle = new Map();
const byModel = new Map();
const byName = new Map();
pages.forEach((p, i) => {
  for (const v of p.variants) {
    if (!v.articleNumber) continue;
    if (!byArticle.has(v.articleNumber)) byArticle.set(v.articleNumber, new Set());
    byArticle.get(v.articleNumber).add(i);
    const m = v.articleNumber.slice(0, 5);
    if (!byModel.has(m)) byModel.set(m, new Set());
    byModel.get(m).add(i);
  }
  const n = norm(p.name);
  if (!byName.has(n)) byName.set(n, []);
  byName.get(n).push(i);
});
const richness = (i) => pages[i].technical.length + pages[i].features.length + pages[i].description.length;

// --- 3. name groups → products ---------------------------------------------

const nameGroups = new Map();
for (const entry of items.values()) {
  const key = norm(entry.row.name);
  if (!nameGroups.has(key)) nameGroups.set(key, { key, name: entry.row.name, entries: [] });
  nameGroups.get(key).entries.push(entry);
}

for (const g of nameGroups.values()) {
  const votes = new Map();
  for (const { row } of g.entries) {
    const exact = byArticle.get(row.item);
    if (exact) for (const i of exact) votes.set(i, (votes.get(i) ?? 0) + 3);
    else for (const i of byModel.get(row.item.slice(0, 5)) ?? []) votes.set(i, (votes.get(i) ?? 0) + 1);
  }
  if (!votes.size) for (const i of byName.get(g.key) ?? []) votes.set(i, 1);
  g.page = [...votes].sort((a, b) => b[1] - a[1] || richness(b[0]) - richness(a[0]))[0]?.[0];
  g.matchedBy = !votes.size ? null : g.entries.some(({ row }) => byArticle.has(row.item)) ? "article" : byName.has(g.key) && !g.entries.some(({ row }) => byModel.has(row.item.slice(0, 5))) ? "name" : "model";

  // Placements across every list the items appear in.
  const placements = [];
  for (const { seen } of g.entries)
    for (const s of seen) for (const p of place(s.list, s.section, s.name)) placements.push(p);
  const uniq = [];
  for (const p of placements) {
    const u = uniq.find((x) => x[0] === p[0] && x[1] === p[1]);
    if (!u) uniq.push([...p]);
    else u[2] ||= p[2];
  }
  const primary = uniq.find((p) => p[2]) ?? uniq[0];
  g.main = primary;
  g.also = uniq.filter((p) => p !== primary);
  if (!primary) console.warn("No placement for", g.name, g.entries[0].seen);
}

// Merge name groups that share an EDELRID page and main category
// (e.g. the Smart Belay X configurations).
const productGroups = [];
for (const g of [...nameGroups.values()].sort((a, b) => a.entries[0].row.order - b.entries[0].row.order)) {
  const target =
    g.page != null &&
    productGroups.find((p) => p.page === g.page && p.main?.[0] === g.main?.[0] && p.main?.[1] === g.main?.[1]);
  if (target) {
    target.groups.push(g);
    for (const a of g.also) if (!target.also.some((x) => x[0] === a[0] && x[1] === a[1])) target.also.push(a);
  } else productGroups.push({ page: g.page, main: g.main, also: [...g.also], groups: [g] });
}

// --- 4. build products -----------------------------------------------------

const todo = { noPage: [], offline: [], noSpecs: [], noCert: [], noImages: [], mismatch: [], unplaced: [] };
const imagePlan = new Map();
const netPrices = {};
const products = [];
const usedSlugs = new Set();

const PPE_SUBS = new Set([
  "dynamic-ropes", "harnesses", "helmets", "carabiners-quickdraws", "belay-devices", "via-ferrata", "static-rappel-lines",
  "slings", "ropes", "work-harnesses", "lanyards", "connectors", "descenders", "ropes-with-terminations", "ascenders",
  "pulleys", "anchors", "rescue", "work-helmets",
]);

function specValue(v) {
  return decimals(v).replace(/\bTyp\b/g, "Type").replace(/\bKlasse\b/g, "Class").trim();
}

function downloadKind(label) {
  if (/declaration of conformity|eu-conf|\bCS\b|certificate/i.test(label)) return "doc";
  if (/manual|instructions|\bGAL\b/i.test(label)) return "manual";
  if (/inspection/i.test(label)) return "doc";
  return "other";
}

for (const pg of productGroups) {
  if (!pg.main) {
    todo.unplaced.push(pg.groups.map((g) => g.name).join(", "));
    continue;
  }
  const page = pg.page != null ? pages[pg.page] : null;
  const names = pg.groups.map((g) => displayName(g.name));
  const name = [...names].sort((a, b) => a.length - b.length)[0];
  let slug = slugify(name);
  while (usedSlugs.has(slug)) slug += "-2";
  usedSlugs.add(slug);

  const entries = pg.groups.flatMap((g) => g.entries.map((e) => ({ ...e, displayName: displayName(g.name) })));
  entries.sort((a, b) => a.row.order - b.row.order);

  // Where the colour code sits in the item number (hardware: 8–10, apparel: 5–7).
  const colourIdx = (row) => {
    const c = colourOf(row.colour)?.code;
    if (!c) return -1;
    if (row.item.slice(8, 11) === c) return 8;
    if (row.item.slice(5, 8) === c) return 5;
    return -1;
  };

  // EDELRID colour id → colour code, via the page's article numbers.
  const pageColourByCode = new Map();
  if (page) {
    const idx = entries.map(({ row }) => colourIdx(row)).find((i) => i >= 0) ?? 8;
    for (const c of page.colours) {
      const codes = page.variants.filter((v) => v.colorId === c.id).map((v) => v.articleNumber.slice(idx, idx + 3));
      for (const code of new Set(codes)) if (!pageColourByCode.has(code)) pageColourByCode.set(code, c);
    }
  }
  const pageVariant = new Map((page?.variants ?? []).map((v) => [v.articleNumber, v]));

  const variants = [];
  const soldColours = [];
  for (const { row, displayName: dn } of entries) {
    const colour = colourOf(row.colour);
    const unit = unitOf(row);
    const options = {};
    if (colour) options.colour = cap(colour.name);
    let size = sizeText(row.size);
    const pv = pageVariant.get(row.item);
    if (/^\d+(\.\d+)?$/.test(size) && pv?.size && /\d\s?(cm|mm|m|l|kg|g)\b/i.test(pv.size)) size = pv.size.toLowerCase().replace(/(\d)(cm|mm|m|l|kg|g)\b/, "$1 $2");
    if (unit.kind === "metre") options.length = "Cut to length";
    else if (size && /\d\s?(m|cm)$/.test(size)) options.length = size;
    else if (size) options.size = size;
    if (names.length > 1 && new Set(names).size > 1) options.config = dn;
    variants.push({
      sku: row.item,
      options,
      price: Number(row.rrp),
      unit,
      stock: null,
      ...(/NEW/.test(row.flags) ? { isNew: true } : {}),
      ...(pv?.gtin ? { gtin: pv.gtin } : {}),
    });
    netPrices[row.item] = { net: Number(row.net), unit: row.netUnit, list: row.list };
    if (colour && !soldColours.some((c) => c.name === colour.name)) soldColours.push(colour);

    // Flag price-list rows whose colour text does not match the colour code in the item number.
    if (colour?.code && colourIdx(row) < 0) {
      todo.mismatch.push(`${dn} — item ${row.item}: the price list text says "${row.colour}" / "${row.size}", but the item number does not contain colour code ${colour.code}. Shown as printed; please confirm with EDELRID.`);
    }
    // Flag official data that disagrees with the price list for the same item number.
    if (pv && colour) {
      const pc = page.colours.find((c) => c.id === pv.colorId)?.name ?? "";
      if (pc && norm(pc) !== norm(colour.name)) {
        todo.mismatch.push(`${dn} — item ${row.item}: price list says colour "${colour.name}" / size "${row.size}", edelrid.com says colour "${pc}" / size "${pv.size}".`);
      }
    }
  }

  // Disambiguate variants whose options collide: by pack size when that
  // differs (Corazon pack of 10 / pack of 3), else by the price-list spec.
  const keyOf = (v) => JSON.stringify(v.options);
  const clash = new Map();
  for (const v of variants) clash.set(keyOf(v), [...(clash.get(keyOf(v)) ?? []), v]);
  for (const group of clash.values()) {
    if (group.length < 2) continue;
    const byUnit = new Set(group.map((v) => JSON.stringify(v.unit))).size === group.length;
    for (const v of group) {
      const row = entries.find((e) => e.row.item === v.sku).row;
      const label = byUnit
        ? v.unit.kind === "pack" ? `Pack of ${v.unit.size}` : v.unit.kind === "pair" ? "Pair" : "Single"
        : row.spec || `Item ${v.sku}`;
      v.options.config = [v.options.config, label].filter(Boolean).join(" · ");
    }
  }

  // Official EDELRID data.
  const specs = {};
  const properties = [];
  const certifications = [];
  for (const [k, v] of page?.technical ?? []) {
    if (k === "Certification") {
      const c = specValue(v);
      if (c && !certifications.includes(c)) certifications.push(c);
      continue;
    }
    const label = specLabels[k] ?? k;
    if (!v) { properties.push(cap(label)); continue; }
    if (!(label in specs)) specs[label] = specValue(v);
  }
  const certText = certifications.join(" ");
  const downloads = (page?.downloads ?? [])
    .filter((d) => {
      const std = d.label.match(/^(EN|ANSI|ASTM)\s?[^ ]*\s?(\d{3,5})/);
      if (std && !/manual|declaration|inspection/i.test(d.label)) return certText.includes(std[2]);
      return true;
    })
    .map((d) => ({ label: d.label, url: d.url, kind: downloadKind(d.label) }));

  // Photos: first image of each colour sold, then more views of the first colour.
  const images = [];
  if (page) {
    const galleries = [];
    for (const c of soldColours) {
      const pcol = pageColourByCode.get(c.code) ?? page.colours.find((x) => norm(x.name) === norm(c.name));
      if (pcol?.images.length) galleries.push({ colour: cap(c.name), ids: pcol.images });
    }
    if (!galleries.length && page.colours[0]?.images.length) galleries.push({ colour: undefined, ids: page.colours[0].images });
    const ids = new Set();
    for (const g of galleries) {
      const id = g.ids[0];
      if (!ids.has(id)) { ids.add(id); images.push({ id, colour: g.colour }); }
    }
    for (const id of galleries[0]?.ids.slice(1, 6) ?? []) {
      if (!ids.has(id)) { ids.add(id); images.push({ id, colour: galleries[0].colour }); }
    }
  }
  for (const im of images) imagePlan.set(im.id, `https://shopapi.edelrid.com/v1/media/image/edelrid/${im.id}/web-m`);

  const placements = [pg.main, ...pg.also];
  const use = [...new Set(placements.map(([w, s]) => useFor(w, s)))];
  const chips = [];
  if (specs.Diameter && /mm/.test(specs.Diameter)) chips.push(specs.Diameter.replace(/(\d)\.?0+ mm/, "$1 mm").replace(/(\.\d)0 mm/, "$1 mm"));
  if (specs["Carabiner shape"]) chips.push(specs["Carabiner shape"]);
  if (specs.Closure) chips.push(specs.Closure);
  if (certifications[0] && chips.length < 3) chips.push(certifications[0]);

  const product = {
    id: slug,
    slug,
    name,
    brand: "EDELRID",
    mainCategory: pg.main[0],
    subcategory: pg.main[1],
    ...(pg.also.length ? { alsoIn: pg.also.map(([w, s]) => ({ mainCategory: w, subcategory: s })) } : {}),
    shortDescription: page?.shortDescription || page?.category || "",
    description: (page?.description ?? []).join("\n\n"),
    features: page?.features ?? [],
    specs,
    properties,
    certifications,
    technologies: page?.technologies ?? [],
    badges: page?.badges ?? [],
    use,
    variants,
    images: images.map((im) => ({ src: `/products/${im.id}.webp`, alt: im.colour ? `${name}, ${im.colour.toLowerCase()}` : name, ...(im.colour ? { colour: im.colour } : {}) })),
    downloads,
    faqs: [],
    related: [],
    tags: [...new Set([...(page?.badges ?? []), ...(page?.technologies ?? [])])],
    ...(variants.some((v) => v.isNew) ? { isNew: true } : {}),
    chips: chips.slice(0, 3),
    rank: entries[0].row.order,
    source: page ? { url: page.url, name: page.name } : null,
    priceLists: [...new Set(entries.flatMap((e) => e.seen.map((s) => s.list)))],
  };

  // Quote-only information that belongs to this product.
  const quote = [];
  const base = norm(pg.groups[0].name).replace(/1st.*|2st.*|1spt.*/, "");
  if (batches.some((b) => norm(b.name) === norm(pg.groups[0].name) || norm(b.name).startsWith(base)))
    quote.push("Whole production batches are available on request.");
  if (pg.main[1] === "ropes-with-terminations" || (pg.main[1] === "ropes" && variants.some((v) => v.unit.kind === "metre")))
    quote.push("Custom lengths and sewn terminations are available on request.");
  if (quote.length) product.quoteNotes = quote;

  // TODOs
  const label = `${name} (${variants.length} item${variants.length > 1 ? "s" : ""}, e.g. ${variants[0].sku})`;
  if (!page) {
    const off = pg.groups.map((g) => offline.get(norm(g.name)) ?? offline.get(norm(g.name.replace(/\s+II+$|\s+III$|\s+IV$/, "")))).find(Boolean);
    if (off) todo.offline.push(`${label} — ${off}`);
    else todo.noPage.push(label);
  }
  else {
    if (!page.technical.length) todo.noSpecs.push(`${label} — ${page.url}`);
    if (!certifications.length && PPE_SUBS.has(pg.main[1])) todo.noCert.push(`${label} — ${page.url}`);
  }
  if (!images.length) todo.noImages.push(label);
  products.push(product);
}

// Related products: same subcategory, closest in EDELRID's list order.
for (const p of products) {
  p.related = products
    .filter((q) => q !== p && q.mainCategory === p.mainCategory && q.subcategory === p.subcategory)
    .sort((a, b) => Math.abs(a.rank - p.rank) - Math.abs(b.rank - p.rank))
    .slice(0, 4)
    .map((q) => q.slug);
}

// --- 5. write --------------------------------------------------------------

await mkdir("data/catalog", { recursive: true });
const generatedAt = new Date().toISOString().slice(0, 10);
await writeFile(
  "data/catalog/products.json",
  JSON.stringify({ generatedAt, sources: LISTS.map((l) => l[2]).concat("edelrid.com/int-en product pages"), facetSpecs, products }, null, 1),
);
await writeFile(
  "data/catalog/net-prices.json",
  JSON.stringify({ _comment: "EDELRID dealer net prices (excl. VAT). Admin only — never import from client code.", generatedAt, prices: netPrices }, null, 1),
);
await writeFile("data/catalog/images.json", JSON.stringify(Object.fromEntries(imagePlan), null, 1));

const list = (arr) => (arr.length ? arr.map((x) => `- [ ] ${x}`).join("\n") : "- none");
const md = `# Catalogue TODO

Generated by \`npm run catalog\` on ${generatedAt}. Safety equipment: no technical value in the shop is invented.
Everything below is missing from the official sources and must be supplied or confirmed before launch.

Sources: ${LISTS.map((l) => l[2]).join("; ")}; official product pages on edelrid.com (int-en).

Products in sections 1 and 2 are listed with name, colours, sizes and prices only — **no description,
specs, certification or photos** — and say so on their product page. Send the EDELRID product sheet /
user manual for each, or decide to hide them until EDELRID publishes the data.

## 1. EDELRID product page currently offline (${todo.offline.length})

edelrid.com links to these pages but they return "page not found" or a server error (checked ${new Date().toISOString().slice(0, 10)}).
Re-run \`node scripts/edelrid/fetch-pages.mjs\`, \`parse-pages.mjs\` and \`npm run catalog\` later to pick them up.

${list(todo.offline)}

## 1b. No EDELRID product page at all (${todo.noPage.length})

Often new for 2026, or renamed (e.g. "Zodiac II" while edelrid.com still shows the previous model).

${list(todo.noPage)}

## 2. Pages with no technical information (${todo.noSpecs.length})

${list(todo.noSpecs)}

## 3. PPE products with no certification on edelrid.com (${todo.noCert.length})

${list(todo.noCert)}

## 4. Products without photos (${todo.noImages.length})

${list(todo.noImages)}

## 5. Price-list data to confirm (${corrections.length + todo.mismatch.length})

Item numbers whose colour or size text looks inconsistent. Please confirm with EDELRID.

${list([...corrections, ...todo.mismatch])}

## 6. Price differences between lists (${conflicts.length})

The shop uses the first list (Sport → Safety → Adventure).

${list(conflicts.map((c) => `${c.name} (${c.item}): ${c.a} vs ${c.b}`))}

## 7. Not sold online

- Price-list rows without a recommended retail price (${noRrp.length}): ${noRrp.map((r) => `${r.name} ${r.item}`).join("; ") || "none"}
- Service fees (shown on the Services page, not in the cart): ${services.map((r) => `${r.name} €${r.net}`).join("; ")}
- Whole production batches (quote form): ${[...new Set(batches.map((b) => b.name))].join("; ")}
- Termination add-ons (quote form): ${notes.filter((n) => n.net).map((n) => `${n.name.split("|")[1]?.trim() ?? n.name} €${n.rrp}`).join("; ")}
${todo.unplaced.length ? `- No shop category (fix in scripts/catalog/rules.mjs): ${todo.unplaced.join("; ")}` : ""}

`;
await writeFile("data/TODO.md", md);

const bySub = {};
for (const p of products) bySub[`${p.mainCategory}/${p.subcategory}`] = (bySub[`${p.mainCategory}/${p.subcategory}`] ?? 0) + 1;
console.log(`${products.length} products, ${products.reduce((n, p) => n + p.variants.length, 0)} variants, ${imagePlan.size} images`);
console.log(`matched to edelrid.com: ${products.filter((p) => p.source).length}; no page: ${todo.noPage.length}; conflicts: ${conflicts.length}; mismatches: ${todo.mismatch.length}`);
console.log(bySub);
