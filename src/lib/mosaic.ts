/**
 * Composición automática del mosaico de /galeria (mismo lenguaje que la portada:
 * grilla de 12 columnas con filas fijas, piezas grandes, medianas y chicas).
 *
 * Se arma con «bandas»: cada banda suma 12 columnas y todas sus piezas tienen la misma altura
 * (filas), así que nunca quedan huecos, sin importar cuántas piezas haya ni qué filtro esté activo.
 * Las bandas se repiten en ciclo y, si el resto no encaja, se usa una banda auxiliar.
 * Las clases son literales completos para que Tailwind las detecte.
 */
export interface MosaicCell {
  cols: number;
  rows: number;
  /** Clases de grilla para escritorio (lg) */
  span: string;
}
export type MosaicBand = MosaicCell[];

/** Mismas clases de contenedor que el mosaico de la portada. */
export const MOSAIC_GRID = "grid grid-cols-2 gap-3 lg:auto-rows-[8.5rem] lg:grid-cols-12 lg:gap-4";

const c8x3: MosaicCell = { cols: 8, rows: 3, span: "lg:col-span-8 lg:row-span-3" };
const c4x3: MosaicCell = { cols: 4, rows: 3, span: "lg:col-span-4 lg:row-span-3" };
const c5x3: MosaicCell = { cols: 5, rows: 3, span: "lg:col-span-5 lg:row-span-3" };
const c3x3: MosaicCell = { cols: 3, rows: 3, span: "lg:col-span-3 lg:row-span-3" };
const c5x2: MosaicCell = { cols: 5, rows: 2, span: "lg:col-span-5 lg:row-span-2" };
const c3x2: MosaicCell = { cols: 3, rows: 2, span: "lg:col-span-3 lg:row-span-2" };
const c4x2: MosaicCell = { cols: 4, rows: 2, span: "lg:col-span-4 lg:row-span-2" };
/** Pieza única: ancho cinematográfico centrado (no deja huecos dentro de la grilla). */
const cSolo: MosaicCell = { cols: 8, rows: 3, span: "lg:col-span-8 lg:col-start-3 lg:row-span-3" };

const TWO: MosaicBand = [c8x3, c4x3];
const THREE_B: MosaicBand = [c5x2, c3x2, c4x2];
const THREE_C: MosaicBand = [c4x3, c5x3, c3x3];
const FOUR: MosaicBand = [c3x3, c3x3, c3x3, c3x3];
const ONE: MosaicBand = [cSolo];

/** Ciclo base: es la composición de la portada (8+4 · 5+3+4 · 4+5+3). */
const CYCLE: MosaicBand[] = [TWO, THREE_B, THREE_C];

export function planMosaic(count: number): MosaicBand[] {
  const bands: MosaicBand[] = [];
  let left = count;
  for (let k = 0; left > 0; k++) {
    let band = CYCLE[k % CYCLE.length];
    if (left === 1) band = ONE;
    else if (left < band.length) band = TWO;
    else if (left - band.length === 1) band = band.length === 2 ? THREE_B : FOUR;
    bands.push(band);
    left -= band.length;
  }
  return bands;
}

/** Una celda por pieza, en orden. */
export const mosaicCells = (count: number): MosaicCell[] => planMosaic(count).flat();

/**
 * Móvil y tablet (2 columnas): ancha, mitad, mitad… Si la última quedaría sola en media fila,
 * se hace ancha para no dejar un hueco.
 */
export const isWideOnSmall = (index: number, count: number) =>
  index % 3 === 0 || (index === count - 1 && index % 3 === 1);
