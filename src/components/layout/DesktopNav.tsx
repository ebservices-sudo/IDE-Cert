"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { mainNav } from "@/config/site";

// Plain text links: the shop first (marked with the red dot), then company pages.
const links = [{ label: "Shop", href: "/shop" }, ...mainNav];

export function DesktopNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="ml-auto hidden lg:block">
      <ul className="flex items-center gap-7">
        {links.map((l) => {
          const current = l.href === "/shop" ? path.startsWith("/shop") || path === "/search" : path.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={current ? "page" : undefined}
                className={clsx(
                  "inline-flex items-center gap-2 text-[15px] transition-colors hover:text-white",
                  current || l.href === "/shop" ? "text-white" : "text-white/65",
                )}
              >
                {l.href === "/shop" && <span aria-hidden className="size-1.5 rounded-full bg-brand" />}
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
