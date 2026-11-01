import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getStageFinalUrl, getStageFirstUrl, getStageFrameUrls, getStageStartPositions, stageIndexAt, stageProgressAt, STAGE_FRAMES } from "@/content/stage-frames";

describe("secuencia del escenario", () => {
  it("tiene los 141 fotogramas en orden, sin huecos, y cada archivo existe", () => {
    const urls = getStageFrameUrls();
    expect(urls).toHaveLength(141);
    urls.forEach((u, i) => expect(u).toContain(`frame-${String(i).padStart(3, "0")}.webp`));
    const onDisk = fs.readdirSync(path.join(__dirname, "../../public/media/ai/stage/frames")).filter((f) => f.endsWith(".webp"));
    expect(onDisk).toHaveLength(141);
    expect(getStageFirstUrl()).toContain("frame-000.webp");
    expect(getStageFinalUrl()).toContain("frame-140.webp");
    for (const u of urls) {
      const file = u.split("?")[0];
      expect(fs.existsSync(path.join(__dirname, "../../public", file)), file).toBe(true);
    }
    expect(STAGE_FRAMES.version).toBeGreaterThan(0);
  });
});

describe("etapas", () => {
  it("fija los límites de las cinco etapas según los fotogramas nuevos", () => {
    expect(getStageStartPositions()).toEqual([0, 50, 72, 99, 115]);
    expect(STAGE_FRAMES.width).toBe(1920);
    expect(STAGE_FRAMES.version).toBe(3);
  });
});

describe("progreso visual por etapas", () => {
  const starts = [0, 50, 72, 99, 115];
  const last = 140;

  it("cada inicio de etapa cae exactamente en i/5 y el final en 1", () => {
    starts.forEach((s, i) => {
      expect(stageIndexAt(s, starts)).toBe(i);
      expect(stageProgressAt(s, starts, last)).toBeCloseTo(i / 5, 10);
    });
    expect(stageProgressAt(last, starts, last)).toBe(1);
    expect(stageIndexAt(last, starts)).toBe(4);
  });

  it("Show sigue activa durante la extensión y la barra llega a 1 solo en el último fotograma", () => {
    for (let f = 115; f <= last; f++) expect(stageIndexAt(f, starts)).toBe(4);
    expect(stageProgressAt(115, starts, last)).toBeCloseTo(0.8, 10);
    expect(stageProgressAt(last - 1, starts, last)).toBeLessThan(1);
    expect(stageProgressAt(last, starts, last)).toBe(1);
  });

  it("el último fotograma de una etapa queda justo antes de la siguiente", () => {
    expect(stageIndexAt(49, starts)).toBe(0);
    expect(stageProgressAt(49, starts, last)).toBeLessThan(0.2);
    expect(stageIndexAt(71, starts)).toBe(1);
    expect(stageProgressAt(71, starts, last)).toBeLessThan(0.4);
    expect(stageIndexAt(114, starts)).toBe(3);
  });

  it("es monótono y se reparte en tramos de igual ancho", () => {
    let prev = -1;
    for (let f = 0; f <= last; f++) {
      const p = stageProgressAt(f, starts, last);
      expect(p).toBeGreaterThanOrEqual(prev);
      prev = p;
    }
    // etapa corta (04: 16 fotogramas) y larga (01: 50) ocupan 20 % cada una
    expect(stageProgressAt(99, starts, last) - stageProgressAt(72, starts, last)).toBeCloseTo(0.2, 10);
  });
});
