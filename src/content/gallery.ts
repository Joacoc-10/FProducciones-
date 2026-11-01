import type { MediaEntry, MediaFallback } from "./media";

/**
 * Galería. ÚNICO lugar donde se registra una pieza nueva:
 *  1. Guardar el archivo en `public/media/...` (fotos: `ai/gallery/` o `real/`; videos: `video/`).
 *  2. Agregar un objeto a `galleryItems` con su `entry` y, opcionalmente, `home`.
 * Aparece sola en `/galeria` (filtros Todos/Fotos/Videos, visor y rótulo), sin tocar componentes.
 * Si el archivo todavía no existe, se usa el `fallback` (o un placeholder).
 *
 * REGLA: una pieza con origin !== "authentic" siempre se rotula «Ilustrativa»
 * y nunca se describe como trabajo realizado (verificado por tests).
 * Para pasar una pieza a real: guardar el archivo en `public/media/real/...`,
 * apuntar `file` allí y cambiar `origin` a "authentic".
 */
export interface GalleryItem {
  entry: MediaEntry;
  /**
   * Presente solo si la pieza va en el mosaico de la portada. El orden del arreglo define la
   * posición y `span` es el tamaño de ESA posición (al intercambiar piezas, intercambiar también el span).
   * Sin `home`, la pieza se ve únicamente en /galeria.
   */
  home?: {
    /** Clases de grilla para escritorio (modo «Todo») */
    span: string;
    featured?: boolean;
    /** `object-position` del recorte (p. ej. "35% 50%") */
    objectPosition?: string;
  };
  /** Tipo de evento (solo piezas auténticas deberían declararlo) */
  event?: string;
}

const IK = "https://ik.imagekit.io/i1pxujmp5t/FProducciones";
const photo = (name: string): MediaFallback => ({ src: `${IK}/${name}`, origin: "stock-illustrative" });
const video = (name: string): MediaFallback => ({
  src: `${IK}/${name}`,
  poster: `${IK}/${name}/ik-thumbnail.jpg?tr=w-1280`,
  origin: "stock-illustrative",
});

export const galleryItems: GalleryItem[] = [
  // — Mosaico de la portada (8 posiciones, en orden) —
  {
    entry: {
      id: "gallery.concept-06",
      kind: "image",
      file: "/media/ai/gallery/concept-06.jpg",
      origin: "ai-illustrative",
      alt: "Imagen conceptual: técnico de sonido de espaldas operando una consola Behringer X32 frente a un escenario al aire libre",
      fallback: photo("7cb71912-631e-40d7-899b-1a0eef828e21.JPG"),
    },
    home: { span: "lg:col-span-8 lg:row-span-3", featured: true },
  },
  {
    entry: {
      id: "gallery.concept-01",
      kind: "image",
      file: "/media/ai/gallery/concept-01.jpg",
      origin: "ai-illustrative",
      alt: "Imagen conceptual: jardín de noche con mesas servidas y una pista iluminada en violeta",
      fallback: photo("f55de1c5-1fc8-4322-bcb6-cde1c0663995.JPG"),
    },
    home: { span: "lg:col-span-4 lg:row-span-3" },
  },
  {
    entry: {
      id: "gallery.concept-02",
      kind: "image",
      file: "/media/ai/gallery/concept-02.jpg",
      origin: "ai-illustrative",
      alt: "Imagen conceptual: novios bailando entre invitados bajo luces violetas y una bola espejada",
      fallback: photo("pexels-frentescuphotography-7360983.jpg"),
    },
    home: { span: "lg:col-span-5 lg:row-span-2" },
  },
  {
    entry: {
      id: "gallery.concept-08",
      kind: "image",
      file: "/media/ai/gallery/concept-08.jpg",
      origin: "ai-illustrative",
      alt: "Imagen conceptual: camión de Fabio Producciones en ruta al atardecer",
    },
    home: { span: "lg:col-span-3 lg:row-span-2", objectPosition: "30% 50%" },
  },
  {
    entry: {
      id: "gallery.video-01",
      kind: "video",
      file: "/media/video/gallery-01.mp4",
      origin: "ai-illustrative",
      alt: "Video conceptual: acercamiento a una consola de DJ",
      fallback: video("12893899-hd_1920_1080_24fps.mp4"),
    },
    home: { span: "lg:col-span-4 lg:row-span-2" },
  },
  {
    entry: {
      id: "gallery.concept-04",
      kind: "image",
      file: "/media/ai/gallery/concept-04.jpg",
      origin: "ai-illustrative",
      alt: "Imagen conceptual: salón de fiesta con bolas espejadas, luces violetas y DJ al fondo",
      fallback: photo("aa4ab966-8cf5-49c1-8209-de54091e652b.JPG"),
    },
    home: { span: "lg:col-span-4 lg:row-span-3" },
  },
  {
    entry: {
      id: "gallery.concept-05",
      kind: "image",
      file: "/media/ai/gallery/concept-05.jpg",
      origin: "ai-illustrative",
      alt: "Imagen conceptual: coro de murga con trajes de colores sobre un escenario con luces rojas y azules",
      fallback: photo("pexels-goumbik-1309597.jpg"),
    },
    home: { span: "lg:col-span-5 lg:row-span-3" },
  },
  {
    entry: {
      id: "gallery.concept-03",
      kind: "image",
      file: "/media/ai/gallery/concept-03.jpg",
      origin: "ai-illustrative",
      alt: "Imagen conceptual: fiesta de 15 con la cumpleañera en vestido de gala entre invitados, bolas espejadas y luces violetas",
      fallback: photo("1fb3af46-9b79-4ed7-8fa0-d5bdc87fafe0.JPG"),
    },
    home: { span: "lg:col-span-3 lg:row-span-3" },
  },

  // — Solo en /galeria —
  {
    entry: {
      id: "gallery.concept-07",
      kind: "image",
      file: "/media/ai/gallery/concept-07.jpg",
      origin: "ai-illustrative",
      alt: "Imagen conceptual: luces móviles sobre una estructura de truss con haces violeta",
    },
  },
  {
    entry: {
      id: "gallery.video-02",
      kind: "video",
      file: "/media/video/gallery-02.mp4",
      origin: "ai-illustrative",
      alt: "Video conceptual: mesa de audio en movimiento",
      fallback: video("120954-724685298_small.mp4"),
    },
  },
];
