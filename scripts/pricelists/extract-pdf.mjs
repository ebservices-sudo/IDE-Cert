// Converts an EDELRID distribution price-list PDF (table version) into a CSV.
//
//   node scripts/pricelists/extract-pdf.mjs <price-list.pdf> <out.csv>
//
// Rows are rebuilt from the positioned text in the PDF: every header row
// ("Artikelnummer / Item No.") defines the column layout for the rows below it,
// and headings without an item number become the "group" column. Rows whose
// description is set in the bold face are marked NEW (EDELRID's convention for
// new 2026 articles). Nothing is interpreted beyond that — the catalogue build
// (scripts/build-catalog.mjs) reads these CSVs.

import fs from "node:fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const [, , file, out] = process.argv;
if (!file || !out) {
  console.error("Usage: node scripts/pricelists/extract-pdf.mjs <price-list.pdf> <out.csv>");
  process.exit(1);
}

const doc = await getDocument({ data: new Uint8Array(fs.readFileSync(file)), verbosity: 0 }).promise;

const UNIT = /^(PC|PA|SET|ST|M|PU\d+)$/;
const PRICE = /^\d[\d,]*\.\d{2}$/; // "3.53", "1008.40", "1,092.44"
const FOOTER = /^VK-Preise|^\*|^EDELRID (SPORT|SAFETY|ADVENTURE)|^vorläufige Preisliste/;

let layout = null; // { cols: [name, x][], priceX, netFlagX, boldFont }
let section = "";
let group = [];
const rows = [];

