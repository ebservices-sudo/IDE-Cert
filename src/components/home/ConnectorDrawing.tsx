// Decorative engineering-style line drawing of a pear-shaped (HMS) screwgate connector for the home hero.
// Purely illustrative: no dimensions or ratings are stated.

export function ConnectorDrawing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 580" className={className} aria-hidden="true">
      {/* frame corner marks */}
      <path
        d="M8 40V8H40M440 8H472V40M472 540V572H440M40 572H8V540"
        fill="none"
        stroke="rgb(255 255 255 / 0.28)"
        strokeWidth="1.5"
      />

      {/* extension lines and centre line */}
      <g stroke="rgb(255 255 255 / 0.2)" strokeWidth="1" strokeDasharray="4 6">
        <line x1="205" y1="47" x2="440" y2="47" />
        <line x1="222" y1="499" x2="440" y2="499" />
        <line x1="69" y1="200" x2="69" y2="540" />
        <line x1="341" y1="150" x2="341" y2="540" />
        <line x1="20" y1="276" x2="460" y2="276" strokeDasharray="14 6 2 6" />
      </g>

      {/* body: wide top, spine tapering to a narrower base */}
      <path
        d="M330 150C330 84 272 58 205 58C128 58 80 104 80 178C80 280 98 372 128 432C150 474 186 490 222 486C254 482 278 460 288 428"
        fill="none"
        stroke="#fff"
        strokeWidth="22"
        strokeLinecap="round"
      />
      {/* gate */}
      <line x1="288" y1="422" x2="328" y2="170" stroke="#fff" strokeWidth="12" strokeLinecap="round" />
      {/* screw sleeve */}
      <g transform="rotate(8.9 319 226)">
        <rect x="305" y="178" width="28" height="96" rx="7" fill="#141414" stroke="#E5484D" strokeWidth="4" />
        <g stroke="#E5484D" strokeWidth="2">
          <line x1="311" y1="198" x2="327" y2="198" />
          <line x1="311" y1="208" x2="327" y2="208" />
          <line x1="311" y1="218" x2="327" y2="218" />
        </g>
      </g>

      {/* dimension lines */}
      <g stroke="#E5484D" strokeWidth="1.5">
        <line x1="430" y1="47" x2="430" y2="499" />
        <line x1="420" y1="47" x2="440" y2="47" />
        <line x1="420" y1="499" x2="440" y2="499" />
        <line x1="69" y1="530" x2="341" y2="530" />
        <line x1="69" y1="520" x2="69" y2="540" />
        <line x1="341" y1="520" x2="341" y2="540" />
      </g>
      <g fill="#E5484D">
        <path d="M430 47l-5 12h10z" />
        <path d="M430 499l-5-12h10z" />
        <path d="M69 530l12-5v10z" />
        <path d="M341 530l-12-5v10z" />
      </g>
      <g fontFamily="var(--font-archivo), sans-serif" fontSize="12" fontWeight="700" textAnchor="middle">
        <circle cx="430" cy="276" r="13" fill="#141414" stroke="#E5484D" strokeWidth="1.5" />
        <text x="430" y="280.5" fill="#fff">A</text>
        <circle cx="205" cy="530" r="13" fill="#141414" stroke="#E5484D" strokeWidth="1.5" />
        <text x="205" y="534.5" fill="#fff">B</text>
      </g>

      <text
        x="8"
        y="566"
        fill="rgb(255 255 255 / 0.45)"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="10"
        letterSpacing="2"
      >
        FIG. 01 · CONNECTOR · SCHEMATIC
      </text>
    </svg>
  );
}
