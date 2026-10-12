"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/store";

export function CartButton({ className }: { className?: string }) {
  const { count } = useCart();
  return (
    <Link href="/cart" aria-label={count ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart"} className={`relative ${className ?? ""}`}>
      <ShoppingBag aria-hidden className="size-5" />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 grid min-w-[1.125rem] place-items-center rounded-full bg-brand px-1 text-[10px] font-bold leading-[1.125rem] text-white tabular-nums">
          {count}
        </span>
      )}
    </Link>
  );
}
