"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { send } from "@emailjs/browser";
import { events } from "@/content/events";
import { site } from "@/content/site";
import {
  emptyQuote,
  firstInvalidStep,
  guestOptions,
  hasErrors,
  LAST_STEP,
  prefillFromSearch,
  serviceOptions,
  STEP_TITLES,
  todayISO,
  validateStep,
  type QuoteData,
  type QuoteErrors,
} from "@/lib/quote";
import { createQuoteSender, readEmailjsConfig, type SubmitResult } from "@/lib/quote-submit";
import { buildQuoteMessage, waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { ChannelLabel } from "@/components/console/Console";
import { ArrowIcon, CheckIcon, WhatsappIcon } from "@/components/ui/Icons";

type Status = "idle" | "sending" | "success" | "error";
type FailureKind = Extract<SubmitResult, { kind: "not-configured" | "provider-error" | "network-error" }>["kind"];

const eventOptions = [...events.map((e) => e.formLabel), "Otro"];
const inputCls =
  "w-full min-h-[48px] border border-white/20 bg-bg px-4 py-3 text-text placeholder:text-muted/70 transition-colors focus:border-brand-hi aria-[invalid=true]:border-brand-hi";

function Field({
  id, label, error, hint, children,
}: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-mono text-xs uppercase tracking-[0.14em] text-muted">{label}</label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1.5 text-sm text-brand-hi">{error}</p>}
    </div>
  );
}

