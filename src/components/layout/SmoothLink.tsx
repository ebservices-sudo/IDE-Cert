"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// A link that, when it points at the page you are already on, glides back to the top
// instead of reloading the same page. Other links navigate normally (with the page
// transition from app/(site)/template.tsx).
export function SmoothLink({ href, onClick, ...rest }: React.ComponentProps<typeof Link> & { href: string }) {
  const path = usePathname();
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        const [target, hash] = href.split("#");
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if ((target || "/") === path) {
          e.preventDefault();
          const el = hash ? document.getElementById(hash) : null;
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          else window.scrollTo({ top: 0, behavior: "smooth" });
          if (hash) history.replaceState(history.state, "", `#${hash}`);
        }
      }}
    />
  );
}
