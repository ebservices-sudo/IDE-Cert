"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { sendContactMessage, type ContactState } from "@/actions/contact";
import { CONTACT_TOPICS, type ContactTopic } from "@/config/contact";
import { SelectField, TextArea, TextField } from "./Field";
import { useTurnstile } from "./Turnstile";

export function ContactForm({ topic, message }: { topic?: ContactTopic; message?: string }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContactMessage, { status: "idle" });
  const [attempt, setAttempt] = useState(0);
  const turnstile = useTurnstile(attempt);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.status === "error" ? (state.errors ?? {}) : {};

  useEffect(() => {
    if (state.status !== "error") return;
    const target = formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]") ?? formRef.current?.querySelector<HTMLElement>("[role=alert]");
    target?.focus();
  }, [state]);

  if (state.status === "ok") {
    return (
      <div role="status" className="rounded-xl border border-line bg-mist p-8 text-center">
        <CheckCircle2 aria-hidden className="mx-auto size-10 text-brand-strong" />
        <p className="mt-4 font-display text-xl">Message sent</p>
        <p className="mt-2 text-muted">Thank you — we will get back to you by email.</p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      method="post"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setAttempt((a) => a + 1);
        startTransition(() => action(fd));
      }}
      className="space-y-5"
    >
      {state.status === "error" && (
        <div role="alert" tabIndex={-1} className="rounded-lg border border-brand-strong/40 bg-brand-soft p-4 text-sm font-medium text-brand-strong">
          {state.message}
        </div>
      )}
      <SelectField
        name="topic"
        label="Topic"
        defaultValue={topic ?? CONTACT_TOPICS[0]}
        options={CONTACT_TOPICS.map((t) => ({ value: t, label: t }))}
        error={errors.topic}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label="Full name" autoComplete="name" error={errors.name} />
        <TextField name="email" label="Email" type="email" autoComplete="email" error={errors.email} />
        <TextField name="phone" label="Phone" type="tel" autoComplete="tel" optional error={errors.phone} />
        <TextField name="company" label="Company" autoComplete="organization" optional />
      </div>
      <TextArea name="message" label="Message" rows={6} defaultValue={message} error={errors.message} />
      {turnstile.widget}
      <button
        type="submit"
        disabled={pending || !turnstile.ready}
        className="inline-flex h-12 items-center rounded-md bg-brand-strong px-8 text-sm font-semibold text-white hover:bg-[#b5252a] disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
