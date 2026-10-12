"use client";

import { useSearchParams } from "next/navigation";
import { ContactForm } from "./ContactForm";

/** /contact?about=… (from "Ask us for the product sheet") prefills the topic and message. */
export function ContactFormFromUrl() {
  const about = (useSearchParams().get("about") ?? "").slice(0, 200);
  if (!about) return <ContactForm />;
  return <ContactForm key={about} topic="Product sheet or user manual" message={`Please send me the product sheet and user manual for ${about}.`} />;
}
