"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Lock, User } from "lucide-react";
import clsx from "clsx";
import { placeOrder, type CheckoutState } from "@/actions/checkout";
import { checkoutCountries, shippingZones, zoneFor, shippingCents } from "@/config/shipping";
import { shop } from "@/config/site";
import { cartActions } from "@/lib/cart/store";
import { usePricedCart } from "@/lib/cart/usePricedCart";
import { enabledPaymentMethods } from "@/lib/payments";
import { formatPrice } from "@/lib/format";
import { SelectField, TextArea, TextField } from "@/components/forms/Field";
import { Turnstile } from "@/components/forms/Turnstile";

const eur = (cents: number) => formatPrice(cents / 100);

export function CheckoutForm() {
  const router = useRouter();
  const { lines, priced, stale } = usePricedCart();
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, { status: "idle" });
  const [customerType, setCustomerType] = useState<"private" | "company">("private");
  const [country, setCountry] = useState("XK");
  const [attempt, setAttempt] = useState(0);
  const zone = zoneFor(country);
  const errors = state.status === "error" ? (state.errors ?? {}) : {};
  const formRef = useRef<HTMLFormElement>(null);

  // After a failed submit, move focus to the first invalid field (or the message).
  useEffect(() => {
    if (state.status !== "error") return;
    const target = formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]") ?? formRef.current?.querySelector<HTMLElement>("[role=alert]");
    target?.focus();
    target?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [state]);

  useEffect(() => {
    if (state.status === "ok") {
      cartActions.clear();
      router.replace(`/checkout/success?order=${encodeURIComponent(state.number)}`);
    }
  }, [state, router]);

  if (!lines.length && state.status !== "ok") {
    return (
      <div className="rounded-xl border border-dashed border-line px-6 py-14 text-center">
        <p className="font-semibold">Your cart is empty.</p>
        <Link href="/shop" className="mt-3 inline-block text-sm font-semibold text-brand-strong hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("cart", JSON.stringify(lines.map(({ sku, qty }) => ({ sku, qty }))));
    setAttempt((a) => a + 1);
    startTransition(() => action(fd));
  };

  const ship = zone && priced ? shippingCents(zone, priced.itemsCents) : null;
  const total = priced ? priced.itemsCents + (ship ?? 0) : 0;
  const groups = shippingZones.map((z) => ({
    label: z.name,
    options: checkoutCountries.filter((c) => c.zone === z.id).map((c) => ({ value: c.code, label: c.name })),
  }));

  return (
    <form ref={formRef} method="post" onSubmit={onSubmit} noValidate className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:items-start">
      <div className="space-y-10">
        {state.status === "error" && (
          <div role="alert" tabIndex={-1} className="rounded-lg border border-brand-strong/40 bg-brand-soft p-4 text-sm font-medium text-brand-strong">
            {state.message}
          </div>
        )}

        <fieldset>
          <legend className="font-display text-xl">1. Contact</legend>
          <div className="mt-5 grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <TextField name="name" label="Full name" autoComplete="name" error={errors.name} className="sm:col-span-2" />
            <TextField name="email" label="Email" type="email" autoComplete="email" inputMode="email" error={errors.email} />
            <TextField name="phone" label="Phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+383 44 123 456" error={errors.phone} />
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-xl">2. Invoice</legend>
          <div className="mt-5 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Customer type">
            {(
              [
                ["private", "Private customer", User],
                ["company", "Company (with NUI)", Building2],
              ] as const
            ).map(([value, label, Icon]) => (
              <label
                key={value}
                className={clsx(
                  "flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm font-semibold transition-colors",
                  customerType === value ? "border-ink bg-mist" : "border-line hover:border-ink/40",
                )}
              >
                <input
                  type="radio"
                  name="customerType"
                  value={value}
                  checked={customerType === value}
                  onChange={() => setCustomerType(value)}
                  className="size-4 accent-brand-strong"
                />
                <Icon aria-hidden className="size-4 text-muted" />
                {label}
              </label>
            ))}
          </div>
          {customerType === "company" && (
            <div className="mt-5 grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <TextField name="company" label="Company name" autoComplete="organization" error={errors.company} className="sm:col-span-2" />
              <TextField name="nui" label="NUI (fiscal number)" error={errors.nui} hint="Numri Unik Identifikues, or your country's company tax number." />
              <TextField name="vatNumber" label="VAT number" optional error={errors.vatNumber} />
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend className="font-display text-xl">3. Delivery address</legend>
          <div className="mt-5 grid gap-x-5 gap-y-5 sm:grid-cols-6">
            <SelectField
              name="country"
              label="Country"
              autoComplete="country"
              value={country}
              onChange={setCountry}
              options={[]}
              groups={groups}
              error={errors.country}
              className="sm:col-span-6"
            />
            <TextField name="addressLine1" label="Street and number" autoComplete="address-line1" error={errors.addressLine1} className="sm:col-span-6" />
            <TextField name="addressLine2" label="Apartment, floor, building" optional autoComplete="address-line2" className="sm:col-span-6" />
            <TextField name="postalCode" label="Postal code" optional autoComplete="postal-code" className="sm:col-span-2" />
            <TextField name="city" label="City" autoComplete="address-level2" error={errors.city} className="sm:col-span-4" />
          </div>
          {zone?.note && <p className="mt-4 rounded-md bg-mist p-3 text-sm text-muted">{zone.note}</p>}
        </fieldset>

        <fieldset>
          <legend className="font-display text-xl">4. Payment</legend>
          <div className="mt-5 space-y-3">
            {enabledPaymentMethods.map((m, i) => (
              <label key={m.id} className="flex cursor-pointer gap-3 rounded-lg border border-ink bg-mist p-4">
                <input type="radio" name="paymentMethod" value={m.id} defaultChecked={i === 0} className="mt-1 size-4 accent-brand-strong" />
                <span>
                  <span className="block font-semibold">{m.label}</span>
                  <span className="mt-0.5 block text-sm text-muted">{m.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-display text-xl">5. Notes and confirmation</legend>
          <TextArea name="notes" label="Note for us" optional rows={3} placeholder="Delivery instructions, reference number, questions…" />
          <div>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" name="terms" className="mt-0.5 size-4 shrink-0 accent-brand-strong" aria-invalid={errors.terms ? true : undefined} />
              <span>
                I accept the{" "}
                <Link href="/terms" target="_blank" className="font-semibold underline">
                  terms of sale
                </Link>{" "}
                and have read the{" "}
                <Link href="/privacy" target="_blank" className="font-semibold underline">
                  privacy notice
                </Link>
                .
              </span>
            </label>
            {errors.terms && <p className="mt-1.5 text-sm font-medium text-brand-strong">{errors.terms}</p>}
          </div>
          <Turnstile resetKey={attempt} />
        </fieldset>
      </div>

      <aside aria-label="Order summary" className="rounded-xl border border-line bg-mist p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-lg">Your order</h2>
        {priced ? (
          <>
            <ul className={clsx("mt-5 space-y-4", stale && "opacity-60")}>
              {priced.lines.map((l) => (
                <li key={l.sku} className="flex gap-3 text-sm">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded border border-line bg-white">
                    {l.image && <Image src={l.image} alt="" fill sizes="56px" className="object-contain p-1" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold leading-snug">{l.name}</span>
                    <span className="block text-xs text-muted">
                      {[l.optionsText, `${l.qty} ${l.unit.kind === "metre" ? "m" : "×"}`].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums">{eur(l.lineCents)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt>Items</dt>
                <dd className="tabular-nums">{eur(priced.itemsCents)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Shipping{zone ? ` (${zone.name})` : ""}</dt>
                <dd className="text-right tabular-nums">{ship == null ? <span className="text-muted">On your proforma</span> : eur(ship)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-3 text-base">
                <dt className="font-semibold">Total{ship == null ? " excl. shipping" : ""}</dt>
                <dd className="font-display tabular-nums">{eur(total)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-xs text-muted">
                <dt>Incl. {Math.round(shop.vatRate * 100)}% VAT</dt>
                <dd className="tabular-nums">{eur(total - Math.round(total / (1 + shop.vatRate)))}</dd>
              </div>
            </dl>
          </>
        ) : (
          <div className="mt-5 h-40 animate-pulse rounded bg-white" />
        )}
        <button
          type="submit"
          disabled={pending || !priced || stale}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-strong text-sm font-semibold text-white transition-colors hover:bg-[#b5252a] disabled:opacity-60"
        >
          <Lock aria-hidden className="size-4" />
          {pending ? "Placing order…" : "Place order"}
        </button>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          No payment now. We email you a proforma invoice; your order is confirmed when the payment arrives.
        </p>
        <Link href="/cart" className="mt-4 inline-block text-xs font-semibold text-muted hover:text-ink hover:underline">
          ← Back to cart
        </Link>
      </aside>
    </form>
  );
}
