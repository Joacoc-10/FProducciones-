/** Utilidades puras para la navegación por anclas y la memoria de scroll. Sin React ni GSAP. */

export function hashToId(hash: string): string {
  const raw = hash.replace(/^#/, "");
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * Posición absoluta de scroll que deja `el` donde lo dejaría el salto nativo a su ancla:
 * respeta `scroll-margin-top` (única fuente del espacio de la navbar, ver globals.css).
 */
export function anchorTop(el: Element, scrollY: number): number {
  const margin = Number.parseFloat(getComputedStyle(el).scrollMarginTop);
  return Math.max(0, el.getBoundingClientRect().top + scrollY - (Number.isNaN(margin) ? 0 : margin));
}

export interface ScrollRange {
  start: number;
  end: number;
}

/**
 * `true` si ir de `from` a `to` atraviesa por dentro algún tramo fijado (pin).
 * Quedar justo en un borde del tramo (p. ej. el inicio del escenario) no cuenta como atravesarlo.
 */
export function crossesRange(from: number, to: number, ranges: readonly ScrollRange[]): boolean {
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  return ranges.some((r) => lo < r.end && hi > r.start);
}

/* — Memoria de scroll por entrada de historial — */

const STORAGE_KEY = "fp:scroll";
const MAX_ENTRIES = 40;

type Store = Pick<Storage, "getItem" | "setItem">;

function load(store: Store): Record<string, number> {
  try {
    const raw = store.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function saveScroll(key: string, y: number, store: Store = sessionStorage): void {
  try {
    const map = load(store);
    delete map[key];
    map[key] = Math.round(y);
    const keys = Object.keys(map);
    for (const k of keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES))) delete map[k];
    store.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* almacenamiento no disponible: se pierde la restauración, nada más */
  }
}

export function readScroll(key: string, store: Store = sessionStorage): number | null {
  const y = load(store)[key];
  return typeof y === "number" && Number.isFinite(y) ? y : null;
}
