import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { QuoteFormFromUrl } from "@/components/forms/QuoteFormFromUrl";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Request a quote",
  description:
    "Custom rope lengths, sewn terminations, whole production batches and larger quantities of EDELRID equipment — ask IDE Cert for a quote.",
};

export default function QuotePage() {
  return (
    <>
      <PageHeader
        kicker="Quote"
        title="Request a quote"
        description="Custom rope lengths, sewn terminations, whole production batches or larger quantities. Tell us what you need and we reply with prices and delivery times."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Request a quote" }]}
      />
      <Container className="py-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <Suspense fallback={<QuoteForm initialItems={[]} />}>
            <QuoteFormFromUrl />
          </Suspense>
        </div>
      </Container>
    </>
  );
}

