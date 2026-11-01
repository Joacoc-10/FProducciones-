/** Datos reales del sitio (tomados del repositorio original). Nada inventado. */
export const site = {
  name: "Fabio Producciones",
  tagline: "Tu evento es el show.",
  description:
    "Sonido profesional, iluminación y escenario portátil para bodas, cumpleaños, fiestas, eventos corporativos y espectáculos en Uruguay.",
  /** Descripción de la portada para buscadores (la orientación geográfica solo vive en metadatos). */
  seoDescription:
    "Alquiler de sonido, luces y escenario portátil para bodas, fiestas de 15, cumpleaños y eventos en Maldonado y Canelones. Tu evento es el show: pedí tu presupuesto.",
  /** Dominio público confirmado por ahora. Se centraliza acá: si el cliente compra otro, basta con NEXT_PUBLIC_SITE_URL. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://fabioproducciones.vercel.app").replace(/\/+$/, ""),
  /**
   * Indexación: solo en producción. En previews de Vercel (VERCEL_ENV distinto de "production") o con
   * SITE_NOINDEX=1 se emite noindex y robots.txt bloquea todo. Fuera de Vercel (build local) se permite.
   */
  indexable:
    process.env.SITE_NOINDEX !== "1" &&
    (process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : true),
  locale: "es_UY",
  /** Primer número = principal (pendiente de confirmar con el cliente). */
  whatsapp: ["+59898067306", "+59899818008"],
  instagram: {
    handle: "fabioproducciones",
    url: "https://www.instagram.com/fabioproducciones/",
  },
  email: "gaston.hernandez.b@gmail.com",
} as const;

export const navLinks = [
  { label: "Eventos", href: "/#eventos" },
  { label: "Servicios", href: "/#servicios" },
  { label: "Escenario", href: "/#escenario" },
  { label: "Galería", href: "/#galeria" },
  { label: "Contacto", href: "/#presupuesto" },
] as const;

/** Tarjetas del menú desplegable de la navbar. Los enlaces externos (WhatsApp, Instagram, email) se agregan en el componente. */
export const navCards = [
  {
    channel: "CH 01",
    title: "Explorá",
    links: [
      { label: "Eventos", href: "/#eventos" },
      { label: "Servicios", href: "/#servicios" },
      { label: "Escenario", href: "/#escenario" },
    ],
  },
  {
    channel: "CH 02",
    title: "Galería",
    links: [
      { label: "En portada", href: "/#galeria" },
      { label: "Galería completa", href: "/galeria" },
    ],
  },
  {
    channel: "CH 03",
    title: "Contacto",
    links: [{ label: "Presupuesto", href: "/#presupuesto" }],
  },
] as const;

/** Muestra un número E.164 uruguayo como +598 98 067 306. */
export function formatPhone(e164: string): string {
  const m = e164.match(/^\+598(\d{2})(\d{3})(\d{3})$/);
  return m ? `+598 ${m[1]} ${m[2]} ${m[3]}` : e164;
}
