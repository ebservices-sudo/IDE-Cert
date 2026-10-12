import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { BuildStepNotice } from "@/components/layout/BuildStepNotice";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy policy.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader kicker="Help" title="Privacy policy" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy" }]} />
      <BuildStepNotice step={6} what="The privacy policy is written in step 6." />
    </>
  );
}
