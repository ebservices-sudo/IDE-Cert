"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";

/**
 * Two-step delete: the first click only asks; the second, red button deletes for good.
 * `action` is a server action that reads the `id` field.
 */
export function DeleteButton({
  action,
  id,
  label = "Delete",
  warning = "This cannot be undone.",
  small = false,
}: {
  action: (fd: FormData) => Promise<void>;
  id: string;
  label?: string;
  warning?: string;
  small?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  const base = small ? "px-2.5 py-1 text-xs" : "h-10 px-4 text-sm";

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className={`inline-flex items-center gap-1.5 rounded-md border border-line bg-white font-semibold text-muted hover:border-brand-strong hover:text-brand-strong ${base}`}
      >
        <Trash2 aria-hidden className={small ? "size-3.5" : "size-4"} />
        {label}
      </button>
    );
  }
  return (
    <form action={action} className="flex flex-wrap items-center gap-2 rounded-lg border border-brand-strong/30 bg-brand-soft p-2.5">
      <input type="hidden" name="id" value={id} />
      <span className="text-xs font-semibold text-brand-strong">{warning}</span>
      <Confirm small={small} />
      <button type="button" onClick={() => setArmed(false)} className={`rounded-md font-semibold text-muted hover:text-ink ${small ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"}`}>
        Keep it
      </button>
    </form>
  );
}

function Confirm({ small }: { small: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      autoFocus
      className={`inline-flex items-center gap-1.5 rounded-md bg-brand-strong font-semibold text-white hover:bg-[#b5252a] disabled:opacity-60 ${small ? "px-2.5 py-1 text-xs" : "h-10 px-4 text-sm"}`}
    >
      <Trash2 aria-hidden className={small ? "size-3.5" : "size-4"} />
      {pending ? "Deleting…" : "Yes, delete for good"}
    </button>
  );
}
