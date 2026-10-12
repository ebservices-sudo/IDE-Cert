import Link from "next/link";
import clsx from "clsx";

type Variant = "primary" | "dark" | "outline-light" | "outline-dark";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-5 h-11 text-sm font-semibold transition-colors focus-visible:outline-offset-2 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-brand-strong text-white hover:bg-[#b5252a]",
  dark: "bg-ink text-white hover:bg-ink-3",
  "outline-light": "border border-white/25 text-white hover:border-white/60 hover:bg-white/5",
  "outline-dark": "border border-ink/20 text-ink hover:border-ink/50 hover:bg-ink/[0.03]",
};

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={clsx(base, variants[variant], className)}>
      {children}
    </Link>
  );
}
