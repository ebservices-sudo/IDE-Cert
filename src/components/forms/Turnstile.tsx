"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

// Cloudflare Turnstile spam check. Renders explicitly so it works after
// client-side navigation; the widget adds a hidden "cf-turnstile-response"
// input to the surrounding form.

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
      reset: (id?: string) => void;
    };
  }
}

export const turnstileSiteKey =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || (process.env.NODE_ENV === "production" ? "" : "1x00000000000000000000AA");

export function Turnstile({ resetKey }: { resetKey?: unknown }) {
  const ref = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);

  const render = () => {
    if (!ref.current || !window.turnstile || widget.current) return;
    widget.current = window.turnstile.render(ref.current, { sitekey: turnstileSiteKey, theme: "light", size: "flexible" });
  };

  useEffect(() => {
    if (!turnstileSiteKey) return;
    render();
    return () => {
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, []);

  // A token is single-use: reset after each submission attempt.
  useEffect(() => {
    if (resetKey !== undefined && widget.current) window.turnstile?.reset(widget.current);
  }, [resetKey]);

  if (!turnstileSiteKey) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={render} />
      <div ref={ref} className="min-h-[65px]" />
    </>
  );
}
