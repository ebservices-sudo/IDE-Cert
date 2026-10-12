import type { Metadata } from "next";
import Link from "next/link";
import { business } from "@/config/business";
import { site } from "@/config/site";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Terms of sale",
  description: `Terms of sale for orders placed with ${site.legalName}.`,
  alternates: { canonical: "/terms" },
};

// TODO(client): draft — review before launch (see legal.reviewed in src/config/site.ts).
export default function TermsPage() {
  return (
    <LegalPage title="Terms of sale">
      <h2>1. Who we are</h2>
      <p>
        This shop is operated by {site.legalName}, {site.address.street}, {site.address.locality}, {site.address.postalCode} {site.address.city},
        Kosovo{business.nui ? `, NUI ${business.nui}` : ""}. You can reach us at {site.phones[0].display} or{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>2. Products and information</h2>
      <p>
        We sell equipment from the EDELRID range. Descriptions, technical data, certifications and photos come from EDELRID. Where EDELRID has
        not published data for an item, the product page says so. Always read and follow the manufacturer&apos;s user manual; personal
        protective equipment must only be used by trained persons.
      </p>

      <h2>3. Prices</h2>
      <p>
        Prices are in euros and include 18% Kosovo VAT. Shipping is added as shown at checkout or, where it cannot be calculated in advance,
        confirmed on your proforma invoice before you pay. For deliveries outside Kosovo, we confirm shipping, customs and VAT on the proforma
        invoice.
      </p>

      <h2>4. How an order works</h2>
      <ol>
        <li>You place an order in the shop. You receive an email confirming that we have received it. This is not yet an acceptance.</li>
        <li>We check availability with EDELRID and send you a proforma invoice with the final amount and our bank details.</li>
        <li>The contract is concluded when you pay the proforma invoice. We then order your items from EDELRID.</li>
        <li>We confirm the expected delivery date by email and deliver to the address you gave.</li>
      </ol>
      <p>
        If an item is no longer available or the price on the proforma differs from your order, you may cancel free of charge before paying.
      </p>

      <h2>5. Payment</h2>
      <p>
        Payment is by bank transfer against the proforma invoice, quoting your order number. The proforma is valid for{" "}
        {business.proformaValidDays} days. If we do not receive payment in that time, the order lapses.
      </p>

      <h2>6. Delivery</h2>
      <p>
        We deliver to Kosovo, the Western Balkans and the European Union. Items are ordered from EDELRID for each customer, so delivery times
        depend on EDELRID; we confirm the date after your payment. See <Link href="/shipping-returns">Shipping &amp; returns</Link>.
      </p>

      <h2>7. Custom-made items</h2>
      <p>
        Rope cut to length, ropes with terminations and other items made to your specification are produced for you and cannot be returned
        unless they are defective.
      </p>

      <h2>8. Returns and defects</h2>
      <p>
        Your rights under the applicable consumer protection law are not affected. How to return an item and report a defect is described
        under <Link href="/shipping-returns">Shipping &amp; returns</Link>. For safety reasons we cannot accept the return of personal protective
        equipment that has been used.
      </p>

      <h2>9. Business customers</h2>
      <p>
        Companies can enter their company name and NUI at checkout; the invoice is then issued to the company. Larger quantities and special
        configurations are available through our <Link href="/quote">quote form</Link>.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about these terms: <a href={`mailto:${site.email}`}>{site.email}</a>, {site.phones[0].display}.
      </p>
    </LegalPage>
  );
}
