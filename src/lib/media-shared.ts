import type { MediaOrigin } from "@/content/media";

/** Resultado de resolver un recurso. Seguro para importar desde componentes de cliente. */
export interface ResolvedMedia {
  id: string;
  kind: "image" | "video";
  src: string | null;
  mobileSrc: string | null;
  poster: string | null;
  origin: MediaOrigin;
  alt: string;
  /** true si se está usando el medio provisorio y no el archivo definitivo */
  isFallback: boolean;
}

/** `true` si el recurso debe llevar la etiqueta «Ilustrativa». */
export const isIllustrative = (origin: MediaOrigin) => origin !== "authentic";

/** Pieza de galería lista para renderizar (portada y /galeria). */
export interface GalleryTile extends ResolvedMedia {
  /** Clases de grilla del mosaico de la portada (vacío si no aparece allí) */
  span: string;
  featured?: boolean;
  /** `object-position` del recorte en el mosaico de la portada */
  objectPosition?: string;
  event?: string;
}
