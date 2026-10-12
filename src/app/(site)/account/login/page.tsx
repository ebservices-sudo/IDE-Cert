import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { safeNext } from "@/lib/server/origin";
import { AuthShell } from "@/components/account/AuthShell";
import { LoginForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage({ searchParams }: PageProps<"/account/login">) {
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
        <LoginWithNext searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function LoginWithNext({ searchParams }: Pick<PageProps<"/account/login">, "searchParams">) {
  const { next } = await searchParams;
  return <LoginForm next={safeNext(next)} />;
}