export default function QuoteForm() {
  const uid = useId();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<QuoteData>(emptyQuote);
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [failure, setFailure] = useState<FailureKind>("provider-error");
  const [today, setToday] = useState("");
  const sender = useMemo(() => createQuoteSender({ send, config: readEmailjsConfig }), []);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const firstRender = useRef(true);

  const id = (n: string) => `${uid}-${n}`;
  const set = <K extends keyof QuoteData>(k: K, v: QuoteData[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  };

  // Fecha mínima y precarga desde la URL (?evento=slug, ?servicio=audio|luces|escenario)
  useEffect(() => {
    // Inicialización solo de cliente tras montar (fecha local y query string): leerlas en el render rompería la hidratación.
    /* eslint-disable react-hooks/set-state-in-effect */
    setToday(todayISO());
    const prefill = prefillFromSearch(window.location.search, events);
    if (prefill.tipoEvento) setData((d) => ({ ...d, tipoEvento: prefill.tipoEvento! }));
    if (prefill.servicios) setData((d) => ({ ...d, servicios: prefill.servicios! }));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Foco al encabezado del paso al cambiar
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, status]);

  const focusFirstError = (errs: QuoteErrors) => {
    const key = Object.keys(errs)[0];
    if (!key) return;
    requestAnimationFrame(() => {
      const el = formRef.current?.querySelector<HTMLElement>(`[data-field="${key}"]`);
      el?.focus();
    });
  };

  const next = () => {
    const errs = validateStep(step, data, today || todayISO());
    setErrors(errs);
    if (hasErrors(errs)) return focusFirstError(errs);
    setStep((s) => Math.min(LAST_STEP, s + 1));
  };

  const submit = useCallback(async () => {
    const bad = firstInvalidStep(data, today || todayISO());
    if (bad !== -1) {
      setStep(bad);
      const errs = validateStep(bad, data, today || todayISO());
      setErrors(errs);
      focusFirstError(errs);
      return;
    }
    // Honeypot: si un bot lo completó, se simula éxito sin enviar nada
    const trap = formRef.current?.elements.namedItem("website") as HTMLInputElement | null;
    if (trap?.value) {
      setStatus("success");
      return;
    }
    setStatus("sending");
    const result = await sender(data);
    if (result.kind === "busy") return;
    if (result.kind === "success") {
      setStatus("success");
      return;
    }
    setFailure(result.kind);
    setStatus("error");
  }, [data, today, sender]);

  const reset = () => {
    setData(emptyQuote);
    setErrors({});
    setStep(0);
    setStatus("idle");
  };

  const waUrl = waLink(site.whatsapp[0], buildQuoteMessage(data));
  const errCount = Object.values(errors).filter(Boolean).length;

  if (status === "success") {
    return (
      <div className="border border-white/10 bg-surface p-6 md:p-10" role="status">
        <span className="flex h-12 w-12 items-center justify-center bg-brand text-white"><CheckIcon className="h-6 w-6" /></span>
        <h3 ref={headingRef} tabIndex={-1} className="mt-6 text-4xl font-extrabold outline-none md:text-5xl">¡Pedido enviado!</h3>
        <p className="mt-4 max-w-md text-muted">El servicio de correo aceptó tu pedido. Si preferís una respuesta más rápida, seguí la conversación por WhatsApp con el resumen ya armado.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary"><WhatsappIcon className="h-5 w-5" /> Seguir por WhatsApp</a>
          <button type="button" onClick={reset} className="btn btn-ghost">Enviar otro pedido</button>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (step === LAST_STEP) submit();
        else next();
      }}
      className="border border-white/10 bg-surface p-5 md:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <ChannelLabel channel="CH 04">Presupuesto</ChannelLabel>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Paso {step + 1} de {STEP_TITLES.length}</p>
      </div>
      <ol aria-label="Progreso" className="mt-4 grid grid-cols-4 gap-2">
        {STEP_TITLES.map((t, i) => (
          <li key={t} aria-current={i === step ? "step" : undefined} className="min-w-0">
            <span className={cn("block h-1 transition-colors duration-500", i <= step ? "bg-brand-hi" : "bg-white/15")} />
            <span className={cn("mt-2 hidden truncate font-mono text-[0.72rem] uppercase tracking-[0.1em] sm:block", i === step ? "text-text" : "text-muted")}>{t}</span>
          </li>
        ))}
      </ol>

      <h3 ref={headingRef} tabIndex={-1} className="mt-8 text-4xl font-extrabold outline-none md:text-5xl">
        {step === 0 && "¿Qué evento es?"}
        {step === 1 && "¿Qué necesitás?"}
        {step === 2 && "¿Cómo te contactamos?"}
        {step === 3 && "Revisá y enviá"}
      </h3>

      {errCount > 0 && (
        <p role="alert" className="mt-4 border-l-2 border-brand-hi bg-brand/10 px-4 py-3 text-sm">
          Revisá {errCount === 1 ? "el campo marcado" : `los ${errCount} campos marcados`} para continuar.
        </p>
      )}

      <div className="mt-6 space-y-6">
        {step === 0 && (
          <>
            <fieldset>
              <legend className="mb-3 font-mono text-xs uppercase tracking-[0.14em] text-muted">Tipo de evento</legend>
              <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-describedby={errors.tipoEvento ? id("tipo-err") : undefined}>
                {eventOptions.map((o, i) => (
                  <label key={o} className="relative block">
                    <input
                      type="radio"
                      name="tipoEvento"
                      value={o}
                      checked={data.tipoEvento === o}
                      onChange={() => set("tipoEvento", o)}
                      data-field={i === 0 ? "tipoEvento" : undefined}
                      className="peer sr-only"
                    />
                    <span className="flex min-h-[48px] items-center border border-white/20 px-4 py-3 transition-colors peer-checked:border-brand-hi peer-checked:bg-brand/15 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-hi hover:border-white/50">{o}</span>
                  </label>
                ))}
              </div>
              {errors.tipoEvento && <p id={id("tipo-err")} className="mt-2 text-sm text-brand-hi">{errors.tipoEvento}</p>}
            </fieldset>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id={id("fecha")} label="Fecha (si ya la tenés)" error={errors.fecha}>
                <input id={id("fecha")} data-field="fecha" type="date" min={today || undefined} value={data.fecha} onChange={(e) => set("fecha", e.target.value)} aria-invalid={!!errors.fecha} aria-describedby={errors.fecha ? id("fecha-err") : undefined} className={inputCls} />
              </Field>
              <Field id={id("lugar")} label="Lugar o ciudad" error={errors.lugar}>
                <input id={id("lugar")} data-field="lugar" type="text" autoComplete="off" placeholder="Ej.: Salón, quinta, ciudad" value={data.lugar} onChange={(e) => set("lugar", e.target.value)} aria-invalid={!!errors.lugar} aria-describedby={errors.lugar ? id("lugar-err") : undefined} className={inputCls} />
              </Field>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <fieldset>
              <legend className="mb-3 font-mono text-xs uppercase tracking-[0.14em] text-muted">Podés elegir más de una</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {serviceOptions.map((o, i) => (
                  <label key={o} className="relative block">
                    <input
                      type="checkbox"
                      checked={data.servicios.includes(o)}
                      onChange={(e) => set("servicios", e.target.checked ? [...data.servicios, o] : data.servicios.filter((s) => s !== o))}
                      data-field={i === 0 ? "servicios" : undefined}
                      className="peer sr-only"
                    />
                    <span className="flex min-h-[48px] items-center border border-white/20 px-4 py-3 transition-colors peer-checked:border-brand-hi peer-checked:bg-brand/15 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-hi hover:border-white/50">{o}</span>
                  </label>
                ))}
              </div>
              {errors.servicios && <p className="mt-2 text-sm text-brand-hi">{errors.servicios}</p>}
            </fieldset>
            <Field id={id("invitados")} label="Cantidad de invitados (aprox.)">
              <select id={id("invitados")} value={data.invitados} onChange={(e) => set("invitados", e.target.value)} className={inputCls}>
                <option value="">Elegí una opción</option>
                {guestOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id={id("nombre")} label="Nombre" error={errors.nombre}>
                <input id={id("nombre")} data-field="nombre" type="text" autoComplete="name" value={data.nombre} onChange={(e) => set("nombre", e.target.value)} aria-invalid={!!errors.nombre} aria-describedby={errors.nombre ? id("nombre-err") : undefined} className={inputCls} />
              </Field>
              <Field id={id("telefono")} label="WhatsApp o teléfono" error={errors.telefono}>
                <input id={id("telefono")} data-field="telefono" type="tel" inputMode="tel" autoComplete="tel" placeholder="+598 9X XXX XXX" value={data.telefono} onChange={(e) => set("telefono", e.target.value)} aria-invalid={!!errors.telefono} aria-describedby={errors.telefono ? id("telefono-err") : undefined} className={inputCls} />
              </Field>
            </div>
            <Field id={id("email")} label="Email (opcional)" error={errors.email}>
              <input id={id("email")} data-field="email" type="email" autoComplete="email" value={data.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? id("email-err") : undefined} className={inputCls} />
            </Field>
            <Field id={id("comentario")} label="Algo más que quieras contarnos (opcional)" error={errors.comentario}>
              <textarea id={id("comentario")} data-field="comentario" rows={4} value={data.comentario} onChange={(e) => set("comentario", e.target.value)} aria-invalid={!!errors.comentario} aria-describedby={errors.comentario ? id("comentario-err") : undefined} className={cn(inputCls, "resize-y")} />
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <dl className="divide-y divide-white/10 border border-white/10">
              {[
                ["Evento", data.tipoEvento],
                ["Fecha", data.fecha || "Sin definir"],
                ["Lugar", data.lugar],
                ["Necesito", data.servicios.join(", ")],
                ["Invitados", data.invitados || "Sin definir"],
                ["Nombre", data.nombre],
                ["Contacto", [data.telefono, data.email].filter(Boolean).join(" · ")],
                ["Comentario", data.comentario || "—"],
              ].map(([k, v]) => (
                <div key={k} className="grid gap-1 px-4 py-3 sm:grid-cols-[9rem_1fr]">
                  <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted">{k}</dt>
                  <dd className="break-words">{v}</dd>
                </div>
              ))}
            </dl>
            {/* Honeypot visual: los bots lo completan, las personas no lo ven */}
            <div aria-hidden="true" className="absolute -left-[9999px]">
              <label>No completar<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>
            {status === "error" && (
              <div role="alert" className="border-l-2 border-brand-hi bg-brand/10 px-4 py-4 text-sm">
                <p className="font-semibold">
                  {failure === "not-configured" ? "El envío desde el formulario no está disponible por ahora." : "No pudimos enviar el pedido."}
                </p>
                <p className="mt-1 text-muted">
                  {failure === "not-configured" && "Escribinos directo por WhatsApp con el resumen ya armado."}
                  {failure === "provider-error" && "Probá de nuevo o escribinos directo por WhatsApp con el resumen ya armado."}
                  {failure === "network-error" && "No recibimos respuesta y no podemos confirmar si el pedido llegó. Para evitar duplicados, lo más seguro es escribirnos por WhatsApp con el resumen ya armado."}
                </p>
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-4 !min-h-[44px]"><WhatsappIcon className="h-5 w-5" /> Enviar por WhatsApp</a>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || status === "sending"} className="btn btn-ghost disabled:invisible">
          Atrás
        </button>
        {step < LAST_STEP ? (
          <button type="submit" className="btn btn-primary">Siguiente <ArrowIcon className="h-5 w-5" /></button>
        ) : (
          <button type="submit" disabled={status === "sending"} aria-busy={status === "sending"} className="btn btn-primary disabled:opacity-60">
            {status === "sending" ? "Enviando…" : status === "error" && failure !== "not-configured" ? "Reintentar envío" : "Enviar pedido"}
          </button>
        )}
      </div>
    </form>
  );
}
