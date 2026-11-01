"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Photo as P } from "@/lib/projectPhotos";
import { useLang } from "@/lib/i18n/useLang";
import { Photo } from "./Photo";

// All of a project's photos: a masonry grid whose tiles rise in as they scroll into view,
// and a full-screen viewer (arrow keys, swipe, Esc).
export function Gallery({ photos, name, drawings = false }: { photos: P[]; name: string; drawings?: boolean }) {
  const { lang } = useLang();
  const [open, setOpen] = useState<number | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const touch = useRef<number | null>(null);
  const label = (i: number) => (lang === "en" ? `${name}, photo ${i + 1} of ${photos.length}` : `${name}, foto ${i + 1} nga ${photos.length}`);

  useEffect(() => {
    const tiles = [...(grid.current?.querySelectorAll<HTMLElement>(".pr-tile") ?? [])];
    const io = new IntersectionObserver(
      (es) => {
        let k = 0;
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.style.setProperty("--i", String(k++ % 4));
          el.setAttribute("data-in", "");
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    tiles.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [photos.length]);

  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);
  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);

  useEffect(() => {
    if (open === null) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    addEventListener("keydown", key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    return () => {
      removeEventListener("keydown", key);
      document.body.style.overflow = prev;
    };
  }, [open === null, go, close]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div ref={grid} className="pr-grid">
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            className={drawings ? "pr-tile pr-tile-d" : "pr-tile"}
            onClick={(e) => {
              opener.current = e.currentTarget;
              setOpen(i);
            }}
            aria-label={label(i)}
          >
            <div style={{ aspectRatio: `${p.w} / ${p.h}` }}>
              <Photo photo={p} alt="" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="h-full w-full" />
            </div>
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="pr-lb" role="dialog" aria-modal="true" aria-label={label(open)}>
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <p className="font-mono text-xs tracking-[0.14em]">
              {String(open + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
              <span className="ml-3 text-white/60">{name}</span>
            </p>
            <button ref={closeBtn} type="button" onClick={close} aria-label={lang === "en" ? "Close" : "Mbyll"}>
              <X aria-hidden className="size-5" />
            </button>
          </div>
          <div
            className="pr-lb-img"
            onClick={(e) => e.target === e.currentTarget && close()}
            onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touch.current === null) return;
              const dx = e.changedTouches[0].clientX - touch.current;
              touch.current = null;
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- full-size web copy */}
            <img key={open} src={photos[open].src} alt={label(open)} />
          </div>
          <div className="flex items-center justify-center gap-3 px-4 py-4">
            <button type="button" onClick={() => go(-1)} aria-label={lang === "en" ? "Previous photo" : "Foto e mëparshme"}>
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label={lang === "en" ? "Next photo" : "Foto tjetër"}>
              <ChevronRight aria-hidden className="size-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
