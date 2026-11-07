"use client";

// "Every height": the home page hero. The visitor descends a red safety line from a
// zip line at 45 m, past an adventure park, to the certification seal at 0 m, while an
// inspection marker checks each part. Kept to three stops (about one and a half screens
// of scroll) so impatient visitors reach the page fast, and both calls to action sit on
// the first frame.
// The scene is SVG line art driven by scroll (no video). Captions sit in the empty side
// of each station. Reduced motion, short landscape phones and no-JS visitors get a static
// first frame with the headline and both calls to action.

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { T, type L10n } from "@/lib/i18n/T";
import { STATIONS, rng } from "./stations";
import "./journey.css";

type Fx = "drift" | "slide" | "rise" | "weave" | "snap" | "settle";

const BANDS: { kicker: L10n; title: L10n; sub: L10n; fx: Fx; lane: "l" | "r" }[] = [
  {
    kicker: { sq: "45 m · Tirolezë", en: "45 m · Zip line" },
    title: { sq: "Siguri në çdo lartësi.", en: "Safe at every height." },
    sub: { sq: "Inspektim, dizajnim, inxhinieri dhe certifikim, si dhe pajisjet EDELRID që ju duhen.", en: "Inspection, design, engineering and certification, and the EDELRID equipment to go with it." },
    fx: "drift",
    lane: "r",
  },
  {
    kicker: { sq: "18 m · Park aventure", en: "18 m · Adventure park" },
    title: { sq: "Vizitorët shohin argëtimin. Ne shohim ngarkesën.", en: "Your guests see the fun. We see the load." },
    sub: {
      sq: "Platforma, ura, pemë dhe sisteme sigurie, të kontrolluara nga inxhinieri. Me raport me shkrim.",
      en: "Platforms, bridges, trees and belay systems, checked by an engineer. With a written report.",
    },
    fx: "weave",
    lane: "l",
  },
  {
    kicker: { sq: "0 m · E certifikuar", en: "0 m · Certified" },
    title: { sq: "Hapur. I sigurt. I certifikuar.", en: "Open. Safe. Certified." },
    sub: {
      sq: "Nga vinçat dhe ashensorët deri te parqet aventure: inspektim dhe certifikim, plus pajisjet EDELRID që ju mbajnë në punë.",
      en: "From cranes and lifts to adventure parks: inspection and certification, plus the EDELRID gear to keep you running.",
    },
    fx: "settle",
    lane: "r",
  },
];

/** Splits a headline into word and character spans with seeded entrance offsets. */
function SplitText({ text, fx, seed }: { text: string; fx: Fx; seed: number }) {
  const r = rng(seed);
  const words = text.split(/\s+/);
  const total = text.replace(/\s/g, "").length;
  let ci = 0;
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, wi) => {
          const wf = wi / Math.max(1, words.length);
          const wStyle: Record<string, string> = {};
          if (fx === "drift") wStyle["--th"] = (wf * 0.35).toFixed(3);
          if (fx === "rise") wStyle["--th"] = (wf * 0.45).toFixed(3);
          if (fx === "settle") wStyle["--th"] = (wf * 0.32).toFixed(3);
          return (
            <span key={wi}>
              <span className="eh-w" style={wStyle as React.CSSProperties}>
                {[...w].map((ch, k) => {
                  const cf = ci++ / total;
                  const s: Record<string, string> = {};
                  if (fx === "slide") {
                    s["--th"] = (cf * 0.5 + r() * 0.04).toFixed(3);
                    s["--jx"] = (-(34 + r() * 30)).toFixed(1) + "px";
                    s["--jy"] = (-(17 + r() * 15)).toFixed(1) + "px";
                  }
                  if (fx === "weave") {
                    s["--th"] = (cf * 0.45 + r() * 0.05).toFixed(3);
                    s["--jy"] = ((ci % 2 ? 1 : -1) * (14 + r() * 8)).toFixed(1) + "px";
                  }
                  if (fx === "snap") {
                    s["--th"] = (cf * 0.5 + r() * 0.05).toFixed(3);
                    s["--jx"] = ((r() < 0.5 ? -1 : 1) * (16 + r() * 22)).toFixed(1) + "px";
                  }
                  return (
                    <span key={k} className="eh-c" style={s as React.CSSProperties}>
                      {ch}
                    </span>
                  );
                })}
              </span>
              {wi < words.length - 1 ? " " : null}
            </span>
          );
        })}
      </span>
    </>
  );
}

