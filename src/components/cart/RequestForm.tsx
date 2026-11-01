"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";
import { submitQuote, type QuoteState } from "@/actions/quote";
import { checkoutCountries, shippingZones } from "@/config/shipping";
import { site } from "@/config/site";
import type { PricedLine } from "@/lib/orders/pricing";
import { formatPrice, unitSuffix } from "@/lib/format";
import { SelectField, TextArea, TextField } from "@/components/forms/Field";
import { useTurnstile } from "@/components/forms/Turnstile";
import { T } from "@/lib/i18n/T";
import { useLang } from "@/lib/i18n/useLang";

// Sends the request list through the quote system (saved in the admin under Quotes and
// emailed to the shop). No payment is taken: we reply with the final price and delivery.

const qtyText = (l: PricedLine) => (l.unit.kind === "metre" ? `${l.qty} m` : String(l.qty));

export function requestText(lines: PricedLine[], extra = "") {
  const rows = lines.map(
    (l, i) =>
      `${i + 1}. ${l.name}${l.optionsText ? ` (${l.optionsText})` : ""} | item ${l.sku} | qty ${qtyText(l)} | ${formatPrice(l.unitCents / 100)} ${unitSuffix(l.unit)}`.trim(),
  );
  return ["Request for EDELRID equipment", "", ...rows, "", extra].join("\n").trim();
}

export function RequestForm({ lines, onSent }: { lines: PricedLine[]; onSent: () => void }) {
  const [state, action, pending] = useActionState<QuoteState, FormData>(submitQuote, { status: "idle" });
  const [attempt, setAttempt] = useState(0);
  const turnstile = useTurnstile(attempt);
  const errors = state.status === "error" ? (state.errors ?? {}) : {};
  const formRef = useRef<HTMLFormElement>(null);
  const sentRef = useRef(false);
  const { t } = useLang();

  useEffect(() => {
    if (state.status === "ok" && !sentRef.current) {
      sentRef.current = true;
      onSent();
    }
    if (state.status !== "error") return;
    const target = formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]") ?? formRef.current?.querySelector<HTMLElement>("[role=alert]");
    target?.focus();
  }, [state, onSent]);

  if (state.status === "ok") {
    return (
      <div role="status" className="rounded-xl border border-line bg-white p-6 text-center">
        <CheckCircle2 aria-hidden className="mx-auto size-10 text-brand-strong" />
        <h2 className="mt-3 font-display text-xl">
          <T sq="Kërkesa u dërgua" en="Request sent" />
        </h2>
        <p className="mt-2 text-sm text-muted">
          <T sq="Numri i referencës:" en="Your reference is" /> <strong className="text-ink">{state.number}</strong>.{" "}
          <T
            sq={`Një kopje shkoi te ${state.email}. Ju kthejmë çmimin përfundimtar dhe datën e dorëzimit.`}
            en={`A copy went to ${state.email}. We reply with the final price and delivery date.`}
          />
        </p>
        <Link href="/shop" className="mt-5 inline-flex h-11 items-center rounded-md bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-3">
          <T sq="Kthehu te dyqani" en="Back to the shop" />
        </Link>
      </div>
    );
  }

  const groups = shippingZones.map((z) => ({
    label: z.name,
    options: checkoutCountries.filter((c) => c.zone === z.id).map((c) => ({ value: c.code, label: c.name })),
  }));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setAttempt((a) => a + 1);
    startTransition(() => action(fd));
  };

  const mailto = `mailto:${site.email}?subject=${encodeURIComponent("Request for EDELRID equipment")}&body=${encodeURIComponent(requestText(lines))}`;

  return (
    <form ref={formRef} method="post" onSubmit={onSubmit} noValidate className="space-y-4">
      {lines.map((l) => (
        <span key={l.sku} hidden>
          <input type="hidden" name="itemSku" value={l.sku} />
          <input type="hidden" name="itemName" value={[l.name, l.optionsText].filter(Boolean).join(" · ")} />
          <input type="hidden" name="itemQty" value={qtyText(l)} />
          <input type="hidden" name="itemDetails" value={`Shown price ${formatPrice(l.unitCents / 100)} ${unitSuffix(l.unit)}`.trim()} />
        </span>
      ))}
      {state.status === "error" &&
        (state.errors && Object.keys(state.errors).length ? (
          <div role="alert" tabIndex={-1} className="rounded-lg border border-brand-strong/40 bg-brand-soft p-3 text-sm font-medium text-brand-strong">
            {state.message}
          </div>
        ) : (
          <div role="alert" tabIndex={-1} className="rounded-lg border border-line bg-white p-4 text-sm">
            <p className="font-semibold">
              <T sq="Nuk mundëm ta dërgonim nga faqja tani." en="We couldn’t send it from the website just now." />
            </p>
            <p className="mt-1 text-muted">
              <T sq="Dërgoni të njëjtën listë me email: hapet gati, ju vetëm shtypni dërgo." en="Send the same list by email: it opens ready to go, you just press send." />
            </p>
            <a
              href={mailto}
              className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ink text-sm font-semibold text-white hover:bg-ink-3"
            >
              <Mail aria-hidden className="size-4" />
              <T sq="Dërgo me email" en="Send by email" />
            </a>
          </div>
        ))}
      <TextField name="name" label={<T sq="Emri dhe mbiemri" en="Full name" />} autoComplete="name" error={errors.name} />
      <TextField name="email" label="Email" type="email" autoComplete="email" error={errors.email} />
      <TextField name="phone" label={<T sq="Telefoni" en="Phone" />} type="tel" autoComplete="tel" optional error={errors.phone} />
      <TextField name="company" label={<T sq="Kompania ose parku" en="Company or park" />} autoComplete="organization" optional />
      <SelectField name="country" label={<T sq="Shteti i dorëzimit" en="Delivery country" />} defaultValue="XK" options={[]} groups={groups} error={errors.country} />
      <TextArea name="message" label={<T sq="Shënim" en="Note" />} optional rows={3} placeholder={t("Data e dorëzimit, pyetje për madhësitë, të dhëna për faturën…", "Delivery date, sizing questions, invoice details…")} />
      {errors.items && <p className="text-sm font-medium text-brand-strong">{errors.items}</p>}
      {turnstile.widget}
      <button
        type="submit"
        disabled={pending || !turnstile.ready || !lines.length}
        className="inline-flex h-12 w-full items-center justify-center rounded-md bg-brand-strong text-sm font-semibold text-white transition-colors hover:bg-[#b5252a] disabled:opacity-60"
      >
        {pending ? <T sq="Duke dërguar…" en="Sending…" /> : <T sq="Dërgo kërkesën" en="Send request" />}
      </button>
      <p className="text-xs leading-relaxed text-muted">
        <T
          sq="Pa pagesë tani. Kontrollojmë disponueshmërinë te EDELRID dhe ju kthejmë çmimin përfundimtar, datën e dorëzimit dhe faturën proforma. Ose shkruani te"
          en="No payment now. We check availability with EDELRID and reply with the final price, delivery date and a proforma invoice. Or email"
        />{" "}
        <a href={mailto} className="font-semibold underline">
          {site.email}
        </a>
        .
      </p>
    </form>
  );
}
