"use client";

import { useEffect, useRef } from "react";

// Marks itself with data-in the first time it scrolls into view; CSS does the rest.
export function InView({ as: Tag = "div", className, children, margin = "0px 0px -12% 0px", ...rest }: { as?: "div" | "article" | "section" | "li" | "ul"; className?: string; children: React.ReactNode; margin?: string } & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting) {
          el.setAttribute("data-in", "");
          io.disconnect();
        }
      },
      { rootMargin: margin, threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  const Comp = Tag as React.ElementType;
  return (
    <Comp ref={ref} className={className} {...rest}>
      {children}
    </Comp>
  );
}
