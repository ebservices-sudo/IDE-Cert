import type { Project } from "@/config/projects";
import { T } from "@/lib/i18n/T";
import { LINE_GAP, VB, cablePoint, fmt, geometry } from "./geometry";

// Side view of a project's zip line in the home page hero's line-art style: terrain,
// launch tower, landing platform, cable(s), rider(s), dimension lines and inspection
// checks. Everything is driven by one CSS variable, --d (0..1), set by animate.ts;
// the server renders the finished drawing (--d: 1) so it reads without JavaScript.

function Rider() {
  return (
    <>
      <rect x="-8" y="-5" width="16" height="8" rx="2" className="pj-trolley" />
      <path d="M0 3V19M-4 19h8" />
      <circle cx="1" cy="25" r="5" />
      <path d="M1 30L-2 44L7 50M-1 35L8 33" />
    </>
  );
}

export function ZipProfile({ project: p, idPrefix }: { project: Project; idPrefix: string }) {
  const g = geometry(p);
  const cable = `M${g.x0} ${g.y0}Q${g.cx} ${g.cy} ${g.x1} ${g.y1}`;
  const twin = p.lines > 1;
  const end = cablePoint(g, 1);
  const mid = cablePoint(g, 0.5);
  const brake = p.facts.some((f) => f.value.en.includes("ZipSTOP")) ? { sq: "ZipSTOP IR", en: "ZipSTOP IR" } : { sq: "Frenimi", en: "Braking" };
  const lengthLabel = (twin ? "2 × " : "") + (p.dropM ? "" : "~") + fmt(p.lengthM) + " m";
  const pct = (x: number, y: number) => ({ left: `${(x / VB.w) * 100}%`, top: `${(y / VB.h) * 100}%` });
  const dropX = g.x1 + 42;

  return (
    <div className="pj-art" data-geo={[g.x0, g.y0, g.cx, g.cy, g.x1, g.y1].join(",")} data-lines={p.lines}>
      <svg viewBox={`0 0 ${VB.w} ${VB.h}`} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${idPrefix}-fade`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d1e21" />
            <stop offset="1" stopColor="#141414" />
          </linearGradient>
          <linearGradient id={`${idPrefix}-sides`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000" />
            <stop offset="0.07" stopColor="#fff" />
            <stop offset="0.93" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <mask id={`${idPrefix}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={VB.w} height={VB.h}>
            <rect width={VB.w} height={VB.h} fill={`url(#${idPrefix}-sides)`} />
          </mask>
        </defs>
        <g mask={`url(#${idPrefix}-mask)`}>
          <path className="pj-far-fill" d={g.far} />
          <path className="pj-far" d={g.farLine} />
          <path d={g.ground} fill={`url(#${idPrefix}-fade)`} />
          <path className="pj-ground" d={g.groundLine} />
        </g>
        {p.valley && (
          <g className="pj-river">
            <path pathLength={1} d={`M${g.valleyX - 70} ${g.valleyY - 3}q17 -7 35 0t35 0t35 0t35 0`} />
            <text x={g.valleyX} y={g.valleyY + 24} textAnchor="middle">{p.valley.toUpperCase()}</text>
          </g>
        )}

        <g className="pj-struct">
          <path pathLength={1} d={`M${g.x0 - 17} ${g.gy0}L${g.x0 - 7} ${g.y0 + 6}M${g.x0 + 17} ${g.gy0}L${g.x0 + 7} ${g.y0 + 6}`} />
          <path pathLength={1} d={`M${g.x0 - 15} ${g.gy0 - 12}L${g.x0 + 14} ${g.gy0 - 34}L${g.x0 - 12} ${g.gy0 - 56}L${g.x0 + 10} ${g.y0 + 18}`} />
          <path pathLength={1} d={`M${g.x0 - 40} ${g.y0 + 10}H${g.x0 + 12}M${g.x0 - 40} ${g.y0 + 10}V${g.y0 - 8}M${g.x0 - 22} ${g.y0 + 10}V${g.y0 - 8}M${g.x0 - 40} ${g.y0 - 2}H${g.x0 - 8}`} />
          <path pathLength={1} d={`M${g.x0 - 7} ${g.y0 + 6}V${g.y0 - 10}H${g.x0 + 7}V${g.y0 + 6}`} />
          <path pathLength={1} d={`M${g.x1} ${g.y1 - 8}V${g.gy1}M${g.x1 - 14} ${g.gy1}L${g.x1} ${g.y1 + 24}L${g.x1 + 14} ${g.gy1}`} />
          <path pathLength={1} d={`M${g.x1 - 16} ${g.y1 + 12}H${g.x1 + 36}M${g.x1 + 36} ${g.y1 + 12}V${g.y1 - 6}`} />
        </g>

        <g className="pj-cables">
          <path className="pj-cable-dim" d={cable} />
          {twin && <path className="pj-cable-dim" d={cable} transform={`translate(0 ${LINE_GAP})`} />}
          <path className="pj-cable" pathLength={1} d={cable} />
          {twin && <path className="pj-cable pj-cable-2" pathLength={1} d={cable} transform={`translate(0 ${LINE_GAP})`} />}
          <rect className="pj-brake" x={g.x1 - 34} y={g.y1 - 6} width="14" height="9" rx="1.5" transform={`rotate(${(Math.atan2(g.y1 - g.cy, g.x1 - g.cx) * 180) / Math.PI} ${g.x1 - 27} ${g.y1 - 1.5})`} />
        </g>

        <g className="pj-dim">
          <path d={`M${g.x0} 70H${g.x1}M${g.x0} 62V78M${g.x1} 62V78`} />
          <text x={(g.x0 + g.x1) / 2} y="56" textAnchor="middle">{lengthLabel}</text>
          {p.dropM && (
            <>
              <path className="pj-guide" d={`M${g.x0 + 14} ${g.y0}H${dropX + 8}`} />
              <path d={`M${dropX} ${g.y0}V${g.y1}M${dropX - 7} ${g.y0}h14M${dropX - 7} ${g.y1}h14`} />
              <text x={dropX - 10} y={g.y0 + (g.y1 - g.y0) * 0.45} textAnchor="end">↓ {fmt(p.dropM, 2)} m</text>
            </>
          )}
        </g>

        {twin && (
          <g className="pj-rider pj-rider-2" transform={`translate(${end.x.toFixed(1)} ${(end.y + LINE_GAP).toFixed(1)})`}>
            <Rider />
          </g>
        )}
        <g className="pj-rider" transform={`translate(${end.x.toFixed(1)} ${end.y.toFixed(1)})`}>
          <Rider />
        </g>
      </svg>

      <span className="pj-chk pj-on" data-at="0.3" style={pct(g.x0 - 8, g.gy0 + 18)}>
        <b>✓</b>
        <T sq="Ankorimi" en="Anchorage" />
        <em>OK</em>
      </span>
      <span className="pj-chk pj-on" data-at="0.55" style={pct(mid.x - 40, mid.y + (twin ? 40 : 30))}>
        <b>✓</b>
        <T sq="Tensioni i litarit" en="Rope tension" />
        <em>OK</em>
      </span>
      <span className="pj-chk pj-chk-r pj-on" data-at="0.96" style={pct(g.x1 + 40, g.gy1 + 24)}>
        <b>✓</b>
        <T sq={brake.sq} en={brake.en} />
        <em>OK</em>
      </span>
    </div>
  );
}
