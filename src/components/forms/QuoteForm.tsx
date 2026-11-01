"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { submitQuote, type QuoteState } from "@/actions/quote";
import { checkoutCountries, shippingZones } from "@/config/shipping";
import { site } from "@/config/site";
import { SelectField, TextArea, TextField } from "./Field";
import { useTurnstile } from "./Turnstile";
import { T } from "@/lib/i18n/T";
import { useLang } from "@/lib/i18n/useLang";

export type QuoteFormItem = { key: string; sku: string; name: string; quantity: string; details: string };

let nextKey = 0;
const blank = (): QuoteFormItem => ({ key: `n${nextKey++}`, sku: "", name: "", quantity: "", details: "" });

const input =
  "block h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none hover:border-ink/40 focus:border-ink";

export function QuoteForm({ initialItems }: { initialItems: QuoteFormItem[] }) {
  const [state, action, pending] = useActionState<QuoteState, FormData>(submitQuote, { status: "idle" });
  const [items, setItems] = useState<QuoteFormItem[]>(initialItems.length ? initialItems : [blank()]);
  const [attempt, setAttempt] = useState(0);
  const turnstile = useTurnstile(attempt);
  const errors = state.status === "error" ? (state.errors ?? {}) : {};
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useLang();

  // After a failed submit, move focus to the first invalid field (or the message).
  useEffect(() => {
    if (state.status !== "error") return;
    const target = formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]") ?? formRef.current?.querySelector<HTMLElement>("[role=alert]");
    target?.focus();
    target?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [state]);

  if (state.status === "ok") {
    return (
      <div role="status" className="rounded-xl border border-line bg-mist p-8 text-center">
        <CheckCircle2 aria-hidden className="mx-auto size-10 text-brand-strong" />
        <h2 className="mt-4 font-display text-2xl">
          <T sq="Kërkesa për ofertë u dërgua" en="Quote request sent" />
        </h2>
        <p className="mt-2 text-muted">
          <T sq="Numri i referencës:" en="Your reference is" /> <strong className="text-ink">{state.number}</strong>.{" "}
          <T
            sq={`Një kopje shkoi te ${state.email}. Ju kthejmë çmimet dhe afatet e dorëzimit.`}
            en={`We have sent a copy to ${state.email} and will reply with prices and delivery times.`}
          />
        </p>
      </div>
    );
  }

  const update = (key: string, patch: Partial<QuoteFormItem>) => setItems((xs) => xs.map((x) => (x.key === key ? { ...x, ...patch } : x)));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setAttempt((a) => a + 1);
    startTransition(() => action(fd));
  };

  const groups = shippingZones.map((z) => ({
    label: z.name,
    options: checkoutCountries.filter((c) => c.zone === z.id).map((c) => ({ value: c.code, label: c.name })),
  }));

  return (
    <form ref={formRef} method="post" onSubmit={onSubmit} noValidate className="space-y-10">
      {state.status === "error" && (
        <div role="alert" tabIndex={-1} className="rounded-lg border border-brand-strong/40 bg-brand-soft p-4 text-sm font-medium text-brand-strong">
          {state.message}
        </div>
      )}

      <fieldset>
        <legend className="font-display text-xl">
          <T sq="Produktet" en="Products" />
        </legend>
        <p className="mt-1 text-sm text-muted">
          <T sq="Numra artikujsh, gjatësi litarësh dhe skaje, sasi: gjithçka që doni ta keni me çmim." en="Item numbers, rope lengths and terminations, quantities: whatever you need priced." />
        </p>
        <ul className="mt-5 space-y-4">
          {items.map((item, i) => (
            <li key={item.key} className="rounded-lg border border-line p-4">
              <input type="hidden" name="itemSku" value={item.sku} />
              <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
                <label className="block text-sm font-semibold">
                  <T sq="Produkti ose numri i artikullit" en="Product or item number" />
                  <input
                    name="itemName"
                    value={item.name}
                    onChange={(e) => update(item.key, { name: e.target.value, sku: "" })}
                    placeholder={t("p.sh. Performance Static 11.0 mm, ose 832560010470", "e.g. Performance Static 11.0 mm, or 832560010470")}
                    className={`mt-1.5 ${input}`}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  <T sq="Sasia" en="Quantity" />
                  <input
                    name="itemQty"
                    value={item.quantity}
                    onChange={(e) => update(item.key, { quantity: e.target.value })}
                    placeholder={t("p.sh. 3 × 40 m", "e.g. 3 × 40 m")}
                    className={`mt-1.5 ${input}`}
                  />
                </label>
              </div>
              <label className="mt-3 block text-sm font-semibold">
                <T sq="Detaje" en="Details" />{" "}
                <span className="font-normal text-muted">
                  <T sq="(opsionale)" en="(optional)" />
                </span>
                <input
                  name="itemDetails"
                  value={item.details}
                  onChange={(e) => update(item.key, { details: e.target.value })}
                  placeholder={t("Skaji, ngjyra, data e dorëzimit…", "Termination, colour, delivery date…")}
                  className={`mt-1.5 ${input}`}
                />
              </label>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => setItems((xs) => xs.filter((x) => x.key !== item.key))}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand-strong"
                >
                  <Trash2 aria-hidden className="size-3.5" />
                  <T sq={`Hiq produktin ${i + 1}`} en={`Remove product ${i + 1}`} />
                </button>
              )}
            </li>
          ))}
        </ul>
        {errors.items && <p className="mt-2 text-sm font-medium text-brand-strong">{errors.items}</p>}
        {items.length < 30 && (
          <button
            type="button"
            onClick={() => setItems((xs) => [...xs, blank()])}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-sm font-semibold hover:border-ink/40"
          >
            <Plus aria-hidden className="size-4" />
            <T sq="Shto produkt" en="Add a product" />
          </button>
        )}
      </fieldset>

      <fieldset>
        <legend className="font-display text-xl">
          <T sq="Të dhënat tuaja" en="Your details" />
        </legend>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField name="name" label={<T sq="Emri dhe mbiemri" en="Full name" />} autoComplete="name" error={errors.name} />
          <TextField name="email" label="Email" type="email" autoComplete="email" error={errors.email} />
          <TextField name="phone" label={<T sq="Telefoni" en="Phone" />} type="tel" autoComplete="tel" optional error={errors.phone} />
          <SelectField name="country" label={<T sq="Shteti i dorëzimit" en="Delivery country" />} defaultValue="XK" options={[]} groups={groups} error={errors.country} />
          <TextField name="company" label={<T sq="Kompania" en="Company" />} autoComplete="organization" optional />
          <TextField name="nui" label={<T sq="NUI (numri fiskal)" en="NUI (fiscal number)" />} optional />
        </div>
      </fieldset>

      <TextArea name="message" label={<T sq="Mesazhi" en="Message" />} optional rows={4} placeholder={t("Diçka tjetër që duhet ta dimë?", "Anything else we should know?")} />
      {turnstile.widget}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending || !turnstile.ready}
          className="inline-flex h-12 items-center rounded-md bg-brand-strong px-8 text-sm font-semibold text-white hover:bg-[#b5252a] disabled:opacity-60"
        >
          {pending ? <T sq="Duke dërguar…" en="Sending…" /> : <T sq="Dërgo kërkesën për ofertë" en="Send quote request" />}
        </button>
        <p className="text-sm text-muted">
          <T sq="Ose telefononi" en="Or call" /> {site.phones[0].display}.
        </p>
      </div>
    </form>
  );
}
