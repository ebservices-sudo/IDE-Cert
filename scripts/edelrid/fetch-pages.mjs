// Downloads EDELRID's English (int-en) product pages listed in their public product sitemap
// into .cache/edelrid/html. Polite: 2 parallel requests, ~700 ms apart. Re-running skips cached pages.
// Usage: node scripts/edelrid/fetch-pages.mjs [--refresh]
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

const UA = "IDECertCatalogSync/1.0 (+https://ide-cert.com)";
const CACHE = ".cache/edelrid";
const HTML = join(CACHE, "html");
const refresh = process.argv.includes("--refresh");

await mkdir(HTML, { recursive: true });

async function get(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, { headers: { "user-agent": UA } });
    if (res.ok) return res.text();
    if (res.status === 404) return null;
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
  throw new Error(`Failed ${url}`);
}

const sitemapPath = join(CACHE, "products-sitemap.xml");
let sitemap;
try {
  if (refresh) throw new Error("refresh");
  sitemap = await readFile(sitemapPath, "utf8");
} catch {
  sitemap = await get("https://edelrid.com/sitemap.edelrid.com.products.xml");
  await writeFile(sitemapPath, sitemap);
}

const urls = [...new Set([...sitemap.matchAll(/<loc>(https:\/\/edelrid\.com\/int-en\/[^<]+)<\/loc>/g)].map((m) => m[1]))];
await writeFile(join(CACHE, "int-en-urls.json"), JSON.stringify(urls, null, 2));
console.log(`${urls.length} int-en product URLs`);

const fileFor = (url) => join(HTML, url.replace("https://edelrid.com/int-en/", "").replaceAll("/", "__") + ".html");
const todo = [];
for (const url of urls) {
  try {
    if (refresh) throw new Error();
    await access(fileFor(url));
  } catch {
    todo.push(url);
  }
}
console.log(`${todo.length} to download`);

// edelrid.com answers some sitemap URLs with a "page not existing" page or a
// redirect to /404. Those are not cached, so a later run tries them again.
const isMissing = (html) => /This page is not existing|<title>Redirecting to \/[a-z-]+\/404/.test(html);
const missing = [];

let done = 0;
async function worker() {
  while (todo.length) {
    const url = todo.shift();
    try {
      const html = await get(url);
      if (html && !isMissing(html)) await writeFile(fileFor(url), html);
      else missing.push({ url, reason: "not found on edelrid.com" });
    } catch (e) {
      missing.push({ url, reason: "server error" });
      console.error(String(e));
    }
    done++;
    if (done % 50 === 0) console.log(`${done} done`);
    await new Promise((r) => setTimeout(r, 700));
  }
}
await Promise.all([worker(), worker()]);
await writeFile(join(CACHE, "missing.json"), JSON.stringify(missing.sort((a, b) => a.url.localeCompare(b.url)), null, 2));
console.log(`Finished. ${missing.length} pages unavailable (see ${join(CACHE, "missing.json")}).`);
