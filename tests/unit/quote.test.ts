import { describe, expect, it } from "vitest";
import { emptyQuote, firstInvalidStep, hasErrors, validateStep, type QuoteData } from "@/lib/quote";

const TODAY = "2026-11-01";
const valid: QuoteData = {
  tipoEvento: "Boda",
  fecha: "2027-02-14",
  lugar: "Punta del Este",
  servicios: ["Audio", "Luces"],
  invitados: "50 a 150",
  nombre: "Ana",
  telefono: "+598 98 067 306",
  email: "ana@example.com",
  comentario: "",
};

describe("validateStep", () => {
  it("paso 1 exige tipo de evento y lugar", () => {
    const e = validateStep(0, emptyQuote, TODAY);
    expect(e.tipoEvento).toBeTruthy();
    expect(e.lugar).toBeTruthy();
  });
  it("rechaza fechas pasadas pero acepta hoy y vacío", () => {
    expect(validateStep(0, { ...valid, fecha: "2026-10-31" }, TODAY).fecha).toBeTruthy();
    expect(validateStep(0, { ...valid, fecha: TODAY }, TODAY).fecha).toBeUndefined();
    expect(validateStep(0, { ...valid, fecha: "" }, TODAY).fecha).toBeUndefined();
  });
  it("paso 2 exige al menos un servicio", () => {
    expect(validateStep(1, { ...valid, servicios: [] }, TODAY).servicios).toBeTruthy();
    expect(hasErrors(validateStep(1, valid, TODAY))).toBe(false);
  });
  it("paso 3 valida nombre, teléfono y email opcional", () => {
    const e = validateStep(2, { ...valid, nombre: "", telefono: "12", email: "mal" }, TODAY);
    expect(e.nombre && e.telefono && e.email).toBeTruthy();
    expect(hasErrors(validateStep(2, { ...valid, email: "" }, TODAY))).toBe(false);
  });
});

describe("firstInvalidStep", () => {
  it("devuelve -1 si todo es válido y el primer paso con errores si no", () => {
    expect(firstInvalidStep(valid, TODAY)).toBe(-1);
    expect(firstInvalidStep({ ...valid, servicios: [] }, TODAY)).toBe(1);
    expect(firstInvalidStep({ ...valid, lugar: "" }, TODAY)).toBe(0);
  });
});
