/**
 * Cargador progresivo de una secuencia de imágenes para dibujar en canvas.
 *
 * - Solo descarga lo necesario: fotogramas "ancla" (cada `anchorStep`, para no quedar nunca en blanco)
 *   más una ventana alrededor del fotograma actual, con sesgo hacia donde va el scroll (adelante o atrás).
 * - Memoria acotada: los bitmaps fuera de la ventana (más `retain` fotogramas de margen, para que invertir el
 *   scroll no los descarte y vuelva a decodificarlos) se liberan; la descarga repetida la resuelve el caché HTTP.
 * - No se gasta CPU en lo que ya no hace falta: una descarga que terminó fuera de la ventana no se decodifica,
 *   y solo se cancela una descarga en curso cuando su lugar lo necesita un fotograma más urgente.
 * - `nearest()` devuelve siempre el fotograma cargado más cercano, así nunca hay un canvas vacío.
 */
export interface FrameSequenceOptions {
  /** Fotogramas (no ancla) que se cargan alrededor del actual */
  windowSize: number;
  /** Fotogramas extra ya decodificados que se conservan fuera de la ventana (histéresis); 0 = se liberan enseguida */
  retain?: number;
  /** Descargas simultáneas (máximo) */
  concurrency: number;
  /**
   * Modo para dispositivos con poca red/CPU: menos descargas simultáneas y ventana más corta cuando cada descarga
   * tarda, y la ventana apunta adonde estará el scroll cuando llegue la descarga (según su velocidad).
   */
  constrained?: boolean;
  /** Cada cuántos fotogramas hay un ancla permanente */
  anchorStep?: number;
  /** Ancho al que se decodifica cada bitmap (ahorra memoria cuando se muestra más chico que el original) */
  bitmapWidth?: number;
  /** Se llamó al cargar un fotograma (índice) */
  onFrame?: (index: number) => void;
  /** Falló la carga de demasiados fotogramas para mostrar la secuencia */
  onFail?: () => void;
}

export type Drawable = ImageBitmap | HTMLImageElement | HTMLCanvasElement;
const BACKWARD_PENALTY = 1.6;
/** Hasta cuántos fotogramas por delante del actual se apunta la ventana, y tiempo estimado de decodificación (ms) */
const MAX_LEAD = 40;
const DECODE_MS = 60;
/** Ventana de carga máxima (fotogramas) cuando la red es lenta */
const SLOW_WINDOW = 8;

function release(d: Drawable) {
  if ("close" in d) d.close();
  else if (d instanceof HTMLCanvasElement) d.width = d.height = 0;
}

/**
 * Safari/WebViews antiguos ignoran `resizeWidth` y devuelven el bitmap completo (Full HD ≈ 8 MB cada uno).
 * Si el resultado quedó mucho más grande que lo pedido, se reduce a un canvas y se libera el original.
 */
function shrink(src: ImageBitmap | HTMLImageElement, width?: number): Drawable {
  if (!width || src.width <= width * 1.25) return src;
  const c = document.createElement("canvas");
  c.width = width;
  c.height = Math.round((src.height * width) / src.width);
  const x = c.getContext("2d");
  if (!x) return src;
  x.imageSmoothingQuality = "medium";
  x.drawImage(src, 0, 0, c.width, c.height);
  release(src);
  return c;
}

export class FrameSequence {
  private frames: (Drawable | null)[];
  private loading = new Set<number>();
  private failed = new Set<number>();
  private controllers = new Map<number, AbortController>();
  private focus = 0;
  /** Hacia dónde va el scroll: +1 adelante, -1 atrás (se conserva el último sentido no nulo) */
  private dir = 1;
  private ranked = new Set<number>();
  /** Velocidad del scroll en fotogramas/ms (media móvil) y cuándo se actualizó el foco por última vez */
  private vel = 0;
  private focusAt = 0;
  /** Fotograma alrededor del que se arma la ventana: el actual, o donde se estará cuando llegue la descarga */
  private aim = 0;
  private started = false;
  private disposed = false;
  private failNotified = false;
  private readonly anchorStep: number;
  /** Duración media (ms) de una descarga; con red lenta conviene menos descargas en paralelo, para que cada una llegue antes */
  private fetchMs = 0;

  constructor(private urls: string[], private opts: FrameSequenceOptions) {
    this.frames = urls.map(() => null);
    this.anchorStep = opts.anchorStep ?? 10;
  }

  get length() {
    return this.urls.length;
  }

  /** Ancho de decodificación; se puede cambiar antes de `start()` */
  setBitmapWidth(w: number) {
    this.opts.bitmapWidth = w;
  }

  /** Empieza a descargar (idempotente) */
  start() {
    if (this.started || this.disposed) return;
    this.started = true;
    this.pump();
  }

  /** Indica el fotograma actual y reprioriza descargas / libera memoria */
  setFocus(index: number) {
    const i = Math.max(0, Math.min(this.length - 1, index));
    if (i === this.focus) return;
    const now = performance.now();
    if (this.focusAt) this.vel = this.vel * 0.5 + (Math.abs(i - this.focus) / Math.max(1, now - this.focusAt)) * 0.5;
    this.focusAt = now;
    this.dir = i > this.focus ? 1 : -1;
    this.focus = i;
    if (this.started) this.pump();
  }

  /** Fotograma exacto o `null` si todavía no está */
  get(index: number): Drawable | null {
    return this.frames[index] ?? null;
  }

  /** El fotograma cargado más cercano a `index` */
  nearest(index: number): Drawable | null {
    for (let d = 0; d < this.length; d++) {
      const a = this.frames[index - d];
      if (a) return a;
      const b = this.frames[index + d];
      if (b) return b;
    }
    return null;
  }

