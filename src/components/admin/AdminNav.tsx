"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { FileSpreadsheet, Inbox, LayoutDashboard, MessageSquareQuote, Package, ShoppingCart } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/quotes", label: "Quotes", icon: MessageSquareQuote },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/prices", label: "Price lists", icon: FileSpreadsheet },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <aside className="shrink-0 bg-ink text-white print:hidden lg:sticky lg:top-0 lg:h-dvh lg:w-60">
      <div className="flex items-center justify-between gap-4 px-5 py-4 lg:block lg:py-6">
        <Link href="/admin" aria-label="Admin home">
          <Logo tone="light" className="h-8 w-auto" />
        </Link>
        <p className="kicker text-[0.65rem] text-muted-dark lg:mt-3">Admin</p>
      </div>
      <nav aria-label="Admin">
        <ul className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3">
          {items.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? path === href : path.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                    active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon aria-hidden className="size-4" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
