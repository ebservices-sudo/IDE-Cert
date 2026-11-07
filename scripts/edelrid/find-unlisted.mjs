// Finds EDELRID product pages that exist on edelrid.com but are missing from their
// product sitemap (new 2026 articles are often published before the sitemap catches up).
// For every catalogue product without photos, it guesses page URLs from the product name
// and the category paths of sibling products, and accepts a page ONLY when it lists one
// of the product's own EDELRID article numbers. Found URLs are written to
// data/edelrid/extra-urls.json, which fetch-pages.mjs downloads alongside the sitemap.
//
// Usage: node scripts/edelrid/find-unlisted.mjs [--wide], then fetch-pages, parse-pages,
// catalog, catalog:images as usual. --wide also tries every category of the same section.
import { readFile, writeFile } from "node:fs/promises";

const UA = "IDECertCatalogSync/1.0 (+https://ide-cert.com)";
const OUT = "data/edelrid/extra-urls.json";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const wide = process.argv.includes("--wide");

const { products } = JSON.parse(await readFile("data/catalog/products.json", "utf8"));
const sitemapUrls = JSON.parse(await readFile(".cache/edelrid/int-en-urls.json", "utf8"));
let known = [];
try {
  known = JSON.parse(await readFile(OUT, "utf8"));
} catch {}

const dir = (u) => u.slice(0, u.lastIndexOf("/"));
const allDirs = [...new Set(sitemapUrls.map(dir))];

// Category paths used by products with a known page, per shop subcategory.
const dirsBySub = new Map();
for (const p of products) {
  if (!p.source?.url) continue;
  const k = `${p.mainCategory}/${p.subcategory}`;
  if (!dirsBySub.has(k)) dirsBySub.set(k, new Set());
  dirsBySub.get(k).add(dir(p.source.url));
}

function slugs(name) {
  const base = name
    .toLowerCase()
    .replace(/^women's\s+/, "wo-")
    .replace(/^men's\s+/, "me-")
    .replace(/'/g, "")
    .replace(/(\d)\.(\d)/g, "$1-$2")
    .replace(/(\d)\s+mm\b/g, "$1mm")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const out = new Set([base]);
  out.add(base.replace(/-ii$|-iii$/, ""));
  out.add(base.replace(/-ii$/, "-2").replace(/-iii$/, "-3"));
  out.add(base.replace(/-t-shirt$/, "-tshirt"));
  out.add(base.replace(/^(wo|me)-/, ""));
  out.add(base.replace(/-for-/, "-fuer-"));
  return [...out].filter(Boolean);
}

async function get(url) {
  const res = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
  if (!res.ok) return null;
  const html = await res.text();
  if (/This page is not existing|<title>Redirecting to \/[a-z-]+\/404/.test(html)) return null;
  return html;
}

const missing = products.filter((p) => !p.images.length);
const found = new Map(known.map((k) => [k.product, k]));
console.log(`${missing.length} products without photos`);

for (const p of missing) {
  if (found.has(p.id)) continue;
  const skus = p.variants.map((v) => v.sku);
  const sub = [...(dirsBySub.get(`${p.mainCategory}/${p.subcategory}`) ?? [])];
  // --wide: after the sibling categories, try every category of the same section.
  const section = wide ? allDirs.filter((d) => d.includes(`/int-en/${p.mainCategory}/`) && !sub.includes(d)) : [];
  const dirs = sub.length ? [...sub, ...section] : allDirs.filter((d) => d.includes(`/int-en/${p.mainCategory}/`));
  const tried = new Set();
  let hit = null;
  outer: for (const d of dirs) {
    for (const s of slugs(p.name)) {
      const url = `${d}/${s}`;
      if (tried.has(url) || sitemapUrls.includes(url)) continue;
      tried.add(url);
      const html = await get(url).catch(() => null);
      await sleep(400);
      if (html && skus.some((sku) => html.includes(sku))) {
        hit = url;
        break outer;
      }
    }
  }
  console.log(`${hit ? "FOUND " : "none  "} ${p.name}${hit ? " -> " + hit : ` (${tried.size} tried)`}`);
  if (hit) found.set(p.id, { product: p.id, name: p.name, url: hit });
}

await writeFile(OUT, JSON.stringify([...found.values()], null, 2) + "\n");
console.log(`${found.size} unlisted pages recorded in ${OUT}`);