for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const tc = await page.getTextContent();
  const items = tc.items
    .filter((it) => it.str.trim())
    .map((it) => ({ x: it.transform[4], y: it.transform[5], s: it.str.trim(), f: it.fontName }));

  // Group into visual lines, top to bottom.
  const lines = [];
  for (const it of [...items].sort((a, b) => b.y - a.y || a.x - b.x)) {
    const line = lines.find((l) => Math.abs(l.y - it.y) < 2);
    if (line) line.items.push(it);
    else lines.push({ y: it.y, items: [it] });
  }
  for (const l of lines) l.items.sort((a, b) => a.x - b.x);

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const first = l.items[0].s;

    if (first === "Artikelnummer") {
      // Header: every line within a few points of "Artikelnummer" (German,
      // English and the wrapped price headings).
      const isData = (x) => x.items.some((t) => /^\d{12}$/.test(t.s) || PRICE.test(t.s.split(" ")[0]));
      const band = lines.filter((x) => Math.abs(x.y - l.y) < 16 && !isData(x));
      const hdr = band.flatMap((x) => x.items);
      const at = (re) => hdr.filter((h) => re.test(h.s)).map((h) => h.x).sort((a, b) => a - b)[0];
      const cols = [
        ["item", l.items[0].x],
        ["desc", at(/^(Bezeichnung|Description)/)],
        ["colour", at(/^(Farbe|Colou?r)/)],
        ["size", at(/^(Länge|Length|Größe|Size)/)],
        ["spec", at(/^(Spezifikation|Spezification)/)],
      ].filter((c) => c[1] != null);
      // "Farbe Größe / Länge" can arrive as a single text run.
      cols.sort((a, b) => a[1] - b[1]);
      layout = {
        cols,
        rrpX: at(/^(UVP|RRT)/) ?? layout?.rrpX,
        netFlagX: at(/^Netto$/),
        boldFont: l.items[0].f,
      };
      // The nearest line above the header carrying a "|" is the section title ("SEILE | ROPES").
      const title = lines
        .slice(0, i)
        .reverse()
        .find((x) => x.y - l.y < 40 && x.items.some((t) => t.s.includes("|")));
      if (title) section = title.items.map((t) => t.s).join(" ");
      group = [];
      while (lines[i + 1] && Math.abs(lines[i + 1].y - l.y) < 16 && !isData(lines[i + 1])) i += 1;
      continue;
    }
    if (!layout) continue;

    const text = l.items.map((t) => t.s).join(" ");
    if (FOOTER.test(text)) continue;
    // Strip a footer that shares a baseline with a real row.
    const its = l.items.filter((t) => !FOOTER.test(t.s));
    if (!its.length) continue;

    const r = { page: p, section, group: group.join(" "), item: "", name: "", colour: "", size: "", spec: "" };
    const flags = new Set();

    // Prices sit at the right edge: [net [unit]] [NET] rrp [unit]. Read them
    // from the right so a size such as "M" just left of the prices stays a size.
    // "647.50 PC" sometimes arrives as one text run.
    const toks = its.flatMap((it) => {
      const m = it.s.match(/^(\S+)\s+(\S+)$/);
      return m && PRICE.test(m[1]) && UNIT.test(m[2])
        ? [{ ...it, s: m[1] }, { ...it, s: m[2], x: it.x + 20 }]
        : [it];
    });
    const popIf = (re) => (toks.length && re.test(toks.at(-1).s) ? toks.pop() : null);
    const NETFLAG = /^(NET|x)$/;
    const prices = [];
    for (let k = 0; k < 2; k++) {
      const unit = popIf(UNIT);
      const price = popIf(PRICE);
      if (!price) { if (unit) toks.push(unit); break; }
      prices.unshift({ price: price.s.replace(/,/g, ""), unit: unit?.s ?? "", x: price.x });
      if (popIf(NETFLAG)) flags.add("NET");
    }
    let net = "", netUnit = "", rrp = "", rrpUnit = "";
    if (prices.length === 2) [{ price: net, unit: netUnit }, { price: rrp, unit: rrpUnit }] = prices;
    else if (prices.length === 1) {
      // A lone price is the RRP only if it sits under the UVP column.
      if (layout.rrpX != null && prices[0].x >= layout.rrpX - 20) ({ price: rrp, unit: rrpUnit } = prices[0]);
      else ({ price: net, unit: netUnit } = prices[0]);
    }

    let bold = false;
    for (const it of toks) {
      if (NETFLAG.test(it.s) && layout.netFlagX != null && Math.abs(it.x - layout.netFlagX) < 14) { flags.add("NET"); continue; }
      let col = layout.cols[0][0];
      for (const [name, x] of layout.cols) if (it.x >= x - 10) col = name;
      const key = col === "desc" ? "name" : col;
      r[key] = r[key] ? `${r[key]} ${it.s}` : it.s;
      if (col === "desc" && it.f === layout.boldFont) bold = true;
    }
    // Some tables have no size column and print "300 blue 85 CM" / "329 icemint XS-M".
    const cs = !r.size && r.colour.match(/^(.*?[a-z)])\s+([A-Z0-9][A-Z0-9 ./,-]*)$/);
    if (cs) [r.colour, r.size] = [cs[1], cs[2]];
    if (bold) flags.add("NEW");

    const isItem = /^\d{12}$/.test(r.item) || /^\d{5} batch\*?$/.test(r.item);
    if (!isItem && !net && !rrp) {
      const h = [r.item, r.name, r.colour, r.size, r.spec].filter(Boolean).join(" ");
      if (h.includes("|") && h === h.toUpperCase()) {
        // Section title ("STATIKSEILE | STATIC ROPES").
        section = h;
        group = [];
        continue;
      }
      if (!r.name && !r.colour) {
        // Headings such as "Interstatic Protect" / "Ø 11,0 mm".
        if (/^Ø|^\d/.test(h) && group.length) group = [group[0], h];
        else group = [h];
        continue;
      }
      // Anything else is an explanatory note; keep it so nothing is lost.
      flags.delete("NEW");
      flags.add("NOTE");
    }
    rows.push({ ...r, net, netUnit, rrp, rrpUnit, flags: [...flags].join(" ") });
  }
}

const cols = ["page", "section", "group", "item", "name", "colour", "size", "spec", "net", "netUnit", "rrp", "rrpUnit", "flags"];
const esc = (v) => (/[;"\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
fs.writeFileSync(out, [cols.join(";"), ...rows.map((r) => cols.map((c) => esc(r[c] ?? "")).join(";"))].join("\n") + "\n");
console.log(`${rows.length} rows → ${out}`);
