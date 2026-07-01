import type { CloudOffer, CloudOfferKind } from "@/lib/cloud-comparison";
import { getCloudOfferMetrics } from "@/lib/cloud-offer-metrics";

export type SortMode = "price-asc" | "monthly-asc" | "cpu-desc" | "memory-desc" | "storage-desc" | "gpu-desc" | "vram-desc" | "provider-asc";

export const pageSizeOptions = [25, 50, 100] as const;
export const vpsCpuOptions = [["0", "CPU 全部"], ["1", "1 核+"], ["2", "2 核+"], ["4", "4 核+"], ["8", "8 核+"]] as const;
export const vpsMemoryOptions = [["0", "内存全部"], ["1", "1 GB+"], ["2", "2 GB+"], ["4", "4 GB+"], ["8", "8 GB+"], ["16", "16 GB+"]] as const;
export const storageOptions = [["0", "硬盘不限"], ["20", "20 GB+"], ["50", "50 GB+"], ["100", "100 GB+"], ["200", "200 GB+"], ["500", "500 GB+"], ["1024", "1 TB+"]] as const;
export const monthlyOptions = [["0", "月价不限"], ["5", "$5 内"], ["10", "$10 内"], ["20", "$20 内"], ["50", "$50 内"]] as const;
export const gpuCountOptions = [["0", "GPU 数全部"], ["0.5", "半卡+"], ["1", "1 张+"], ["2", "2 张+"], ["4", "4 张+"], ["8", "8 张+"]] as const;
export const vramOptions = [["0", "显存全部"], ["8", "8 GB+"], ["16", "16 GB+"], ["24", "24 GB+"], ["48", "48 GB+"], ["80", "80 GB+"]] as const;
export const hourlyOptions = [["0", "小时价不限"], ["0.2", "$0.20 内"], ["0.5", "$0.50 内"], ["1", "$1 内"], ["2", "$2 内"], ["5", "$5 内"]] as const;
export const billingOptions = [["all", "计费不限"], ["month", "月付"], ["hour", "按小时"], ["spot", "抢占式低价"]] as const;

const vpsSortOptions: readonly (readonly [SortMode, string])[] = [["monthly-asc", "月价从低到高"], ["cpu-desc", "CPU 从高到低"], ["memory-desc", "内存从高到低"], ["storage-desc", "硬盘从高到低"], ["provider-asc", "商家 A-Z"]];
const gpuSortOptions: readonly (readonly [SortMode, string])[] = [["price-asc", "价格从低到高"], ["vram-desc", "显存从高到低"], ["gpu-desc", "GPU 数从高到低"], ["provider-asc", "商家 A-Z"]];

export function getSortOptions(kind: CloudOfferKind): readonly (readonly [SortMode, string])[] {
  return kind === "gpu" ? gpuSortOptions : vpsSortOptions;
}

export function toSortMode(value: string, kind: CloudOfferKind): SortMode {
  for (const [optionValue] of getSortOptions(kind)) {
    if (optionValue === value) return optionValue;
  }
  return kind === "gpu" ? "price-asc" : "monthly-asc";
}

export function toPageSize(value: string) {
  const parsed = Number(value);
  for (const option of pageSizeOptions) {
    if (option === parsed) return option;
  }
  return 25;
}

export function matchesBilling(billing: string, mode: string) {
  const normalized = billing.toLowerCase();
  if (mode === "all") return true;
  if (mode === "month") return /month|monthly|月付|按月/.test(normalized);
  if (mode === "hour") return /hour|hourly|按小时|小时/.test(normalized);
  if (mode === "spot") return /spot|preempt|interrupt|抢占|竞价/.test(normalized);
  return false;
}

export function compareOffers(left: CloudOffer, right: CloudOffer, sortMode: SortMode) {
  const leftMetrics = getCloudOfferMetrics(left);
  const rightMetrics = getCloudOfferMetrics(right);

  if (sortMode === "provider-asc") return left.provider.localeCompare(right.provider);
  if (sortMode === "monthly-asc") return left.monthlyEstimateUsd - right.monthlyEstimateUsd;
  if (sortMode === "cpu-desc") return rightMetrics.cpuCores - leftMetrics.cpuCores;
  if (sortMode === "memory-desc") return rightMetrics.memoryGb - leftMetrics.memoryGb;
  if (sortMode === "storage-desc") return rightMetrics.storageGb - leftMetrics.storageGb;
  if (sortMode === "gpu-desc") return rightMetrics.gpuCount - leftMetrics.gpuCount;
  if (sortMode === "vram-desc") return rightMetrics.vramGb - leftMetrics.vramGb;
  return left.priceUsd - right.priceUsd;
}

export function getGpuModelOptions(offers: readonly CloudOffer[]): readonly (readonly [string, string])[] {
  const counts = new Map<string, number>();
  for (const offer of offers) {
    if (offer.kind !== "gpu") continue;
    const model = getGpuModel(offer);
    if (!model) continue;
    counts.set(model, (counts.get(model) ?? 0) + 1);
  }

  return [
    ["all", "型号全部"],
    ...[...counts.entries()]
      .sort(([leftModel, leftCount], [rightModel, rightCount]) => rightCount - leftCount || leftModel.localeCompare(rightModel))
      .map(([model, count]) => [model, `${model} (${count})`] as const),
  ] as const;
}

export function getGpuModel(offer: CloudOffer) {
  const text = `${offer.config.compute} ${offer.product}`;
  const match = text.match(/\b(RTX\s?\d{4}|GTX\s?\d{4}|A\d{2,4}|H\d{3,4}|L\d{1,2}|T\d|V\d{3}|B\d{3,4}|MI\d{2,3}X?)\b/i);
  if (!match) return "";
  return match[1].toUpperCase().replace(/(RTX|GTX)\s?(\d)/, "$1 $2");
}
