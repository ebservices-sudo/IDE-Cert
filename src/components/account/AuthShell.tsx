import { Container } from "@/components/ui/Container";

/** Narrow centred card used by the sign-in, register and password pages. */
export function AuthShell({ title, intro, children, footer }: { title: string; intro?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <Container className="py-14 lg:py-20">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-3xl">{title}</h1>
        {intro && <p className="mt-2 text-muted">{intro}</p>}
        <div className="mt-8 rounded-xl border border-line p-6 sm:p-8">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
      </div>
    </Container>
  );
}
