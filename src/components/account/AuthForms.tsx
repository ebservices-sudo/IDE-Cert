"use client";

import { startTransition, useActionState, useState } from "react";
import Link from "next/link";
import { login, register, requestPasswordReset, resetPassword, type AuthState } from "@/actions/account";
import { TextField } from "@/components/forms/Field";
import { Turnstile } from "@/components/forms/Turnstile";

function useAuthAction(fn: (prev: AuthState, fd: FormData) => Promise<AuthState>) {
  const [state, action, pending] = useActionState<AuthState, FormData>(fn, { status: "idle" });
  const [attempt, setAttempt] = useState(0);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setAttempt((a) => a + 1);
    startTransition(() => action(fd));
  };
  const errors = state.status === "error" ? (state.errors ?? {}) : {};
  return { state, pending, onSubmit, errors, attempt };
}

function Message({ state }: { state: AuthState }) {
  if (state.status === "idle") return null;
  return (
    <div
      role={state.status === "error" ? "alert" : "status"}
      className={
        state.status === "error"
          ? "rounded-lg border border-brand-strong/40 bg-brand-soft p-3.5 text-sm font-medium text-brand-strong"
          : "rounded-lg border border-line bg-mist p-3.5 text-sm font-medium"
      }
    >
      {state.message}
    </div>
  );
}

const submit =
  "inline-flex h-12 w-full items-center justify-center rounded-md bg-brand-strong text-sm font-semibold text-white hover:bg-[#b5252a] disabled:opacity-60";

export function LoginForm({ next }: { next: string }) {
  const { state, pending, onSubmit, attempt } = useAuthAction(login);
  return (
    <form method="post" onSubmit={onSubmit} noValidate className="space-y-5">
      <Message state={state} />
      <input type="hidden" name="next" value={next} />
      <TextField name="email" label="Email" type="email" autoComplete="email" />
      <div>
        <TextField name="password" label="Password" type="password" autoComplete="current-password" />
        <Link href="/account/forgot" className="mt-2 inline-block text-xs font-semibold text-muted hover:text-ink hover:underline">
          Forgot your password?
        </Link>
      </div>
      <Turnstile resetKey={attempt} />
      <button type="submit" disabled={pending} className={submit}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function RegisterForm() {
  const { state, pending, onSubmit, errors, attempt } = useAuthAction(register);
  return (
    <form method="post" onSubmit={onSubmit} noValidate className="space-y-5">
      <Message state={state} />
      <TextField name="name" label="Full name" autoComplete="name" error={errors.name} />
      <TextField name="email" label="Email" type="email" autoComplete="email" error={errors.email} />
      <TextField name="company" label="Company" optional autoComplete="organization" />
      <TextField
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        hint="At least 10 characters."
        error={errors.password}
      />
      <Turnstile resetKey={attempt} />
      <button type="submit" disabled={pending} className={submit}>
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-xs leading-relaxed text-muted">
        By creating an account you agree to our{" "}
        <Link href="/privacy" className="underline">
          privacy notice
        </Link>
        . An account is optional — you can also check out as a guest.
      </p>
    </form>
  );
}

export function ForgotForm() {
  const { state, pending, onSubmit, errors, attempt } = useAuthAction(requestPasswordReset);
  if (state.status === "ok") return <Message state={state} />;
  return (
    <form method="post" onSubmit={onSubmit} noValidate className="space-y-5">
      <Message state={state} />
      <TextField name="email" label="Email" type="email" autoComplete="email" error={errors.email} />
      <Turnstile resetKey={attempt} />
      <button type="submit" disabled={pending} className={submit}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const { state, pending, onSubmit, errors } = useAuthAction(resetPassword);
  return (
    <form method="post" onSubmit={onSubmit} noValidate className="space-y-5">
      <Message state={state} />
      <input type="hidden" name="token" value={token} />
      <TextField name="password" label="New password" type="password" autoComplete="new-password" hint="At least 10 characters." error={errors.password} />
      <button type="submit" disabled={pending} className={submit}>
        {pending ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
