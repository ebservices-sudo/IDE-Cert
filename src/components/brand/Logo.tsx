// IDE Cert wordmark, redrawn from the supplied logo (public/logo/ide-cert-logo-original.png).
// Geometry: 28-unit strokes, 12-unit stencil gaps, half-ring D. Keep in sync with public/brand/*.svg.

import { useId } from "react";

const RED = "#E5484D";

/** "IDE" letters. The D bowl has two hairline 45° stencil cuts, as in the original artwork. */
export function IdeGlyphs({ fill, cuts = true }: { fill: string; cuts?: boolean }) {
  const maskId = useId();
  return (
    <g fill={fill}>
      {cuts && (
        <mask id={maskId} maskUnits="userSpaceOnUse" x="100" y="-2" width="90" height="148">
          <rect x="100" y="-2" width="90" height="148" fill="white" />
          <g stroke="black" strokeWidth="0.8">
            <line x1="138.28" y1="43.72" x2="163.74" y2="18.26" />
            <line x1="138.28" y1="100.28" x2="163.74" y2="125.74" />
          </g>
        </mask>
      )}
      <rect x="0" y="0" width="28" height="144" />
      <rect x="62" y="0" width="28" height="144" />
      <path
        d="M102 0H110A72 72 0 0 1 110 144H102V116H110A44 44 0 0 0 110 28H102Z"
        mask={cuts ? `url(#${maskId})` : undefined}
      />
      <rect x="216" y="0" width="28" height="144" />
      <rect x="256" y="0" width="68" height="28" />
      <rect x="256" y="58" width="52" height="28" />
      <rect x="256" y="116" width="68" height="28" />
    </g>
  );
}

function CertGlyphs() {
  return (
    <g fill={RED}>
      <path d="M32.58 177.53A13.75 12.25 0 1 0 32.58 183.47" fill="none" stroke={RED} strokeWidth="7.5" />
      <rect x="102" y="165" width="7" height="31.5" />
      <rect x="102" y="165" width="30" height="7" />
      <rect x="102" y="178" width="27" height="6.5" />
      <rect x="102" y="189.5" width="30" height="7" />
      <rect x="197" y="165" width="7" height="31.5" />
      <path d="M200.5 168.5H218Q224.5 168.5 224.5 175Q224.5 181.5 218 181.5H200.5" fill="none" stroke={RED} strokeWidth="7" />
      <polygon points="214,182 222.5,182 229,196.5 220.5,196.5" />
      <rect x="291" y="165" width="32" height="7" />
      <rect x="304" y="165" width="7" height="31.5" />
    </g>
  );
}

type LogoProps = {
  /** "dark" = near-black IDE for light backgrounds; "light" = white IDE for dark backgrounds. */
  tone?: "dark" | "light";
  className?: string;
};

export function Logo({ tone = "dark", className }: LogoProps) {
  return (
    <svg viewBox="0 0 324 197" role="img" aria-label="IDE Cert" className={className}>
      <IdeGlyphs fill={tone === "dark" ? "#141414" : "#FFFFFF"} />
      <CertGlyphs />
    </svg>
  );
}
