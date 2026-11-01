import { Logo } from "@/components/brand/Logo";
import { DesktopNav } from "./DesktopNav";
import { LangToggle } from "./LangToggle";
import { MobileNav } from "./MobileNav";
import { RequestButton } from "./RequestButton";
import { SearchDialog } from "./SearchDialog";
import { SmoothLink } from "./SmoothLink";

const iconLink =
  "inline-flex size-10 items-center justify-center rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-white";

export function SiteHeader() {
  return (
    <header style={{ viewTransitionName: "site-header" }} className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(20,20,20,0.82)] text-white backdrop-blur-[14px]">
      <div className="mx-auto flex h-16 w-full max-w-[90rem] items-center gap-5 px-4 sm:px-6 lg:h-[72px] lg:px-14">
        <SmoothLink href="/" aria-label="IDE Cert" className="shrink-0 transition-opacity hover:opacity-80">
          <Logo tone="light" className="h-9 w-auto lg:h-10" />
        </SmoothLink>

        <DesktopNav />

        <div className="ml-auto flex items-center gap-2 xl:ml-3">
          <SearchDialog className={iconLink} />
          <LangToggle className="hidden sm:flex" />
          <div className="ml-1">
            <RequestButton />
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
