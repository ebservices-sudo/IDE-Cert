"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { turnstileSiteKey } from "@/config/turnstile";

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

/** If the widget never produces a token (e.g. blocked), let people submit anyway; the server decides. */
const READY_FALLBACK_MS = 8000;

/**
 * Whether a form may be submitted: true without Turnstile, otherwise once a
 * token is ready. Tokens are single-use, so pass a new `resetKey` per attempt.
 */
export function useTurnstile(resetKey: unknown) {
  const [ready, setReady] = useState(!turnstileSiteKey);
  const [lastKey, setLastKey] = useState(resetKey);
  if (turnstileSiteKey && lastKey !== resetKey) {
    setLastKey(resetKey);
    setReady(false);
  }
  useEffect(() => {
    if (ready) return;
    const t = window.setTimeout(() => setReady(true), READY_FALLBACK_MS);
    return () => window.clearTimeout(t);
  }, [ready, resetKey]);
  return { ready, widget: <Turnstile resetKey={resetKey} onReady={setReady} /> };
}

export function Turnstile({ resetKey, onReady }: { resetKey?: unknown; onReady?: (ready: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  });

  const render = () => {
    if (!ref.current || !window.turnstile || widget.current) return;
    // "flexible" needs at least 300px; very narrow screens get the compact widget.
    const size = ref.current.offsetWidth < 300 ? "compact" : "flexible";
    widget.current = window.turnstile.render(ref.current, {
      sitekey: turnstileSiteKey,
      theme: "light",
      size,
      callback: () => onReadyRef.current?.(true),
      "expired-callback": () => onReadyRef.current?.(false),
      "error-callback": () => onReadyRef.current?.(false),
    });
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
