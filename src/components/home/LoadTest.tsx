"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Container } from "@/components/ui/Container";

// Press-and-hold load test: the one interactive moment on the home page.
// Holding loads the anchor to 12 kN; releasing early eases the gauge back down.
// Reduced motion gets the finished state with no hold required.

const CHECKS = ["The anchor held the load", "No permanent deformation", "Cable within tolerance", "Ready for the report"];
const CX = 200, CY = 210;
const TICKS = Array.from({ length: 25 }, (_, i) => {
  const a = ((-120 + i * 10 - 90) * Math.PI) / 180, r1 = i % 4 ? 146 : 140, r2 = 154;
  return { x1: CX + r1 * Math.cos(a), y1: CY + r1 * Math.sin(a), x2: CX + r2 * Math.cos(a), y2: CY + r2 * Math.sin(a) };
});

export function LoadTest() {
  const [g, setG] = useState(0);
  const [passed, setPassed] = useState(false);
  const holding = useRef(false);
  const raf = useRef<number | null>(null);
  const last = useRef(0);
  const gRef = useRef(0);
  const passedRef = useRef(false);
  const downWhilePassed = useRef(false);

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (mq.matches) {
        gRef.current = 1;
        passedRef.current = true;
        setG(1);
        setPassed(true);
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, []);

  function tick(now: number) {
    const dt = Math.min(64, now - (last.current || now));
    last.current = now;
    let v = gRef.current;
    if (holding.current && !passedRef.current) v = Math.min(1, v + dt / 2400);
    else if (!passedRef.current) v = Math.max(0, v - (dt / 1500) * (0.4 + v));
    gRef.current = v;
    if (v >= 1 && !passedRef.current) {
      passedRef.current = true;
      setPassed(true);
    }
    setG(v);
    if ((holding.current && !passedRef.current) || (!passedRef.current && v > 0)) raf.current = requestAnimationFrame(tick);
    else {
      raf.current = null;
      last.current = 0;
    }
  }
  const kick = () => {
    if (raf.current === null) raf.current = requestAnimationFrame(tick);
  };
  const start = () => {
    if (passedRef.current) return;
    holding.current = true;
    kick();
  };
  const end = () => {
    holding.current = false;
    if (!passedRef.current) kick();
  };
  const reset = () => {
    passedRef.current = false;
    gRef.current = 0;
    setPassed(false);
    setG(0);
  };

  return (
    <section className="relative overflow-hidden bg-ink py-16 text-white sm:py-20" aria-labelledby="loadtest-title">
      <div aria-hidden className="absolute inset-0 bg-grid-dark [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <Container className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl border border-ink-line bg-ink-2" aria-hidden>
          <svg viewBox="0 0 400 400" className="absolute inset-[7%] h-[86%] w-[86%]">
            <g stroke="rgba(242,239,234,.26)" strokeWidth={2}>
              {TICKS.map((t, i) => (
                <line key={i} x1={t.x1.toFixed(1)} y1={t.y1.toFixed(1)} x2={t.x2.toFixed(1)} y2={t.y2.toFixed(1)} />
              ))}
            </g>
            <path d="M89.4 273.8A128 128 0 1 1 310.6 273.8" fill="none" stroke="rgba(242,239,234,.1)" strokeWidth={14} strokeLinecap="round" />
            <path
              d="M89.4 273.8A128 128 0 1 1 310.6 273.8"
              fill="none"
              stroke="#E5484D"
              strokeWidth={14}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - g}
              opacity={Math.min(1, g * 40)}
            />
            <g transform={`rotate(${-120 + 240 * g} ${CX} ${CY})`}>
              <path d={`M${CX} ${CY}L${CX} 104`} stroke="#F2EFEA" strokeWidth={3} strokeLinecap="round" />
              <circle cx={CX} cy={CY} r={10} fill="#E5484D" />
            </g>
            <text x={CX} y={300} textAnchor="middle" fill="#F2EFEA" fontSize={44} fontFamily="ui-monospace, monospace">
              {(g * 12).toFixed(1)}
            </text>
            <text x={CX} y={326} textAnchor="middle" fill="#A3A3A0" fontSize={13} letterSpacing={2} fontFamily="ui-monospace, monospace">
              kN
            </text>
          </svg>
          <div
            className={clsx(
              "absolute left-1/2 top-[31%] -translate-x-1/2 -translate-y-1/2 -rotate-[7deg] rounded-lg border-[3px] border-brand bg-ink/75 px-4 py-2 font-display text-2xl tracking-[0.12em] text-brand transition-[opacity,scale] duration-500",
              passed ? "scale-100 opacity-100" : "scale-150 opacity-0",
            )}
          >
            PASSED
          </div>
        </div>

        <div>
          <p className="kicker text-brand">Try it yourself</p>
          <h2 id="loadtest-title" className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
            What a load test feels like
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-dark">
            Press and hold the button. We load the anchor until it reaches the test load.
          </p>
          <button
            type="button"
            className="relative mt-8 inline-flex h-12 min-w-60 touch-none select-none items-center justify-center overflow-hidden rounded-md bg-brand-strong px-6 text-sm font-semibold text-white transition-colors hover:bg-[#b5252a]"
            onPointerDown={(e) => {
              downWhilePassed.current = passedRef.current;
              if (passedRef.current) return;
              e.preventDefault();
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {}
              start();
            }}
            onPointerUp={end}
            onPointerCancel={end}
            onLostPointerCapture={end}
            onContextMenu={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                e.preventDefault();
                if (passedRef.current) reset();
                else start();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === " " || e.key === "Enter") end();
            }}
            onClick={(e) => {
              if (passedRef.current && downWhilePassed.current && e.detail !== 0) {
                downWhilePassed.current = false;
                reset();
              }
            }}
          >
            <span aria-hidden className="absolute inset-0 origin-left bg-white/20" style={{ transform: `scaleX(${passed ? 0 : g})` }} />
            <span className="relative">{passed ? "Test again" : "Hold to test"}</span>
          </button>
          <ul className="mt-8 grid gap-3" aria-live="polite">
            {CHECKS.map((c, i) => (
              <li
                key={c}
                className={clsx("flex items-center gap-3.5 transition-colors duration-500", passed ? "text-white" : "text-muted-dark")}
                style={{ transitionDelay: passed ? `${i * 180}ms` : "0ms" }}
              >
                <span
                  aria-hidden
                  className={clsx(
                    "grid size-6 shrink-0 place-items-center rounded-full border text-xs transition-colors duration-500",
                    passed ? "border-brand-strong bg-brand-strong text-white" : "border-white/30 text-transparent",
                  )}
                  style={{ transitionDelay: passed ? `${i * 180}ms` : "0ms" }}
                >
                  ✓
                </span>
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-dark">
            This is an illustration. Real tests happen on site, to the standard for your installation.
          </p>
        </div>
      </Container>
    </section>
  );
}
