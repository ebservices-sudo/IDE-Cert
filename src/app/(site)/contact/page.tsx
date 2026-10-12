import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { BuildStepNotice } from "@/components/layout/BuildStepNotice";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact IDE Cert in Çagllavicë, Prishtinë: phone, email and address.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader kicker="Contact" title="Contact us" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <BuildStepNotice step={6} what="Contact form, phone numbers, email, address and map are built in step 6." />
    </>
  );
}
