import { LINE_GAP, cablePoint, fmt } from "./geometry";

// Drives a project panel from one progress value d (0..1): the cable draws, the rider
// travels it, the counters count up and the inspection checks tick off. Every DOM
// write is delta-gated so a scroll-driven loop only touches what changed.

type Geo = { x0: number; y0: number; cx: number; cy: number; x1: number; y1: number };

export type Rig = {
  el: HTMLElement;
  d: number;
  geo: Geo | null;
  riders: { g: SVGGElement; lag: number; dy: number; last: string }[];
  nums: { el: HTMLElement; from: number; to: number; dec: number; last: string }[];
  chks: { el: HTMLElement; at: number; on: boolean }[];
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export function rig(el: HTMLElement): Rig {
  const art = el.querySelector<HTMLElement>(".pj-art");
  const raw = art?.dataset.geo?.split(",").map(Number);
  const geo = raw && raw.length === 6 ? { x0: raw[0], y0: raw[1], cx: raw[2], cy: raw[3], x1: raw[4], y1: raw[5] } : null;
  return {
    el,
    d: -1,
    geo,
    riders: [...el.querySelectorAll<SVGGElement>(".pj-rider")].map((g) => {
      const two = g.classList.contains("pj-rider-2");
      return { g, lag: two ? 0.07 : 0, dy: two ? LINE_GAP : 0, last: "" };
    }),
    nums: [...el.querySelectorAll<HTMLElement>("[data-count]")].map((n) => ({
      el: n,
      from: Number(n.dataset.from ?? 0),
      to: Number(n.dataset.count),
      dec: Number(n.dataset.dec ?? 0),
      last: n.textContent ?? "",
    })),
    chks: [...el.querySelectorAll<HTMLElement>(".pj-chk")].map((c) => ({ el: c, at: Number(c.dataset.at ?? 1), on: true })),
  };
}

export function setD(r: Rig, d: number) {
  if (Math.abs(d - r.d) < 0.002 && !(d === 1 && r.d !== 1) && !(d === 0 && r.d !== 0)) return;
  r.d = d;
  r.el.style.setProperty("--d", d.toFixed(3));
  if (r.geo) {
    for (const rd of r.riders) {
      // Structure, then cable, then the ride: speeds up down the line, brakes at the end.
      const u = clamp((d - 0.42 - rd.lag) / (0.54 - rd.lag), 0, 1);
      const t = u * u * (3 - 2 * u);
      const p = cablePoint(r.geo, t);
      const v = `translate(${p.x.toFixed(1)} ${(p.y + rd.dy).toFixed(1)})`;
      if (v !== rd.last) {
        rd.last = v;
        rd.g.setAttribute("transform", v);
      }
    }
  }
  const k = ease(clamp(d / 0.9, 0, 1));
  for (const n of r.nums) {
    const v = fmt(n.from + (n.to - n.from) * k, n.dec);
    if (v !== n.last) {
      n.last = v;
      n.el.textContent = v;
    }
  }
  for (const c of r.chks) {
    const on = d >= c.at;
    if (on !== c.on) {
      c.on = on;
      c.el.classList.toggle("pj-on", on);
    }
  }
}

/** Plays a rig from 0 to 1 over `ms`, once. Returns a cancel function. */
export function play(r: Rig, ms = 2200) {
  let start = 0;
  let id = requestAnimationFrame(function step(now) {
    if (!start) start = now;
    const t = clamp((now - start) / ms, 0, 1);
    setD(r, t);
    if (t < 1) id = requestAnimationFrame(step);
  });
  return () => cancelAnimationFrame(id);
}
