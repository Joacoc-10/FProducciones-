// Tabla resumida: node tests/perf/summarize.mjs <label> [<label2> ...]
import { readdirSync, readFileSync } from "node:fs";
const labels = process.argv.slice(2);
const keys = ["exactPct","nearPct","stalePct","lagMean","reqs","mbNet","decodedMBEnd","bitmapW"];
const files = readdirSync("tests/perf/results").filter((f) => f.endsWith(".json")).sort();
const cfgs = [...new Set(files.map((f) => f.replace(/^[^-]+-/, "")))];
for (const cfg of cfgs) {
  console.log(`\n## ${cfg.replace(".json","")}`);
  const data = labels.map((l) => { try { return JSON.parse(readFileSync(`tests/perf/results/${l}-${cfg}`, "utf8")); } catch { return null; } });
  const sc = Object.keys((data.find(Boolean) ?? { scenarios: {} }).scenarios).filter((s) => s.endsWith("@0ms"));
  console.log(["scenario", "label", ...keys].join("\t"));
  for (const s of sc) data.forEach((d, i) => d && console.log([s.replace("@0ms",""), labels[i], ...keys.map((k) => d.scenarios[s]?.[k] ?? "-")].join("\t")));
}
