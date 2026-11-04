/**
 * Benchmark del escenario (#escenario). Conduce el scroll con perfiles deterministas y compara, en cada
 * frame del navegador, el fotograma que está dibujado con el que correspondería a la posición de scroll.
 *
 * Uso (con `next build && next start -p 3100` corriendo):
 *   node tests/perf/stage-bench.mjs --label baseline --engine chromium --device desktop [--throttle] [--runs 3]
 *
 * Métricas (por escenario, mediana de las corridas):
 *   exactPct      % de frames dentro del recorrido con el fotograma pedido ya dibujado (no un reemplazo "nearest")
 *   lagMean/P95   |fotograma esperado por scrollY − fotograma dibujado|, en fotogramas
 *   lagMs         lo mismo en ms (fotogramas de retraso ÷ velocidad del scroll)
 *   jumps         saltos bruscos del fotograma dibujado (> max(4, 2×avance esperado + 3)) entre frames
 *   settleMs      desde que el scroll se detiene hasta dibujar el fotograma final exacto
 *   recoverMs     (reversal) desde la inversión hasta volver a ≤1 fotograma de error y exacto
 *   long33/long50 frames del navegador que tardaron >33 ms / >50 ms
 *   p95Frame      percentil 95 de la duración de frame (ms)
 *   reqs / mbNet  requests a /stage/frames/ y MB transferidos
 *   decodedMax    máximo de bitmaps decodificados simultáneos, y MB estimados
 */
import { chromium, webkit, devices } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  if (i < 0) return d;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
};
const label = arg("label", "run");
const engineName = arg("engine", "chromium");
const device = arg("device", "desktop");
const throttle = Boolean(arg("throttle", false));
const runs = Number(arg("runs", 3));
const base = arg("base", "http://localhost:3100");
const only = arg("only", "");

/** Perfiles: delta de scroll (px) por frame del navegador. `v` = índice de frame. */
const DESKTOP = {
  slow: { frames: 150, delta: () => 10 },
  normal: { frames: 70, delta: () => 35 },
  flick: { frames: 20, delta: () => 140 },
  reversal: { frames: 120, delta: (v) => (v < 50 ? 35 : v < 60 ? 0 : -35) , reverseAt: 50 },
};
const MOBILE = {
  slow: { frames: 150, delta: () => 8 },
  normal: { frames: 70, delta: () => 30 },
  flick: { frames: 90, delta: (v) => 120 * Math.pow(0.95, v) },
  reversal: { frames: 120, delta: (v) => (v < 50 ? 30 : v < 60 ? 0 : -30), reverseAt: 50 },
};
const PROFILES = device === "mobile" ? MOBILE : DESKTOP;
const DWELLS = [0, 1500]; // ms de espera frente al escenario antes de empezar a mover

const median = (a) => (a.length ? [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] : null);
const pct = (a, p) => (a.length ? [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * p))] : 0);

