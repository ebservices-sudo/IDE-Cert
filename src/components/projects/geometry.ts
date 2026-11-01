import type { Project } from "@/config/projects";
import { rng } from "@/components/home/journey/stations";

// Side-view geometry for a project's zip line, in a 800 × 500 drawing. The drop is
// exaggerated so short and long lines both read clearly; the horizontal span grows with
// the real length. Theth has no published drop, so it gets a typical slope.

export const VB = { w: 800, h: 500 };
/** Vertical offset of the second cable on twin-line projects. */
export const LINE_GAP = 12;

export type Geo = {
  x0: number; y0: number; cx: number; cy: number; x1: number; y1: number;
  gy0: number; gy1: number; valleyX: number; valleyY: number;
  ground: string; groundLine: string; far: string; farLine: string;
};

export function geometry(p: Project): Geo {
  const ratio = p.dropM ? p.dropM / p.lengthM : 0.12;
  const span = 380 + (Math.min(p.lengthM, 1104) / 1104) * 300;
  const x0 = Math.round((VB.w - span) / 2 - 10);
  const x1 = Math.round(x0 + span);
  const y0 = 120;
  const y1 = Math.round(y0 + 110 + ratio * 560);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2 + 34;
  const gy0 = y0 + 92;
  const gy1 = y1 + 46;
  const valleyX = Math.round(x0 + span * 0.58);
  const valleyY = Math.min(468, Math.max(gy0, gy1) + 58);

  const r = rng(p.lengthM * 7 + p.year);
  const j = (v: number, a = 10) => Math.round(v + (r() - 0.5) * a);
  const pts: [number, number][] = [
    [0, j(gy0 - 40)],
    [j(x0 - 90, 20), j(gy0 - 70)],
    [x0 - 34, gy0 - 6],
    [x0 + 22, gy0 + 2],
    [j(x0 + span * 0.2), j(gy0 + (valleyY - gy0) * 0.45)],
    [j(x0 + span * 0.42), j(valleyY - 16)],
    [valleyX, valleyY],
    [j(x0 + span * 0.72), j(valleyY - 22)],
    [x1 - 30, gy1 + 6],
    [x1 + 18, gy1],
    [j(x1 + 70, 16), j(gy1 - 30)],
    [VB.w, j(gy1 - 10)],
  ];
  const groundLine = `M${pts.map(([x, y]) => `${x} ${y}`).join("L")}`;
  const ground = `${groundLine}V${VB.h}H0Z`;

  const fr: string[] = [];
  for (let i = 0; i <= 10; i++) fr.push(`${Math.round((VB.w / 10) * i)} ${j(i % 2 ? 150 : 205, 60)}`);
  const farLine = `M${fr.join("L")}`;
  const far = `${farLine}V${VB.h}H0Z`;

  return { x0, y0, cx, cy, x1, y1, gy0, gy1, valleyX, valleyY, ground, groundLine, far, farLine };
}

/** Point on the cable (a quadratic curve with sag) at t in 0..1. */
export function cablePoint(g: Pick<Geo, "x0" | "y0" | "cx" | "cy" | "x1" | "y1">, t: number) {
  const u = 1 - t;
  return {
    x: u * u * g.x0 + 2 * u * t * g.cx + t * t * g.x1,
    y: u * u * g.y0 + 2 * u * t * g.cy + t * t * g.y1,
  };
}

export const fmt = (n: number, dec = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
