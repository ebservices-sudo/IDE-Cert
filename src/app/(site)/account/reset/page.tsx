import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/account/AuthShell";
import { ResetFormFromUrl } from "@/components/account/UrlForms";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default function ResetPage() {
  return (
    <AuthShell title="Choose a new password">
      <Suspense fallback={null}>
        <ResetFormFromUrl />
      </Suspense>
    </AuthShell>
  );
}

