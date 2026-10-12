import "server-only";
import netPrices from "../../../data/catalog/net-prices.json";

// EDELRID dealer net prices (excl. VAT). Imported only by admin pages, which
// render on the server for signed-in admins — never pass these to client components.

type NetPrice = { net: number; unit: string; list: string };
const prices = netPrices.prices as Record<string, NetPrice>;

export function baseNetPrice(sku: string): NetPrice | undefined {
  return prices[sku];
}
