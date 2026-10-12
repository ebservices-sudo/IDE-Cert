import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/account/AuthShell";
import { RegisterForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create an account"
      intro="Optional — keep your orders in one place and check out faster."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/account/login" className="font-semibold text-brand-strong hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
