// Builds favicon / app icons from public/brand/app-icon*.svg.
// Run after changing the icon: npm run icons
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import sharp from "sharp";

const icon = await readFile("public/brand/app-icon.svg");
const maskable = await readFile("public/brand/app-icon-maskable.svg");

const png = (svg, size) => sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();

await mkdir("public/icons", { recursive: true });

// App Router file conventions: src/app/icon.svg, apple-icon.png, favicon.ico
await copyFile("public/brand/app-icon.svg", "src/app/icon.svg");
await writeFile("src/app/apple-icon.png", await png(icon, 180));

// PWA manifest icons
await writeFile("public/icons/icon-192.png", await png(icon, 192));
await writeFile("public/icons/icon-512.png", await png(icon, 512));
await writeFile("public/icons/icon-maskable-512.png", await png(maskable, 512));

// favicon.ico with embedded 16/32/48 PNGs (ICO supports PNG payloads)
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((s) => png(icon, s)));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = 6 + 16 * images.length;
const entries = images.map((img, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i], 0);
  e.writeUInt8(sizes[i], 1);
  e.writeUInt8(0, 2);
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(img.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += img.length;
  return e;
});
await writeFile("src/app/favicon.ico", Buffer.concat([header, ...entries, ...images]));

// Social share fallback logo (PNG) for structured data
await writeFile(
  "public/brand/ide-cert-logo.png",
  await sharp(await readFile("public/brand/ide-cert-logo.svg"), { density: 384 })
    .resize({ width: 648 })
    .png()
    .toBuffer(),
);

console.log("Icons written.");
