/** Resolución de recursos en servidor (usa fs). Para tipos/utilidades de cliente ver media-shared. */
import fs from "node:fs";
import path from "node:path";
import { mediaEntries, type MediaEntry } from "@/content/media";
import type { ResolvedMedia } from "./media-shared";
export type { ResolvedMedia } from "./media-shared";
export { isIllustrative } from "./media-shared";
import { galleryItems } from "@/content/gallery";

type Exists = (publicPath: string) => boolean;

const defaultExists: Exists = (p) =>
  fs.existsSync(path.join(process.cwd(), "public", p));

export function resolveMedia(entry: MediaEntry, exists: Exists = defaultExists): ResolvedMedia {
  const hasFile = exists(entry.file);
  if (hasFile) {
    const hasMobile = entry.mobileFile ? exists(entry.mobileFile) : false;
    return {
      id: entry.id,
      kind: entry.kind,
      src: entry.file,
      mobileSrc: hasMobile ? entry.mobileFile! : null,
      poster: null,
      origin: entry.origin,
      alt: entry.alt,
      isFallback: false,
    };
  }
  const fb = entry.fallback;
  return {
    id: entry.id,
    kind: entry.kind,
    src: fb ? fb.src : null,
    mobileSrc: null,
    poster: fb?.poster ?? null,
    origin: fb ? fb.origin : "placeholder",
    alt: entry.alt,
    isFallback: true,
  };
}

const registry = new Map<string, MediaEntry>(
  [...mediaEntries, ...galleryItems.map((g) => g.entry)].map((e) => [e.id, e]),
);

export function getMedia(id: string, exists?: Exists): ResolvedMedia {
  const entry = registry.get(id);
  if (!entry) throw new Error(`Recurso de media desconocido: ${id}`);
  return resolveMedia(entry, exists);
}
