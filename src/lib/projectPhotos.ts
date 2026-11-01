import manifest from "@/config/project-photos.json";

// Photos per project, written by scripts/project-photos.mjs before each build from the
// originals in public/projects/. First photo = cover.
export type Photo = { src: string; small: string; w: number; h: number; blur: string };

const all = manifest as Record<string, Photo[]>;

export const projectPhotos = (slug: string): Photo[] => all[slug] ?? [];
export const coverPhoto = (slug: string): Photo | undefined => all[slug]?.[0];