// Stops on the way down, one caption band per stop.
const N = STATIONS.length, M = N - 1;
if (BANDS.length !== N) throw new Error("EveryHeight: one caption band per station");

const DUST = (() => {
  const r = rng(9);
  return Array.from({ length: 22 }, () => ({
    left: (r() * 100).toFixed(1) + "%",
    top: (20 + r() * 80).toFixed(1) + "%",
    animationDuration: (14 + r() * 12).toFixed(1) + "s",
    animationDelay: (-r() * 20).toFixed(1) + "s",
  }));
})();

export function EveryHeight() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const $ = <T extends Element = HTMLElement>(s: string) => hero.querySelector(s) as T;
    const $$ = <T extends Element = HTMLElement>(s: string) => [...hero.querySelectorAll(s)] as T[];
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
    const smooth = (p: number, e0: number, e1: number) => {
      const t = clamp((p - e0) / (e1 - e0), 0, 1);
      return t * t * (3 - 2 * t);
    };

    const stage = $(".eh-stage");
    const world = $(".eh-world");
    const grid = $(".eh-grid");
    const rFar = $(".eh-far");
    const rNear = $(".eh-near");
    const rulerI = $(".eh-ruler i");
    const altN = $(".eh-alt-n b");
    const altSq = $(".eh-alt-s .lang-sq");
    const altEn = $(".eh-alt-s .lang-en");
    const ropeDone = $(".eh-rope.eh-done");
    const ropeTodo = $(".eh-rope.eh-todo");
    const marker = $(".eh-marker");
    const cue = $(".eh-cue");
    const stEls = $$(".eh-station").map((el) => ({ el, d: -1, chk: [...el.querySelectorAll<HTMLElement>(".eh-chk")], on: [] as boolean[] }));
    const bands = $$(".eh-band").map((el, i) => {
      const c = 0.04 + (0.92 * i) / M, h = (0.92 * 0.42) / M;
      return { el, a: i === 0 ? 0 : c - h, b: i === M ? 1 : c + h, op: -1, k: -1, live: false };
    });
    const P0 = 0.04, SPAN = 0.92;
    const sOf = (p: number) => {
      const u = clamp((p - P0) / SPAN, 0, 1) * M;
      const i = Math.min(M - 1, Math.floor(u));
      const f = u - i;
      return i + f - (0.85 * Math.sin(2 * Math.PI * f)) / (2 * Math.PI);
    };
    const altAt = (s: number) => {
      const i = clamp(Math.floor(s), 0, M - 1);
      return STATIONS[i].height + (STATIONS[i + 1].height - STATIONS[i].height) * clamp(s - i, 0, 1);
    };

    hero.classList.add("eh-js");
    let L = { vw: 0, vh: 0, W: 0, H: 0, SP: 0, fy: 0, range: 1 };
    let stickTop = 0, ropeTopW = 0, ropeBotW = 0, lastCam = NaN, lastAlt = "", lastAltAt = 0, lastStation = -1, markerOp = -1, cueOp = -1, loadK = 0, loadStart = 0;

    function layout() {
      const vw = stage.clientWidth, vh = stage.clientHeight, mobile = vw <= 720;
      const W = mobile ? vw * 1.08 : Math.min(vw, vh * 1.18), H = W * 0.7;
      const SP = Math.max(H, vh * (mobile ? 0.62 : 0.85)), fy = vh * (mobile ? 0.37 : 0.5);
      L = { vw, vh, W, H, SP, fy, range: Math.max(1, hero!.offsetHeight - vh) };
      stickTop = parseFloat(getComputedStyle(stage).top) || 0;
      stEls.forEach(({ el }, i) => {
        el.style.width = W + "px";
        el.style.height = H + "px";
        el.style.left = (vw - W) / 2 + "px";
        el.style.top = i * SP + (SP - H) / 2 + "px";
      });
      // The safety line hangs in from above the first frame.
      ropeTopW = -vh;
      ropeBotW = M * SP + (SP - H) / 2 + (398 / 700) * H;
      stage.style.setProperty("--fy", fy + "px");
      lastCam = NaN;
      stEls.forEach((s) => (s.d = -1));
      bands.forEach((b) => ((b.op = -1), (b.k = -1)));
    }
    // The stage sticks below the site header, so progress starts when the hero reaches it.
    const heroProgress = () => clamp((stickTop - hero!.getBoundingClientRect().top) / L.range, 0, 1);

    function render(p: number, now: number, force: boolean) {
      const s = sOf(p), cam = s * L.SP + L.SP / 2 - L.fy, vh = L.vh;
      if (force || Math.abs(cam - lastCam) > 0.25) {
        lastCam = cam;
        world.style.transform = `translate3d(0,${(-cam).toFixed(1)}px,0)`;
        grid.style.transform = `translate3d(0,${(-(cam * 0.35) % 64).toFixed(1)}px,0)`;
        rFar.style.transform = `translate3d(0,${((1 - s / M) * vh * 0.3).toFixed(1)}px,0)`;
        rNear.style.transform = `translate3d(0,${((1 - s / M) * vh * 0.5).toFixed(1)}px,0)`;
        rulerI.style.transform = `translate3d(0,${(((60 - altAt(s)) * 6) % 30).toFixed(1)}px,0)`;
        const top = ropeTopW - cam, bot = ropeBotW - cam;
        const redEnd = L.fy + clamp((s - (M - 0.45)) / 0.4, 0, 1) * Math.max(0, bot - L.fy);
        ropeDone.style.clipPath = `inset(${Math.max(0, top).toFixed(1)}px 0 ${Math.max(0, vh - Math.min(redEnd, bot)).toFixed(1)}px 0)`;
        ropeTodo.style.clipPath = `inset(${Math.max(L.fy, top).toFixed(1)}px 0 ${Math.max(0, vh - bot).toFixed(1)}px 0)`;
        const mo = 1 - smooth(s, M - 0.4, M - 0.05);
        if (Math.abs(mo - markerOp) > 0.01) {
          markerOp = mo;
          marker.style.opacity = mo.toFixed(2);
        }
        stEls.forEach((st, i) => {
          const d = i === 0 ? loadK : smooth(s, i - 0.85, i - 0.2);
          if (Math.abs(d - st.d) > 0.004) {
            st.d = d;
            st.el.style.setProperty("--d", d.toFixed(3));
          }
          st.chk.forEach((c, j) => {
            const on = i === 0 ? loadK > 0.85 : s >= i - 0.2 - (j === 0 ? 0.12 : 0);
            if (on !== st.on[j]) {
              st.on[j] = on;
              c.classList.toggle("eh-on", on);
            }
          });
        });
      }
      if (force || now - lastAltAt > 100) {
        const a = altAt(s).toFixed(1);
        if (a !== lastAlt) {
          lastAlt = a;
          altN.textContent = a;
        }
        lastAltAt = now;
        const si = Math.round(s);
        if (si !== lastStation) {
          lastStation = si;
          const n = String(si + 1).padStart(2, "0") + "/" + String(N).padStart(2, "0") + " · ";
          altSq.textContent = n + STATIONS[si].nameSq;
          altEn.textContent = n + STATIONS[si].name;
        }
      }
      bands.forEach((b, i) => {
        const f = Math.min(0.02, (b.b - b.a) / 3);
        const op = (i === 0 ? 1 : smooth(p, b.a, b.a + f)) * (i === M ? 1 : 1 - smooth(p, b.b - f, b.b));
        const ramp = Math.min(0.025, (b.b - b.a) * 0.35);
        let k = clamp((p - b.a) / ramp, 0, 1);
        if (i === 0) {
          k = Math.max(k, loadK);
          const co = 1 - smooth(p, 0.02, 0.07);
          if (Math.abs(co - cueOp) > 0.01) {
            cueOp = co;
            cue.style.opacity = co.toFixed(2);
          }
        }
        if (Math.abs(op - b.op) > 0.004) {
          b.op = op;
          b.el.style.opacity = op.toFixed(3);
          const live = op > 0.5;
          if (live !== b.live) {
            b.live = live;
            b.el.classList.toggle("eh-live", live);
          }
        }
        if (Math.abs(k - b.k) > 0.008 || (k === 1 && b.k !== 1)) {
          b.k = k;
          b.el.style.setProperty("--k", k.toFixed(3));
        }
      });
    }

    // Drive loop: dt-normalized lerp that rests when converged.
    let target = 0, shown = 0, rafId: number | null = null, lastTick = 0, heroOn = true, scrubOn = false;
    function tick(now: number) {
      const dt = Math.min(100, now - (lastTick || now));
      lastTick = now;
      shown += (target - shown) * (1 - Math.pow(1 - 0.14, dt / 16.667));
      if (loadK < 1) {
        if (!loadStart) loadStart = now;
        const t = clamp((now - loadStart) / 1500, 0, 1);
        loadK = 1 - Math.pow(1 - t, 3);
      }
      const settled = Math.abs(target - shown) < 0.0004;
      if (settled) shown = target;
      render(shown, now, loadK < 1);
      if (settled && loadK >= 1) {
        rafId = null;
        lastTick = 0;
      } else rafId = requestAnimationFrame(tick);
    }
    function onScroll() {
      if (!scrubOn) return;
      target = heroProgress();
      if (rafId === null && heroOn) rafId = requestAnimationFrame(tick);
    }
    const io = new IntersectionObserver((es) => {
      heroOn = es[0].isIntersecting;
      if (heroOn) onScroll();
    });
    io.observe(hero);

    // Static-hero gates, decided live.
    const MQLS = ["(prefers-reduced-motion: reduce)", "(orientation: landscape) and (pointer: coarse) and (max-height: 560px)"].map((q) => matchMedia(q));
    function enableScrub() {
      if (scrubOn) return;
      scrubOn = true;
      hero!.classList.remove("eh-static");
      layout();
      addEventListener("scroll", onScroll, { passive: true });
      target = shown = heroProgress();
      render(shown, performance.now(), true);
      onScroll();
    }
    function disableScrub() {
      scrubOn = false;
      removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      lastTick = 0;
      hero!.classList.add("eh-static");
      loadK = 1;
      layout();
      render(0, performance.now(), true);
      bands.forEach((b, i) => {
        if (i) {
          b.el.style.opacity = "0";
          b.op = 0;
        }
      });
    }
    const applyMode = () => (MQLS.some((m) => m.matches) ? disableScrub() : enableScrub());
    MQLS.forEach((m) => m.addEventListener("change", applyMode));
    applyMode();

    let rz: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(rz);
      rz = setTimeout(() => {
        layout();
        if (scrubOn) target = shown = heroProgress();
        render(scrubOn ? shown : 0, performance.now(), true);
      }, 120);
    };
    addEventListener("resize", onResize);
    const onVis = () => document.body.classList.toggle("eh-paused", document.hidden);
    document.addEventListener("visibilitychange", onVis);
    document.fonts?.ready.then(() => {
      layout();
      render(scrubOn ? shown : 0, performance.now(), true);
    });

    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      MQLS.forEach((m) => m.removeEventListener("change", applyMode));
      io.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
      clearTimeout(rz);
      hero.classList.remove("eh-js", "eh-static");
    };
  }, []);

  return (
    <section ref={heroRef} className="eh-hero" aria-labelledby="hero-title">
      <div className="eh-stage">
        <div className="eh-layer eh-grid" aria-hidden="true" />
        <svg className="eh-ridge eh-far" viewBox="0 0 1600 300" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 170L120 130L210 150L330 80L420 120L520 60L640 110L760 70L860 120L980 50L1100 100L1210 70L1330 120L1440 90L1600 130V300H0Z" fill="#17171A" stroke="rgba(242,239,234,.16)" strokeWidth="1" />
        </svg>
        <svg className="eh-ridge eh-near" viewBox="0 0 1600 300" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 220L140 170L260 200L390 140L500 190L620 150L700 175L820 120L940 180L1060 150L1180 200L1300 160L1420 190L1600 150V300H0Z" fill="#191A1D" stroke="rgba(242,239,234,.24)" strokeWidth="1" />
        </svg>
        <div className="eh-layer eh-dust" aria-hidden="true">
          {DUST.map((d, i) => (
            <i key={i} style={d} />
          ))}
        </div>
        <div className="eh-world" aria-hidden="true">
          {STATIONS.map((st) => (
            <div className="eh-station" key={st.name}>
              <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet" dangerouslySetInnerHTML={{ __html: st.svg }} />
              {st.checks.map((c) => (
                <span
                  key={c.label}
                  className={`eh-chk${c.x > 800 ? " eh-r" : c.x < 200 ? " eh-l" : ""}`}
                  style={{ left: `${c.x / 10}%`, top: `${c.y / 7}%` }}
                >
                  <b>✓</b>
                  <T sq={c.labelSq} en={c.label} />
                  <em>OK</em>
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="eh-rope eh-todo" aria-hidden="true" />
        <div className="eh-rope eh-done" aria-hidden="true" />
        <div className="eh-marker" aria-hidden="true">
          <i />
        </div>
        <div className="eh-layer eh-scrim" aria-hidden="true" />
        <div className="eh-hud" aria-hidden="true">
          <div className="eh-ruler">
            <i />
          </div>
          <div className="eh-alt">
            <div className="eh-alt-n">
              <b>{STATIONS[0].height.toFixed(1)}</b>
              <i>m</i>
            </div>
            <div className="eh-alt-l">
              <T sq="Lartësia" en="Height" />
            </div>
            <div className="eh-alt-s">
              <T sq={`01/0${N} · ${STATIONS[0].nameSq}`} en={`01/0${N} · ${STATIONS[0].name}`} />
            </div>
          </div>
        </div>

        {BANDS.map((b, i) => {
          const Heading = i === 0 ? "h1" : "h2";
          return (
            <div key={i} className={`eh-band eh-${b.lane}`} data-i={i} data-fx={b.fx}>
              <p className="eh-kick">
                <T sq={b.kicker.sq} en={b.kicker.en} />
              </p>
              <Heading id={i === 0 ? "hero-title" : undefined} className="eh-h font-display">
                <T sq={<SplitText text={b.title.sq} fx={b.fx} seed={1000 + i * 17} />} en={<SplitText text={b.title.en} fx={b.fx} seed={2000 + i * 17} />} />
              </Heading>
              <p className="eh-sub">
                <T sq={b.sub.sq} en={b.sub.en} />
              </p>
              {(i === 0 || i === M) && (
                <div className="eh-row">
                  <ButtonLink href="/shop">
                    <T sq="Dyqani" en="Shop" />
                    <ArrowRight aria-hidden className="size-4" />
                  </ButtonLink>
                  <ButtonLink href="/services#request" variant="outline-light">
                    <T sq="Kërko inspektim" en="Request an inspection" />
                  </ButtonLink>
                </div>
              )}
            </div>
          );
        })}
        <div className="eh-cue" aria-hidden="true">
          <T sq="Rrëshqit poshtë" en="Scroll down" />
          <i />
        </div>
      </div>
    </section>
  );
}
