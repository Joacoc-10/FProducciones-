/**
 * Genera el favicon a partir del isotipo ORIGINAL «FP» (la P negra + la F roja) del logo oficial.
 * La geometría no se modifica: el isotipo se aísla con componentes conexas sobre el PNG original
 * (las letras «ABIO» y «RODUCCIONES» son componentes aparte y quedan fuera).
 * Único ajuste: el negro de la P pasa a blanco cálido (igual que logo-dark) y se apoya sobre un
 * mosaico oscuro, para que se lea tanto en pestañas claras como oscuras. El rojo no cambia.
 *
 * Salidas: src/app/favicon.ico (16/32/48), src/app/icon.png, src/app/apple-icon.png,
 *          public/icons/icon-192.png, public/icons/icon-512.png
 * Uso: node scripts/make-favicons.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const SRC = path.join(root, "public/brand/logo-original.png");
const BLACK = 17, RED = [219, 37, 28], WHITE = [242, 239, 234], TILE = "#07070A";

// 1) Aislar el isotipo (componente conexa más grande)
const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const lab = new Int32Array(W * H);
const on = (i) => data[i * 4 + 3] > 8;
let best = { n: 0 };
for (let s = 0; s < W * H; s++) {
  if (lab[s] || !on(s)) continue;
  const id = s + 1;
  const stack = [s];
  lab[s] = id;
  let n = 0, x0 = W, y0 = H, x1 = 0, y1 = 0;
  while (stack.length) {
    const p = stack.pop();
    n++;
    const x = p % W, y = (p / W) | 0;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const q = ny * W + nx;
        if (!lab[q] && on(q)) { lab[q] = id; stack.push(q); }
      }
  }
  if (n > best.n) best = { n, id, x0, y0, x1, y1 };
}
const bw = best.x1 - best.x0 + 1, bh = best.y1 - best.y0 + 1;

// 2) Recortar solo esos píxeles y adaptar el contraste (negro → blanco cálido)
const mark = Buffer.alloc(bw * bh * 4);
for (let y = 0; y < bh; y++)
  for (let x = 0; x < bw; x++) {
    const si = (y + best.y0) * W + (x + best.x0);
    const di = (y * bw + x) * 4;
    if (lab[si] !== best.id) continue; // letras u otros elementos: transparentes
    const f = Math.min(1, Math.max(0, (data[si * 4] - BLACK) / (RED[0] - BLACK)));
    for (let c = 0; c < 3; c++) mark[di + c] = Math.round(f * RED[c] + (1 - f) * WHITE[c]);
    mark[di + 3] = data[si * 4 + 3];
  }
const markPng = await sharp(mark, { raw: { width: bw, height: bh, channels: 4 } }).png().toBuffer();

// 3) Mosaico maestro 1024 px
const MASTER = 1024;
async function tile({ rounded, share }) {
  const box = Math.round(MASTER * share);
  const m = await sharp(markPng).resize({ width: box, height: box, fit: "inside", kernel: "lanczos3" }).toBuffer();
  const mm = await sharp(m).metadata();
  const r = rounded ? Math.round(MASTER * 0.22) : 0;
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${MASTER}" height="${MASTER}"><rect width="${MASTER}" height="${MASTER}" rx="${r}" fill="${TILE}"/></svg>`);
  return sharp(bg).composite([{ input: m, left: Math.round((MASTER - mm.width) / 2), top: Math.round((MASTER - mm.height) / 2) }]).png().toBuffer();
}
const rounded = await tile({ rounded: true, share: 0.74 });
const square = await tile({ rounded: false, share: 0.66 }); // iOS aplica su propia máscara
const at = (buf, size) => sharp(buf).resize(size, size, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer();

// 4) Archivos
fs.mkdirSync(path.join(root, "public/icons"), { recursive: true });
fs.writeFileSync(path.join(root, "src/app/icon.png"), await at(rounded, 256));
fs.writeFileSync(path.join(root, "src/app/apple-icon.png"), await at(square, 180));
fs.writeFileSync(path.join(root, "public/icons/icon-192.png"), await at(rounded, 192));
fs.writeFileSync(path.join(root, "public/icons/icon-512.png"), await at(rounded, 512));

// ICO con PNG incrustados (16, 32, 48)
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => at(rounded, s)));
const head = Buffer.alloc(6);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const dir = Buffer.concat(sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(pngs[i].length, 8); e.writeUInt32LE(offset, 12);
  offset += pngs[i].length;
  return e;
}));
fs.writeFileSync(path.join(root, "src/app/favicon.ico"), Buffer.concat([head, dir, ...pngs]));

console.log("isotipo:", { x: best.x0, y: best.y0, w: bw, h: bh }, "px:", best.n);
