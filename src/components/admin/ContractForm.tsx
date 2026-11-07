"use client";

import { startTransition, useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveContract, type ContractFormState } from "@/actions/contracts";
import { allDefaultTexts, contractDefaults, KIND_OPTIONS } from "@/lib/contracts/defaults";
import type { ContractKind, ContractLanguage } from "@/lib/contracts/store";
import { buttonCls, inputCls } from "./ui";

export type ContractFormValues = {
  id?: string;
  kind: ContractKind;
  language: ContractLanguage;
  sourceType?: string | null;
  sourceId?: string | null;
  sourceNumber?: string | null;
  clientName: string;
  clientCompany: string;
  clientNui: string;
  clientRepresentative: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone: string;
  title: string;
  scope: string;
  location: string;
  startDate: string;
  endDate: string;
  items: { description: string; quantity: string; unit: string; price: string }[];
  vatRate: number;
  paymentTerms: string;
  validityDays: number;
  specialTerms: string;
  nextInspectionDate: string;
  internalNotes: string;
};

const parseCents = (raw: string) => {
  let s = raw.trim().replace(/\s|€/g, "");
  if (/,\d{1,2}$/.test(s)) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(/,/g, "");
  const n = Number(s);
  return s && Number.isFinite(n) ? Math.round(n * 100) : 0;
};
const eur = (cents: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      {children}
      {hint && !error && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-brand-strong">{error}</span>}
    </label>
  );
}

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <h2 className="text-sm font-semibold">{title}</h2>
        {aside}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

