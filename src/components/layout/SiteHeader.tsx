import Link from "next/link";
import { UserRound } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { RequestButton } from "./RequestButton";
import { SearchDialog } from "./SearchDialog";

const iconLink =
  "inline-flex size-10 items-center justify-center rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-white";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink text-white">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Link href="/" aria-label="IDE Cert home" className="shrink-0">
          <Logo tone="light" className="h-9 w-auto lg:h-10" />
        </Link>

        <DesktopNav />

        <div className="ml-auto flex items-center gap-1.5 lg:ml-4">
          <SearchDialog className={iconLink} />
          <Link href="/account" aria-label="Your account" className={`${iconLink} hidden sm:inline-flex`}>
            <UserRound aria-hidden className="size-5" />
          </Link>
          <div className="ml-1.5">
            <RequestButton />
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
