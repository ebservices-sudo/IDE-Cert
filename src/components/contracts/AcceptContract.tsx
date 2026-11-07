"use client";

import { useActionState, useEffect } from "react";
import { CheckCircle2, Printer } from "lucide-react";
import { acceptContractOnline, type AcceptState } from "@/actions/contracts";

type Labels = {
  heading: string;
  lead: string;
  name: string;
  agree: string;
  button: string;
  sending: string;
  done: string;
  doneLead: string;
};

export function AcceptContract({ token, labels }: { token: string; labels: Labels }) {
  const [state, action, pending] = useActionState(acceptContractOnline, { status: "idle" } as AcceptState);
  if (state.status === "ok") {
    return (
      <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
        <CheckCircle2 aria-hidden className="size-6 shrink-0 text-emerald-700" />
        <div>
          <p className="font-semibold">{labels.done}</p>
          <p className="mt-1 text-sm">{labels.doneLead}</p>
        </div>
      </div>
    );
  }
  return (
    <form action={action} className="rounded-xl border border-line bg-white p-5 sm:p-6">
      <input type="hidden" name="token" value={token} />
      <h2 className="font-display text-xl">{labels.heading}</h2>
      <p className="mt-1 text-sm text-muted">{labels.lead}</p>
      <label className="mt-4 block text-sm font-semibold">
        {labels.name}
        <input name="name" required autoComplete="name" className="mt-1.5 block h-11 w-full rounded-md border border-line px-3 text-base outline-none hover:border-ink/40 focus:border-ink" />
      </label>
      <label className="mt-4 flex items-start gap-3 text-sm">
        <input type="checkbox" name="agree" required className="mt-0.5 size-4 accent-[#ce2c31]" />
        <span>{labels.agree}</span>
      </label>
      <button type="submit" disabled={pending} className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-brand-strong px-5 font-semibold text-white hover:bg-[#b5252a] disabled:opacity-60 sm:w-auto">
        {pending ? labels.sending : labels.button}
      </button>
      {state.status === "error" && (
        <p role="alert" className="mt-3 text-sm font-medium text-brand-strong">
          {state.message}
        </p>
      )}
    </form>
  );
}

export function PrintButton({ label, auto }: { label: string; auto?: boolean }) {
  useEffect(() => {
    if (auto) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [auto]);
  return (
    <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-md border border-white/25 px-4 text-sm font-semibold text-white hover:bg-white/10">
      <Printer aria-hidden className="size-4" />
      {label}
    </button>
  );
}
