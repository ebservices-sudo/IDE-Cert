import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/account/AuthShell";
import { LoginForm } from "@/components/account/AuthForms";
import { LoginFormFromUrl } from "@/components/account/UrlForms";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in"
      intro="See your orders and check out faster."
      footer={
        <>
          New here?{" "}
          <Link href="/account/register" className="font-semibold text-brand-strong hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={<LoginForm next="/account" />}>
        <LoginFormFromUrl />
      </Suspense>
    </AuthShell>
  );
}

