"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { mainNav } from "@/config/site";
import { T } from "@/lib/i18n/T";

// Plain text links: the shop first (marked with the red dot), then company pages.
const links = [{ label: "Shop", labelSq: "Dyqani", href: "/shop" }, ...mainNav];

export function DesktopNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="ml-auto hidden xl:block">
      <ul className="flex items-center gap-7">
        {links.map((l) => {
          const shop = l.href === "/shop";
          const current = shop ? path.startsWith("/shop") || path === "/search" : !l.href.includes("#") && path.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={current ? "page" : undefined}
                className={clsx("inline-flex items-center gap-2 text-[15px] transition-colors hover:text-white", current || shop ? "text-white" : "text-white/60")}
              >
                {shop && <span aria-hidden className="size-[7px] rounded-full bg-brand" />}
                <T sq={l.labelSq} en={l.label} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
