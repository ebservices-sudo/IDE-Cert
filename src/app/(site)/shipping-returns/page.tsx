import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { BuildStepNotice } from "@/components/layout/BuildStepNotice";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description: "Shipping zones, delivery times and returns at IDE Cert.",
};

export default function ShippingReturnsPage() {
  return (
    <>
      <PageHeader kicker="Help" title="Shipping & returns" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Shipping & returns" }]} />
      <BuildStepNotice step={6} what="Shipping and returns policy is written in step 6 once shipping rates are decided." />
    </>
  );
}
