"use client";

import { useActionState, useState } from "react";
import { Check, Copy, Send } from "lucide-react";
import { sendContract, type ContractActionState } from "@/actions/contracts";
import { buttonCls, inputCls } from "./ui";

export function SendContractForm({ id, email, alreadySent }: { id: string; email: string; alreadySent: boolean }) {
  const [state, action, pending] = useActionState(sendContract, { status: "idle" } as ContractActionState);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <label className="block text-sm font-semibold">
        Personal note (optional)
        <textarea
          name="note"
          rows={3}
          placeholder="Shown above the contract in the email, e.g. “Siç u dakorduam në telefon…”"
          className={`${inputCls} mt-1.5 py-2`}
        />
      </label>
      <button type="submit" disabled={pending} className={`${buttonCls.primary} w-full`}>
        <Send aria-hidden className="size-4" />
        {pending ? "Sending…" : alreadySent ? "Send again" : "Send to client"}
      </button>
      <p className="text-xs text-muted">
        Goes to <strong className="text-ink">{email}</strong> with the full contract and a private link to read, save as PDF and accept it online.
      </p>
      {state.status !== "idle" && (
        <p role={state.status === "error" ? "alert" : "status"} className={state.status === "error" ? "text-sm font-medium text-brand-strong" : "text-sm font-medium text-emerald-700"}>
          {state.message}
        </p>
      )}
    </form>
  );
}

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt("Copy the client link:", url);
        }
      }}
      className={`${buttonCls.outline} w-full`}
    >
      {copied ? <Check aria-hidden className="size-4 text-emerald-700" /> : <Copy aria-hidden className="size-4" />}
      {copied ? "Link copied" : "Copy client link"}
    </button>
  );
}
