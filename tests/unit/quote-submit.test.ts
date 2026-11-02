import { describe, expect, it, vi } from "vitest";
import { buildTemplateParams, createQuoteSender, readEmailjsConfig, type SendFn } from "@/lib/quote-submit";
import { buildQuoteMessage, waLink } from "@/lib/whatsapp";
import { prefillFromSearch, type QuoteData } from "@/lib/quote";

const data: QuoteData = {
  tipoEvento: "Boda",
  fecha: "2027-02-14",
  lugar: "Punta del Este",
  servicios: ["Audio", "Luces"],
  invitados: "50 a 150",
  nombre: " Ana ",
  telefono: "+598 98 067 306",
  email: "ana@example.com",
  comentario: "Salón con eco",
};
const config = { serviceId: "svc_test", templateId: "tpl_test", publicKey: "pk_test" };
const ok = { status: 200, text: "OK" };

describe("readEmailjsConfig", () => {
  const full = {
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: "s",
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: "t",
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: "k",
  };
  it("devuelve la configuración completa", () => {
    expect(readEmailjsConfig(full)).toEqual({ serviceId: "s", templateId: "t", publicKey: "k" });
  });
  it("devuelve null si falta cualquiera, está vacía o solo tiene espacios", () => {
    for (const k of Object.keys(full)) {
      expect(readEmailjsConfig({ ...full, [k]: undefined })).toBeNull();
      expect(readEmailjsConfig({ ...full, [k]: "  " })).toBeNull();
    }
  });
});

describe("buildTemplateParams", () => {
  it("incluye todos los datos del pedido y ningún destinatario", () => {
    const p = buildTemplateParams(data);
    expect(p).toEqual({
      subject: "Nuevo pedido de presupuesto — Boda",
      name: "Ana",
      phone: "+598 98 067 306",
      email: "ana@example.com",
      reply_to: "ana@example.com",
      event_type: "Boda",
      event_date: "2027-02-14",
      location: "Punta del Este",
      services: "Audio, Luces",
      guests: "50 a 150",
      comment: "Salón con eco",
    });
    expect(Object.keys(p).some((k) => /^to/i.test(k))).toBe(false);
  });
  it("email opcional: reply_to vacío y valores por defecto", () => {
    const p = buildTemplateParams({ ...data, email: "", fecha: "", invitados: "", comentario: "" });
    expect(p.reply_to).toBe("");
    expect(p.email).toBe("No informado");
    expect(p.event_date).toBe("Sin definir");
    expect(p.guests).toBe("Sin definir");
    expect(p.comment).toBe("—");
  });
  it("no deja saltos de línea en el asunto ni en reply_to", () => {
    const p = buildTemplateParams({ ...data, tipoEvento: "Boda\r\nBcc: x@y.z", email: "a@b.co\nBcc: x" });
    expect(p.subject).not.toMatch(/[\r\n]/);
    expect(p.reply_to).not.toMatch(/[\r\n]/);
  });
});

describe("createQuoteSender", () => {
  it("envío aceptado: llama a EmailJS con ids, parámetros y clave pública", async () => {
    const send = vi.fn<SendFn>().mockResolvedValue(ok);
    const submit = createQuoteSender({ send, config: () => config });
    expect(await submit(data)).toEqual({ kind: "success" });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith("svc_test", "tpl_test", buildTemplateParams(data), { publicKey: "pk_test" });
  });
  it("configuración ausente: no intenta enviar", async () => {
    const send = vi.fn<SendFn>();
    const submit = createQuoteSender({ send, config: () => null });
    expect(await submit(data)).toEqual({ kind: "not-configured" });
    expect(send).not.toHaveBeenCalled();
  });
  it("error del proveedor (promesa rechazada con status/text)", async () => {
    const send = vi.fn<SendFn>().mockRejectedValue({ status: 412, text: "Gmail_API: Invalid grant" });
    const submit = createQuoteSender({ send, config: () => config });
    expect(await submit(data)).toEqual({ kind: "provider-error", status: 412, text: "Gmail_API: Invalid grant" });
  });
  it("respuesta no-200 sin excepción no cuenta como éxito", async () => {
    const send = vi.fn<SendFn>().mockResolvedValue({ status: 202, text: "?" });
    const submit = createQuoteSender({ send, config: () => config });
    expect((await submit(data)).kind).toBe("provider-error");
  });
  it("error de red (TypeError de fetch)", async () => {
    const send = vi.fn<SendFn>().mockRejectedValue(new TypeError("Failed to fetch"));
    const submit = createQuoteSender({ send, config: () => config });
    expect(await submit(data)).toEqual({ kind: "network-error" });
  });
  it("previene el doble envío y no reintenta solo", async () => {
    let release!: (v: { status: number; text: string }) => void;
    const send = vi.fn<SendFn>().mockReturnValue(new Promise((r) => (release = r)));
    const submit = createQuoteSender({ send, config: () => config });
    const first = submit(data);
    expect(await submit(data)).toEqual({ kind: "busy" });
    expect(send).toHaveBeenCalledTimes(1);
    release(ok);
    expect(await first).toEqual({ kind: "success" });
  });
  it("tras un error se puede reenviar manualmente", async () => {
    const send = vi.fn<SendFn>().mockRejectedValueOnce(new TypeError("x")).mockResolvedValueOnce(ok);
    const submit = createQuoteSender({ send, config: () => config });
    expect((await submit(data)).kind).toBe("network-error");
    expect((await submit(data)).kind).toBe("success");
    expect(send).toHaveBeenCalledTimes(2);
  });
});

describe("WhatsApp y precarga de servicios", () => {
  it("WhatsApp sigue armando el enlace con el resumen", () => {
    const href = waLink("+598 98 067 306", buildQuoteMessage(data));
    expect(href).toMatch(/^https:\/\/wa\.me\/59898067306\?text=/);
    expect(decodeURIComponent(href)).toContain("Evento: Boda");
  });
  const events = [{ slug: "corporativos", formLabel: "Evento corporativo" }];
  it("?servicio= y ?evento= preseleccionan", () => {
    expect(prefillFromSearch("?servicio=luces", events)).toEqual({ servicios: ["Luces"] });
    expect(prefillFromSearch("?servicio=escenario&evento=corporativos", events)).toEqual({
      servicios: ["Escenario portátil"],
      tipoEvento: "Evento corporativo",
    });
    expect(prefillFromSearch("?servicio=otro&evento=nada", events)).toEqual({});
  });
});
