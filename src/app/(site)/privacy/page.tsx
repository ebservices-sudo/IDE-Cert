import type { Metadata } from "next";
import { site } from "@/config/site";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: `How ${site.legalName} handles personal data.`,
  alternates: { canonical: "/privacy" },
};

// TODO(client): draft — review before launch (see legal.reviewed in src/config/site.ts).
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy notice">
      <h2>Who is responsible</h2>
      <p>
        {site.legalName}, {site.address.street}, {site.address.locality}, {site.address.postalCode} {site.address.city}, Kosovo,{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>, is responsible for the personal data processed through this website.
      </p>

      <h2>What we collect and why</h2>
      <ul>
        <li>
          <strong>Orders</strong>: name, email, phone, delivery address and, for companies, company name, NUI and VAT number — to process and
          deliver your order, issue invoices and meet accounting obligations.
        </li>
        <li>
          <strong>Quote requests and contact messages</strong>: your details and message — to answer you.
        </li>
        <li>
          <strong>Customer accounts</strong> (optional): name, email, a securely hashed password and your order history — so you can sign in
          and see your orders.
        </li>
        <li>
          <strong>Technical data</strong>: your IP address and browser information, processed by our hosting provider to deliver the website
          and protect it against abuse.
        </li>
      </ul>

      <h2>Cookies and local storage</h2>
      <p>
        We use one cookie, and only when you sign in: it keeps your session. Your cart is stored in your browser&apos;s local storage on your
        device. We do not use advertising or analytics cookies. Our spam check (Cloudflare Turnstile) runs on forms.
      </p>

      <h2>Service providers</h2>
      <ul>
        <li>Cloudflare, Inc. — hosting, database, spam protection.</li>
        <li>Resend — sending order and account emails.</li>
      </ul>
      <p>They process data on our behalf and only for these purposes. Some providers may process data outside Kosovo and the EU.</p>

      <h2>How long we keep data</h2>
      <p>
        Order and invoice data is kept as long as accounting and tax law requires. Messages and quote requests are deleted when they are no
        longer needed. You can delete your account at any time by contacting us.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask for access to, correction or deletion of your data, and object to its processing, under Kosovo&apos;s data protection law
        and, for customers in the EU, the GDPR. Write to <a href={`mailto:${site.email}`}>{site.email}</a>. You may also complain to the
        data protection supervisory authority.
      </p>
    </LegalPage>
  );
}
