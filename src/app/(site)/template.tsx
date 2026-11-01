import { ViewTransition } from "react";

// Re-created on every navigation, so each page fades and slides in while the old
// one fades out (CSS in globals.css: .page-in / .page-out). The header stays put.
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      {children}
    </ViewTransition>
  );
}
