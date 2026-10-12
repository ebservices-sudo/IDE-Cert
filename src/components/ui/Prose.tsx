import clsx from "clsx";

/** Typography for long-form text (legal pages, about). */
export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "max-w-3xl text-[15px] leading-relaxed text-ink/85",
        "[&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-ink [&_h2:first-child]:mt-0",
        "[&_h3]:mt-8 [&_h3]:font-semibold [&_h3]:text-ink",
        "[&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
        "[&_a]:font-semibold [&_a]:text-brand-strong [&_a]:underline-offset-2 hover:[&_a]:underline [&_strong]:text-ink",
        className,
      )}
    >
      {children}
    </div>
  );
}
