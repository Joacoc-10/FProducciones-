/**
 * Cargador progresivo de una secuencia de imágenes para dibujar en canvas.
 *
 * Dos niveles de caché, ambos con presupuesto en bytes:
 *  1. Archivos comprimidos (Blob): se descargan por adelantado, cerca del fotograma actual primero y con sesgo
 *     hacia donde va el scroll. Con el archivo en memoria, invertir el scroll no vuelve a pasar por la red.
 *  2. Bitmaps decodificados: una ventana alrededor del fotograma actual (más ancha hacia donde va el scroll)
 *     más fotogramas "ancla" permanentes. El tamaño de la ventana sale del presupuesto de memoria y del tamaño
 *     real de cada bitmap, no de una cantidad fija. Se libera con histéresis (un margen extra) para que mover
 *     el scroll un poco hacia atrás no descarte lo que se acaba de decodificar.
 * - La decodificación es independiente de la descarga y tiene su propio límite de concurrencia.
 * - `nearestIndex()` devuelve siempre el fotograma decodificado más cercano, así nunca hay un canvas vacío.
 */
export interface FrameSequenceOptions {
  /** Presupuesto (MB) de bitmaps decodificados, incluidas las anclas */
  decodeBudgetMB: number;
  /** Presupuesto (MB) de archivos comprimidos conservados en memoria */
  blobBudgetMB: number;
  /** Descargas simultáneas (máximo) */
  concurrency: number;
  /** Decodificaciones simultáneas (máximo) */
  decodeConcurrency?: number;
  /**
   * Modo para dispositivos con poca red/CPU: menos descargas simultáneas cuando cada descarga tarda, y la
   * ventana apunta adonde estará el scroll cuando llegue la descarga (según su velocidad).
   */
  constrained?: boolean;
  /** Cada cuántos fotogramas hay un ancla permanente */
  anchorStep?: number;
  /** Ancho al que se decodifica cada bitmap (ahorra memoria cuando se muestra más chico que el original) */
  bitmapWidth?: number;
  /** Alto/ancho de los fotogramas (para estimar el tamaño de cada bitmap). 9/16 por defecto */
  aspect?: number;
  /** Se decodificó un fotograma (índice) */
  onFrame?: (index: number) => void;
  /** Falló la carga de demasiados fotogramas para mostrar la secuencia */
  onFail?: () => void;
}

