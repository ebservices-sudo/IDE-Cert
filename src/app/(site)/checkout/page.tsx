import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <Container className="py-10 lg:py-14">
      <h1 className="font-display text-3xl sm:text-4xl">Checkout</h1>
      <p className="mt-2 text-sm text-muted">Guest checkout — no account needed.</p>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </Container>
  );
}
