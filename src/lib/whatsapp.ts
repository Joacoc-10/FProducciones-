import type { QuoteData } from "./quote";

/** https://wa.me/<número sin símbolos>?text=<mensaje> */
export function waLink(phoneE164: string, message?: string): string {
  const digits = phoneE164.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

const line = (label: string, value: string) => (value.trim() ? `${label}: ${value.trim()}` : "");

/** Mensaje prearmado con el resumen del formulario (voseo). */
export function buildQuoteMessage(d: QuoteData): string {
  const head = `Hola Fabio Producciones, soy ${d.nombre.trim() || "—"}. Quiero pedir un presupuesto.`;
  const body = [
    line("Evento", d.tipoEvento),
    line("Fecha", d.fecha),
    line("Lugar", d.lugar),
    line("Necesito", d.servicios.join(", ")),
    line("Invitados", d.invitados),
    line("Comentario", d.comentario),
  ].filter(Boolean);
  return [head, body.join("\n")].filter(Boolean).join("\n\n");
}

/** Mensaje genérico (sin formulario). */
export const genericWhatsappMessage =
  "Hola Fabio Producciones, quiero consultar por un evento.";
