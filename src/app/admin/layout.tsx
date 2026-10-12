import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { logout } from "@/actions/account";
import { requireAdmin } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/AdminNav";

// The admin is private and rendered per request (it reads the session cookie).
// Every page also checks the session itself: layouts do not protect pages.

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin | IDE Cert" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="flex min-h-dvh flex-col bg-mist lg:flex-row">
      <AdminNav />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-end gap-4 border-b border-line bg-white px-6 py-2.5 text-sm print:hidden">
          <span className="truncate text-muted">{user.email}</span>
          <Link href="/" className="inline-flex items-center gap-1.5 font-semibold hover:text-brand-strong">
            Shop
            <ExternalLink aria-hidden className="size-3.5" />
          </Link>
          <form action={logout}>
            <button type="submit" className="inline-flex items-center gap-1.5 font-semibold hover:text-brand-strong">
              <LogOut aria-hidden className="size-3.5" />
              Sign out
            </button>
          </form>
        </div>
        <main id="main" className="px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
