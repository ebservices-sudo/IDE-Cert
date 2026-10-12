import { Container } from "@/components/ui/Container";

// Development placeholder for pages built in a later step of the build plan. Remove before launch.
export function BuildStepNotice({ step, what }: { step: number; what: string }) {
  return (
    <Container className="py-16">
      <div className="rounded-xl border border-dashed border-ink/25 bg-mist p-8 text-center">
        <p className="kicker text-brand-strong">Build step {step}</p>
        <p className="mx-auto mt-3 max-w-xl text-muted">{what}</p>
      </div>
    </Container>
  );
}
