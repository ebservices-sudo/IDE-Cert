import { BadgeCheck, ShieldCheck, Truck, UserRound } from "lucide-react";
import { site } from "@/config/site";
import { Container } from "@/components/ui/Container";

const points = [
  {
    icon: ShieldCheck,
    title: "An engineering company first",
    text: "Inspection, design, engineering and certification are our core work. The same expertise stands behind the equipment we sell.",
  },
  {
    icon: BadgeCheck,
    title: "Genuine EDELRID equipment",
    text: "Products come from EDELRID's current range, and every product page lists its standards and technical data.",
  },
  {
    icon: UserRound,
    title: `Led by ${site.owner}`,
    text: "Talk directly to the team about your project, your equipment or the standard that applies to it.",
  },
  {
    icon: Truck,
    title: "Kosovo and the Balkans",
    text: "Ordered for you from EDELRID and delivered across Kosovo and the Balkans, with a business invoice on request.",
  },
];

export function TrustSection() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="trust-title">
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="kicker text-brand-strong">Why IDE Cert</p>
          <h2 id="trust-title" className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
            Safety equipment from people who inspect it
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            Choosing PPE is a technical decision. We sell equipment the way we inspect it: with the standard, the data
            and the manufacturer documents in view.
          </p>
        </div>
        <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-7">
          {points.map(({ icon: Icon, title, text }) => (
            <li key={title} className="border-t-2 border-ink pt-5">
              <Icon aria-hidden className="size-6 text-brand-strong" strokeWidth={1.75} />
              <h3 className="mt-4 font-display text-lg leading-snug">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
