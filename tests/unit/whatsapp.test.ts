import { describe, expect, it } from "vitest";
import { buildQuoteMessage, waLink } from "@/lib/whatsapp";
import type { QuoteData } from "@/lib/quote";

const data: QuoteData = {
  tipoEvento: "Boda",
  fecha: "2027-02-14",
  lugar: "Maldonado",
  servicios: ["Audio", "Escenario portátil"],
  invitados: "150 a 300",
  nombre: "Ana",
  telefono: "099123456",
  email: "",
  comentario: "Ceremonia al aire libre",
};

describe("waLink", () => {
  it("normaliza el número a dígitos y codifica el mensaje", () => {
    expect(waLink("+59898067306")).toBe("https://wa.me/59898067306");
    expect(waLink("+59898067306", "Hola & chau")).toBe("https://wa.me/59898067306?text=Hola%20%26%20chau");
  });
});

describe("buildQuoteMessage", () => {
  it("incluye el resumen y omite campos vacíos", () => {
    const msg = buildQuoteMessage(data);
    expect(msg).toContain("soy Ana");
    expect(msg).toContain("Evento: Boda");
    expect(msg).toContain("Necesito: Audio, Escenario portátil");
    expect(msg).toContain("Comentario: Ceremonia al aire libre");
    expect(buildQuoteMessage({ ...data, comentario: "", invitados: "" })).not.toMatch(/Comentario:|Invitados:/);
  });
});
