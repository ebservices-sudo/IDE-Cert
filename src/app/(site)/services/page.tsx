import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { BuildStepNotice } from "@/components/layout/BuildStepNotice";

export const metadata: Metadata = {
  title: "Services",
  description: "Inspection, design, engineering and certification services by IDE Cert.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader kicker="Services" title="Inspection, design, engineering and certification" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]} />
      <BuildStepNotice step={6} what="One section per service with a request-a-quote / inspection form is built in step 6." />
    </>
  );
}
