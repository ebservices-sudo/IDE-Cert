import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <Container className="py-10 lg:py-14">
      <h1 className="font-display text-3xl sm:text-4xl">Your cart</h1>
      <div className="mt-8">
        <CartView />
      </div>
    </Container>
  );
}
