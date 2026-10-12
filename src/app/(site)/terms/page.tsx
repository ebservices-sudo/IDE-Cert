import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { BuildStepNotice } from "@/components/layout/BuildStepNotice";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms and conditions of sale.",
};

export default function TermsPage() {
  return (
    <>
      <PageHeader kicker="Help" title="Terms and conditions" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Terms" }]} />
      <BuildStepNotice step={6} what="Terms and conditions are written in step 6." />
    </>
  );
}