async function runOnce(browser, ctxOpts, name, dwell) {
  const context = await browser.newContext(ctxOpts);
  const page = await context.newPage();
  const reqs = [];
  page.on("requestfinished", async (r) => {
    if (!r.url().includes("/stage/frames")) return;
    try { reqs.push((await r.sizes()).responseBodySize); } catch { reqs.push(0); }
  });
  await page.addInitScript(() => {
    window.__draws = [];
    window.__stageProbe = (e) => window.__draws.push(e);
  });
  if (throttle && engineName === "chromium") {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    // ~20 Mbps, 40 ms de latencia: una conexión de escritorio/4G razonable
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 40, downloadThroughput: (20 * 1024 * 1024) / 8, uploadThroughput: (5 * 1024 * 1024) / 8 });
  }
  await page.goto(base, { waitUntil: "load" });
  await page.waitForFunction(() => window.__motionReady === true);
  const isMobile = device === "mobile";
  const prof = PROFILES[name];

  // Ubicar el inicio del escenario y esperar a que exista el espacio del pin
  const geo = await page.evaluate(
    ({ pct }) => {
      const s = document.getElementById("escenario");
      const vh = window.innerHeight;
      const start = Math.round(s.getBoundingClientRect().top + window.scrollY);
      return { start, vh, len: (pct / 100) * vh };
    },
    { pct: Math.round(140 * (isMobile ? 2.2 : 2.8)) },
  );
  // Acercarse (dispara la precarga) y quedar frente al primer fotograma
  await page.evaluate((y) => window.scrollTo(0, y), geo.start - Math.round(geo.vh * 0.5));
  await page.waitForTimeout(400);
  await page.evaluate((y) => window.scrollTo(0, y), geo.start);
  await page.waitForTimeout(300 + dwell);

  const result = await page.evaluate(
    ({ prof, geo, isMobile }) =>
      new Promise((resolve) => {
        const deltas = prof.deltas;
        const last = 140;
        const expectedAt = (y) => Math.min(1, Math.max(0, (y - geo.start) / geo.len)) / 0.92 * last;
        const exp = (y) => Math.min(last, expectedAt(y));
        const samples = []; // {t, y, wanted, shown, exact}
        let v = 0, prevT = performance.now(), stopT = 0, y0 = window.scrollY, lastDrawIdx = 0;
        const tick = (t) => {
          if (v < deltas.length) {
            const d = deltas[v++];
            if (d) {
              if (isMobile) window.scrollBy(0, d);
              else window.dispatchEvent(new WheelEvent("wheel", { deltaY: d, deltaMode: 0, bubbles: true, cancelable: true }));
            }
            if (v === deltas.length) stopT = t;
          }
          const draws = window.__draws;
          const dr = draws.length ? draws[draws.length - 1] : null;
          samples.push({ t, dt: t - prevT, y: window.scrollY, shown: dr ? dr.shown : 0, wanted: dr ? dr.wanted : 0, exact: dr ? dr.exact : true, n: draws.length });
          prevT = t;
          lastDrawIdx = draws.length;
          // Termina cuando el scroll ya se detuvo y pasó tiempo para que se asiente
          const quietFor = samples.length > 12 && samples.slice(-12).every((s) => Math.abs(s.y - samples[samples.length - 1].y) < 0.3);
          if (v >= deltas.length && quietFor && t - stopT > 600) return resolve({ samples, stopT, reverseAt: prof.reverseAt ?? -1, dens: window.__stageSeq ? window.__stageSeq.stats() : null });
          if (t - stopT > 8000 && v >= deltas.length) return resolve({ samples, stopT, reverseAt: prof.reverseAt ?? -1, dens: window.__stageSeq ? window.__stageSeq.stats() : null });
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    { prof: { deltas: Array.from({ length: prof.frames }, (_, v) => prof.delta(v)), reverseAt: prof.reverseAt }, geo, isMobile },
  );
  const stats = result.dens;
  await context.close();

  // --- análisis ---
  const { samples, stopT, reverseAt } = result;
  const last = 140;
  const exp = (y) => Math.min(last, (Math.min(1, Math.max(0, (y - geo.start) / geo.len)) / 0.92) * last);
  const inRange = samples.filter((s) => s.y > geo.start + 2 && s.y < geo.start + geo.len);
  const lag = inRange.map((s) => Math.abs(exp(s.y) - s.shown));
  const moving = samples.filter((s) => s.t <= stopT);
  // velocidad media (fotogramas/ms) para convertir retraso a ms
  const span = moving.length > 1 ? moving[moving.length - 1].t - moving[0].t : 1;
  const travelled = moving.length > 1 ? Math.abs(exp(moving[moving.length - 1].y) - exp(moving[0].y)) : 0;
  const fpms = Math.max(travelled / Math.max(1, span), 1e-6);
  let jumps = 0;
  for (let i = 1; i < inRange.length; i++) {
    const ds = Math.abs(inRange[i].shown - inRange[i - 1].shown);
    const de = Math.abs(exp(inRange[i].y) - exp(inRange[i - 1].y));
    if (ds > Math.max(4, 2 * de + 3)) jumps++;
  }
  const dts = samples.slice(1).map((s) => s.dt);
  const finalExp = Math.round(exp(samples[samples.length - 1].y));
  const settleSample = samples.find((s) => s.t >= stopT && Math.abs(s.shown - finalExp) <= 0 && s.exact);
  const settleMs = settleSample ? settleSample.t - stopT : null;
  let recoverMs = null;
  if (reverseAt >= 0) {
    const t0 = samples[Math.min(samples.length - 1, reverseAt + 1)].t;
    const rec = samples.find((s, i) => s.t > t0 && s.exact && Math.abs(exp(s.y) - s.shown) <= 1.5);
    recoverMs = rec ? rec.t - t0 : null;
  }
  const bw = stats?.bitmapWidth || 0;
  return {
    exactPct: inRange.length ? +((100 * inRange.filter((s) => s.exact).length) / inRange.length).toFixed(1) : null,
    lagMean: +(lag.reduce((a, b) => a + b, 0) / Math.max(1, lag.length)).toFixed(2),
    lagP95: +pct(lag, 0.95).toFixed(1),
    lagMax: +Math.max(0, ...lag).toFixed(1),
    lagMs: +(lag.reduce((a, b) => a + b, 0) / Math.max(1, lag.length) / fpms).toFixed(0),
    jumps,
    settleMs: settleMs === null ? null : Math.round(settleMs),
    recoverMs: recoverMs === null ? null : Math.round(recoverMs),
    nearPct: inRange.length ? +((100 * lag.filter((l) => l <= 2).length) / inRange.length).toFixed(1) : null,
    stalePct: inRange.length ? +((100 * lag.filter((l) => l > 6).length) / inRange.length).toFixed(1) : null,
    long33: dts.filter((d) => d > 33.5).length,
    long50: dts.filter((d) => d > 50).length,
    p95Frame: +pct(dts, 0.95).toFixed(1),
    reqs: reqs.length,
    mbNet: +(reqs.reduce((a, b) => a + b, 0) / 1048576).toFixed(1),
    decodedEnd: stats?.decoded ?? null,
    bitmapW: bw,
    decodedMBEnd: stats ? +((stats.decoded * bw * ((bw * 9) / 16) * 4) / 1048576).toFixed(0) : null,
  };
}

const browserType = engineName === "webkit" ? webkit : chromium;
const browser = await browserType.launch();
const ctxOpts =
  device === "mobile"
    ? { ...(engineName === "webkit" ? devices["iPhone 14"] : devices["Pixel 7"]) }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };

const out = { label, engine: engineName, device, throttle, runs, when: new Date().toISOString(), scenarios: {} };
for (const name of Object.keys(PROFILES)) {
  if (only && !String(only).split(",").includes(name)) continue;
  for (const dwell of DWELLS) {
    const rs = [];
    for (let i = 0; i < runs; i++) rs.push(await runOnce(browser, ctxOpts, name, dwell));
    const keys = Object.keys(rs[0]);
    const agg = {};
    for (const k of keys) {
      const vals = rs.map((r) => r[k]).filter((x) => x !== null && x !== undefined);
      agg[k] = vals.length ? median(vals) : null;
    }
    out.scenarios[`${name}@${dwell}ms`] = agg;
    console.log(`${label} ${engineName}/${device} ${name}@${dwell}ms`, JSON.stringify(agg));
  }
}
await browser.close();
mkdirSync("tests/perf/results", { recursive: true });
const file = `tests/perf/results/${label}-${engineName}-${device}${throttle ? "-throttled" : ""}.json`;
writeFileSync(file, JSON.stringify(out, null, 2));
console.log("→", file);
