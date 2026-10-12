// Downloads the product photos listed in data/catalog/images.json (official
// EDELRID images) and stores them as WebP in public/products/{id}.webp.
// Existing files are skipped. Usage: node scripts/catalog/fetch-images.mjs
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const UA = "IDECertCatalogSync/1.0 (+https://ide-cert.com)";
const OUT = "public/products";
const MAX = 1000;

await mkdir(OUT, { recursive: true });
const plan = Object.entries(JSON.parse(await readFile("data/catalog/images.json", "utf8")));

const todo = [];
for (const [id, url] of plan) {
  try {
    await access(join(OUT, `${id}.webp`));
  } catch {
    todo.push([id, url]);
  }
}
console.log(`${plan.length} images, ${todo.length} to download`);

const failed = [];
let done = 0;
async function worker() {
  while (todo.length) {
    const [id, url] = todo.shift();
    try {
      const res = await fetch(url, { headers: { "user-agent": UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const webp = await sharp(buf)
        .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
        .flatten({ background: "#ffffff" })
        .webp({ quality: 78 })
        .toBuffer();
      await writeFile(join(OUT, `${id}.webp`), webp);
    } catch (e) {
      failed.push(`${id} ${url} ${e.message}`);
    }
    if (++done % 100 === 0) console.log(`${done} done`);
    await new Promise((r) => setTimeout(r, 150));
  }
}
await Promise.all([worker(), worker(), worker()]);
if (failed.length) console.error(`${failed.length} failed:\n${failed.join("\n")}`);
console.log("Finished.");
