import type { Metadata } from "next";
import { getExplorerItems } from "@/lib/catalog/explorer-data";
import { Suspense } from "react";
import { ShopExplorer, ShopExplorerFromUrl } from "@/components/shop/ShopExplorer";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "The EDELRID range at IDE Cert: climbing equipment, work-at-height PPE and adventure-park systems. Prices incl. VAT; send a request and we confirm price and delivery.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const items = await getExplorerItems();
  const props = {
    items: items,
    kicker: "Shop · Official EDELRID partner",
    title: "EDELRID gear for every height.",
    lede: "Find what you need by what it is for, by category or by name. Add items to your request and send it. We reply with the final price and delivery date.",
  };
  return (
    <Suspense fallback={<ShopExplorer {...props} />}>
      <ShopExplorerFromUrl {...props} />
    </Suspense>
  );
}
