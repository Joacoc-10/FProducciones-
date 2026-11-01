import { describe, expect, it } from "vitest";
import { isWideOnSmall, mosaicCells, planMosaic } from "@/lib/mosaic";

describe("mosaico automático", () => {
  it("genera una celda por pieza para cualquier cantidad", () => {
    for (let n = 0; n <= 60; n++) expect(mosaicCells(n)).toHaveLength(n);
  });

  it("cada banda llena las 12 columnas con altura uniforme (sin huecos)", () => {
    for (let n = 1; n <= 60; n++) {
      for (const band of planMosaic(n)) {
        const rows = new Set(band.map((c) => c.rows));
        expect(rows.size).toBe(1);
        const cols = band.reduce((a, c) => a + c.cols, 0);
        // Pieza única: 8 columnas centradas (2 de margen a cada lado)
        expect(band.length === 1 ? cols + 4 : cols).toBe(12);
      }
    }
  });

  it("la primera pieza es la destacada (8 columnas) salvo que sea la única", () => {
    expect(mosaicCells(10)[0].cols).toBe(8);
    expect(mosaicCells(2)[0].cols).toBe(8);
  });

  it("con 8 piezas reproduce la composición de la portada", () => {
    expect(mosaicCells(8).map((c) => `${c.cols}x${c.rows}`)).toEqual(["8x3", "4x3", "5x2", "3x2", "4x2", "4x3", "5x3", "3x3"]);
  });

  it("móvil: ninguna fila de 2 columnas queda a medias", () => {
    for (let n = 1; n <= 40; n++) {
      let used = 0;
      for (let i = 0; i < n; i++) {
        used += isWideOnSmall(i, n) ? 2 : 1;
        if (used >= 2) used = 0;
      }
      expect(used).toBe(0);
    }
  });
});