  dispose() {
    this.disposed = true;
    this.controllers.forEach((c) => c.abort());
    this.controllers.clear();
    this.loading.clear();
    this.frames.forEach((f) => f && release(f));
    this.frames.fill(null);
  }

  private isAnchor(i: number) {
    return i % this.anchorStep === 0 || i === this.length - 1;
  }

  /** Menor = más urgente. El lado hacia donde va el scroll cuenta menos que el lado ya recorrido. */
  private score(i: number) {
    if (i === this.focus) return -1;
    const signed = (i - this.aim) * this.dir;
    const d = signed >= 0 ? signed : -signed * BACKWARD_PENALTY;
    return this.isAnchor(i) ? d * 0.4 : d;
  }

  /** Índices ordenados de más a menos urgente (sin anclas: esas siempre están) */
  private rankedFrames(): number[] {
    const scored: [number, number][] = [];
    for (let i = 0; i < this.length; i++) if (!this.isAnchor(i)) scored.push([this.score(i), i]);
    scored.sort((a, b) => a[0] - b[0]);
    return scored.map((e) => e[1]);
  }

  /** Descargas simultáneas: con red lenta cada una comparte el canal y llegaría tarde, ya fuera de la ventana */
  private slots() {
    const c = this.opts.concurrency;
    if (!this.opts.constrained) return c;
    if (this.fetchMs > 700) return 1;
    if (this.fetchMs > 350) return Math.min(2, c);
    return c;
  }

  private pump() {
    if (this.disposed) return;
    this.aim = this.focus;
    if (this.opts.constrained && performance.now() - this.focusAt < 200) {
      const lead = Math.min(MAX_LEAD, this.vel * (this.fetchMs + DECODE_MS));
      this.aim = Math.max(0, Math.min(this.length - 1, Math.round(this.focus + this.dir * lead)));
    }
    const order = this.rankedFrames();
    // Con red lenta solo da tiempo a traer lo más cercano: una ventana larga reparte el canal entre fotogramas que llegarían tarde
    const slow = this.opts.constrained && this.fetchMs > 350;
    const win = slow ? Math.min(this.opts.windowSize, SLOW_WINDOW) : this.opts.windowSize;
    const keep = win + (this.opts.retain ?? 0);
    const wanted = new Set<number>();
    const retained = new Set<number>();
    for (let i = 0; i < this.length; i++) if (this.isAnchor(i)) wanted.add(i);
    order.slice(0, win).forEach((i) => wanted.add(i));
    order.slice(0, keep).forEach((i) => retained.add(i));
    wanted.add(this.focus);
    this.ranked = new Set([...wanted, ...retained]);

    // Liberar memoria solo de lo que quedó fuera de la ventana y del margen de retención
    for (let i = 0; i < this.length; i++) {
      if (this.ranked.has(i)) continue;
      const f = this.frames[i];
      if (f) {
        release(f);
        this.frames[i] = null;
      }
    }

    const pending = [...wanted]
      .filter((i) => !this.frames[i] && !this.loading.has(i) && !this.failed.has(i))
      .sort((a, b) => this.score(a) - this.score(b));

    // Sin lugar libre para lo urgente: se cancelan las descargas en curso que ya no hacen falta
    if (pending.length && this.loading.size >= this.slots()) {
      for (const i of this.loading) if (!this.ranked.has(i)) this.controllers.get(i)?.abort();
    }
    for (const i of pending) {
      if (this.loading.size >= this.slots()) break;
      void this.load(i);
    }
  }

  private async load(i: number) {
    const ctrl = new AbortController();
    this.controllers.set(i, ctrl);
    this.loading.add(i);
    try {
      const blob = await this.fetchBlob(this.urls[i], ctrl.signal);
      // Mientras se descargaba el scroll pudo irse lejos: no se gasta CPU decodificando algo que sobra
      if (!this.ranked.has(i)) return;
      const frame = await this.decode(blob);
      if (this.disposed || ctrl.signal.aborted || !this.ranked.has(i)) {
        release(frame);
      } else {
        this.frames[i] = frame;
        this.opts.onFrame?.(i);
      }
    } catch {
      if (!ctrl.signal.aborted && !this.disposed) this.failed.add(i);
    } finally {
      this.loading.delete(i);
      this.controllers.delete(i);
      if (!this.disposed) {
        this.checkFailure();
        this.pump();
      }
    }
  }

  private async fetchBlob(url: string, signal: AbortSignal): Promise<Blob> {
    const t0 = performance.now();
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const ms = performance.now() - t0;
    this.fetchMs = this.fetchMs ? this.fetchMs * 0.7 + ms * 0.3 : ms;
    return blob;
  }

  private async decode(blob: Blob): Promise<Drawable> {
    const w = this.opts.bitmapWidth;
    if (typeof createImageBitmap === "function") {
      if (w) {
        try {
          return shrink(await createImageBitmap(blob, { resizeWidth: w, resizeQuality: "medium" }), w);
        } catch {
          /* navegador sin soporte de resize: decodifica a tamaño completo */
        }
      }
      return shrink(await createImageBitmap(blob), w);
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);
    try {
      img.src = objectUrl;
      await img.decode();
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
    return shrink(img, w);
  }

  /** Con el primer fotograma caído o más de un tercio fallado, se abandona la secuencia animada */
  private checkFailure() {
    if (this.failNotified) return;
    if (this.failed.has(0) || this.failed.size > this.length / 3) {
      this.failNotified = true;
      this.opts.onFail?.();
    }
  }
}
