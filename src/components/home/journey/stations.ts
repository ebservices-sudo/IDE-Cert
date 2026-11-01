// Line-art stations for the "Every height" scroll journey on the home page.
// Each station is drawn in a 1000 x 700 box with the safety rope at x = 500.
// Paths use pathLength="1" so the scroll engine can draw them in with one
// custom property (--d) per station. Output is deterministic (seeded), so the
// server render and the browser render are identical.

export const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
};

const P = (d: string, o = 0, cls = "") =>
  `<path class="eh-ln${cls ? " " + cls : ""}" pathLength="1" style="--o:${o.toFixed(2)}" d="${d}"/>`;
const C = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const R = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}Z`;

function hTruss(x1: number, x2: number, yt: number, yb: number, st: number) {
  let d = `M${x1} ${yt}H${x2}M${x1} ${yb}H${x2}M${x1} ${yb}`;
  let up = true;
  for (let x = x1 + st / 2; x <= x2 + 0.1; x += st / 2) {
    d += `L${x} ${up ? yt : yb}`;
    up = !up;
  }
  return d;
}
function vTruss(xl: number, xr: number, y1: number, y2: number, st: number) {
  let d = `M${xl} ${y1}V${y2}M${xr} ${y1}V${y2}M${xl} ${y1}`;
  let rt = true;
  for (let y = y1 + st / 2; y <= y2 + 0.1; y += st / 2) {
    d += `L${rt ? xr : xl} ${y}`;
    rt = !rt;
  }
  return d;
}

const LOGO =
  "M0 0h28v144h-28ZM62 0h28v144h-28ZM102 0h8v28h-8ZM109 0A72 72 0 0 1 158.83 20.03L139.45 40.24A44 44 0 0 0 109 28ZM160.97 22.17A72 72 0 0 1 160.97 121.83L140.76 102.45A44 44 0 0 0 140.76 41.55ZM158.83 123.97A72 72 0 0 1 109 144L109 116A44 44 0 0 0 139.45 103.76ZM102 116h8v28h-8ZM216 0h28v144h-28ZM256 0h68v28h-68ZM256 58h52v28h-52ZM256 116h68v28h-68Z";

function seal(cx: number, cy: number, id: string) {
  return `<g>
    ${P(C(cx, cy, 72), 0.2, "eh-red")}
    ${P(C(cx, cy, 52), 0.35, "eh-red")}
    <path id="${id}" fill="none" d="M${cx - 62} ${cy}a62 62 0 1 1 124 0a62 62 0 1 1 -124 0"/>
    <g class="eh-fill"><g class="eh-spin" style="transform-origin:${cx}px ${cy}px"><text font-family="ui-monospace, monospace" font-size="9" fill="#E5484D"><textPath href="#${id}" textLength="384" lengthAdjust="spacing">CERTIFIED · E CERTIFIKUAR · IDE CERT ·</textPath></text></g>
    <path fill="#F2EFEA" transform="translate(${cx - 34} ${cy - 22}) scale(.21)" d="${LOGO}"/>
    <text x="${cx}" y="${cy + 22}" text-anchor="middle" font-weight="800" font-size="10.5" letter-spacing="6.5" fill="#E5484D" style="font-stretch:125%">CERT</text></g>
  </g>`;
}

function crane() {
  return (
    P(vTruss(200, 240, 150, 700, 40), 0) +
    P("M200 110L220 30L240 110", 0.1) +
    P(hTruss(240, 940, 110, 150, 40) + "M940 110V150", 0.12) +
    P(hTruss(40, 200, 118, 150, 32), 0.2) +
    P(R(50, 150, 30, 44) + R(84, 150, 30, 44), 0.35) +
    P("M220 30L940 110M220 30L40 118", 0.3, "eh-thin") +
    P(R(244, 150, 58, 40) + R(254, 158, 38, 16), 0.3) +
    P(R(478, 150, 44, 14), 0.4) +
    P("M492 164V252M508 164V252", 0.45, "eh-thin") +
    P(R(482, 252, 36, 30), 0.5) +
    P("M500 282V296", 0.55)
  );
}

function zip() {
  const k = 0.32;
  const cy = (x: number) => 280 + (x - 150) * k;
  const n = Math.hypot(1, k), dx = 1 / n, dy = k / n, px = -dy, py = dx;
  const at = (x0: number, a: number, b: number) => {
    const y0 = cy(x0);
    return `${(x0 + dx * a + px * b).toFixed(1)} ${(y0 + dy * a + py * b).toFixed(1)}`;
  };
  let spring = "M" + at(840, 0, 0);
  for (let i = 1; i <= 10; i++) spring += "L" + at(840, i * 5.2, i % 2 ? 8 : -8);
  const brake = `M${at(905, -16, -11)}L${at(905, 16, -11)}L${at(905, 16, 11)}L${at(905, -16, 11)}Z`;
  const trolley = `M${at(330, -14, -4)}L${at(330, 14, -4)}L${at(330, 14, 6)}L${at(330, -14, 6)}Z`;
  const y0 = cy(330);
  return (
    P(vTruss(70, 150, 300, 700, 70), 0) +
    P("M45 300H175M45 260H175M45 260V300M175 260V300", 0.1) +
    P(`M150 280L955 ${cy(955).toFixed(1)}`, 0.15) +
    P(C(150, 280, 6), 0.2, "eh-red") +
    P(trolley, 0.35) +
    P(`M330 ${y0 + 6}L331 ${y0 + 52}`, 0.4) +
    P(C(318, y0 + 46, 10), 0.45) +
    P(`M331 ${y0 + 52}L327 ${y0 + 102}L343 ${y0 + 134}L364 ${y0 + 131}M331 ${y0 + 66}L348 ${y0 + 46}`, 0.5) +
    P(spring, 0.45, "eh-thin") +
    P(brake, 0.5) +
    P("M958 548V700M932 700H984M958 584L986 612", 0.3) +
    P("M0 700H1000", 0.05, "eh-thin")
  );
}

function ferrata() {
  let rungs = "";
  [90, 165, 240, 315, 390, 465, 540, 615].forEach((y, i) => {
    const x = 620 + (i % 2 ? 8 : -4);
    rungs += `M${x} ${y - 11}V${y}H${x + 42}V${y - 11}`;
  });
  const pts = [[690, 30], [705, 160], [692, 290], [722, 410], [706, 530], [728, 660]];
  const bolts = pts.map((p) => C(p[0], p[1], 5)).join("");
  return (
    P("M560 0L540 80L575 150L548 230L590 320L560 400L600 480L570 560L610 640L590 700", 0) +
    P("M640 40L700 120L690 200M760 90L820 160M700 300L780 340L860 330M650 520L720 580L800 560L880 620M900 200L960 260M860 420L930 470M800 640L870 690", 0.2, "eh-thin") +
    P(rungs, 0.3) +
    P("M" + pts.map((p) => p.join(" ")).join("L"), 0.45) +
    P(bolts, 0.5, "eh-red")
  );
}

function ropePark() {
  const qd = (t: number, a: number, c: number, b: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;
  let hang = "";
  for (let i = 1; i <= 9; i++) {
    const t = i / 10;
    const x = qd(t, 650, 742, 835), yd = qd(t, 336, 400, 336), yh = qd(t, 290, 340, 290);
    hang += `M${x.toFixed(1)} ${yh.toFixed(1)}L${x.toFixed(1)} ${yd.toFixed(1)}l0 8`;
  }
  const canopy = (dx: number) =>
    `M${520 + dx} 120C${500 + dx} 50 ${580 + dx} 15 ${620 + dx} 45C${670 + dx} 15 ${725 + dx} 75 ${692 + dx} 122C${722 + dx} 165 ${650 + dx} 190 ${610 + dx} 158C${570 + dx} 190 ${495 + dx} 175 ${520 + dx} 120Z`;
  return (
    P("M590 700L596 110M612 700L606 110M870 700L876 110M892 700L886 110", 0) +
    P(canopy(0) + canopy(280), 0.12, "eh-thin") +
    P("M555 330H650M555 342H650M562 342L592 384M643 342L612 384M835 330H930M835 342H930M842 342L872 384M923 342L892 384", 0.25) +
    P("M650 336Q742 400 835 336M650 290Q742 340 835 290", 0.35) +
    P(hang, 0.45, "eh-thin") +
    P("M606 232H876", 0.5, "eh-red") +
    P("M380 700H1000", 0.05, "eh-thin")
  );
}

function wall() {
  const xl = (y: number) => 130 - ((y - 60) * 38) / 620;
  const xr = (y: number) => (y <= 300 ? 462 - ((y - 40) * 30) / 260 : 432 + ((y - 300) * 40) / 380);
  let joints = "";
  [200, 360, 520].forEach((y) => (joints += `M${xl(y).toFixed(1)} ${y}L${xr(y).toFixed(1)} ${y}`));
  const r = rng(77);
  let holds = "";
  for (let i = 0; i < 20; i++) {
    const y = 90 + r() * 560, x = xl(y) + 30 + r() * (xr(y) - xl(y) - 60), s = 6 + r() * 7;
    holds += `M${(x - s).toFixed(1)} ${y.toFixed(1)}a${s.toFixed(1)} ${(s * 0.75).toFixed(1)} 0 1 0 ${(2 * s).toFixed(1)} 0a${s.toFixed(1)} ${(s * 0.75).toFixed(1)} 0 1 0 ${(-2 * s).toFixed(1)} 0`;
  }
  const route = [[300, 72], [282, 170], [312, 268], [286, 366], [306, 464], [292, 562]];
  const qds = route.slice(1).map((p) => `M${p[0]} ${p[1]}l4 16` + C(p[0] + 4, p[1] + 20, 3.5)).join("");
  return (
    P("M92 680L130 60L462 40L432 300L472 680Z", 0) +
    P(joints + "M240 52L212 680M352 46L346 680", 0.15, "eh-thin") +
    P(holds, 0.3) +
    P(C(300, 72, 7), 0.4, "eh-red") +
    P(qds, 0.45) +
    P("M300 79" + route.slice(1).map((p) => `L${p[0] + 4} ${p[1] + 24}`).join("") + "L298 680", 0.5, "eh-thin") +
    P("M60 680H520", 0.05, "eh-thin")
  );
}

function lift() {
  let hatch = "";
  for (let y = 20; y <= 540; y += 40) hatch += `M140 ${y}l-14 14M380 ${y}l14 14`;
  let g = "";
  for (let x = 14; x <= 1000; x += 28) g += `M${x} 560l-18 22`;
  return (
    P("M140 0V560M380 0V560", 0) +
    P(hatch, 0.1, "eh-thin") +
    P("M176 0V560M344 0V560", 0.15, "eh-thin") +
    P("M252 0V372M268 0V372", 0.2, "eh-thin") +
    P(R(352, 140, 20, 110) + "M362 0V140", 0.3) +
    P(R(190, 372, 140, 186), 0.3) +
    P(R(202, 386, 116, 172) + "M260 386V558", 0.4) +
    P("M0 560H1000", 0.05) +
    P(g, 0.15, "eh-thin") +
    seal(500, 470, "eh-seal-path")
  );
}

export type Check = { x: number; y: number; label: string };
export type Station = { name: string; height: number; svg: string; checks: Check[] };

export const STATIONS: Station[] = [
  { name: "Tower crane", height: 60, svg: crane(), checks: [{ x: 500, y: 205, label: "Hoist rope" }, { x: 270, y: 150, label: "Load limiter" }] },
  { name: "Zip line", height: 45, svg: zip(), checks: [{ x: 150, y: 270, label: "Anchor" }, { x: 905, y: 512, label: "Brake" }] },
  { name: "Via ferrata", height: 32, svg: ferrata(), checks: [{ x: 641, y: 300, label: "Rungs" }, { x: 722, y: 400, label: "Steel cable" }] },
  { name: "Rope park", height: 18, svg: ropePark(), checks: [{ x: 602, y: 322, label: "Platform" }, { x: 742, y: 224, label: "Safety line" }] },
  { name: "Climbing wall", height: 9, svg: wall(), checks: [{ x: 215, y: 290, label: "Holds" }, { x: 300, y: 64, label: "Belay points" }] },
  { name: "Lift", height: 0, svg: lift(), checks: [{ x: 260, y: 466, label: "Doors" }, { x: 260, y: 364, label: "Safety brake" }] },
];
