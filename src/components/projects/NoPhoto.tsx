import { T } from "@/lib/i18n/T";

// Shown until a project's photos are uploaded.
export function NoPhoto({ className = "", label = true }: { className?: string; label?: boolean }) {
  return (
    <div className={`pr-none ${className}`}>
      <svg className="pr-ridge" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 80L50 52L90 66L150 30L200 58L250 40L300 70L350 46L400 64V120H0Z" fill="rgba(242,239,234,0.05)" stroke="rgba(242,239,234,0.22)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d="M60 40L330 78" stroke="#e5484d" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      {label && (
        <span>
          <T sq="Fotot vijnë së shpejti" en="Photos coming soon" />
        </span>
      )}
    </div>
  );
}
