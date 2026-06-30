import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = join(here, "..", "data", "cloud-offers.json");
const raw = readFileSync(dataPath, "utf8");
const payload = JSON.parse(raw);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(Array.isArray(payload.offers), "cloud-offers.json must expose an offers array");
assert(payload.offers.length === 30, `expected exactly 30 cloud offers, got ${payload.offers.length}`);

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
assert(vpsCount >= 10, `expected at least 10 VPS offers, got ${vpsCount}`);
assert(gpuCount >= 10, `expected at least 10 GPU offers, got ${gpuCount}`);

console.log(`cloud offer contract ok: ${payload.offers.length} offers (${vpsCount} VPS, ${gpuCount} GPU)`);
