"use client";

import { useEffect, useState } from "react";
import type { Photo as P } from "@/lib/projectPhotos";
import { Container } from "@/components/ui/Container";
import { Photo } from "./Photo";

const DUR = 6000;

// The projects hero: each project's cover photo in turn, cross-fading with a slow drift.
// The project names underneath show which one is on screen and switch it on click.
export function Slideshow({
  slides,
  children,
}: {
  slides: { name: string; photo?: P }[];
  children: React.ReactNode;
}) {
  const shown = slides.filter((s) => s.photo);
  const [on, setOn] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (
      shown.length < 2 ||
      paused ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const t = setTimeout(() => setOn((i) => (i + 1) % shown.length), DUR);
    return () => clearTimeout(t);
  }, [on, paused, shown.length]);

  useEffect(() => {
    const vis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", vis);
    return () => document.removeEventListener("visibilitychange", vis);
  }, []);

  return (
    <>
      <div className="pr-slides" aria-hidden="true">
        {shown.map((s, i) => (
          <div
            key={s.name}
            className="pr-slide"
            data-on={i === on ? "" : undefined}
          >
            <Photo photo={s.photo!} alt="" sizes="100vw" priority={i === 0} />
          </div>
        ))}
      </div>
      <div className="pr-hero-in">
        <Container className="pb-12 pt-24 sm:pb-16">
          {children}
          {shown.length > 1 && (
            <div
              className="pr-names mt-8"
              style={{ "--pr-dur": `${DUR}ms` } as React.CSSProperties}
            >
              {shown.map((s, i) => (
                <button
                  key={s.name}
                  type="button"
                  className="pr-name"
                  data-on={i === on ? "" : undefined}
                  aria-pressed={i === on}
                  onClick={() => setOn(i)}
                >
                  {s.name}
                  <i aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </Container>
      </div>
    </>
  );
}
