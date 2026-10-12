"use client";

import { useSearchParams } from "next/navigation";
import { LoginForm, ResetForm } from "./AuthForms";

// URL-driven wrappers (read in the browser so the pages stay static).
// The server action re-validates `next` and the token.

export function LoginFormFromUrl() {
  return <LoginForm next={useSearchParams().get("next") ?? "/account"} />;
}

export function ResetFormFromUrl() {
  return <ResetForm token={useSearchParams().get("token") ?? ""} />;
}