export type Drawable = ImageBitmap | HTMLImageElement | HTMLCanvasElement;
const BACKWARD_PENALTY = 1.2;
/** Hasta cuántos fotogramas por delante del actual se apunta la ventana, y tiempo estimado de descarga+decodificación (ms) */
const MAX_LEAD = 40;
const DECODE_MS = 40;
/** Margen con el que se libera lo decodificado / el caché de archivos, respecto de lo que se quiere tener */
const KEEP_DECODED = 1.25;
const KEEP_BLOBS = 1.1;
/** Descargas simultáneas máximas para fotogramas que todavía no se van a dibujar */
const FAR_SLOTS = 2;
/** Tamaño supuesto de un archivo antes de conocer el real */
const DEFAULT_BLOB_BYTES = 600 * 1024;

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
  private blobs: (Blob | null)[];
  private blobBytes = 0;
  private blobCount = 0;
  private loading = new Set<number>();
  private decoding = new Set<number>();
  private failed = new Set<number>();
  private controllers = new Map<number, AbortController>();
  private focus = 0;
  /** Hacia dónde va el scroll: +1 adelante, -1 atrás (se conserva el último sentido no nulo) */
  private dir = 1;
  /** Qué se quiere tener decodificado / conservar */
  private keepDecoded = new Set<number>();
  private keepBlobs = new Set<number>();
  /** Velocidad del scroll en fotogramas/ms (media móvil) y cuándo se actualizó el foco por última vez */
  private vel = 0;
  private focusAt = 0;
  /** Fotograma alrededor del que se arma la ventana: el actual, o donde se estará cuando llegue la descarga */
  private aim = 0;
  private started = false;
  /** La sección está cerca del viewport: solo entonces se descarga y se decodifica */
  private active = true;
  private disposed = false;
  private failNotified = false;
  private readonly anchorStep: number;
  /** Duración media (ms) de una descarga; con red lenta conviene menos descargas en paralelo, para que cada una llegue antes */
  private fetchMs = 0;

  constructor(private urls: string[], private opts: FrameSequenceOptions) {
    this.frames = urls.map(() => null);
    this.blobs = urls.map(() => null);
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

  /**
   * Pausa/reanuda el trabajo según la sección esté o no cerca del viewport. Al pausar se cancelan las descargas en
   * curso y se liberan los bitmaps (el costo de memoria más alto); los archivos comprimidos se conservan, así que
   * al volver no hace falta la red.
   */
  setActive(active: boolean) {
    if (this.active === active || this.disposed) return;
    this.active = active;
    if (active) {
      if (this.started) this.pump();
      return;
    }
    this.controllers.forEach((c) => c.abort());
    this.frames.forEach((f, i) => {
      if (f) release(f);
      this.frames[i] = null;
    });
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

  /** Fotograma decodificado exacto o `null` si todavía no está */
  get(index: number): Drawable | null {
    return this.frames[index] ?? null;
  }

  /** Índice del fotograma decodificado más cercano a `index` (-1 si no hay ninguno) */
  nearestIndex(index: number): number {
    for (let d = 0; d < this.length; d++) {
      if (this.frames[index - d]) return index - d;
      if (this.frames[index + d]) return index + d;
    }
    return -1;
  }

  /** El fotograma decodificado más cercano a `index` */
  nearest(index: number): Drawable | null {
    const i = this.nearestIndex(index);
    return i < 0 ? null : this.frames[i];
  }

  /** Estado interno, solo para mediciones */
  stats() {
    let decoded = 0;
    for (const f of this.frames) if (f) decoded++;
    return {
      decoded,
      blobs: this.blobCount,
      blobMB: +(this.blobBytes / 1048576).toFixed(1),
      loading: this.loading.size,
      failed: this.failed.size,
      fetchMs: Math.round(this.fetchMs),
      bitmapWidth: this.opts.bitmapWidth ?? 0,
    };
  }

  dispose() {
    this.disposed = true;
    this.controllers.forEach((c) => c.abort());
    this.controllers.clear();
    this.loading.clear();
    this.decoding.clear();
    this.frames.forEach((f) => f && release(f));
    this.frames.fill(null);
    this.blobs.fill(null);
    this.blobBytes = this.blobCount = 0;
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

  /** Bytes que ocupa un bitmap decodificado (RGBA) al ancho actual */
  private bitmapBytes() {
    const w = this.opts.bitmapWidth ?? 1280;
    return w * (w * (this.opts.aspect ?? 9 / 16)) * 4;
  }

  private pump() {
    if (this.disposed || !this.active) return;
    this.aim = this.focus;
    if (performance.now() - this.focusAt < 200) {
      const wait = this.opts.constrained ? this.fetchMs + DECODE_MS : DECODE_MS;
      const lead = Math.min(MAX_LEAD, this.vel * wait);
      this.aim = Math.max(0, Math.min(this.length - 1, Math.round(this.focus + this.dir * lead)));
    }
    const order = this.rankedFrames();
    const anchors: number[] = [];
    for (let i = 0; i < this.length; i++) if (this.isAnchor(i)) anchors.push(i);

    // Cuántos bitmaps caben en el presupuesto (descontadas las anclas), y cuántos archivos
    const decodeWindow = Math.max(4, Math.floor((this.opts.decodeBudgetMB * 1048576) / this.bitmapBytes()) - anchors.length);
    const avgBlob = this.blobCount ? this.blobBytes / this.blobCount : DEFAULT_BLOB_BYTES;
    const blobWindow = Math.max(decodeWindow, Math.floor((this.opts.blobBudgetMB * 1048576) / avgBlob) - anchors.length);
    // Con red lenta cada descarga tarda: no repartir el canal entre fotogramas que llegarían tarde
    const slow = this.fetchMs > 350;
    const fetchWindow = slow ? Math.min(blobWindow, decodeWindow) : blobWindow;

    const wantDecode = new Set<number>([...anchors, this.focus, ...order.slice(0, decodeWindow)]);
    const wantBlob = new Set<number>([...wantDecode, ...order.slice(0, fetchWindow)]);
    this.keepDecoded = new Set<number>([...wantDecode, ...order.slice(0, Math.ceil(decodeWindow * KEEP_DECODED))]);
    this.keepBlobs = new Set<number>([...wantBlob, ...order.slice(0, Math.ceil(blobWindow * KEEP_BLOBS))]);

    // Liberar memoria solo de lo que quedó fuera del margen
    for (let i = 0; i < this.length; i++) {
      const f = this.frames[i];
      if (f && !this.keepDecoded.has(i)) {
        release(f);
        this.frames[i] = null;
      }
      const b = this.blobs[i];
      if (b && !this.keepBlobs.has(i) && !this.decoding.has(i)) this.dropBlob(i);
    }

    // Decodificar lo que ya está descargado y se necesita, lo más urgente primero
    const decodeSlots = this.opts.decodeConcurrency ?? 2;
    const toDecode = [...wantDecode]
      .filter((i) => !this.frames[i] && this.blobs[i] && !this.decoding.has(i) && !this.failed.has(i))
      .sort((a, b) => this.score(a) - this.score(b));
    for (const i of toDecode) {
      if (this.decoding.size >= decodeSlots) break;
      void this.decodeFrame(i);
    }

    // Descargar lo que falta, lo más urgente primero
    const pending = [...wantBlob]
      .filter((i) => !this.blobs[i] && !this.loading.has(i) && !this.failed.has(i))
      .sort((a, b) => this.score(a) - this.score(b));
    // Sin lugar libre para lo urgente: se cancelan las descargas en curso que no se van a dibujar pronto (precarga lejana).
    // Las que sí se van a dibujar se esperan: cancelarlas tira lo ya descargado.
    if (pending.length && wantDecode.has(pending[0]) && this.loading.size >= this.slots()) {
      for (const i of this.loading) if (!wantDecode.has(i)) this.controllers.get(i)?.abort();
    }
    // La precarga lejana (fuera de lo que se va a dibujar pronto) no ocupa todos los lugares: queda canal para lo urgente
    let farLoading = 0;
    for (const i of this.loading) if (!wantDecode.has(i)) farLoading++;
    for (const i of pending) {
      if (this.loading.size >= this.slots()) break;
      const urgent = wantDecode.has(i);
      if (!urgent && farLoading >= FAR_SLOTS) continue;
      if (!urgent) farLoading++;
      void this.load(i, urgent);
    }
  }

  private dropBlob(i: number) {
    const b = this.blobs[i];
    if (!b) return;
    this.blobBytes -= b.size;
    this.blobCount--;
    this.blobs[i] = null;
  }

  private async load(i: number, urgent: boolean) {
    const ctrl = new AbortController();
    this.controllers.set(i, ctrl);
    this.loading.add(i);
    try {
      const blob = await this.fetchBlob(this.urls[i], ctrl.signal, urgent);
      if (this.disposed || ctrl.signal.aborted) return;
      this.blobs[i] = blob;
      this.blobBytes += blob.size;
      this.blobCount++;
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

  private async decodeFrame(i: number) {
    const blob = this.blobs[i];
    if (!blob) return;
    this.decoding.add(i);
    try {
      const frame = await this.decode(blob);
      // Mientras se decodificaba el scroll pudo irse lejos: lo que sobra no se guarda
      if (this.disposed || !this.active || !this.keepDecoded.has(i) || this.frames[i]) {
        release(frame);
      } else {
        this.frames[i] = frame;
        this.opts.onFrame?.(i);
      }
    } catch {
      if (!this.disposed) this.failed.add(i);
    } finally {
      this.decoding.delete(i);
      if (!this.disposed) {
        this.checkFailure();
        this.pump();
      }
    }
  }

  private async fetchBlob(url: string, signal: AbortSignal, urgent: boolean): Promise<Blob> {
    const t0 = performance.now();
    const res = await fetch(url, { signal, priority: urgent ? "high" : "low" } as RequestInit);
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
