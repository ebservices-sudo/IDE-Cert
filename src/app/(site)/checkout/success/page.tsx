import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";
import { shippingZones } from "@/config/shipping";
import { site } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Order received",
  robots: { index: false },
};

export default function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  return (
    <Container className="py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <CheckCircle2 aria-hidden className="mx-auto size-12 text-brand-strong" />
        <h1 className="mt-6 font-display text-3xl sm:text-4xl">Thank you for your order</h1>
        <Suspense fallback={<p className="mt-4 text-lg text-muted">Your order has been received.</p>}>
          <OrderNumber searchParams={searchParams} />
        </Suspense>
        <ol className="mx-auto mt-10 max-w-lg space-y-4 text-left">
          {[
            `We check your items with EDELRID and email you a proforma invoice with our bank details${shippingZones.some((z) => z.rateCents == null) ? " and the shipping cost" : ""}.`,
            "You pay by bank transfer, quoting your order number.",
            "We order your items from EDELRID and confirm the delivery date.",
          ].map((step, i) => (
            <li key={step} className="flex gap-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-white">{i + 1}</span>
              <span className="pt-1 leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-sm text-muted">
          A confirmation is on its way to your email. Questions? Call {site.phones[0].display} or write to {site.email}.
        </p>
        <div className="mt-8">
          <ButtonLink href="/shop" variant="dark">
            Continue shopping
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}

async function OrderNumber({ searchParams }: Pick<PageProps<"/checkout/success">, "searchParams">) {
  const { order } = await searchParams;
  const number = typeof order === "string" && /^IDE-\d{4}-\d{5}$/.test(order) ? order : null;
  return (
    <p className="mt-4 text-lg text-muted">
      {number ? (
        <>
          Your order number is <strong className="text-ink">{number}</strong>.
        </>
      ) : (
        "Your order has been received."
      )}
    </p>
  );
}
