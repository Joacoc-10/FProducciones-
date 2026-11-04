/**
 * Compara la variante móvil contra el original, a los tamaños en que realmente se ve en pantalla.
 * Para cada ancho de pantalla: original → reducido a ese ancho (Lanzos, referencia) vs variante 960 → ese ancho.
 * Métricas sobre luminancia: PSNR y SSIM medio (ventanas de 8×8).
 *
 *   node scripts/compare-stage-frames.mjs [--step 7]
 */
import sharp from "sharp";
import { readdirSync } from "node:fs";

const step = Number(process.argv[process.argv.indexOf("--step") + 1]) || 7;
const SRC = "public/media/ai/stage/frames";
const SMALL = "public/media/ai/stage/frames-960";
// Anchos de canvas móvil típicos: 360×1.5, 412×1.5, 430×1.5 y el máximo móvil (767×1.5)
const TARGETS = [540, 618, 645, 960, 1150];

async function gray(file, w) {
  const { data, info } = await sharp(file).resize({ width: w, kernel: "lanczos3" }).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

function psnr(a, b) {
  let se = 0;
  for (let i = 0; i < a.data.length; i++) se += (a.data[i] - b.data[i]) ** 2;
  const mse = se / a.data.length;
  return mse === 0 ? 99 : 10 * Math.log10((255 * 255) / mse);
}

function ssim(a, b) {
  const C1 = (0.01 * 255) ** 2;
  const C2 = (0.03 * 255) ** 2;
  const { w, h } = a;
  let sum = 0;
  let n = 0;
  for (let y = 0; y + 8 <= h; y += 4) {
    for (let x = 0; x + 8 <= w; x += 4) {
      let ma = 0, mb = 0;
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { ma += a.data[(y + j) * w + x + i]; mb += b.data[(y + j) * w + x + i]; }
      ma /= 64; mb /= 64;
      let va = 0, vb = 0, cov = 0;
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
        const da = a.data[(y + j) * w + x + i] - ma;
        const db = b.data[(y + j) * w + x + i] - mb;
        va += da * da; vb += db * db; cov += da * db;
      }
      va /= 63; vb /= 63; cov /= 63;
      sum += ((2 * ma * mb + C1) * (2 * cov + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2));
      n++;
    }
  }
  return sum / n;
}

const files = readdirSync(SRC).filter((f) => /^frame-\d{3}\.webp$/.test(f)).sort().filter((_, i) => i % step === 0);
for (const w of TARGETS) {
  let p = 0, s = 0, worstP = 99, worstS = 1, worstF = "";
  for (const f of files) {
    const ref = await gray(`${SRC}/${f}`, w);
    const alt = await gray(`${SMALL}/${f}`, w);
    const pp = psnr(ref, alt);
    const ss = ssim(ref, alt);
    p += pp; s += ss;
    if (ss < worstS) { worstS = ss; worstP = pp; worstF = f; }
  }
  console.log(`${String(w).padStart(5)} px · ${files.length} fotogramas · PSNR medio ${(p / files.length).toFixed(1)} dB · SSIM medio ${(s / files.length).toFixed(4)} · peor ${worstF} (SSIM ${worstS.toFixed(4)}, PSNR ${worstP.toFixed(1)})`);
}
