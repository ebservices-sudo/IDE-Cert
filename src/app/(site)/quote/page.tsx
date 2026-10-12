import type { Metadata } from "next";
import { Suspense } from "react";
import { getCatalog } from "@/lib/catalog/data";
import { optionsText } from "@/lib/orders/pricing";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuoteForm, type QuoteFormItem } from "@/components/forms/QuoteForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Request a quote",
  description:
    "Custom rope lengths, sewn terminations, whole production batches and larger quantities of EDELRID equipment — ask IDE Cert for a quote.",
};

export default function QuotePage({ searchParams }: PageProps<"/quote">) {
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
            <PrefilledQuoteForm searchParams={searchParams} />
          </Suspense>
        </div>
      </Container>
    </>
  );
}

async function PrefilledQuoteForm({ searchParams }: Pick<PageProps<"/quote">, "searchParams">) {
  const { sku } = await searchParams;
  const skus = (Array.isArray(sku) ? sku : sku ? [sku] : []).slice(0, 20);
  const { getVariant } = await getCatalog();
  const items: QuoteFormItem[] = skus.flatMap((s, i) => {
    const found = getVariant(s);
    if (!found) return [];
    const { product, variant } = found;
    return [{ key: `p${i}`, sku: s, name: [product.name, optionsText(variant.options)].filter(Boolean).join(" · "), quantity: "", details: "" }];
  });
  return <QuoteForm initialItems={items} />;
}
