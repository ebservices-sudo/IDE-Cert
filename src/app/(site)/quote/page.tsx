import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { QuoteFormFromUrl } from "@/components/forms/QuoteFormFromUrl";
import { Container } from "@/components/ui/Container";
import { T } from "@/lib/i18n/T";

export const metadata: Metadata = {
  title: "Request a quote",
  description:
    "Custom rope lengths, sewn terminations, whole production batches and larger quantities of EDELRID equipment — ask IDE Cert for a quote.",
};

export default function QuotePage() {
  return (
    <>
      <PageHeader
        kicker={<T sq="Ofertë" en="Quote" />}
        title={<T sq="Kërkoni ofertë" en="Request a quote" />}
        description={
          <T
            sq="Gjatësi të veçanta litari, skaje të qepura, seri të tëra prodhimi ose sasi më të mëdha. Na tregoni çfarë ju duhet dhe ju kthejmë çmimet dhe afatet e dorëzimit."
            en="Custom rope lengths, sewn terminations, whole production batches or larger quantities. Tell us what you need and we reply with prices and delivery times."
          />
        }
        breadcrumbs={[{ label: <T sq="Ballina" en="Home" />, href: "/" }, { label: <T sq="Kërkoni ofertë" en="Request a quote" /> }]}
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

