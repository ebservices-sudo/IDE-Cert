import manifest from "@/config/project-photos.json";

// Photos per project, written by scripts/project-photos.mjs before each build from the
// originals in public/projects/. Photos and renders first (the first is the cover), then
// technical drawings.
export type Photo = { src: string; small: string; w: number; h: number; blur: string; kind?: "photo" | "drawing" };

const all = manifest as Record<string, Photo[]>;

export const projectPhotos = (slug: string): Photo[] => (all[slug] ?? []).filter((p) => p.kind !== "drawing");
export const projectDrawings = (slug: string): Photo[] => (all[slug] ?? []).filter((p) => p.kind === "drawing");
export const coverPhoto = (slug: string): Photo | undefined => projectPhotos(slug)[0];
/** Every project photo, interleaved across projects, for the moving strip. */
export function allPhotos(slugs: string[]): { photo: Photo; slug: string }[] {
  const lists = slugs.map((s) => projectPhotos(s).map((photo) => ({ photo, slug: s })));
  const out: { photo: Photo; slug: string }[] = [];
  for (let i = 0; lists.some((l) => l[i]); i++) lists.forEach((l) => l[i] && out.push(l[i]));
  return out;
}
