import { Mail, Phone } from "lucide-react";
import { site } from "@/config/site";
import { Container } from "@/components/ui/Container";

export function TopBar() {
  const [primary, secondary] = site.phones;
  return (
    <div className="bg-ink-2 text-xs text-muted-dark">
      <Container className="flex h-9 items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <a href={primary.href} className="inline-flex items-center gap-1.5 hover:text-white">
            <Phone aria-hidden className="size-3.5" />
            {primary.display}
          </a>
          <a href={secondary.href} className="hidden items-center gap-1.5 hover:text-white sm:inline-flex">
            <Phone aria-hidden className="size-3.5" />
            {secondary.display}
          </a>
          <a href={`mailto:${site.email}`} className="hidden items-center gap-1.5 hover:text-white md:inline-flex">
            <Mail aria-hidden className="size-3.5" />
            {site.email}
          </a>
        </div>
        <p className="hidden lg:block">{site.deliveryNote}</p>
      </Container>
    </div>
  );
}
