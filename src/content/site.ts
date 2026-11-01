/** Datos reales del sitio (tomados del repositorio original). Nada inventado. */
export const site = {
  name: "Fabio Producciones",
  tagline: "Tu evento es el show.",
  description:
    "Sonido profesional, iluminación y escenario portátil para bodas, cumpleaños, fiestas, eventos corporativos y espectáculos en Uruguay.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://fabioproducciones.vercel.app",
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

/** Muestra un número E.164 uruguayo como +598 98 067 306. */
export function formatPhone(e164: string): string {
  const m = e164.match(/^\+598(\d{2})(\d{3})(\d{3})$/);
  return m ? `+598 ${m[1]} ${m[2]} ${m[3]}` : e164;
}
