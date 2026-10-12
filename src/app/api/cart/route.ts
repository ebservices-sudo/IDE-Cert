import type { NextRequest } from "next/server";
import { priceCart } from "@/lib/orders/pricing";

/** Prices cart lines from the catalogue: POST { lines: [{ sku, qty }] }. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const raw = (body as { lines?: unknown })?.lines;
  if (!Array.isArray(raw)) return Response.json({ error: "Expected { lines: [] }" }, { status: 400 });
  const lines = raw
    .filter((l): l is { sku: string; qty: number } => typeof l?.sku === "string" && /^\d{12}$/.test(l.sku))
    .map((l) => ({ sku: l.sku, qty: Number(l.qty) }));
  return Response.json(await priceCart(lines));
}
