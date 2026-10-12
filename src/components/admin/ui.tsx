import Link from "next/link";
import clsx from "clsx";

// Small building blocks for admin pages.

export function AdminHeader({ title, description, actions, back }: { title: string; description?: React.ReactNode; actions?: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="text-xs font-semibold text-muted hover:text-ink">
            ← {back.label}
          </Link>
        )}
        <h1 className="mt-1 font-display text-2xl sm:text-3xl">{title}</h1>
        {description && <div className="mt-1 text-sm text-muted">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, children, className, actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={clsx("rounded-xl border border-line bg-white", className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 className="text-sm font-semibold">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Stat({ label, value, href, tone }: { label: string; value: React.ReactNode; href?: string; tone?: "alert" }) {
  const body = (
    <>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className={clsx("mt-2 font-display text-3xl tabular-nums", tone === "alert" && "text-brand-strong")}>{value}</p>
    </>
  );
  const cls = "block rounded-xl border border-line bg-white p-5";
  return href ? (
    <Link href={href} className={clsx(cls, "transition-colors hover:border-ink/30")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export const table = {
  wrap: "overflow-x-auto rounded-xl border border-line bg-white",
  table: "w-full min-w-[40rem] text-sm",
  thead: "bg-mist text-left text-xs uppercase tracking-wider text-muted",
  th: "px-4 py-3 font-semibold",
  td: "px-4 py-3 align-top",
  tbody: "divide-y divide-line",
};

export const inputCls = "block w-full rounded-md border border-line bg-white px-3 text-sm outline-none hover:border-ink/40 focus:border-ink";
export const buttonCls = {
  primary: "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-strong px-4 text-sm font-semibold text-white hover:bg-[#b5252a] disabled:opacity-50",
  dark: "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-3 disabled:opacity-50",
  outline: "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold hover:border-ink/40 disabled:opacity-50",
};

export const eur = (cents: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(cents / 100);
export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Belgrade" });
