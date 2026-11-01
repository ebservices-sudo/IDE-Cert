"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import { T } from "@/lib/i18n/T";
import { useLang } from "@/lib/i18n/useLang";

type Suggestion = { name: string; href: string; image: string | null; price: string; category: string };

/** Header search: a dialog with instant suggestions; Enter opens the full results page. */
export function SearchDialog({ className }: { className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [result, setResult] = useState<{ q: string; total: number; items: Suggestion[] } | null>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const ctrl = new AbortController();
    const t = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        .then((r) => r.json() as Promise<{ q: string; total: number; items: Suggestion[] }>)
        .then(setResult)
        .catch(() => {});
    }, 150);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [q]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onClose = () => document.documentElement.style.removeProperty("overflow");
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  const open = () => {
    dialog.current?.showModal();
    document.documentElement.style.overflow = "hidden";
    input.current?.select();
  };
  const close = () => dialog.current?.close();

  const showResults = q.trim().length >= 2 && result && result.q === q.trim();

  return (
    <>
      <button type="button" onClick={open} aria-label={t("Kërko produkte", "Search products")} className={className}>
        <Search aria-hidden className="size-5" />
      </button>
      <dialog
        ref={dialog}
        aria-label={t("Kërko produkte", "Search products")}
        className="mx-auto mt-0 w-full max-w-2xl bg-transparent p-0 backdrop:bg-ink/70 sm:mt-20"
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
      >
        <div className="overflow-hidden bg-white text-ink shadow-2xl sm:rounded-xl">
          <form action="/search" method="get" role="search" onSubmit={close} className="flex items-center gap-3 border-b border-line px-4">
            <Search aria-hidden className="size-5 shrink-0 text-muted" />
            <input
              ref={input}
              name="q"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Kërko litarë, rripa, numra artikujsh…", "Search ropes, harnesses, item numbers…")}
              aria-label={t("Kërko produkte", "Search products")}
              aria-controls={listId}
              autoComplete="off"
              className="h-16 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
            />
            <button type="button" onClick={close} className="grid size-10 shrink-0 place-items-center rounded-md hover:bg-mist">
              <X aria-hidden className="size-5" />
              <span className="sr-only"><T sq="Mbyll kërkimin" en="Close search" /></span>
            </button>
          </form>
          <div id={listId} aria-live="polite" className="max-h-[60dvh] overflow-y-auto">
            {showResults ? (
              result.items.length ? (
                <>
                  <ul className="divide-y divide-line">
                    {result.items.map((s) => (
                      <li key={s.href}>
                        <Link href={s.href} onClick={close} className="flex items-center gap-4 px-4 py-3 hover:bg-mist">
                          <span className="relative size-14 shrink-0 overflow-hidden rounded border border-line bg-mist">
                            {s.image && <Image src={s.image} alt="" fill sizes="56px" className="object-contain p-1 mix-blend-multiply" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold">{s.name}</span>
                            <span className="block truncate text-xs text-muted">{s.category}</span>
                          </span>
                          <span className="shrink-0 text-sm font-semibold tabular-nums">{s.price}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/shop?q=${encodeURIComponent(q.trim())}`}
                    onClick={close}
                    className="flex items-center justify-center gap-2 border-t border-line px-4 py-3.5 text-sm font-semibold text-brand-strong hover:bg-mist"
                  >
                    {result.total === 1 ? <T sq="Hap rezultatin" en="Open search results" /> : <T sq={`Shiko të gjitha ${result.total} rezultatet`} en={`See all ${result.total} results`} />}
                    <ArrowRight aria-hidden className="size-4" />
                  </Link>
                </>
              ) : (
                <p className="px-4 py-8 text-center text-sm text-muted">
                  <T
                    sq={`Nuk u gjet asnjë produkt për “${q.trim()}”. Provoni një emër produkti ose numër artikulli EDELRID.`}
                    en={`No products found for “${q.trim()}”. Try a product name or an EDELRID item number.`}
                  />
                </p>
              )
            ) : (
              <p className="px-4 py-6 text-sm text-muted">
                <T sq="Shkruani të paktën dy shkronja: emra produktesh, kategori ose numra artikujsh." en="Type at least two letters: product names, categories or item numbers." />
              </p>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
