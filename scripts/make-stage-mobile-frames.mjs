/**
 * Genera la variante móvil de la secuencia del escenario: 960 px de ancho, WebP.
 * Los originales (public/media/ai/stage/frames/) NO se tocan.
 *
 *   node scripts/make-stage-mobile-frames.mjs [--quality 78] [--width 960]
 *
 * Salida: public/media/ai/stage/frames-960/frame-000.webp … (mismos números que los originales).
 */
import sharp from "sharp";
import { mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i < 0 ? d : Number(process.argv[i + 1]);
};
const quality = arg("quality", 78);
const width = arg("width", 960);
const SRC = "public/media/ai/stage/frames";
const OUT = "public/media/ai/stage/frames-960";

mkdirSync(OUT, { recursive: true });
const files = readdirSync(SRC).filter((f) => /^frame-\d{3}\.webp$/.test(f)).sort();
let inBytes = 0;
let outBytes = 0;
for (const f of files) {
  const src = path.join(SRC, f);
  const dst = path.join(OUT, f);
  await sharp(src)
    .resize({ width, kernel: "lanczos3" })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toFile(dst);
  inBytes += statSync(src).size;
  outBytes += statSync(dst).size;
}
const mb = (n) => (n / 1048576).toFixed(1);
console.log(`${files.length} fotogramas · ${mb(inBytes)} MB → ${mb(outBytes)} MB (${((100 * outBytes) / inBytes).toFixed(0)} %) · q${quality} · ${width}px`);
