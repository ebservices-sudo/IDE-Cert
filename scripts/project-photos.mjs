// Project photos: drop the original photos anywhere under public/projects/ (one folder per
// project, any name that mentions the place: "Permet", "Përmeti Zipline", "Decan",
// "Dardha", "Theth", …) and this script, run before every build:
//   1. matches each photo to its project by the folder or file name,
//   2. writes web-ready copies (auto-rotated WebP, 2000 px and 900 px wide) to
//      public/projects/_web/ (not committed),
//   3. writes src/config/project-photos.json, which the pages read.
// Photos are ordered by file name; a file called "cover", "kryesore" or "main" comes first.
// Without any photos the pages show a tidy placeholder instead.

import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative, extname, basename, sep } from "node:path";

const ROOT = "public/projects";
const OUT = join(ROOT, "_web");
const MANIFEST = "src/config/project-photos.json";
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);
const MATCH = [
  ["permet-zipline", /perm/],
  ["decan-zipline", /decan|decani|belegu/],
  ["dardha-zipline", /dardh/],
  ["theth-zipline", /theth|thet\b|thethi/],
];
const COVER = /^(cover|kryesore|main|ballina)/;

const plain = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (p === OUT) return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const manifest = {};
if (!existsSync(ROOT)) {
  writeFileSync(MANIFEST, "{}\n");
  console.log("project-photos: no public/projects folder, nothing to do");
  process.exit(0);
}

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.warn("project-photos: sharp is not available, photos are served as uploaded");
}

const all = walk(ROOT);
for (const f of all.filter((f) => /\.hei[cf]$/i.test(f))) console.warn(`project-photos: "${relative(ROOT, f)}" is HEIC, which browsers cannot show: export it as JPG`);
const files = all.filter((f) => EXT.has(extname(f).toLowerCase()));
const bySlug = {};
for (const f of files) {
  const key = plain(relative(ROOT, f));
  const hit = MATCH.find(([, re]) => re.test(key));
  if (!hit) {
    console.warn(`project-photos: cannot tell which project "${relative(ROOT, f)}" belongs to (put it in a folder named after the place)`);
    continue;
  }
  (bySlug[hit[0]] ??= []).push(f);
}

rmSync(OUT, { recursive: true, force: true });
const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
const url = (p) => "/" + p.split(sep).slice(1).map(encodeURIComponent).join("/");

for (const [slug, list] of Object.entries(bySlug)) {
  list.sort((a, b) => {
    const ca = COVER.test(plain(basename(a))), cb = COVER.test(plain(basename(b)));
    return ca !== cb ? (ca ? -1 : 1) : collator.compare(a, b);
  });
  mkdirSync(join(OUT, slug), { recursive: true });
  manifest[slug] = [];
  for (const [i, f] of list.entries()) {
    const n = String(i + 1).padStart(2, "0");
    if (!sharp) {
      manifest[slug].push({ src: url(f), small: url(f), w: 3, h: 2, blur: "" });
      continue;
    }
    try {
      const img = sharp(f, { failOn: "none" }).rotate();
      const big = join(OUT, slug, `${n}.webp`);
      const small = join(OUT, slug, `${n}-s.webp`);
      const info = await img.clone().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 80 }).toFile(big);
      await img.clone().resize({ width: 900, withoutEnlargement: true }).webp({ quality: 74 }).toFile(small);
      const blur = await img.clone().resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer();
      manifest[slug].push({ src: url(big), small: url(small), w: info.width, h: info.height, blur: `data:image/webp;base64,${blur.toString("base64")}` });
    } catch (e) {
      console.warn(`project-photos: skipped "${relative(ROOT, f)}": ${e.message}`);
    }
  }
  console.log(`project-photos: ${slug}: ${manifest[slug].length} photo(s)`);
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1) + "\n");
