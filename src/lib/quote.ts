export interface QuoteData {
  tipoEvento: string;
  fecha: string; // yyyy-mm-dd
  lugar: string;
  servicios: string[];
  invitados: string;
  nombre: string;
  telefono: string;
  email: string;
  comentario: string;
}

export type QuoteErrors = Partial<Record<keyof QuoteData, string>>;

export const emptyQuote: QuoteData = {
  tipoEvento: "",
  fecha: "",
  lugar: "",
  servicios: [],
  invitados: "",
  nombre: "",
  telefono: "",
  email: "",
  comentario: "",
};

export const serviceOptions = ["Audio", "Luces", "Escenario portátil", "No sé, asesorame"] as const;
export const guestOptions = ["Hasta 50", "50 a 150", "150 a 300", "Más de 300", "No lo sé todavía"] as const;

export const STEP_TITLES = ["Tu evento", "Qué necesitás", "Tus datos", "Resumen"] as const;
export const LAST_STEP = STEP_TITLES.length - 1;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Fecha local de hoy en formato yyyy-mm-dd. */
export const todayISO = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Valida un paso (0–2). El paso 3 es solo resumen. */
export function validateStep(step: number, d: QuoteData, today = todayISO()): QuoteErrors {
  const e: QuoteErrors = {};
  if (step === 0) {
    if (!d.tipoEvento) e.tipoEvento = "Elegí el tipo de evento.";
    if (d.lugar.trim().length < 2) e.lugar = "Contanos dónde se hace el evento.";
    if (d.fecha && d.fecha < today) e.fecha = "La fecha no puede ser anterior a hoy.";
  }
  if (step === 1) {
    if (d.servicios.length === 0) e.servicios = "Elegí al menos una opción.";
  }
  if (step === 2) {
    if (d.nombre.trim().length < 2) e.nombre = "Escribí tu nombre.";
    const digits = d.telefono.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) e.telefono = "Ingresá un teléfono o WhatsApp válido.";
    if (d.email.trim() && !emailRe.test(d.email.trim())) e.email = "El email no parece válido.";
    if (d.comentario.length > 1000) e.comentario = "Máximo 1000 caracteres.";
  }
  return e;
}

export const hasErrors = (e: QuoteErrors) => Object.keys(e).length > 0;

/** Valida todo el formulario y devuelve el primer paso con errores (o -1). */
export function firstInvalidStep(d: QuoteData, today = todayISO()): number {
  for (const s of [0, 1, 2]) if (hasErrors(validateStep(s, d, today))) return s;
  return -1;
}

const serviceByParam: Record<string, string> = { audio: "Audio", luces: "Luces", escenario: "Escenario portátil" };

/**
 * Valores precargados desde la URL: ?evento=<slug> y ?servicio=audio|luces|escenario.
 * Recibe los slugs y etiquetas de eventos para no depender de content/.
 */
export function prefillFromSearch(
  search: string,
  events: { slug: string; formLabel: string }[],
): Partial<Pick<QuoteData, "tipoEvento" | "servicios">> {
  const params = new URLSearchParams(search);
  const out: Partial<Pick<QuoteData, "tipoEvento" | "servicios">> = {};
  const ev = events.find((e) => e.slug === params.get("evento"));
  if (ev) out.tipoEvento = ev.formLabel;
  const option = serviceByParam[params.get("servicio") ?? ""];
  if (option) out.servicios = [option];
  return out;
}
