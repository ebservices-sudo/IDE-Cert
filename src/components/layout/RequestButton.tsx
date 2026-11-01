"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { useCart } from "@/lib/cart/store";

/** The visitor's request list (stored like a cart), shown as the red button in the header. */
export function RequestButton() {
  const { count } = useCart();
  const label = count ? `Your request, ${count} ${count === 1 ? "item" : "items"}` : "Your request";
  return (
    <Link
      href="/cart"
      aria-label={label}
      className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-strong pl-3 pr-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b5252a] sm:pl-4"
    >
      <ClipboardList aria-hidden className="size-4 sm:hidden" />
      <span className="hidden sm:inline">Request</span>
      <span className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-white px-1.5 text-[11px] font-bold leading-none text-brand-strong tabular-nums">
        {count}
      </span>
    </Link>
  );
}
