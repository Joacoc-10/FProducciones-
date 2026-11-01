import type { MediaEntry, MediaFallback } from "./media";

/**
 * Galería. Mientras no haya material auténtico, se usa contenido conceptual.
 * REGLA: una pieza con origin !== "authentic" siempre se rotula «Ilustrativa»
 * y nunca se describe como trabajo realizado (verificado por tests).
 * Para pasar una pieza a real: guardar el archivo en `public/media/real/...`,
 * apuntar `file` allí y cambiar `origin` a "authentic".
 */
export interface GalleryItem {
  entry: MediaEntry;
  /** Clases de grilla para escritorio (modo «Todo») */
  span: string;
  featured?: boolean;
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
  {
    entry: {
      id: "gallery.video-01",
      kind: "video",
      file: "/media/video/gallery-01.mp4",
      origin: "ai-illustrative",
      alt: "Video conceptual: acercamiento a una consola de DJ",
      fallback: video("12893899-hd_1920_1080_24fps.mp4"),
    },
    span: "lg:col-span-8 lg:row-span-3",
    featured: true,
  },
  {
    entry: {
      id: "gallery.concept-01",
      kind: "image",
      file: "/media/ai/gallery/concept-01.jpg",
      origin: "ai-illustrative",
      alt: "Imagen conceptual: escenario de teatro con luces rojas entre humo",
      fallback: photo("f55de1c5-1fc8-4322-bcb6-cde1c0663995.JPG"),
    },
    span: "lg:col-span-4 lg:row-span-3",
  },
  {
    entry: {
      id: "gallery.concept-02",
      kind: "image",
      file: "/media/ai/gallery/concept-02.jpg",
      origin: "ai-illustrative",
      alt: "Imagen conceptual: escenario con luces rojas y público en silueta",
      fallback: photo("pexels-frentescuphotography-7360983.jpg"),
    },
    span: "lg:col-span-5 lg:row-span-2",
  },
  {
    entry: {
      id: "gallery.concept-03",
      kind: "image",
      file: "/media/ai/gallery/concept-03.jpg",
      origin: "ai-illustrative",
      alt: "Imagen conceptual: consola de audio y esferas espejadas",
      fallback: photo("1fb3af46-9b79-4ed7-8fa0-d5bdc87fafe0.JPG"),
    },
    span: "lg:col-span-3 lg:row-span-2",
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
    span: "lg:col-span-4 lg:row-span-2",
  },
  {
    entry: {
      id: "gallery.concept-04",
      kind: "image",
      file: "/media/ai/gallery/concept-04.jpg",
      origin: "ai-illustrative",
      alt: "Imagen conceptual: espectáculo con haces de luz violeta y amarilla",
      fallback: photo("aa4ab966-8cf5-49c1-8209-de54091e652b.JPG"),
    },
    span: "lg:col-span-4 lg:row-span-3",
  },
  {
    entry: {
      id: "gallery.concept-05",
      kind: "image",
      file: "/media/ai/gallery/concept-05.jpg",
      origin: "ai-illustrative",
      alt: "Imagen conceptual: público bajo una gran carpa con luces",
      fallback: photo("pexels-goumbik-1309597.jpg"),
    },
    span: "lg:col-span-5 lg:row-span-3",
  },
  {
    entry: {
      id: "gallery.concept-06",
      kind: "image",
      file: "/media/ai/gallery/concept-06.jpg",
      origin: "ai-illustrative",
      alt: "Imagen conceptual: consola digital frente a un escenario al aire libre",
      fallback: photo("7cb71912-631e-40d7-899b-1a0eef828e21.JPG"),
    },
    span: "lg:col-span-3 lg:row-span-3",
  },
];
