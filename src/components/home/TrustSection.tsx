import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, Truck, UserRound } from "lucide-react";
import { site } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { T } from "@/lib/i18n/T";

const points = [
  {
    icon: ShieldCheck,
    title: <T sq="Para së gjithash, kompani inxhinierike" en="An engineering company first" />,
    text: <T sq="Inspektimi, dizajnimi, inxhinieria dhe certifikimi janë puna jonë kryesore. E njëjta përvojë qëndron pas pajisjeve që shesim." en="Inspection, design, engineering and certification are our core work. The same expertise stands behind the equipment we sell." />,
  },
  {
    icon: BadgeCheck,
    title: <T sq="Pajisje origjinale EDELRID" en="Genuine EDELRID equipment" />,
    text: <T sq="Produktet vijnë nga gama aktuale e EDELRID dhe çdo faqe produkti tregon standardet dhe të dhënat teknike." en="Products come from EDELRID's current range, and every product page lists its standards and technical data." />,
  },
  {
    icon: UserRound,
    title: <T sq={`Udhëhequr nga ${site.owner}`} en={`Led by ${site.owner}`} />,
    text: <T sq="Flisni drejtpërdrejt me ekipin për projektin, pajisjet ose standardin që vlen për ju." en="Talk directly to the team about your project, your equipment or the standard that applies to it." />,
  },
  {
    icon: Truck,
    title: <T sq="Kosova dhe Ballkani" en="Kosovo and the Balkans" />,
    text: <T sq="I porosisim për ju nga EDELRID dhe i dorëzojmë në Kosovë dhe Ballkan, me faturë biznesi sipas kërkesës." en="Ordered for you from EDELRID and delivered across Kosovo and the Balkans, with a business invoice on request." />,
  },
];

export function TrustSection() {
  return (
    <section id="rreth-nesh" className="py-16 sm:py-20" aria-labelledby="trust-title">
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="kicker text-brand-strong"><T sq="Pse IDE Cert" en="Why IDE Cert" /></p>
          <h2 id="trust-title" className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
            <T sq="Pajisje sigurie nga njerëzit që i inspektojnë" en="Safety equipment from people who inspect it" />
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            <T
              sq="Zgjedhja e PPE është vendim teknik. Ne i shesim pajisjet ashtu siç i inspektojmë: me standardin, të dhënat dhe dokumentet e prodhuesit para syve."
              en="Choosing PPE is a technical decision. We sell equipment the way we inspect it: with the standard, the data and the manufacturer documents in view."
            />
          </p>
          <Link href="/about" className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold hover:text-brand-strong">
            <T sq="Më shumë rreth nesh" en="More about us" />
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-7">
          {points.map(({ icon: Icon, title, text }, i) => (
            <li key={i} className="border-t-2 border-ink pt-5">
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
