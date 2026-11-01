import type { Project } from "@/config/projects";
import type { L10n } from "@/lib/i18n/T";

const n = (v: number, dec = 0) => v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

/** The three headline figures for a project. */
export function projectStats(p: Project): { label: L10n; value: L10n }[] {
  const twin = p.lines > 1;
  const len = `${p.dropM ? "" : "~"}${n(p.lengthM)} m`;
  return [
    { label: twin ? { sq: "Gjatësia / linjë", en: "Length / line" } : { sq: "Gjatësia", en: "Length" }, value: { sq: len, en: len } },
    p.dropM
      ? { label: { sq: "Disniveli", en: "Drop" }, value: { sq: `${n(p.dropM, 2)} m`, en: `${n(p.dropM, 2)} m` } }
      : { label: { sq: "Linja", en: "Lines" }, value: { sq: String(p.lines), en: String(p.lines) } },
    { label: { sq: "Shpejtësia", en: "Speed" }, value: { sq: p.speed, en: p.speed } },
  ];
}
