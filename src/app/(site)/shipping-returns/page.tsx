import type { Metadata } from "next";
import Link from "next/link";
import { shippingZones } from "@/config/shipping";
import { shop, site } from "@/config/site";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description: "Delivery across Kosovo, the Balkans and the EU; returns and defects.",
  alternates: { canonical: "/shipping-returns" },
};

const eur = (cents: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(cents / 100);

// TODO(client): draft — review before launch; add rates in src/config/shipping.ts.
export default function ShippingReturnsPage() {
  return (
    <LegalPage title="Shipping & returns">
      <h2>Where we deliver</h2>
      <ul>
        {shippingZones.map((z) => (
          <li key={z.id}>
            <strong>{z.name}</strong>:{" "}
            {z.rateCents == null
              ? "shipping cost confirmed on your proforma invoice before you pay"
              : `${eur(z.rateCents)} per order${z.freeFromCents != null ? `, free from ${eur(z.freeFromCents)}` : ""}`}
            .
          </li>
        ))}
      </ul>
      <p>For deliveries outside Kosovo, customs duties and import VAT may apply. We confirm them on the proforma invoice.</p>

      <h2>Delivery time</h2>
      <p>
        We order every item from EDELRID after your payment arrives, so you always receive current production.{" "}
        {shop.leadTime ? `Delivery usually takes ${shop.leadTime}.` : "We confirm the expected delivery date by email once we have ordered."}
      </p>

      <h2>Returns</h2>
      <p>
        If you want to return an item, contact us first at <a href={`mailto:${site.email}`}>{site.email}</a> with your order number. Items must
        be unused, complete and in their original packaging. For safety reasons we cannot take back personal protective equipment that has been
        used.
      </p>
      <p>Items made to your specification — rope cut to length, ropes with terminations and other custom items — cannot be returned unless they are defective.</p>

      <h2>Defects and complaints</h2>
      <p>
        If an item arrives damaged or is defective, contact us as soon as possible with your order number and photos. We handle the claim with
        EDELRID and repair, replace or refund the item. Do not use equipment that you suspect is damaged.
      </p>

      <h2>Questions</h2>
      <p>
        Call {site.phones[0].display} or use the <Link href="/contact">contact form</Link>.
      </p>
    </LegalPage>
  );
}
