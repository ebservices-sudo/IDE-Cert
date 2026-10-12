import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/account/AuthShell";
import { ResetForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default function ResetPage({ searchParams }: PageProps<"/account/reset">) {
  return (
    <AuthShell title="Choose a new password">
      <Suspense fallback={null}>
        <ResetWithToken searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function ResetWithToken({ searchParams }: Pick<PageProps<"/account/reset">, "searchParams">) {
  const { token } = await searchParams;
  return <ResetForm token={typeof token === "string" ? token : ""} />;
}
