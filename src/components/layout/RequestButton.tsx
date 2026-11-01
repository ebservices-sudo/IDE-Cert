"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { useCart } from "@/lib/cart/store";
import { T } from "@/lib/i18n/T";
import { useLang } from "@/lib/i18n/useLang";

/** The visitor's request list (stored like a cart), shown as the red button in the header. */
export function RequestButton() {
  const { count } = useCart();
  const { t } = useLang();
  const label = count ? t(`Kërkesa juaj, ${count} artikuj`, `Your request, ${count} ${count === 1 ? "item" : "items"}`) : t("Kërkesa juaj", "Your request");
  return (
    <Link
      href="/cart"
      aria-label={label}
      className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-brand-strong pl-3 pr-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b5252a] sm:pl-4"
    >
      <ClipboardList aria-hidden className="size-4 sm:hidden" />
      <span className="hidden sm:inline">
        <T sq="Kërkesa" en="Request" />
      </span>
      <span className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-white px-1.5 text-[11px] font-bold leading-none text-brand-strong tabular-nums">
        {count}
      </span>
    </Link>
  );
}
