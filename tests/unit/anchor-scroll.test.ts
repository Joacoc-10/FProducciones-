import { describe, expect, it } from "vitest";
import { crossesRange, hashToId, readScroll, saveScroll } from "@/lib/anchor-scroll";

const stage = [{ start: 3000, end: 9000 }];

describe("crossesRange", () => {
  it("atravesar el tramo fijado de punta a punta cuenta", () => {
    expect(crossesRange(0, 11000, stage)).toBe(true); // Inicio → Contacto
    expect(crossesRange(11000, 0, stage)).toBe(true);
  });
  it("partir desde dentro o terminar dentro cuenta", () => {
    expect(crossesRange(5000, 11000, stage)).toBe(true);
    expect(crossesRange(0, 5000, stage)).toBe(true);
  });
  it("quedar justo en el borde no cuenta (ir al inicio del escenario desde arriba)", () => {
    expect(crossesRange(0, 3000, stage)).toBe(false);
    expect(crossesRange(9000, 11000, stage)).toBe(false);
  });
  it("sin pines o del mismo lado, no cuenta", () => {
    expect(crossesRange(0, 11000, [])).toBe(false);
    expect(crossesRange(100, 2000, stage)).toBe(false);
    expect(crossesRange(9500, 12000, stage)).toBe(false);
  });
});

describe("hashToId", () => {
  it("quita # y decodifica", () => {
    expect(hashToId("#presupuesto")).toBe("presupuesto");
    expect(hashToId("#a%C3%B1o")).toBe("año");
  });
  it("no falla con porcentajes mal formados", () => {
    expect(hashToId("#100%")).toBe("100%");
  });
});

describe("memoria de scroll", () => {
  const fakeStore = () => {
    const m = new Map<string, string>();
    return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
  };
  it("guarda y lee por entrada de historial", () => {
    const store = fakeStore();
    saveScroll("/", 1900.4, store);
    saveScroll("/eventos/bodas", 12, store);
    expect(readScroll("/", store)).toBe(1900);
    expect(readScroll("/eventos/bodas", store)).toBe(12);
    expect(readScroll("/otra", store)).toBeNull();
  });
  it("acota la cantidad de entradas y descarta las más viejas", () => {
    const store = fakeStore();
    for (let i = 0; i < 60; i++) saveScroll(`/p${i}`, i, store);
    expect(readScroll("/p0", store)).toBeNull();
    expect(readScroll("/p59", store)).toBe(59);
  });
  it("tolera almacenamiento roto", () => {
    const broken = { getItem: () => "{no json", setItem: () => { throw new Error("cuota"); } };
    expect(() => saveScroll("/", 1, broken)).not.toThrow();
    expect(readScroll("/", broken)).toBeNull();
  });
});
