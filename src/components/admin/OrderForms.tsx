"use client";

import { useActionState } from "react";
import { saveOrder, saveQuote, sendProforma, type AdminState } from "@/actions/admin";
import { orderStatusLabel, quoteStatusLabel } from "@/lib/orders/status";
import { buttonCls, inputCls } from "./ui";

function Feedback({ state }: { state: AdminState }) {
  if (state.status === "idle") return null;
  return (
    <p role={state.status === "error" ? "alert" : "status"} className={state.status === "error" ? "text-sm font-medium text-brand-strong" : "text-sm font-medium text-emerald-700"}>
      {state.message}
    </p>
  );
}

export function OrderEditor({ id, status, shippingCents, adminNotes }: { id: string; status: string; shippingCents: number | null; adminNotes: string }) {
  const [state, action, pending] = useActionState(saveOrder, { status: "idle" } as AdminState);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <label className="block text-sm font-semibold">
        Status
        <select name="status" defaultValue={status} className={`${inputCls} mt-1.5 h-10`}>
          {Object.entries(orderStatusLabel).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold">
        Shipping (EUR, incl. VAT)
        <input
          name="shipping"
          inputMode="decimal"
          defaultValue={shippingCents == null ? "" : (shippingCents / 100).toFixed(2)}
          placeholder="Not set — e.g. 7.50, or 0"
          className={`${inputCls} mt-1.5 h-10`}
        />
      </label>
      <label className="block text-sm font-semibold">
        Internal notes
        <textarea name="adminNotes" defaultValue={adminNotes} rows={4} className={`${inputCls} mt-1.5 py-2`} />
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={buttonCls.dark}>
          {pending ? "Saving…" : "Save"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function ProformaButton({ id, disabledReason, sentAt }: { id: string; disabledReason?: string; sentAt?: string | null }) {
  const [state, action, pending] = useActionState(sendProforma, { status: "idle" } as AdminState);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending || Boolean(disabledReason)} className={buttonCls.primary}>
        {pending ? "Sending…" : sentAt ? "Send proforma again" : "Email proforma to customer"}
      </button>
      {disabledReason && <p className="text-xs text-muted">{disabledReason}</p>}
      {sentAt && <p className="text-xs text-muted">Last sent {new Date(sentAt).toLocaleString("en-GB")}</p>}
      <Feedback state={state} />
    </form>
  );
}

export function QuoteEditor({ id, status, adminNotes }: { id: string; status: string; adminNotes: string }) {
  const [state, action, pending] = useActionState(saveQuote, { status: "idle" } as AdminState);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <label className="block text-sm font-semibold">
        Status
        <select name="status" defaultValue={status} className={`${inputCls} mt-1.5 h-10`}>
          {Object.entries(quoteStatusLabel).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold">
        Internal notes (prices offered, follow-up…)
        <textarea name="adminNotes" defaultValue={adminNotes} rows={5} className={`${inputCls} mt-1.5 py-2`} />
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={buttonCls.dark}>
          {pending ? "Saving…" : "Save"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}
