// Parses the cached EDELRID product pages (.cache/edelrid/html, see fetch-pages.mjs)
// into data/edelrid/pages.json. Only what EDELRID publishes is kept, verbatim:
// name, short description, description, features, technical information,
// technologies, downloads, colours, article numbers and image ids.
// Usage: node scripts/edelrid/parse-pages.mjs

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as cheerio from "cheerio";

const HTML = ".cache/edelrid/html";
const OUT = "data/edelrid/pages.json";

const clean = (s) => s.replace(/ /g, " ").replace(/\s+/g, " ").trim();

function section($, title) {
  const label = $("h3.ed-accordion-label").filter((_, e) => clean($(e).text()) === title).first();
  if (!label.length) return null;
  return label.parents("li").first().find(".uk-accordion-content").first();
}

function parse(html, url) {
  const $ = cheerio.load(html);
  const name = clean($("h1").first().text());
  if (!name) return null;

  const description = (() => {
    const s = section($, "Description");
    if (!s) return [];
    const ps = s.find("p").map((_, p) => clean($(p).text())).get().filter(Boolean);
    return ps.length ? ps : [clean(s.text())].filter(Boolean);
  })();

  const features = (() => {
    const s = section($, "Features");
    return s ? s.children("ul").first().find("li").map((_, li) => clean($(li).text())).get().filter(Boolean) : [];
  })();

  const technical = (() => {
    const s = section($, "Technical information");
    if (!s) return [];
    return s
      .find("li")
      .map((_, li) => {
        const t = clean($(li).text());
        const i = t.indexOf(":");
        return i > 0 ? [[clean(t.slice(0, i)), clean(t.slice(i + 1))]] : [[t, ""]];
      })
      .get();
  })();

  const technologies = (() => {
    const s = section($, "EDELRID technologies");
    return s ? s.find("h4").map((_, h) => clean($(h).text())).get() : [];
  })();

  const downloads = (() => {
    const s = section($, "PDF downloads");
    if (!s) return [];
    return s
      .find("a[href]")
      .map((_, a) => ({ label: clean($(a).text()) || $(a).attr("download") || "", url: $(a).attr("href") }))
      .get()
      .filter((d) => /^https?:\/\//.test(d.url));
  })();

  const badges = [...new Set($(".ed-product-feature-icons img").map((_, i) => clean($(i).attr("alt") ?? "")).get().filter(Boolean))];

  const colours = $("[data-product-detail-description-target=colorSelect]")
    .map((_, b) => ({ id: $(b).attr("data-color-id"), name: clean($(b).attr("aria-label") ?? "") }))
    .get();

  const galleries = {};
  $("[data-product-variant]").each((_, d) => {
    const id = $(d).attr("data-product-variant");
    if (!/^\d+$/.test(id)) return;
    galleries[id] = [
      ...new Set(
        $(d)
          .find("img")
          .map((_, im) => ($(im).attr("src") ?? "").match(/media\/image\/edelrid\/(\d+)\//)?.[1])
          .get()
          .filter(Boolean),
      ),
    ];
  });

  const variants = [];
  const raw = $("[data-product-detail-description-variants-value]").attr("data-product-detail-description-variants-value");
  if (raw) {
    try {
      const v = JSON.parse(raw);
      for (const [colorId, [, sizes]] of Object.entries(v)) {
        for (const [title, o] of sizes) {
          variants.push({ colorId, size: clean(title ?? ""), articleNumber: o.articleNumber ?? "", gtin: o.gtin ?? "" });
        }
      }
    } catch {
      // leave variants empty; reported by build-catalog
    }
  }

  return {
    url,
    path: url.replace("https://edelrid.com/int-en/", ""),
    name,
    title: clean($("title").text()).replace(/\s*\|\s*EDELRID$/, ""),
    category: clean($(".ed-product-detail-banner-sub-headline").first().text()),
    shortDescription: clean($(".ed-text-child-light-content").first().text()),
    description,
    features,
    technical,
    technologies,
    badges,
    downloads,
    colours: colours.map((c) => ({ ...c, images: galleries[c.id] ?? [] })),
    variants,
  };
}

const files = (await readdir(HTML)).filter((f) => f.endsWith(".html")).sort();
const pages = [];
let skipped = 0;
for (const f of files) {
  const url = "https://edelrid.com/int-en/" + f.replace(/\.html$/, "").replaceAll("__", "/");
  const page = parse(await readFile(join(HTML, f), "utf8"), url);
  if (page) pages.push(page);
  else skipped++;
}
let unavailable = [];
try {
  unavailable = JSON.parse(await readFile(".cache/edelrid/missing.json", "utf8"));
} catch {
  // no record of failed downloads
}
await mkdir("data/edelrid", { recursive: true });
await writeFile(
  OUT,
  JSON.stringify({ source: "https://edelrid.com/int-en/", parsedAt: new Date().toISOString().slice(0, 10), unavailable, pages }, null, 1),
);
console.log(`${pages.length} pages parsed, ${skipped} skipped → ${OUT}`);
console.log(`${pages.reduce((n, p) => n + p.variants.length, 0)} article numbers, ${pages.filter((p) => !p.variants.length).length} pages without variants`);
