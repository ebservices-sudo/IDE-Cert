import Link from "next/link";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

export function SectionHeading({
  kicker,
  title,
  description,
  action,
  tone = "light",
  id,
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
  tone?: "light" | "dark";
  id?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {kicker && <p className={clsx("kicker", dark ? "text-brand" : "text-brand-strong")}>{kicker}</p>}
        <h2 id={id} className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className={clsx("mt-4 text-base leading-relaxed", dark ? "text-muted-dark" : "text-muted")}>
            {description}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className={clsx(
            "group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold",
            dark ? "text-white hover:text-brand" : "text-ink hover:text-brand-strong",
          )}
        >
          {action.label}
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
