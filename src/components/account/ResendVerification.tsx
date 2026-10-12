"use client";

import { useActionState } from "react";
import { resendVerification, type AuthState } from "@/actions/account";

export function ResendVerification() {
  const [state, action, pending] = useActionState<AuthState>(resendVerification, { status: "idle" });
  if (state.status !== "idle") return <p className="font-semibold">{state.message}</p>;
  return (
    <form action={action}>
      <button type="submit" disabled={pending} className="font-semibold underline disabled:opacity-60">
        {pending ? "Sending…" : "Send a new link"}
      </button>
    </form>
  );
}
