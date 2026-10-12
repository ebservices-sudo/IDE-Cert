import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ConnectorDrawing } from "./ConnectorDrawing";

const facts = [
  { label: "Range", value: "EDELRID 2026" },
  { label: "Shop", value: "Sport & Professional" },
  { label: "Delivery", value: "Kosovo & the Balkans" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-white" aria-labelledby="hero-title">
      <div aria-hidden className="absolute inset-0 bg-grid-dark [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <Container className="relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-7">
          <p className="kicker text-brand">Inspection · Design · Engineering · Certification</p>
          <h1 id="hero-title" className="mt-6 font-display text-4xl leading-[1.04] sm:text-5xl lg:text-[3.5rem]">
            Certified gear for climbing and work at height.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-dark">
            IDE Cert supplies the EDELRID range for sport and professional use, and provides inspection, design,
            engineering and certification services from Prishtinë.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/shop">
              Shop equipment
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
            <ButtonLink href="/services#request" variant="outline-light">
              Request an inspection
            </ButtonLink>
          </div>
          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-ink-line pt-6">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="kicker text-[0.65rem] text-muted-dark">{f.label}</dt>
                <dd className="mt-1.5 text-sm font-semibold text-white">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="hidden lg:col-span-5 lg:block">
          <ConnectorDrawing className="mx-auto w-full max-w-md" />
        </div>
      </Container>
    </section>
  );
}
