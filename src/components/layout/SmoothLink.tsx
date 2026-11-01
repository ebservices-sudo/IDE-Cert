"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// Menu links glide to their section instead of jumping:
// - same page: smooth-scroll to #section (or to the top for a plain link);
// - another page: navigate there, then smooth-scroll down to #section (PendingScroll).
const KEY = "idecert-scroll-to";

export function SmoothLink({ href, onClick, ...rest }: React.ComponentProps<typeof Link> & { href: string }) {
  const path = usePathname();
  const router = useRouter();
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        const [target, hash] = href.split("#");
        const targetPath = target || "/";
        if (targetPath === path) {
          e.preventDefault();
          glide(hash);
          return;
        }
        if (hash) {
          e.preventDefault();
          try {
            sessionStorage.setItem(KEY, hash);
          } catch {}
          router.push(targetPath);
        }
      }}
    />
  );
}

function glide(hash?: string) {
  const el = hash ? document.getElementById(hash) : null;
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(history.state, "", `#${hash}`);
  } else window.scrollTo({ top: 0, behavior: "smooth" });
}

/** After a menu click on another page, scrolls smoothly to the requested section once the new page is shown. */
export function PendingScroll() {
  const path = usePathname();
  useEffect(() => {
    let hash: string | null = null;
    try {
      hash = sessionStorage.getItem(KEY);
      sessionStorage.removeItem(KEY);
    } catch {}
    if (!hash) return;
    const t = window.setTimeout(() => glide(hash!), 120);
    return () => window.clearTimeout(t);
  }, [path]);
  return null;
}
