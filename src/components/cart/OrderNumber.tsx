"use client";

import { useSearchParams } from "next/navigation";

export function OrderNumber() {
  const order = useSearchParams().get("order");
  const number = order && /^IDE-\d{4}-\d{5}$/.test(order) ? order : null;
  return (
    <p className="mt-4 text-lg text-muted">
      {number ? (
        <>
          Your order number is <strong className="text-ink">{number}</strong>.
        </>
      ) : (
        "Your order has been received."
      )}
    </p>
  );
}
