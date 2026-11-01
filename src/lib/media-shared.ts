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
