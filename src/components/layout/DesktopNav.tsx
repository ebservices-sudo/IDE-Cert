"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { subcategoryHref, worldHref, worlds } from "@/config/catalog";
import { mainNav } from "@/config/site";
import { Container } from "@/components/ui/Container";

const navLink =
  "inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm font-semibold text-white/85 transition-colors hover:bg-white/5 hover:text-white";

export function DesktopNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  // Hover opens the menu for mouse users only; touch and keyboard use the button.
  // A click right after a hover-open must keep the menu open instead of toggling it shut.
  const openedByHover = useRef(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        openedByHover.current = false;
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return;
      openedByHover.current = false;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const onEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(closeTimer.current);
    if (!open) openedByHover.current = true;
    setOpen(true);
  };
  const onLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    closeTimer.current = window.setTimeout(() => {
      openedByHover.current = false;
      setOpen(false);
    }, 180);
  };
  const onButtonClick = () => {
    if (openedByHover.current) {
      openedByHover.current = false;
      return;
    }
    setOpen((o) => !o);
  };
  const close = () => {
    openedByHover.current = false;
    setOpen(false);
  };

  return (
    <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
      <div ref={wrapRef} onPointerEnter={onEnter} onPointerLeave={onLeave}>
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onButtonClick}
          className={clsx(navLink, open && "bg-white/5 text-white")}
        >
          Shop
          <ChevronDown aria-hidden className={clsx("size-4 transition-transform", open && "rotate-180")} />
        </button>

        <div
          id={panelId}
          hidden={!open}
          className="absolute inset-x-0 top-full border-t border-ink-line bg-white text-ink shadow-2xl shadow-black/20"
        >
          <Container className="grid grid-cols-12 gap-10 py-9">
            {worlds.map((world) => (
              <div key={world.slug} className="col-span-4">
                <Link
                  href={worldHref(world.slug)}
                  onClick={close}
                  className="group flex items-baseline justify-between gap-4 border-b border-line pb-3"
                >
                  <span className="font-display text-xl uppercase">{world.name}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-strong">
                    Shop all
                    <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
                <p className="mt-2 text-sm text-muted">{world.tagline}</p>
                <ul className="mt-4 grid grid-cols-2 gap-x-6">
                  {world.subcategories.map((sub) => (
                    <li key={sub.slug}>
                      <Link
                        href={subcategoryHref(world.slug, sub.slug)}
                        onClick={close}
                        className="block py-1.5 text-sm text-ink/80 transition-colors hover:text-brand-strong"
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <aside className="col-span-4 flex flex-col rounded-lg bg-ink p-7 text-white">
              <p className="kicker text-brand">Services</p>
              <p className="mt-3 font-display text-xl leading-tight">Need equipment inspected or certified?</p>
              <p className="mt-3 text-sm text-muted-dark">
                Inspection, design, engineering and certification by the IDE Cert team.
              </p>
              <Link
                href="/services"
                onClick={close}
                className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-white hover:text-brand"
              >
                Explore services
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </aside>
          </Container>
        </div>
      </div>

      {mainNav.map((item) => (
        <Link key={item.href} href={item.href} className={navLink}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
