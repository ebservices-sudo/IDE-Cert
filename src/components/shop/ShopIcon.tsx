// Line icons for shop categories and uses, drawn on a 48-unit grid in the
// site's technical-drawing style. The red stroke marks the safety-critical part.

export type IconName =
  | "rope" | "cord" | "sling" | "carab" | "belay" | "pulley" | "harness" | "helmet"
  | "lanyard" | "ice" | "bag" | "acc" | "spare" | "shirt" | "tree" | "wall" | "all";

const PATHS: Record<IconName, React.ReactNode> = {
  rope: (<><ellipse cx="24" cy="24" rx="15" ry="11" /><ellipse cx="24" cy="24" rx="10" ry="7" /><ellipse cx="24" cy="24" rx="5" ry="3.2" /><path className="text-brand" d="M37 30c4 3 6 7 6 13" /></>),
  cord: (<><path d="M8 30c6-14 14 8 20-6s10 2 12-4" /><path d="M8 36c6-14 14 8 20-6s10 2 12-4" /><circle className="text-brand" cx="40" cy="20" r="2" /></>),
  sling: (<><rect x="8" y="17" width="32" height="14" rx="7" /><rect x="13" y="21" width="22" height="6" rx="3" /><path className="text-brand" d="M24 17v14" /></>),
  carab: (<><path d="M18 8h10a10 10 0 0 1 10 10v12a10 10 0 0 1-10 10h-6a10 10 0 0 1-10-10V16a8 8 0 0 1 6-8Z" /><path className="text-brand" d="M12 18l7 14" /></>),
  belay: (<><path d="M14 8h20l4 18-14 14-14-14Z" /><rect x="18" y="14" width="4" height="10" rx="2" /><rect x="26" y="14" width="4" height="10" rx="2" /><path className="text-brand" d="M20 4v20M28 4v20" /></>),
  pulley: (<><circle cx="24" cy="22" r="10" /><circle cx="24" cy="22" r="3" /><path d="M14 22v14h20V22" /><path className="text-brand" d="M14 36v8M34 36v8" /></>),
  harness: (<><path d="M8 14c10 4 22 4 32 0" /><path d="M8 20c10 4 22 4 32 0" /><path d="M14 22c-2 8 0 16 6 20M34 22c2 8 0 16-6 20" /><circle className="text-brand" cx="24" cy="26" r="3" /></>),
  helmet: (<><path d="M8 32c0-11 7-20 16-20s16 9 16 20Z" /><path d="M6 32h36" /><path d="M18 14c-2 5-2 12-1 18M30 14c2 5 2 12 1 18" /><path className="text-brand" d="M14 32v6M34 32v6" /></>),
  lanyard: (<><path d="M24 9v9" /><path d="M24 18c-4 6-10 10-12 16M24 18c4 6 10 10 12 16" /><path className="text-brand" d="M8 34h7v8H8ZM33 34h7v8h-7Z" /><circle cx="24" cy="6" r="2.5" /></>),
  ice: (<><path d="M20 6l6 2-4 34" /><path d="M8 12c6-4 14-6 22-4l10 4" /><path className="text-brand" d="M40 12l-6 6" /><path d="M22 42h4" /></>),
  bag: (<><rect x="12" y="12" width="24" height="30" rx="5" /><path d="M18 12V9a6 6 0 0 1 12 0v3" /><path d="M12 24h24" /><path className="text-brand" d="M20 30h8" /></>),
  acc: (<><path d="M14 14h20l-3 26H17Z" /><path d="M14 14c0-4 4-6 10-6s10 2 10 6" /><path className="text-brand" d="M20 24h8" /></>),
  spare: (<><path d="M30 8a8 8 0 0 0-8 10L8 32l6 6 14-14a8 8 0 0 0 10-8l-5 3-4-4Z" /><circle className="text-brand" cx="12" cy="34" r="1.6" /></>),
  shirt: (<><path d="M16 8l-9 6 4 7 5-3v22h16V18l5 3 4-7-9-6c-1 3-4 5-8 5s-7-2-8-5Z" /><path className="text-brand" d="M20 24h8" /></>),
  tree: (<><path d="M24 44V20" /><path d="M24 6c-8 0-14 6-14 13s6 11 14 11 14-4 14-11S32 6 24 6Z" /><path className="text-brand" d="M24 26l8 6v12" /></>),
  wall: (<><path d="M10 42L13 6H38L36 42Z" /><circle cx="19" cy="14" r="2" /><circle cx="30" cy="20" r="2" /><circle cx="21" cy="30" r="2" /><path className="text-brand" d="M26 8V42" /></>),
  all: (<><rect x="8" y="8" width="13" height="13" rx="2" /><rect x="27" y="8" width="13" height="13" rx="2" /><rect x="8" y="27" width="13" height="13" rx="2" /><rect className="text-brand" x="27" y="27" width="13" height="13" rx="2" /></>),
};

export function ShopIcon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}