export function ContractForm({ initial }: { initial: ContractFormValues }) {
  const [state, action, pending] = useActionState(saveContract, { status: "idle" } as ContractFormState);
  const errors = state.status === "error" ? (state.errors ?? {}) : {};
  const [kind, setKind] = useState(initial.kind);
  const [language, setLanguage] = useState(initial.language);
  const [title, setTitle] = useState(initial.title);
  const [paymentTerms, setPaymentTerms] = useState(initial.paymentTerms);
  const [vatRate, setVatRate] = useState(initial.vatRate);
  const [items, setItems] = useState(initial.items.length ? initial.items : [{ description: "", quantity: "1", unit: contractDefaults(initial.kind, initial.language).unit, price: "" }]);

  // Swap the starting texts when type or language changes, unless they were edited.
  function applyDefaults(k: ContractKind, l: ContractLanguage) {
    const d = contractDefaults(k, l);
    if (!title || allDefaultTexts.has(title)) setTitle(d.title);
    if (!paymentTerms || allDefaultTexts.has(paymentTerms)) setPaymentTerms(d.paymentTerms);
    setItems((rows) => rows.map((r) => (!r.unit || allDefaultTexts.has(r.unit) ? { ...r, unit: d.unit } : r)));
  }

  const net = items.reduce((s, r) => s + Math.round((Number(r.quantity.replace(",", ".")) || 0) * parseCents(r.price)), 0);
  const vat = Math.round((net * vatRate) / 100);
  const setItem = (i: number, patch: Partial<(typeof items)[number]>) => setItems((rows) => rows.map((r, n) => (n === i ? { ...r, ...patch } : r)));
  const periodic = kind === "inspection" || kind === "certification";

  return (
    <form
      method="post"
      noValidate
      // Submitted by hand (not via the action prop) so a validation error keeps what was typed.
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
    >
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="sourceType" value={initial.sourceType ?? ""} />
      <input type="hidden" name="sourceId" value={initial.sourceId ?? ""} />
      <input type="hidden" name="sourceNumber" value={initial.sourceNumber ?? ""} />

      <div className="space-y-6">
        <Section title="Contract">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type" error={errors.kind}>
              <select
                name="kind"
                value={kind}
                onChange={(e) => {
                  const k = e.target.value as ContractKind;
                  setKind(k);
                  applyDefaults(k, language);
                }}
                className={`${inputCls} mt-1.5 h-10`}
              >
                {KIND_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Language of the contract">
              <select
                name="language"
                value={language}
                onChange={(e) => {
                  const l = e.target.value as ContractLanguage;
                  setLanguage(l);
                  applyDefaults(kind, l);
                }}
                className={`${inputCls} mt-1.5 h-10`}
              >
                <option value="sq">Shqip</option>
                <option value="en">English</option>
              </select>
            </Field>
          </div>
          <Field label="Title" error={errors.title} hint="One line, shown under the contract heading.">
            <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} className={`${inputCls} mt-1.5 h-10`} />
          </Field>
          <Field label="Scope of work" error={errors.scope} hint="What exactly you will do or deliver. One point per line reads best.">
            <textarea name="scope" defaultValue={initial.scope} rows={7} className={`${inputCls} mt-1.5 py-2`} />
          </Field>
          <Field label="Site / object (optional)" error={errors.location} hint="Address and what is there, e.g. “Parku Aventura, Gërmia: 3 tirolezë, 2 parkour me litarë”.">
            <textarea name="location" defaultValue={initial.location} rows={2} className={`${inputCls} mt-1.5 py-2`} />
          </Field>
        </Section>

        <Section title="Price (net, before VAT)" aside={<span className="text-sm font-semibold tabular-nums">{eur(net + vat)} total</span>}>
          {errors.items && <p className="text-sm font-medium text-brand-strong">{errors.items}</p>}
          <div className="space-y-3">
            <div className="hidden grid-cols-[minmax(0,1fr)_5rem_6rem_7.5rem_2.25rem] gap-2 text-xs font-semibold uppercase tracking-wider text-muted sm:grid">
              <span>Description</span>
              <span>Qty</span>
              <span>Unit</span>
              <span>Unit price €</span>
              <span />
            </div>
            {items.map((r, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr] gap-2 rounded-lg border border-line p-3 sm:grid-cols-[minmax(0,1fr)_5rem_6rem_7.5rem_2.25rem] sm:border-0 sm:p-0">
                <textarea
                  name="itemDesc"
                  aria-label={`Line ${i + 1} description`}
                  value={r.description}
                  onChange={(e) => setItem(i, { description: e.target.value })}
                  rows={1}
                  className={`${inputCls} col-span-2 min-h-10 py-2 sm:col-span-1`}
                />
                <input name="itemQty" aria-label={`Line ${i + 1} quantity`} inputMode="decimal" value={r.quantity} onChange={(e) => setItem(i, { quantity: e.target.value })} className={`${inputCls} h-10`} />
                <input name="itemUnit" aria-label={`Line ${i + 1} unit`} value={r.unit} onChange={(e) => setItem(i, { unit: e.target.value })} className={`${inputCls} h-10`} />
                <input name="itemPrice" aria-label={`Line ${i + 1} unit price in euros`} inputMode="decimal" placeholder="0,00" value={r.price} onChange={(e) => setItem(i, { price: e.target.value })} className={`${inputCls} h-10 text-right tabular-nums`} />
                <button
                  type="button"
                  onClick={() => setItems((rows) => (rows.length > 1 ? rows.filter((_, n) => n !== i) : rows))}
                  aria-label={`Remove line ${i + 1}`}
                  className="grid h-10 place-items-center rounded-md border border-line text-muted hover:border-ink/40 hover:text-ink"
                >
                  <Trash2 aria-hidden className="size-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setItems((rows) => [...rows, { description: "", quantity: "1", unit: contractDefaults(kind, language).unit, price: "" }])}
              className={buttonCls.outline}
            >
              <Plus aria-hidden className="size-4" />
              Add line
            </button>
          </div>
          <dl className="ml-auto max-w-xs space-y-1 border-t border-line pt-4 text-sm tabular-nums">
            <div className="flex justify-between">
              <dt className="text-muted">Net</dt>
              <dd>{eur(net)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">
                <select name="vat" value={String(vatRate)} onChange={(e) => setVatRate(Number(e.target.value))} className="rounded border border-line bg-white px-1.5 py-0.5 text-sm">
                  <option value="18">VAT 18%</option>
                  <option value="0">No VAT</option>
                </select>
              </dt>
              <dd>{eur(vat)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd className="text-brand-strong">{eur(net + vat)}</dd>
            </div>
          </dl>
        </Section>

        <Section title="Terms">
          <Field label="Payment terms" error={errors.paymentTerms}>
            <textarea name="paymentTerms" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} rows={3} className={`${inputCls} mt-1.5 py-2`} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Start of work" error={errors.startDate}>
              <input type="date" name="startDate" defaultValue={initial.startDate} className={`${inputCls} mt-1.5 h-10`} />
            </Field>
            <Field label="Completion / delivery" error={errors.endDate}>
              <input type="date" name="endDate" defaultValue={initial.endDate} className={`${inputCls} mt-1.5 h-10`} />
            </Field>
            <Field label="Client can accept for" hint="Days after sending.">
              <input type="number" name="validityDays" min={1} max={180} defaultValue={initial.validityDays} className={`${inputCls} mt-1.5 h-10`} />
            </Field>
          </div>
          {periodic && (
            <Field label="Next periodic inspection due (optional)" hint="Shown in the contract and on your dashboard 60 days before, so you can offer the next inspection in time.">
              <input type="date" name="nextInspectionDate" defaultValue={initial.nextInspectionDate} className={`${inputCls} mt-1.5 h-10 sm:max-w-xs`} />
            </Field>
          )}
          <Field label="Special terms (optional)" hint="Anything agreed for this job only. Appears as its own article in the contract.">
            <textarea name="specialTerms" defaultValue={initial.specialTerms} rows={3} className={`${inputCls} mt-1.5 py-2`} />
          </Field>
        </Section>
      </div>

      <div className="space-y-6">
        <Section title="Client">
          <Field label="Contact name" error={errors.clientName}>
            <input name="clientName" defaultValue={initial.clientName} className={`${inputCls} mt-1.5 h-10`} />
          </Field>
          <Field label="Email (the contract is sent here)" error={errors.clientEmail}>
            <input name="clientEmail" type="email" defaultValue={initial.clientEmail} className={`${inputCls} mt-1.5 h-10`} />
          </Field>
          <Field label="Company (optional)" error={errors.clientCompany}>
            <input name="clientCompany" defaultValue={initial.clientCompany} className={`${inputCls} mt-1.5 h-10`} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <Field label="NUI (optional)" error={errors.clientNui}>
              <input name="clientNui" defaultValue={initial.clientNui} className={`${inputCls} mt-1.5 h-10`} />
            </Field>
            <Field label="Phone (optional)" error={errors.clientPhone}>
              <input name="clientPhone" defaultValue={initial.clientPhone} className={`${inputCls} mt-1.5 h-10`} />
            </Field>
          </div>
          <Field label="Signs for the client (optional)" error={errors.clientRepresentative} hint="Name and role, e.g. “Arben Krasniqi, Drejtor”. Defaults to the contact name.">
            <input name="clientRepresentative" defaultValue={initial.clientRepresentative} className={`${inputCls} mt-1.5 h-10`} />
          </Field>
          <Field label="Address (optional)" error={errors.clientAddress}>
            <textarea name="clientAddress" defaultValue={initial.clientAddress} rows={2} className={`${inputCls} mt-1.5 py-2`} />
          </Field>
        </Section>
        <Section title="Internal notes">
          <textarea name="internalNotes" aria-label="Internal notes" defaultValue={initial.internalNotes} rows={4} placeholder="Only you see these." className={`${inputCls} py-2`} />
        </Section>
        <div className="sticky bottom-4 rounded-xl border border-line bg-white p-4 shadow-lg">
          <button type="submit" disabled={pending} className={`${buttonCls.primary} w-full`}>
            {pending ? "Saving…" : initial.id ? "Save changes" : "Create contract"}
          </button>
          <p className="mt-2 text-center text-xs text-muted">Next you preview it and send it to the client.</p>
          {state.status === "error" && (
            <p role="alert" className="mt-2 text-center text-sm font-medium text-brand-strong">
              {state.message}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
