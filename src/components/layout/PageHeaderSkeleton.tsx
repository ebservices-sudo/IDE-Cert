import { Container } from "@/components/ui/Container";

/** Placeholder for <PageHeader> while route params resolve. */
export function PageHeaderSkeleton() {
  return (
    <section aria-hidden className="bg-ink">
      <Container className="py-12 sm:py-14">
        <div className="h-3 w-48 rounded bg-white/10" />
        <div className="mt-8 h-3 w-24 rounded bg-white/10" />
        <div className="mt-4 h-10 w-2/3 max-w-md rounded bg-white/10" />
        <div className="mt-5 h-4 w-full max-w-xl rounded bg-white/10" />
      </Container>
    </section>
  );
}
