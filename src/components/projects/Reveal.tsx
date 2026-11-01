"use client";

import { useEffect, useRef } from "react";
import { play, rig, setD } from "./animate";

// Builds a project drawing and counts up its figures once it scrolls into view.
// Reduced motion keeps the finished drawing the server rendered.
export function Reveal({ className, children, labelledBy }: { className?: string; children: React.ReactNode; labelledBy?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = rig(el);
    setD(r, 0);
    let stop: (() => void) | undefined;
    const io = new IntersectionObserver(
      (es) => {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        stop = play(r, 2400);
      },
      { rootMargin: "0px 0px -15% 0px", threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop?.();
      setD(r, 1);
    };
  }, []);
  return (
    <article ref={ref} className={className} aria-labelledby={labelledBy}>
      {children}
    </article>
  );
}
