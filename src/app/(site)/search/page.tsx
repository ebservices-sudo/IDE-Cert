import type { Metadata } from "next";
import { getExplorerItems } from "@/lib/catalog/explorer-data";
import { Suspense } from "react";
import { ShopExplorer, ShopExplorerFromUrl } from "@/components/shop/ShopExplorer";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the EDELRID range at IDE Cert by product name, category or item number.",
  robots: { index: false, follow: true },
};

/** Static page; the explorer reads ?q= from the URL and searches in the browser. */
export default async function SearchPage() {
  const items = await getExplorerItems();
  const props = {
    items: items,
    kicker: "Shop · Search",
    title: "Search the shop",
    lede: "Search by product name, category, size, length or EDELRID item number.",
  };
  return (
    <Suspense fallback={<ShopExplorer {...props} />}>
      <ShopExplorerFromUrl {...props} />
    </Suspense>
  );
}
