import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SiteChrome } from "@/components/layout/SiteChrome";

export default function NotFound() {
  return (
    <SiteChrome>
    <section className="relative overflow-hidden bg-ink text-white">
      <div aria-hidden className="absolute inset-0 bg-grid-dark" />
      <Container className="relative py-24 sm:py-32">
        <p className="kicker text-brand">Error 404</p>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl">Page not found</h1>
        <p className="mt-4 max-w-lg text-muted-dark">
          This page doesn&apos;t exist or has moved. Try the shop, or get in touch and we&apos;ll help you find the
          right equipment.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/shop">
            Go to the shop
            <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline-light">
            Contact us
          </ButtonLink>
        </div>
      </Container>
    </section>
    </SiteChrome>
  );
}
