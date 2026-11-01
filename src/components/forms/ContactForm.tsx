"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { sendContactMessage, type ContactState } from "@/actions/contact";
import { CONTACT_TOPICS, type ContactTopic } from "@/config/contact";
import { SelectField, TextArea, TextField } from "./Field";
import { useTurnstile } from "./Turnstile";
import { T } from "@/lib/i18n/T";
import { useLang } from "@/lib/i18n/useLang";

const TOPIC_SQ: Record<string, string> = {
  "General question": "Pyetje e përgjithshme",
  "Product question": "Pyetje për produkt",
  "Product sheet or user manual": "Fleta e produktit ose manuali",
  "Inspection or other services": "Inspektim ose shërbime të tjera",
  "Question about an order": "Pyetje për një porosi",
};

export function ContactForm({ topic, message }: { topic?: ContactTopic; message?: string }) {
  const { lang } = useLang();
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
        <p className="mt-4 font-display text-xl">
          <T sq="Mesazhi u dërgua" en="Message sent" />
        </p>
        <p className="mt-2 text-muted">
          <T sq="Faleminderit, do t'ju përgjigjemi me email." en="Thank you, we will get back to you by email." />
        </p>
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
        label={<T sq="Tema" en="Topic" />}
        defaultValue={topic ?? CONTACT_TOPICS[0]}
        options={CONTACT_TOPICS.map((v) => ({ value: v, label: lang === "sq" ? TOPIC_SQ[v] : v }))}
        error={errors.topic}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label={<T sq="Emri dhe mbiemri" en="Full name" />} autoComplete="name" error={errors.name} />
        <TextField name="email" label="Email" type="email" autoComplete="email" error={errors.email} />
        <TextField name="phone" label={<T sq="Telefoni" en="Phone" />} type="tel" autoComplete="tel" optional error={errors.phone} />
        <TextField name="company" label={<T sq="Kompania" en="Company" />} autoComplete="organization" optional />
      </div>
      <TextArea name="message" label={<T sq="Mesazhi" en="Message" />} rows={6} defaultValue={message} error={errors.message} />
      {turnstile.widget}
      <button
        type="submit"
        disabled={pending || !turnstile.ready}
        className="inline-flex h-12 items-center rounded-md bg-brand-strong px-8 text-sm font-semibold text-white hover:bg-[#b5252a] disabled:opacity-60"
      >
        {pending ? <T sq="Duke dërguar…" en="Sending…" /> : <T sq="Dërgo mesazhin" en="Send message" />}
      </button>
    </form>
  );
}
