"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Mail, Menu, Phone, X } from "lucide-react";
import { subcategoryHref, worldHref, worlds } from "@/config/catalog";
import { mainNav, site } from "@/config/site";
import { Logo } from "@/components/brand/Logo";
import { T } from "@/lib/i18n/T";
import { useLang } from "@/lib/i18n/useLang";
import { LangToggle } from "./LangToggle";

// Full-screen menu on a native <dialog>: focus trap, Escape and inert background come built in.
export function MobileNav() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("Hap menunë", "Open menu")}
        aria-haspopup="dialog"
        className="inline-flex size-10 items-center justify-center rounded-md text-white/85 hover:bg-white/5 hover:text-white xl:hidden"
      >
        <Menu aria-hidden className="size-5" />
      </button>

      <dialog
        ref={dialogRef}
        aria-label={t("Menuja", "Menu")}
        onClose={close}
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-ink p-0 text-white backdrop:bg-black/60"
      >
        <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-ink-line bg-ink px-4 sm:px-6">
          <Link href="/" onClick={close} aria-label="IDE Cert home">
            <Logo tone="light" className="h-9 w-auto" />
          </Link>
          <button
            type="button"
            onClick={close}
            aria-label={t("Mbyll menunë", "Close menu")}
            className="inline-flex size-10 items-center justify-center rounded-md text-white/85 hover:bg-white/5 hover:text-white"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>

        <nav aria-label="Mobile" className="px-4 py-6 sm:px-6">
          <Link href="/shop" onClick={close} className="flex items-center gap-2.5 py-2 font-display text-lg uppercase">
            <span aria-hidden className="size-2 rounded-full bg-brand" />
            <T sq="Të gjitha produktet" en="All products" />
          </Link>
          <LangToggle className="mt-4 w-fit" />
          <p className="kicker mt-6 text-muted-dark">
            <T sq="Dyqani sipas gamës" en="Shop by range" />
          </p>
          <div className="mt-3 divide-y divide-ink-line border-y border-ink-line">
            {worlds.map((world) => (
              <details key={world.slug} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
                  <span className="font-display text-lg uppercase"><T sq={world.nameSq} en={world.name} /></span>
                  <ChevronDown aria-hidden className="size-5 text-muted-dark transition-transform group-open:rotate-180" />
                </summary>
                <ul className="pb-4">
                  <li>
                    <Link
                      href={worldHref(world.slug)}
                      onClick={close}
                      className="block py-2 text-sm font-semibold text-brand"
                    >
                      <T sq={`Të gjitha: ${world.nameSq}`} en={`All ${world.name}`} />
                    </Link>
                  </li>
                  {world.subcategories.map((sub) => (
                    <li key={sub.slug}>
                      <Link
                        href={subcategoryHref(world.slug, sub.slug)}
                        onClick={close}
                        className="block py-2 text-sm text-white/80 hover:text-white"
                      >
                        <T sq={sub.nameSq} en={sub.name} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>

          <ul className="mt-6 space-y-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={close} className="block py-2.5 font-display text-lg uppercase">
                  <T sq={item.labelSq} en={item.label} />
                </Link>
              </li>
            ))}
            <li>
              <Link href="/cart" onClick={close} className="block py-2.5 font-display text-lg uppercase">
                <T sq="Kërkesa juaj" en="Your request" />
              </Link>
            </li>
            <li>
              <Link href="/account" onClick={close} className="block py-2.5 font-display text-lg uppercase">
                <T sq="Llogaria" en="Account" />
              </Link>
            </li>
          </ul>

          <div className="mt-8 space-y-3 border-t border-ink-line pt-6 text-sm text-muted-dark">
            {site.phones.map((p) => (
              <a key={p.href} href={p.href} className="flex items-center gap-2 hover:text-white">
                <Phone aria-hidden className="size-4" />
                {p.display}
              </a>
            ))}
            <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-white">
              <Mail aria-hidden className="size-4" />
              {site.email}
            </a>
          </div>
        </nav>
      </dialog>
    </>
  );
}
