import type { QuoteData } from "./quote";

/** Configuración pública de EmailJS (las tres variables son públicas por diseño del SDK de navegador). */
export interface EmailjsConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

/**
 * Lee la configuración. Las referencias a process.env.NEXT_PUBLIC_* deben ser literales para que
 * Next las inyecte en el bundle del cliente. Devuelve null si falta cualquiera (vacío o solo espacios).
 */
export function readEmailjsConfig(
  env: Record<string, string | undefined> = {
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
  },
): EmailjsConfig | null {
  const serviceId = env.NEXT_PUBLIC_EMAILJS_SERVICE_ID?.trim();
  const templateId = env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID?.trim();
  const publicKey = env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?.trim();
  return serviceId && templateId && publicKey ? { serviceId, templateId, publicKey } : null;
}

/**
 * Contrato de parámetros de la plantilla de EmailJS. Todos son strings; ninguno es el destinatario
 * (el "To" se fija en la plantilla, nunca desde el formulario).
 */
export interface QuoteTemplateParams extends Record<string, string> {
  subject: string;
  name: string;
  phone: string;
  /** Email para mostrar en el cuerpo ("No informado" si el visitante no lo dejó). */
  email: string;
  /** Email crudo para el campo Reply-To de la plantilla; "" si no se informó. */
  reply_to: string;
  event_type: string;
  event_date: string;
  location: string;
  services: string;
  guests: string;
  comment: string;
}

/** Quita saltos de línea y caracteres de control (el valor va a un encabezado de correo). */
const oneLine = (s: string) => s.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();

export function buildTemplateParams(d: QuoteData): QuoteTemplateParams {
  const email = oneLine(d.email);
  return {
    subject: `Nuevo pedido de presupuesto — ${oneLine(d.tipoEvento)}`,
    name: oneLine(d.nombre),
    phone: oneLine(d.telefono),
    email: email || "No informado",
    reply_to: email,
    event_type: oneLine(d.tipoEvento),
    event_date: d.fecha || "Sin definir",
    location: oneLine(d.lugar),
    services: d.servicios.join(", "),
    guests: d.invitados || "Sin definir",
    comment: d.comentario.trim() || "—",
  };
}

export type SendFn = (
  serviceId: string,
  templateId: string,
  params: Record<string, unknown>,
  options: { publicKey: string },
) => Promise<{ status: number; text: string }>;

export type SubmitResult =
  | { kind: "success" }
  | { kind: "not-configured" }
  | { kind: "busy" }
  /** EmailJS respondió con un error (HTTP o validación del SDK). */
  | { kind: "provider-error"; status: number; text: string }
  /** Sin respuesta: no se sabe si el correo llegó a salir. */
  | { kind: "network-error" };

/**
 * Envía un pedido. Un solo envío en curso por instancia (evita duplicados por doble clic o Enter).
 * No reintenta: un reintento automático podría duplicar el correo. Solo es "success" si EmailJS
 * respondió 200 (aceptó el envío; no confirma entrega en la bandeja).
 */
export function createQuoteSender(deps: { send: SendFn; config: () => EmailjsConfig | null }) {
  let inFlight = false;
  return async function submit(data: QuoteData): Promise<SubmitResult> {
    if (inFlight) return { kind: "busy" };
    const config = deps.config();
    if (!config) return { kind: "not-configured" };
    inFlight = true;
    try {
      const res = await deps.send(config.serviceId, config.templateId, buildTemplateParams(data), {
        publicKey: config.publicKey,
      });
      return res.status === 200
        ? { kind: "success" }
        : { kind: "provider-error", status: res.status, text: res.text };
    } catch (err) {
      // EmailJSResponseStatus: { status, text }. Cualquier otra cosa (TypeError de fetch) es de red.
      const e = err as { status?: unknown; text?: unknown } | null;
      if (e && typeof e.status === "number") {
        return { kind: "provider-error", status: e.status, text: typeof e.text === "string" ? e.text : "" };
      }
      return { kind: "network-error" };
    } finally {
      inFlight = false;
    }
  };
}
