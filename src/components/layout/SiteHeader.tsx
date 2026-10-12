import Link from "next/link";
import { UserRound } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { CartButton } from "./CartButton";
import { SearchDialog } from "./SearchDialog";

const iconLink =
  "inline-flex size-10 items-center justify-center rounded-md text-white/85 transition-colors hover:bg-white/5 hover:text-white";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-line bg-ink text-white">
      <Container className="flex h-16 items-center gap-8 lg:h-[72px]">
        <Link href="/" aria-label="IDE Cert home" className="shrink-0">
          <Logo tone="light" className="h-9 w-auto lg:h-10" />
        </Link>

        <DesktopNav />

        <div className="ml-auto flex items-center gap-1">
          <SearchDialog className={iconLink} />
          <Link href="/account" aria-label="Your account" className={`${iconLink} hidden sm:inline-flex`}>
            <UserRound aria-hidden className="size-5" />
          </Link>
          <CartButton className={iconLink} />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
