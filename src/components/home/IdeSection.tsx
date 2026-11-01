"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import { T } from "@/lib/i18n/T";

// "What IDE stands for": the four services as stencil letters (I, D, E and a red C for
// CERT) cut from the logo geometry. The letter pieces slide together when the row scrolls in.

type Piece = { d: string; x?: number; y?: number };
const LETTERS: { key: string; viewBox: string; red?: boolean; pieces: Piece[]; name: { sq: string; en: string }; text: { sq: string; en: string } }[] = [
  {
    key: "inspection",
    viewBox: "0 0 28 144",
    pieces: [{ d: "M0 0h28v144h-28Z", y: -40 }],
    name: { sq: "Inspektim", en: "Inspection" },
    text: { sq: "Kontroll në vend i çdo pjese që mban peshë: kabllo, ankorime, platforma, frena.", en: "On-site checks of every part that carries load: cables, anchors, platforms, brakes." },
  },
  {
    key: "design",
    viewBox: "0 0 120 144",
    pieces: [
      { d: "M0 0h28v144h-28Z", x: -30 },
      { d: "M40 0h8v28h-8ZM47 0A72 72 0 0 1 96.83 20.03L77.45 40.24A44 44 0 0 0 47 28Z", x: 30, y: -24 },
      { d: "M98.97 22.17A72 72 0 0 1 98.97 121.83L78.76 102.45A44 44 0 0 0 78.76 41.55Z", x: 44 },
      { d: "M96.83 123.97A72 72 0 0 1 47 144L47 116A44 44 0 0 0 77.45 103.76ZM40 116h8v28h-8Z", x: 30, y: 24 },
    ],
    name: { sq: "Dizajnim", en: "Design" },
    text: { sq: "Planifikojmë parqe dhe instalime të reja që kalojnë inspektimin që nga dita e parë.", en: "We plan new parks and installations that pass inspection from day one." },
  },
  {
    key: "engineering",
    viewBox: "0 0 108 144",
    pieces: [
      { d: "M0 0h28v144h-28Z", x: -30 },
      { d: "M40 0h68v28h-68Z", x: 40 },
      { d: "M40 58h52v28h-52Z", x: 56 },
      { d: "M40 116h68v28h-68Z", x: 40 },
    ],
    name: { sq: "Inxhinieri", en: "Engineering" },
    text: { sq: "Llogaritje ngarkesash, analiza strukturore dhe rregullime kur diçka nuk shkon.", en: "Load calculations, structural analysis and fixes when something is wrong." },
  },
  {
    key: "certification",
    viewBox: "0 0 124 144",
    red: true,
    pieces: [
      { d: "M72 144A72 72 0 0 1 22.17 123.97L41.55 103.76A44 44 0 0 0 72 116ZM72 116h52v28h-52Z", x: -24, y: 28 },
      { d: "M20.03 121.83A72 72 0 0 1 20.03 22.17L40.24 41.55A44 44 0 0 0 40.24 102.45Z", x: -44 },
      { d: "M22.17 20.03A72 72 0 0 1 72 0L72 28A44 44 0 0 0 41.55 40.24ZM72 0h52v28h-52Z", x: -24, y: -28 },
    ],
    name: { sq: "Certifikim", en: "Certification" },
    text: { sq: "Raport i qartë dhe certifikatë që mund t'ua tregoni sigurimeve, autoriteteve dhe klientëve.", en: "A clear report and a certificate you can show insurers, authorities and customers." },
  },
];

export function IdeSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="sherbimet" className="relative overflow-hidden bg-ink py-20 text-white sm:py-28" aria-labelledby="ide-title">
      <div aria-hidden className="absolute inset-0 bg-grid-dark opacity-60" />
      <div aria-hidden className="absolute -right-40 -top-40 size-[36rem] rounded-full bg-brand/10 blur-3xl" />
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.14em] text-muted-dark">
          <span aria-hidden className="size-2 animate-pulse rounded-full bg-brand" />
          <T sq="Shërbimet" en="Services" />
        </p>
        <h2 id="ide-title" className="mt-5 font-display text-[clamp(2.1rem,5vw,4.3rem)] leading-[1.02]">
          <T sq="Çfarë do të thotë IDE." en="What IDE stands for." />
        </h2>
        <p className="mt-5 max-w-xl text-lg text-muted-dark">
          <T sq="Katër punë, një ekip. Nga vizatimi i parë deri te certifikata në mur." en="Four jobs, one team. From the first drawing to the certificate on the wall." />
        </p>

        <div ref={ref} className="relative mt-14 grid border-t border-white/10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/4 animate-[ide-scan_9s_cubic-bezier(.65,0,.35,1)_-2s_infinite] bg-gradient-to-r from-transparent via-brand/10 to-transparent motion-reduce:hidden" />
          {LETTERS.map((l, i) => (
            <Link
              key={l.key}
              href={`/services#${l.key}`}
              className={clsx(
                "group relative flex flex-col border-white/10 py-9 sm:px-7 lg:first:pl-0",
                i < 3 && "lg:border-r",
                i % 2 === 0 && "sm:border-r lg:border-r",
                "max-lg:border-b",
              )}
            >
              <svg viewBox={l.viewBox} aria-hidden className="h-24 w-auto self-start overflow-visible sm:h-28 lg:h-32">
                {l.pieces.map((p, k) => (
                  <path
                    key={k}
                    d={p.d}
                    className={clsx(
                      "transition-[transform,opacity] duration-[1100ms] ease-[cubic-bezier(.22,.8,.24,1)] motion-reduce:transition-none",
                      l.red ? "fill-brand" : "fill-[#F2EFEA]",
                    )}
                    style={{
                      transform: seen ? "none" : `translate(${p.x ?? 0}px, ${p.y ?? 0}px)`,
                      opacity: seen ? 1 : 0,
                      transitionDelay: `${i * 120}ms`,
                    }}
                  />
                ))}
              </svg>
              <h3 className="mt-8 font-display text-xl">
                <T sq={l.name.sq} en={l.name.en} />
              </h3>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-brand">
                <T sq={l.name.en} en={l.name.sq} />
              </p>
              <p className="mt-4 max-w-[30ch] text-[15px] leading-relaxed text-muted-dark">
                <T sq={l.text.sq} en={l.text.en} />
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 group-hover:text-white">
                <T sq="Mëso më shumë" en="Learn more" />
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
