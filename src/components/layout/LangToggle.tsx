"use client";

import clsx from "clsx";
import { setLang, useLang } from "@/lib/i18n/useLang";

/** SQ / EN switch in the header. */
export function LangToggle({ className }: { className?: string }) {
  const { lang } = useLang();
  return (
    <div role="group" aria-label="Gjuha / Language" className={clsx("flex rounded-full border border-white/30 p-[3px]", className)}>
      {(["sq", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={clsx(
            "h-8 min-w-10 rounded-full px-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] transition-colors",
            lang === l ? "bg-white text-ink" : "text-white/65 hover:text-white",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
