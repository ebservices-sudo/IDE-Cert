// Compatibility patch for @opennextjs/cloudflare 1.20.10 with Next.js 16.4:
// Next 16.4 reads `.next/server/preview-props.json` through loadManifest(),
// but OpenNext only inlines *-manifest.json, required-server-files.json and
// prefetch-hints.json into the Worker, so every page fails with
// "Unexpected loadManifest(/.next/server/preview-props.json) call!".
// This adds preview-props to the inlined files. Idempotent; runs before
// `opennextjs-cloudflare build` (see package.json). Remove once OpenNext
// includes preview-props.json itself.

import { readFileSync, writeFileSync } from "node:fs";

const file = "node_modules/@opennextjs/cloudflare/dist/cli/build/patches/plugins/load-manifest.js";
const from = "**/{*-manifest,required-server-files,prefetch-hints}.json";
const to = "**/{*-manifest,required-server-files,prefetch-hints,preview-props}.json";

const src = readFileSync(file, "utf8");
if (src.includes(to)) {
  console.log("patch-opennext: already applied");
} else if (src.includes(from)) {
  writeFileSync(file, src.replace(from, to));
  console.log("patch-opennext: added preview-props.json to inlined manifests");
} else {
  console.warn("patch-opennext: pattern not found — OpenNext changed; check whether the patch is still needed.");
}
