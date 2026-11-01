import { redirect } from "next/navigation";

// The shop takes requests instead of orders: the request list is sent from /cart.
export default function CheckoutPage() {
  redirect("/cart");
}
