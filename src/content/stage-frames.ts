/**
 * Secuencia de fotogramas del montaje del escenario (sección #escenario).
 * Origen: un único video ilustrativo de ~10 s → 141 WebP de 1920×1080 (calidad 92, ~14 fps) en
 * `public/media/ai/stage/frames/` (frame-000 … frame-140), sin cortes ni continuación aparte.
 *
 * Para corregir un fotograma sin tocar la lógica:
 *  - reemplazar el archivo (mismo nombre) y subir `version` para invalidar el caché; o
 *  - apuntar el índice a otro archivo con `overrides`; o
 *  - quitarlo de la secuencia con `skip` (el scroll se reparte entre los restantes).
 */
export const STAGE_FRAMES = {
  /** Cantidad de archivos originales (frame-000 … frame-140) */
  total: 141,
  dir: "/media/ai/stage/frames",
  width: 1920,
  height: 1080,
  /** Se agrega como `?v=` a cada URL; subirlo al reemplazar fotogramas (los frames se sirven con caché larga) */
  version: 3,
  /** índice original → ruta pública alternativa */
  overrides: {} as Record<number, string>,
  /** índices originales que se omiten de la secuencia */
  skip: [] as number[],
  /**
   * Primer fotograma ORIGINAL de cada etapa (plataforma, estructura, sonido, iluminación, show), según lo que
   * se ve en pantalla: la plataforma queda plana en el 49 y el truss empieza a subir en el 50; el truss llega
   * arriba y aparecen los parlantes en el 72; el equipamiento queda completo en el 98 (99 = escena lista, a
   * punto de encender); las luces se encienden en el 112 y los haces empiezan a moverse en el 115, hasta el 140.
   * Si se reemplaza el video, revisar estos valores.
   */
  stageStarts: [0, 50, 72, 99, 115] as readonly number[],
  alt: "Ilustración de un escenario portátil que se arma de a poco: estructura de luces, parlantes y micrófonos hasta quedar listo para el show",
} as const;

const pad = (n: number) => String(n).padStart(3, "0");

/** URL del fotograma original `n` */
function frameUrl(n: number): string {
  const base = STAGE_FRAMES.overrides[n] ?? `${STAGE_FRAMES.dir}/frame-${pad(n)}.webp`;
  return `${base}?v=${STAGE_FRAMES.version}`;
}

/** URLs en orden de reproducción, ya sin los fotogramas omitidos */
export function getStageFrameUrls(): string[] {
  const skip = new Set<number>(STAGE_FRAMES.skip);
  const urls: string[] = [];
  for (let n = 0; n < STAGE_FRAMES.total; n++) if (!skip.has(n)) urls.push(frameUrl(n));
  return urls;
}

/** Imagen del escenario terminado (reduced-motion, sin JS o error de carga) */
export function getStageFinalUrl(): string {
  const urls = getStageFrameUrls();
  return urls[urls.length - 1];
}

/** Primer fotograma (estado inicial) */
export function getStageFirstUrl(): string {
  return getStageFrameUrls()[0];
}

/** Posición (en la secuencia, ya sin omitidos) donde empieza cada etapa */
export function getStageStartPositions(): number[] {
  const skip = new Set<number>(STAGE_FRAMES.skip);
  const originals: number[] = [];
  for (let n = 0; n < STAGE_FRAMES.total; n++) if (!skip.has(n)) originals.push(n);
  return STAGE_FRAMES.stageStarts.map((start) => {
    const pos = originals.findIndex((n) => n >= start);
    return pos === -1 ? originals.length - 1 : pos;
  });
}

/** Etapa activa (0-based) para un fotograma de la secuencia, según los inicios de etapa */
export function stageIndexAt(frame: number, starts: readonly number[]): number {
  let idx = 0;
  for (let i = 0; i < starts.length; i++) if (frame >= starts[i]) idx = i;
  return idx;
}

/**
 * Progreso visual 0–1 de la barra: cada etapa ocupa el mismo ancho (1/N) sin importar cuántos
 * fotogramas tenga, y dentro de su tramo avanza linealmente con los fotogramas.
 * En el primer fotograma de una etapa vale exactamente `i / N`; en el último fotograma, 1.
 */
export function stageProgressAt(frame: number, starts: readonly number[], last: number): number {
  const n = starts.length;
  const i = stageIndexAt(frame, starts);
  const from = starts[i];
  const to = i + 1 < n ? starts[i + 1] : last;
  const t = to > from ? Math.min(1, Math.max(0, (frame - from) / (to - from))) : 1;
  return (i + t) / n;
}
