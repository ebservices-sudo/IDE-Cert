"use client";

import { useState, useTransition } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { createPriceImport } from "@/actions/admin";
import { buttonCls, inputCls } from "./ui";

// Reads an EDELRID price list (Excel or CSV) in the browser, maps the columns,
// and sends only item number, name and prices to the server for comparison.

type Cell = string | number | boolean | null | undefined;
type Sheet = { name: string; rows: Cell[][] };
type Mapping = { sku: number; name: number; rrp: number; net: number };

const digits = (c: Cell) => String(c ?? "").replace(/\D/g, "");
const isSku = (c: Cell) => digits(c).length === 12;

/** "1.234,56" (German), "1,234.56", "1234.56" or a number → cents. */
function toCents(c: Cell): number | null {
  if (typeof c === "number") return Number.isFinite(c) && c > 0 ? Math.round(c * 100) : null;
  let s = String(c ?? "").replace(/[€\s]/g, "");
  if (!s) return null;
  if (/^\d{1,3}(\.\d{3})*,\d{1,2}$/.test(s) || /^\d+,\d{1,2}$/.test(s)) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(/,/g, "");
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : null;
}

function guessMapping(sheets: Sheet[]): Mapping {
  const rows = sheets.flatMap((s) => s.rows);
  const width = Math.max(0, ...rows.slice(0, 500).map((r) => r.length));
  const score = (col: number, test: (c: Cell) => boolean) => rows.slice(0, 2000).filter((r) => test(r[col])).length;
  const sku = [...Array(width).keys()].sort((a, b) => score(b, isSku) - score(a, isSku))[0] ?? 0;
  const header = rows.find((r) => r.some((c) => /artikel|item no|item number|sku/i.test(String(c ?? "")))) ?? [];
  const find = (re: RegExp) => header.findIndex((c) => re.test(String(c ?? "")));
  const dataRows = rows.filter((r) => isSku(r[sku]));
  const numericCols = [...Array(width).keys()].filter((c) => c !== sku && dataRows.slice(0, 200).filter((r) => toCents(r[c]) != null).length > dataRows.slice(0, 200).length * 0.6);
  const rrp = find(/uvp|rrp|rrt|retail|vk-?preis/i);
  const net = find(/einheitspreis|unit price|ek-?preis|^net$|net price/i);
  const name = find(/bezeichnung|description|name/i);
  return {
    sku,
    name: name >= 0 ? name : sku + 1,
    rrp: rrp >= 0 ? rrp : (numericCols.at(-1) ?? -1),
    net: net >= 0 ? net : (numericCols.at(-2) ?? -1),
  };
}

const colName = (i: number) => (i < 0 ? "—" : i < 26 ? String.fromCharCode(65 + i) : `${String.fromCharCode(64 + Math.floor(i / 26))}${String.fromCharCode(65 + (i % 26))}`);

export function PriceUpload() {
  const [file, setFile] = useState<{ name: string; sheets: Sheet[] } | null>(null);
  const [mapping, setMapping] = useState<Mapping | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onFile = async (f: File | undefined) => {
    setError(null);
    if (!f) return;
    try {
      const XLSX = await import("xlsx");
      let wb;
      if (/\.csv$/i.test(f.name)) {
        const text = await f.text();
        const semicolons = (text.slice(0, 5000).match(/;/g) ?? []).length;
        const commas = (text.slice(0, 5000).match(/,/g) ?? []).length;
        wb = XLSX.read(text, { type: "string", FS: semicolons > commas ? ";" : "," , raw: true });
      } else {
        wb = XLSX.read(await f.arrayBuffer(), { type: "array" });
      }
      const sheets = wb.SheetNames.map((name) => ({ name, rows: XLSX.utils.sheet_to_json<Cell[]>(wb.Sheets[name], { header: 1, raw: true, defval: "" }) }));
      const m = guessMapping(sheets);
      setFile({ name: f.name, sheets });
      setMapping(m);
    } catch (e) {
      setError(`Could not read this file: ${String(e)}`);
    }
  };

  const rows =
    file && mapping
      ? file.sheets
          .flatMap((s) => s.rows)
          .filter((r) => isSku(r[mapping.sku]))
          .map((r) => ({
            sku: digits(r[mapping.sku]),
            name: mapping.name >= 0 ? String(r[mapping.name] ?? "").trim() : "",
            rrpCents: mapping.rrp >= 0 ? toCents(r[mapping.rrp]) : null,
            netCents: mapping.net >= 0 ? toCents(r[mapping.net]) : null,
          }))
          .filter((r): r is { sku: string; name: string; rrpCents: number; netCents: number | null } => r.rrpCents != null)
      : [];

  const width = file ? Math.max(0, ...file.sheets.flatMap((s) => s.rows.slice(0, 300)).map((r) => r.length)) : 0;

  const submit = () => {
    if (!file || !rows.length) return;
    startTransition(async () => {
      const res = await createPriceImport({ filename: file.name, rows });
      if (res && "error" in res) setError(res.error);
    });
  };

  return (
    <div className="space-y-5">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-white px-6 py-10 text-center hover:border-ink/40">
        <FileSpreadsheet aria-hidden className="size-8 text-muted" />
        <span className="font-semibold">{file ? file.name : "Choose an EDELRID price list"}</span>
        <span className="text-xs text-muted">Excel (.xlsx, .xls) or CSV. The file is read in your browser; only item numbers and prices are sent.</span>
        <input type="file" accept=".xlsx,.xls,.csv" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
      {error && (
        <p role="alert" className="text-sm font-medium text-brand-strong">
          {error}
        </p>
      )}
      {file && mapping && (
        <>
          <fieldset className="grid gap-4 rounded-xl border border-line bg-white p-5 sm:grid-cols-4">
            <legend className="px-1 text-sm font-semibold">Columns (detected automatically — check them)</legend>
            {(
              [
                ["sku", "Item number"],
                ["name", "Description"],
                ["rrp", "RRP incl. VAT (UVP)"],
                ["net", "Net price (Einheitspreis)"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-sm font-semibold">
                {label}
                <select
                  value={mapping[key]}
                  onChange={(e) => setMapping({ ...mapping, [key]: Number(e.target.value) })}
                  className={`${inputCls} mt-1.5 h-10`}
                >
                  {key !== "sku" && key !== "rrp" && <option value={-1}>— none —</option>}
                  {[...Array(width).keys()].map((i) => (
                    <option key={i} value={i}>
                      Column {colName(i)}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </fieldset>
          <div className="overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full min-w-[36rem] text-sm">
              <caption className="px-4 py-3 text-left text-sm text-muted">
                {rows.length} rows with an item number and a price, from {file.sheets.length} sheet{file.sheets.length > 1 ? "s" : ""}. First rows:
              </caption>
              <thead className="bg-mist text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-2">Item no.</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2 text-right">RRP</th>
                  <th className="px-4 py-2 text-right">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.slice(0, 8).map((r) => (
                  <tr key={r.sku}>
                    <td className="px-4 py-2 font-mono text-xs">{r.sku}</td>
                    <td className="px-4 py-2">{r.name}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{(r.rrpCents / 100).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{r.netCents != null ? (r.netCents / 100).toFixed(2) : "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={submit} disabled={pending || !rows.length} className={buttonCls.primary}>
            <Upload aria-hidden className="size-4" />
            {pending ? "Comparing…" : `Compare ${rows.length} prices with the shop`}
          </button>
        </>
      )}
    </div>
  );
}
