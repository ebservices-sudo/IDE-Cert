"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useLang } from "@/lib/i18n/useLang";

/** Header link to the account page (which sends signed-out visitors to the sign-in page). Shown at every width. */
export function AccountLink({ className }: { className?: string }) {
  const { t } = useLang();
  const label = t("Llogaria / Hyr", "Account / Sign in");
  return (
    <Link href="/account" aria-label={label} title={label} className={className}>
      <UserRound aria-hidden className="size-5" />
    </Link>
  );
}
