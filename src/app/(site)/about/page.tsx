import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { BuildStepNotice } from "@/components/layout/BuildStepNotice";

export const metadata: Metadata = {
  title: "About",
  description: "About IDE Cert and its founder, Dr. sc. Shpetim Lajqi.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader kicker="About" title="About IDE Cert" breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <BuildStepNotice step={6} what="Company story, the founder and expertise are built in step 6." />
    </>
  );
}
