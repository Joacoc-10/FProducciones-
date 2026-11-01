/**
 * Genera las variantes del logo ORIGINAL de Fabio Producciones a partir de
 * public/brand/logo-original.png (archivo original sin modificar).
 *
 *  - logo-original-trim.png : recorte exacto de los márgenes transparentes (sin recolorear).
 *  - logo-dark.png          : misma forma y proporciones; solo las partes negras pasan a blanco cálido
 *                             para leerse sobre fondo oscuro. El rojo se conserva.
 *  - logo-dark-480.png      : lo mismo a 480 px de ancho (para la UI; se muestra sin recompresión).
 *
 * Uso: node scripts/make-logo-variants.mjs
 */
import sharp from "sharp";
import path from "node:path";

const dir = path.join(process.cwd(), "public", "brand");
const src = path.join(dir, "logo-original.png");

// Colores medidos en el original (los dos tonos dominantes del logo)
const BLACK = 17;
const RED = [219, 37, 28];
const WHITE = [242, 239, 234]; // --text del sistema de diseño

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

// Caja de contenido (alpha > 8)
let minX = width, minY = height, maxX = -1, maxY = -1;
for (let y = 0; y < height; y++)
  for (let x = 0; x < width; x++)
    if (data[(y * width + x) * 4 + 3] > 8) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
const box = { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };

// Variante oscura: cada píxel es una mezcla f·rojo + (1-f)·negro (el borde antialias incluido).
// Se estima f con el canal R y se vuelve a mezclar f·rojo + (1-f)·blanco. El alfa no se toca.
const out = Buffer.from(data);
for (let i = 0; i < out.length; i += 4) {
  const f = Math.min(1, Math.max(0, (data[i] - BLACK) / (RED[0] - BLACK)));
  for (let c = 0; c < 3; c++) out[i + c] = Math.round(f * RED[c] + (1 - f) * WHITE[c]);
}

const raw = { raw: { width, height, channels: 4 } };
await sharp(src).extract(box).png({ compressionLevel: 9 }).toFile(path.join(dir, "logo-original-trim.png"));
const dark = sharp(out, raw).extract(box);
await dark.clone().png({ compressionLevel: 9 }).toFile(path.join(dir, "logo-dark.png"));
await dark.clone().resize({ width: 480, kernel: "lanczos3" }).png({ compressionLevel: 9, palette: true, quality: 95, effort: 10 }).toFile(path.join(dir, "logo-dark-480.png"));

console.log("recorte:", box, `(${(box.width / box.height).toFixed(3)}:1)`);
