export type CloudOfferKind = "vps" | "gpu";

import cloudOfferPayload from "../../data/cloud-offers-db.json";

export type CloudDataStatus = "parsed_source" | "manual_reference" | "pending_collector" | "needs_review";

export type CloudOfferConfig = {
  readonly compute: string;
  readonly memory: string;
  readonly storage: string;
  readonly network: string;
  readonly note: string;
};

export type CloudOffer = {
  readonly id: string;
  readonly kind: CloudOfferKind;
  readonly provider: string;
  readonly product: string;
  readonly pricingUrl: string;
  readonly homepageUrl: string;
  readonly priceUsd: number;
  readonly monthlyEstimateUsd: number;
  readonly priceDisplay: string;
  readonly config: CloudOfferConfig;
  readonly priceBasis: string;
  priceHighlights: readonly string[];
  readonly billing: string;
  readonly sourceName: string;
  readonly regions: readonly string[];
  readonly specs: readonly string[];
  readonly bestFor: readonly string[];
  readonly cautions: readonly string[];
  readonly dataStatus: CloudDataStatus;
  readonly lastChecked: string;
};

type CloudOfferPayloadRow = {
  readonly id: string;
  readonly kind: CloudOfferKind;
  readonly provider: string;
  readonly product: string;
  readonly priceUsd: number;
  readonly monthlyEstimateUsd: number;
  readonly priceText: string;
  readonly billing: string;
  readonly compute: string;
  readonly memory: string;
  readonly storage: string;
  readonly network: string;
  readonly region: string;
  readonly risk: string;
  readonly sourceName: string;
  readonly sourceUrl: string;
  readonly verifyUrl: string;
  readonly sourceType: string;
  readonly lastChecked: string;
};

type CloudOfferPayload = {
  readonly updatedAt: string;
  readonly generatedAt: string;
  readonly selection: string;
  readonly offers: readonly CloudOfferPayloadRow[];
};

const cloudOfferData: CloudOfferPayload = {
  updatedAt: cloudOfferPayload.updatedAt,
  generatedAt: cloudOfferPayload.generatedAt,
  selection: cloudOfferPayload.selection,
  offers: cloudOfferPayload.offers.flatMap((offer) => {
    if (offer.kind !== "vps" && offer.kind !== "gpu") return [];
    return [
      {
        id: offer.id,
        kind: offer.kind,
        provider: offer.provider,
        product: offer.product,
        priceUsd: offer.priceUsd,
        monthlyEstimateUsd: offer.monthlyEstimateUsd,
        priceText: offer.priceText,
        billing: offer.billing,
        compute: offer.compute,
        memory: offer.memory,
        storage: offer.storage,
        network: offer.network,
        region: offer.region,
        risk: offer.risk,
        sourceName: offer.sourceName,
        sourceUrl: offer.sourceUrl,
        verifyUrl: offer.verifyUrl,
        sourceType: offer.sourceType,
        lastChecked: offer.lastChecked,
      },
    ];
  }),
};

export const cloudOffers: CloudOffer[] = cloudOfferData.offers.map((offer) => ({
  id: offer.id,
  kind: offer.kind,
  provider: offer.provider,
  product: offer.product,
  homepageUrl: offer.sourceUrl,
  pricingUrl: offer.verifyUrl,
  priceUsd: offer.priceUsd,
  monthlyEstimateUsd: offer.monthlyEstimateUsd,
  priceDisplay: offer.priceText,
  config: {
    compute: offer.compute,
    memory: offer.memory,
    storage: offer.storage,
    network: offer.network,
    note: offer.risk,
  },
  priceBasis: `${offer.sourceName} 抓取结果；${offer.risk}`,
  priceHighlights: [offer.billing, offer.region, offer.sourceName],
  billing: offer.billing,
  sourceName: offer.sourceName,
  regions: offer.region ? offer.region.split(" / ") : [],
  specs: [offer.compute, offer.memory, offer.storage],
  bestFor: [offer.kind === "vps" ? "长期在线服务" : "短时算力任务"],
  cautions: [offer.risk],
  dataStatus: "parsed_source",
  lastChecked: offer.lastChecked,
}));

export const cloudComparisonSummary = {
  updatedAt: cloudOfferData.updatedAt,
  selection: cloudOfferData.selection,
  vpsCount: cloudOffers.filter((offer) => offer.kind === "vps").length,
  gpuCount: cloudOffers.filter((offer) => offer.kind === "gpu").length,
};

export function getCloudOffersByKind(kind: CloudOfferKind) {
  return cloudOffers.filter((offer) => offer.kind === kind);
}

export function getCloudStatusLabel(status: CloudDataStatus) {
  if (status === "parsed_source") return "采集入库";
  if (status === "manual_reference") return "已录入参考价";
  if (status === "pending_collector") return "待接自动采集";
  return "待复核";
}
