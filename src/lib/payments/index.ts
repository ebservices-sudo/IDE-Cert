// Payment methods. Bank transfer against a proforma invoice is live. Card
// payments will go through a Kosovo bank's e-commerce gateway (ProCredit,
// Raiffeisen or TEB — not decided yet); implement CardGateway for the chosen
// bank and enable it here. Stripe and PayPal do not serve merchants in Kosovo.

export type PaymentMethodId = "bank_transfer" | "card";

export type PaymentMethod = {
  id: PaymentMethodId;
  label: string;
  description: string;
  enabled: boolean;
};

export const paymentMethods: PaymentMethod[] = [
  {
    id: "bank_transfer",
    label: "Bank transfer",
    description:
      "We email you a proforma invoice with our bank details. We order your items from EDELRID as soon as the payment arrives.",
    enabled: true,
  },
  {
    id: "card",
    label: "Card payment",
    description: "Visa and Mastercard through a Kosovo bank's secure payment page.",
    enabled: false, // TODO(client): choose the bank, then implement CardGateway below.
  },
];

export const enabledPaymentMethods = paymentMethods.filter((m) => m.enabled);

/**
 * Contract for a bank card gateway (hosted payment page). The checkout creates
 * the order first, then redirects to `startPayment(...).redirectUrl`; the bank
 * calls back a route handler that uses `verifyCallback` before marking the order paid.
 */
export interface CardGateway {
  id: string;
  startPayment(input: {
    orderId: string;
    orderNumber: string;
    amountCents: number;
    currency: "EUR";
    customerEmail: string;
    returnUrl: string;
    callbackUrl: string;
  }): Promise<{ redirectUrl: string; reference: string }>;
  verifyCallback(request: Request): Promise<{ orderNumber: string; paid: boolean; reference: string }>;
}
