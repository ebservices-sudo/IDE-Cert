import type { Metadata } from "next";
import { getExplorerItems } from "@/lib/catalog/explorer-data";
import { Suspense } from "react";
import { T } from "@/lib/i18n/T";
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
    kicker: <T sq="Dyqani" en="Shop" />,
    title: <T sq="Pajisje EDELRID për çdo lartësi." en="EDELRID gear for every height." />,
    lede: (
      <T
        sq="Gjeni atë që ju duhet sipas përdorimit, kategorisë ose emrit. Shtoni artikujt në kërkesë dhe dërgojeni. Ju kthejmë çmimin përfundimtar dhe datën e dorëzimit."
        en="Find what you need by what it is for, by category or by name. Add items to your request and send it. We reply with the final price and delivery date."
      />
    ),
  };
  return (
    <Suspense fallback={<ShopExplorer {...props} />}>
      <ShopExplorerFromUrl {...props} />
    </Suspense>
  );
}
