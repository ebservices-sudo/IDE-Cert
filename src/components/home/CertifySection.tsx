"use client";

import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { T } from "@/lib/i18n/T";

// The six kinds of installation IDE Cert inspects, drawn in the same line style as the
// home page hero. Icons draw themselves once the grid scrolls into view.
const installations = [
  {
    name: <T sq="Tirolezë" en="Zip lines" />,
    text: <T sq="Kabllo, ankorime, trolej dhe sisteme frenimi." en="Cables, anchors, trolleys and brake systems." />,
    icon: (
      <>
        <path pathLength={1} d="M6 60V14M2 60h10M4 14h12" />
        <path pathLength={1} className="text-brand" d="M10 14L60 38" />
        <path pathLength={1} d="M27 22.5l7 3.4M30 24.5v9" />
        <circle pathLength={1} cx="27" cy="38" r="3.4" />
        <path pathLength={1} d="M30 34l-1 11 6 7 5-1" />
      </>
    ),
  },
  {
    name: <T sq="Parqe me litarë" en="Rope parks" />,
    text: <T sq="Platforma, ura, pemë dhe linja të vazhdueshme sigurie." en="Platforms, bridges, trees and continuous belay lines." />,
    icon: (
      <>
        <path pathLength={1} d="M14 60V24M50 60V24" />
        <circle pathLength={1} cx="14" cy="15" r="9" />
        <circle pathLength={1} cx="50" cy="15" r="9" />
        <path pathLength={1} className="text-brand" d="M14 28Q32 37 50 28" />
        <path pathLength={1} d="M14 38Q32 48 50 38M23 32v10M32 34v11M41 32v10" />
      </>
    ),
  },
  {
    name: <T sq="Via ferrata" en="Via ferrata" />,
    text: <T sq="Shufra, kabllo çeliku dhe ankorime në shkëmb." en="Rungs, steel cables and rock anchors." />,
    icon: (
      <>
        <path pathLength={1} d="M30 2L22 16L32 28L24 42L34 62" />
        <path pathLength={1} d="M38 14v-4h9v4M40 30v-4h9v4M38 46v-4h9v4" />
        <path pathLength={1} className="text-brand" d="M54 4L58 30L54 60" />
      </>
    ),
  },
  {
    name: <T sq="Mure ngjitjeje" en="Climbing walls" />,
    text: <T sq="Struktura, panele, mbajtëse dhe pika sigurimi." en="Structure, panels, holds and belay points." />,
    icon: (
      <>
        <path pathLength={1} d="M10 58L14 6H52L48 58Z" />
        <circle pathLength={1} cx="22" cy="16" r="2.6" />
        <circle pathLength={1} cx="40" cy="22" r="2.6" />
        <circle pathLength={1} cx="25" cy="33" r="2.6" />
        <circle pathLength={1} cx="42" cy="41" r="2.6" />
        <circle pathLength={1} cx="21" cy="48" r="2.6" />
        <path pathLength={1} className="text-brand" d="M32 9V58" />
      </>
    ),
  },
  {
    name: <T sq="Vinça kullë" en="Tower cranes" />,
    text: <T sq="Struktura, kabllo ngritjeje, frena dhe kufizues ngarkese." en="Structure, hoist ropes, brakes and load limiters." />,
    icon: (
      <>
        <path pathLength={1} d="M18 60V10M24 60V10M18 20l6 8M24 28l-6 8M18 36l6 8M24 44l-6 8" />
        <path pathLength={1} d="M4 10H62M8 16H62M18 10L21 2L24 10" />
        <path pathLength={1} className="text-brand" d="M46 16V36" />
        <path pathLength={1} d="M42 36h8v5h-8Z" />
      </>
    ),
  },
  {
    name: <T sq="Ashensorë" en="Lifts" />,
    text: <T sq="Kabina, dyer, kabllo dhe frena sigurie." en="Cars, doors, ropes and safety brakes." />,
    icon: (
      <>
        <path pathLength={1} d="M14 4H50V60H14Z" />
        <path pathLength={1} d="M14 14H50M32 18V60" />
        <path pathLength={1} className="text-brand" d="M27 9h10" />
        <path pathLength={1} d="M24 34l-4 4 4 4M40 34l4 4-4 4" />
      </>
    ),
  },
];

export function CertifySection() {
  const ref = useRef<HTMLUListElement>(null);
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
    <section id="certify" className="scroll-mt-20 py-16 sm:py-20" aria-labelledby="certify-title">
      <Container>
        <SectionHeading
          id="certify-title"
          kicker={<T sq="Çfarë inspektojmë" en="What we inspect" />}
          title={<T sq="Gjithçka që punon lart" en="Everything that works up high" />}
          description={<T sq="Gjashtë lloje instalimesh, një rregull: të sigurta për njerëzit që i përdorin." en="Six kinds of installation, one rule: safe for the people who use them." />}
          action={{ href: "/services#inspection", label: <T sq="Rreth inspektimit" en="About inspection" /> }}
        />
        <ul ref={ref} className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {installations.map((it, i) => (
            <li
              key={i}
              className="rounded-xl border border-line bg-white p-6 transition-colors hover:border-ink/25"
            >
              <svg
                viewBox="0 0 64 64"
                aria-hidden
                className="size-14 fill-none stroke-current text-ink [&_*]:[stroke-dasharray:1_1] [&_*]:[transition:stroke-dashoffset_1.6s_cubic-bezier(.22,.8,.24,1)] [&_*]:[vector-effect:non-scaling-stroke] motion-reduce:[&_*]:![stroke-dashoffset:0]"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <g style={{ strokeDashoffset: seen ? 0 : 1, transitionDelay: `${i * 90}ms` }} className="[&_*]:[stroke-dashoffset:inherit] [&_*]:[transition-delay:inherit]">
                  {it.icon}
                </g>
              </svg>
              <h3 className="mt-6 font-display text-lg">{it.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{it.text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <ButtonLink href="/services#request" variant="dark">
            <T sq="Kërko inspektim" en="Request an inspection" />
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
