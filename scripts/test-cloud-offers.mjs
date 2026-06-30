import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = join(here, "..", "data", "cloud-offers-db.json");
const explorerPath = join(here, "..", "src", "components", "cloud", "CloudOfferExplorer.tsx");
const libraryPath = join(here, "..", "src", "lib", "cloud-comparison.ts");
const raw = readFileSync(dataPath, "utf8");
const payload = JSON.parse(raw);
const explorerSource = readFileSync(explorerPath, "utf8");
const librarySource = readFileSync(libraryPath, "utf8");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(Array.isArray(payload.offers), "cloud-offers-db.json must expose an offers array");
assert(payload.offers.length >= 500, `expected the full cloud offer database, got ${payload.offers.length}`);
assert(typeof payload.selection === "string" && payload.selection.includes("全量入库"), "cloud offer selection copy must describe the full database");
assert(!payload.selection.includes("共 30 条"), "cloud offer selection copy must not describe the old fixed 30-row list");

const kinds = new Set(payload.offers.map((offer) => offer.kind));
assert(kinds.has("vps"), "offers must include VPS rows");
assert(kinds.has("gpu"), "offers must include GPU rows");

const ids = new Set();
for (const offer of payload.offers) {
  assert(typeof offer.id === "string" && offer.id.length > 0, "offer.id is required");
  assert(!ids.has(offer.id), `duplicate offer id: ${offer.id}`);
  ids.add(offer.id);
  assert(offer.kind === "vps" || offer.kind === "gpu", `invalid kind for ${offer.id}`);
  assert(typeof offer.provider === "string" && offer.provider.length > 0, `provider missing for ${offer.id}`);
  assert(typeof offer.product === "string" && offer.product.length > 0, `product missing for ${offer.id}`);
  assert(typeof offer.priceText === "string" && offer.priceText.length > 0, `priceText missing for ${offer.id}`);
  assert(typeof offer.priceUsd === "number" && Number.isFinite(offer.priceUsd), `priceUsd missing for ${offer.id}`);
  assert(typeof offer.billing === "string" && offer.billing.length > 0, `billing missing for ${offer.id}`);
  assert(typeof offer.compute === "string" && offer.compute.length > 0, `compute missing for ${offer.id}`);
  assert(typeof offer.memory === "string" && offer.memory.length > 0, `memory missing for ${offer.id}`);
  assert(typeof offer.storage === "string" && offer.storage.length > 0, `storage missing for ${offer.id}`);
  assert(typeof offer.network === "string" && offer.network.length > 0, `network missing for ${offer.id}`);
  assert(typeof offer.risk === "string" && offer.risk.length > 0, `risk missing for ${offer.id}`);
  assert(typeof offer.sourceName === "string" && offer.sourceName.length > 0, `sourceName missing for ${offer.id}`);
  assert(typeof offer.sourceUrl === "string" && offer.sourceUrl.startsWith("https://"), `sourceUrl missing for ${offer.id}`);
  assert(typeof offer.verifyUrl === "string" && offer.verifyUrl.startsWith("https://"), `verifyUrl missing for ${offer.id}`);
  assert(typeof offer.lastChecked === "string" && /^\d{4}-\d{2}-\d{2}$/.test(offer.lastChecked), `lastChecked must be YYYY-MM-DD for ${offer.id}`);
}

const vpsCount = payload.offers.filter((offer) => offer.kind === "vps").length;
const gpuCount = payload.offers.filter((offer) => offer.kind === "gpu").length;
assert(vpsCount >= 100, `expected at least 100 VPS offers, got ${vpsCount}`);
assert(gpuCount >= 100, `expected at least 100 GPU offers, got ${gpuCount}`);

assert(librarySource.includes('data/cloud-offers-db.json'), "cloud comparison library must read the full offer database");
assert(explorerSource.includes('"use client"') || explorerSource.includes("'use client'"), "cloud explorer must be a client component");
assert(explorerSource.includes("CPU") && explorerSource.includes("内存"), "VPS filters must expose CPU and memory controls");
assert(explorerSource.includes("显存") && explorerSource.includes("小时价"), "GPU filters must expose VRAM and hourly price controls");
assert(explorerSource.includes("GPU 型号"), "GPU filters must expose a GPU model selector");
assert(explorerSource.includes("getGpuModelOptions"), "GPU model selector must be generated from real offer data");
assert(explorerSource.includes("pageSize") && explorerSource.includes("分页"), "cloud explorer must paginate the full offer list");

const gpuModels = new Set(
  payload.offers
    .filter((offer) => offer.kind === "gpu")
    .map((offer) => `${offer.compute} ${offer.product}`.match(/\b(RTX\s?\d{4}|GTX\s?\d{4}|A\d{2,4}|H\d{3,4}|L\d{1,2}|T\d|V\d{3}|B\d{3,4}|MI\d{2,3}X?)\b/i)?.[1]?.toUpperCase().replace(/(RTX|GTX)\s?(\d)/, "$1 $2"))
    .filter(Boolean),
);

assert(gpuModels.has("RTX 3090"), "GPU database must include RTX 3090 rows for model filtering");
assert(gpuModels.has("A100"), "GPU database must include A100 rows for model filtering");
assert(gpuModels.has("H100"), "GPU database must include H100 rows for model filtering");

console.log(`cloud offer contract ok: ${payload.offers.length} offers (${vpsCount} VPS, ${gpuCount} GPU)`);
