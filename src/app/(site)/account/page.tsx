import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listOrdersForUser } from "@/lib/orders/queries";
import { StatusBadge } from "@/lib/orders/status";
import { formatPrice } from "@/lib/format";
import { logout } from "@/actions/account";
import { ResendVerification } from "@/components/account/ResendVerification";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

const NOTICES: Record<string, string> = {
  welcome: "Your account is ready. We have sent you an email to confirm your address.",
  reset: "Your password has been changed.",
  "verified:1": "Thank you — your email address is confirmed.",
  "verified:invalid": "This confirmation link is invalid or has expired.",
  "denied:admin": "Your account does not have access to the admin area.",
};

export default function AccountPage({ searchParams }: PageProps<"/account">) {
  return (
    <Container className="py-10 lg:py-14">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-mist" />}>
        <AccountContent searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function AccountContent({ searchParams }: Pick<PageProps<"/account">, "searchParams">) {
  const user = await requireUser("/account");
  const sp = await searchParams;
  const notice =
    (sp.welcome && NOTICES.welcome) ||
    (sp.reset && NOTICES.reset) ||
    (typeof sp.verified === "string" && NOTICES[`verified:${sp.verified}`]) ||
    (sp.denied === "admin" && NOTICES["denied:admin"]) ||
    null;
  const orders = await listOrdersForUser(user);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker text-brand-strong">Account</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">Hello, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-muted">
            {user.email}
            {user.company ? ` · ${user.company}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {user.role === "admin" && (
            <Link href="/admin" className="inline-flex h-10 items-center rounded-md bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-3">
              Admin
            </Link>
          )}
          <form action={logout}>
            <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-sm font-semibold hover:border-ink/40">
              <LogOut aria-hidden className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      </div>

      {notice && (
        <p role="status" className="mt-6 rounded-lg border border-line bg-mist p-4 text-sm font-medium">
          {notice}
        </p>
      )}
      {!user.emailVerified && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <p>Please confirm your email address. Orders placed as a guest with this email appear here once it is confirmed.</p>
          <ResendVerification />
        </div>
      )}

      <section className="mt-10" aria-labelledby="orders-title">
        <h2 id="orders-title" className="font-display text-xl">
          Your orders
        </h2>
        {orders.length ? (
          <div className="mt-4 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[36rem] text-sm">
              <thead className="bg-mist text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Order</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Items</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-semibold">{o.number}</td>
                    <td className="px-4 py-3 text-muted">{new Date(o.createdAt).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3">{o.itemCount}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatPrice(o.totalCents / 100)}
                      {o.shippingCents == null && <span className="block text-xs font-normal text-muted">excl. shipping</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">
            No orders yet.{" "}
            <Link href="/shop" className="font-semibold text-brand-strong hover:underline">
              Browse the shop
            </Link>
          </p>
        )}
      </section>
    </>
  );
}
