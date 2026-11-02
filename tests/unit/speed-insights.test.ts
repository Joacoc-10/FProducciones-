import { describe, expect, it } from "vitest";
import { sanitizeSpeedInsightsEvent } from "@/lib/speed-insights";

describe("sanitizeSpeedInsightsEvent", () => {
  it("quita query y hash, conserva origen y ruta", () => {
    const e = sanitizeSpeedInsightsEvent({ type: "vital", url: "https://x.uy/eventos/bodas?servicio=audio&nombre=Ana#presupuesto" });
    expect(e.url).toBe("https://x.uy/eventos/bodas");
    expect(e.type).toBe("vital");
  });
  it("tolera URLs relativas", () => {
    expect(sanitizeSpeedInsightsEvent({ url: "/?evento=bodas#a" }).url).toBe("/");
  });
});
