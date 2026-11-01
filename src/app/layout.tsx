import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { site } from "@/config/site";
import { langBootScript } from "@/lib/i18n/T";
import "./globals.css";

// Variable font with a width axis: normal width for body text, 125% for display headings.
const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "IDE Cert | Certified climbing and work-at-height equipment",
    template: "%s | IDE Cert",
  },
  description:
    "IDE Cert supplies EDELRID climbing and work-at-height equipment and provides inspection, design, engineering and certification services from Prishtinë, Kosovo.",
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en",
    images: [{ url: "/brand/ide-cert-logo.png", alt: site.legalName }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#141414",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sq" data-lang="sq" data-scroll-behavior="smooth" className={archivo.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: langBootScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
