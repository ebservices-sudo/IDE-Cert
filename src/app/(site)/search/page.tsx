import type { Metadata } from "next";
import { getExplorerItems } from "@/lib/catalog/explorer-data";
import { Suspense } from "react";
import { T } from "@/lib/i18n/T";
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
    kicker: <T sq="Dyqani · Kërkim" en="Shop · Search" />,
    title: <T sq="Kërko në dyqan" en="Search the shop" />,
    lede: <T sq="Kërkoni sipas emrit të produktit, kategorisë, madhësisë, gjatësisë ose numrit të artikullit EDELRID." en="Search by product name, category, size, length or EDELRID item number." />,
  };
  return (
    <Suspense fallback={<ShopExplorer {...props} />}>
      <ShopExplorerFromUrl {...props} />
    </Suspense>
  );
}
