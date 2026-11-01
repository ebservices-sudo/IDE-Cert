import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Your request",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <Container className="py-10 lg:py-14">
      <p className="kicker text-brand-strong">Request · no payment now</p>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl">Your request</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">Check the items and quantities, then send the list. We confirm the final price, delivery date and send a proforma invoice.</p>
      <div className="mt-8">
        <CartView />
      </div>
    </Container>
  );
}
