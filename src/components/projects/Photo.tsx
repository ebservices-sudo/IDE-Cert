"use client";

import { useEffect, useRef, useState } from "react";
import type { Photo as P } from "@/lib/projectPhotos";

// A project photo that fades in over its blurred preview once it has loaded.
export function Photo({ photo, alt, sizes, className = "", priority = false }: { photo: P; alt: string; sizes: string; className?: string; priority?: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth) requestAnimationFrame(() => setLoaded(true));
  }, []);
  const srcSet = photo.small === photo.src ? undefined : `${photo.small} 900w, ${photo.src} 2000w`;
  return (
    <div className={`pr-ph ${className}`} style={photo.blur ? { backgroundImage: `url("${photo.blur}")` } : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element -- web copies are made at build time (scripts/project-photos.mjs) */}
      <img
        ref={ref}
        src={photo.small}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={photo.w}
        height={photo.h}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        data-loaded={loaded ? "" : undefined}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
