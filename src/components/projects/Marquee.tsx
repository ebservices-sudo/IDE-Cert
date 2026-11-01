import Link from "next/link";
import type { Photo as P } from "@/lib/projectPhotos";
import { Photo } from "./Photo";

// An endless, slowly moving strip of project photos (pauses on hover). Each photo links
// to its project. Reduced motion: a plain strip you can scroll sideways.
export function Marquee({ items, names }: { items: { photo: P; slug: string }[]; names: Record<string, string> }) {
  if (items.length < 3) return null;
  const loop = [...items, ...items];
  return (
    <div className="pr-marq" aria-label="Photos">
      <ul className="pr-marq-track" style={{ "--pr-marq": `${items.length * 7}s` } as React.CSSProperties}>
        {loop.map((it, i) => {
          const copy = i >= items.length;
          return (
            <li key={i} aria-hidden={copy || undefined}>
              <Link href={`/projects/${it.slug}`} tabIndex={copy ? -1 : undefined} className="pr-card pr-marq-item" style={{ aspectRatio: `${it.photo.w} / ${it.photo.h}` }}>
                <Photo photo={it.photo} alt="" sizes="40vw" className="h-full w-full" />
                <span className="pr-marq-tag">{names[it.slug]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
