/**
 * Registro central de recursos visuales.
 * Cada entrada declara la ruta pública donde debe guardarse el archivo definitivo.
 * Si el archivo existe en build, se usa con su `origin`; si no, se usa el `fallback`.
 * Inventario y prompts: docs/MEDIA_ASSETS.md
 */
export type MediaOrigin =
  | "authentic"
  | "ai-illustrative"
  | "stock-illustrative"
  | "placeholder";

export interface MediaFallback {
  src: string;
  poster?: string;
  origin: MediaOrigin;
}

export interface MediaEntry {
  id: string;
  kind: "image" | "video";
  /** Ruta pública (relativa a /public) del archivo definitivo */
  file: string;
  /** Variante liviana para móvil (solo video) */
  mobileFile?: string;
  /** Póster del video (ruta pública). Se usa solo si el archivo existe en build */
  poster?: string;
  /** Origen del archivo definitivo */
  origin: MediaOrigin;
  alt: string;
  /** Medio actual mientras no exista el archivo definitivo */
  fallback?: MediaFallback;
}

const IK = "https://ik.imagekit.io/i1pxujmp5t/FProducciones";
const ikPhoto = (name: string): MediaFallback => ({
  src: `${IK}/${name}`,
  // Procedencia sin confirmar → se trata como ilustrativa
  origin: "stock-illustrative",
});
const ikVideo = (name: string): MediaFallback => ({
  src: `${IK}/${name}`,
  poster: `${IK}/${name}/ik-thumbnail.jpg?tr=w-1280`,
  origin: "stock-illustrative",
});

export const mediaEntries: MediaEntry[] = [
  // — Hero —
  {
    id: "hero.poster",
    kind: "image",
    file: "/media/ai/hero/hero-stage-wide.jpg",
    origin: "ai-illustrative",
    alt: "Ilustración de un escenario vacío con haces de luz carmesí entre humo",
    fallback: {
      src: `${IK}/4043976-hd_1920_1080_24fps.mp4/ik-thumbnail.jpg?tr=w-1920`,
      origin: "stock-illustrative",
    },
  },
  {
    id: "hero.video",
    kind: "video",
    file: "/media/video/hero-loop.mp4",
    mobileFile: "/media/video/hero-loop-mobile.mp4",
    origin: "ai-illustrative",
    alt: "Video ilustrativo: consola y luces de un evento",
    fallback: ikVideo("4043976-hd_1920_1080_24fps.mp4"),
  },

  // — Escenario portátil —
  {
    id: "stage.poster",
    kind: "image",
    file: "/media/ai/stage/stage-poster.jpg",
    origin: "ai-illustrative",
    alt: "Ilustración de una plataforma portátil desplegada y vacía",
  },
  {
    id: "stage.final",
    kind: "image",
    file: "/media/ai/stage/stage-final.jpg",
    origin: "ai-illustrative",
    alt: "Ilustración de un escenario portátil equipado con estructura, sonido y luces encendidas",
  },
  {
    id: "stage.video",
    kind: "video",
    file: "/media/video/stage-build.mp4",
    mobileFile: "/media/video/stage-build-mobile.mp4",
    origin: "ai-illustrative",
    alt: "Animación ilustrativa de una plataforma portátil que pasa de vacía a equipada e iluminada",
  },

  // — Tipos de evento —
  {
    id: "event.bodas",
    kind: "image",
    file: "/media/ai/events/bodas-card.jpg",
    origin: "ai-illustrative",
    alt: "Ilustración de un salón de bodas de noche con luces ámbar",
    fallback: ikPhoto("IMG_7176.JPG"),
  },
  {
    id: "event.cumpleanos-y-15",
    kind: "image",
    file: "/media/ai/events/cumpleanos-y-15-card.jpg",
    origin: "ai-illustrative",
    alt: "Ilustración de un salón de fiesta con luces magenta",
    fallback: ikPhoto("aa4ab966-8cf5-49c1-8209-de54091e652b.JPG"),
  },
  {
    id: "event.fiestas-privadas",
    kind: "image",
    file: "/media/ai/events/fiestas-privadas-card.jpg",
    origin: "ai-illustrative",
    alt: "Ilustración de una fiesta privada en un jardín con luces violeta",
    fallback: ikPhoto("1fb3af46-9b79-4ed7-8fa0-d5bdc87fafe0.JPG"),
  },
  {
    id: "event.corporativos",
    kind: "image",
    file: "/media/ai/events/corporativos-card.jpg",
    origin: "ai-illustrative",
    alt: "Ilustración de un escenario de conferencia con luces azules",
    fallback: ikPhoto("pexels-goumbik-1309597.jpg"),
  },
  {
    id: "event.espectaculos",
    kind: "image",
    file: "/media/ai/events/espectaculos-card.jpg",
    origin: "ai-illustrative",
    alt: "Ilustración de un escenario de espectáculo con haces carmesí y blancos entre humo",
    fallback: ikPhoto("pexels-frentescuphotography-7360983.jpg"),
  },

  // — Servicios (fondos opcionales, sin fallback) —
  {
    id: "service.audio",
    kind: "image",
    file: "/media/ai/services/audio.jpg",
    origin: "ai-illustrative",
    alt: "Ilustración de una consola de audio con faders iluminados en rojo",
  },
  {
    id: "service.luces",
    kind: "image",
    file: "/media/ai/services/luces.jpg",
    origin: "ai-illustrative",
    alt: "Ilustración de luces móviles proyectando haces carmesí y blancos",
  },
  {
    id: "service.escenario",
    kind: "image",
    file: "/media/ai/services/escenario.jpg",
    origin: "ai-illustrative",
    alt: "Ilustración de una plataforma portátil con paneles modulares",
  },
];
