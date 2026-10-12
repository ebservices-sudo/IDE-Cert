import Image from "next/image";
import { IdeGlyphs } from "@/components/brand/Logo";

/** Product photo, or a branded placeholder while the photo is missing. */
export function ProductImage({
  src,
  alt,
  sizes,
  preload = false,
  className = "object-contain p-4 sm:p-6",
}: {
  src?: string;
  alt: string;
  sizes?: string;
  preload?: boolean;
  className?: string;
}) {
  if (src) {
    return <Image src={src} alt={alt} fill sizes={sizes} preload={preload} className={className} />;
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,#f5f5f4,#ececea)]">
      <svg viewBox="0 0 324 144" aria-hidden="true" className="w-1/3 opacity-[0.12]">
        <IdeGlyphs fill="#141414" cuts={false} />
      </svg>
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Photo coming soon</span>
    </div>
  );
}
