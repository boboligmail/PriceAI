export type CloudOfferKind = "vps" | "gpu";

export type CloudDataStatus = "manual_reference" | "pending_collector" | "needs_review";

export type CloudOffer = {
  id: string;
  kind: CloudOfferKind;
  provider: string;
  product: string;
  pricingUrl: string;
  homepageUrl: string;
  priceDisplay: string;
  priceBasis: string;
  billing: string;
  regions: string[];
  specs: string[];
  bestFor: string[];
  cautions: string[];
  dataStatus: CloudDataStatus;
  lastChecked: string;
};

export const cloudOffers: CloudOffer[] = [
  {
    id: "hetzner-cloud-shared",
    kind: "vps",
    provider: "Hetzner",
    product: "Cloud shared vCPU",
    homepageUrl: "https://www.hetzner.com/cloud",
    pricingUrl: "https://www.hetzner.com/cloud",
    priceDisplay: "待采集官方价格",
    priceBasis: "按小时计费，设月度封顶；不同地区和机型价格不同。",
    billing: "hourly with monthly cap",
    regions: ["Germany", "Finland", "USA", "Singapore"],
    specs: ["Shared vCPU", "NVMe SSD", "IPv4/IPv6", "Snapshot / Volume"],
    bestFor: ["低成本网站", "Docker 小服务", "欧洲节点", "长期运行实例"],
    cautions: ["2026 年有价格调整，必须以官方价格页为准。", "部分地区库存和网络表现差异较大。"],
    dataStatus: "pending_collector",
    lastChecked: "2026-06-30",
  },
  {
    id: "vultr-cloud-compute",
    kind: "vps",
    provider: "Vultr",
    product: "Cloud Compute",
    homepageUrl: "https://www.vultr.com/products/cloud-compute/",
    pricingUrl: "https://www.vultr.com/pricing/",
    priceDisplay: "待采集官方价格",
    priceBasis: "公开价格页展示不同 CPU / RAM / 存储规格的月付和小时价。",
    billing: "hourly / monthly",
    regions: ["North America", "Europe", "Asia", "Australia"],
    specs: ["Shared CPU", "High Frequency", "IPv4", "Block / Object Storage"],
    bestFor: ["全球节点", "轻量应用", "开发测试", "需要多地区部署"],
    cautions: ["低价档通常资源较小，注意流量、快照和备份费用。", "不同地区价格和可用规格可能不同。"],
    dataStatus: "pending_collector",
    lastChecked: "2026-06-30",
  },
  {
    id: "digitalocean-droplets",
    kind: "vps",
    provider: "DigitalOcean",
    product: "Droplets",
    homepageUrl: "https://www.digitalocean.com/products/droplets",
    pricingUrl: "https://www.digitalocean.com/pricing/droplets",
    priceDisplay: "待采集官方价格",
    priceBasis: "按 Droplet 规格展示月付和小时价，适合做标准化对比。",
    billing: "hourly / monthly",
    regions: ["North America", "Europe", "Asia"],
    specs: ["Basic / Premium CPU", "SSD", "Managed add-ons", "Marketplace images"],
    bestFor: ["开发者项目", "教程型部署", "中小网站", "标准化云服务器"],
    cautions: ["托管数据库、负载均衡、备份等会单独计费。", "同等硬件成本不一定最低。"],
    dataStatus: "pending_collector",
    lastChecked: "2026-06-30",
  },
  {
    id: "contabo-vps",
    kind: "vps",
    provider: "Contabo",
    product: "VPS plans",
    homepageUrl: "https://contabo.com/en/vps/",
    pricingUrl: "https://contabo.com/en/vps/",
    priceDisplay: "待采集官方价格",
    priceBasis: "套餐式月付，通常给出较大的内存和存储。",
    billing: "monthly",
    regions: ["Europe", "USA", "Asia"],
    specs: ["vCPU", "Large RAM", "SSD / NVMe", "Traffic allowance"],
    bestFor: ["大内存低成本", "测试环境", "轻量数据库", "预算敏感用户"],
    cautions: ["注意开通费、地区费用和退款规则。", "高峰期性能需要长期样本验证。"],
    dataStatus: "pending_collector",
    lastChecked: "2026-06-30",
  },
  {
    id: "runpod-gpu-cloud",
    kind: "gpu",
    provider: "RunPod",
    product: "GPU Cloud",
    homepageUrl: "https://www.runpod.io/",
    pricingUrl: "https://www.runpod.io/pricing",
    priceDisplay: "官方页展示 GPU 小时价",
    priceBasis: "按 GPU 型号、显存、CPU/RAM 和云类型计费；适合采集为 $/hour。",
    billing: "per-second / hourly",
    regions: ["Global GPU cloud"],
    specs: ["RTX 4090 / 5090", "L4", "A5000", "A100 / H100 class"],
    bestFor: ["AI 绘图", "模型微调", "短时推理", "需要模板镜像的 GPU 任务"],
    cautions: ["社区云和安全云价格、稳定性不同。", "关机、卷存储、镜像和网络费用要单独核对。"],
    dataStatus: "manual_reference",
    lastChecked: "2026-06-30",
  },
  {
    id: "vastai-marketplace",
    kind: "gpu",
    provider: "Vast.ai",
    product: "GPU marketplace",
    homepageUrl: "https://vast.ai/",
    pricingUrl: "https://vast.ai/pricing",
    priceDisplay: "实时市场价，波动大",
    priceBasis: "按 GPU 型号、主机信誉、带宽、磁盘、地区和中断风险实时变化。",
    billing: "hourly marketplace",
    regions: ["Marketplace hosts"],
    specs: ["RTX 3090 / 4090 / 5090", "A100", "H100 / H200", "B200 class"],
    bestFor: ["追求低 GPU 小时价", "批量筛选显卡", "可接受主机差异的任务", "短期实验"],
    cautions: ["市场价变化快，必须接 API 或实时页面。", "主机可靠性、带宽、磁盘和数据安全要单独判断。"],
    dataStatus: "manual_reference",
    lastChecked: "2026-06-30",
  },
  {
    id: "lambda-cloud-gpu",
    kind: "gpu",
    provider: "Lambda",
    product: "GPU Cloud",
    homepageUrl: "https://lambda.ai/service/gpu-cloud",
    pricingUrl: "https://lambda.ai/service/gpu-cloud/pricing",
    priceDisplay: "待采集官方价格",
    priceBasis: "按 GPU 实例类型小时计费，偏向开发者和 ML 工作流。",
    billing: "hourly",
    regions: ["USA", "Cloud regions vary"],
    specs: ["NVIDIA GPUs", "Persistent storage", "SSH / Jupyter", "ML images"],
    bestFor: ["机器学习训练", "稳定 GPU 云", "团队开发环境", "需要官方支持"],
    cautions: ["热门 GPU 可能缺货。", "与 marketplace 型平台相比，最低价不一定最低。"],
    dataStatus: "pending_collector",
    lastChecked: "2026-06-30",
  },
  {
    id: "tensordock-gpu",
    kind: "gpu",
    provider: "TensorDock",
    product: "GPU Cloud",
    homepageUrl: "https://tensordock.com/",
    pricingUrl: "https://marketplace.tensordock.com/",
    priceDisplay: "市场价，待采集",
    priceBasis: "按 marketplace 机器、GPU 型号、CPU、内存、磁盘和地区计费。",
    billing: "hourly marketplace",
    regions: ["Marketplace hosts"],
    specs: ["Consumer GPUs", "Data center GPUs", "Custom CPU/RAM", "Storage"],
    bestFor: ["按规格找低价 GPU", "短期训练", "推理测试", "多地区选择"],
    cautions: ["不同主机质量差异较大。", "需要记录可用性、取消规则和磁盘费用。"],
    dataStatus: "needs_review",
    lastChecked: "2026-06-30",
  },
];

export const cloudComparisonSummary = {
  updatedAt: "2026-06-30",
  vpsCount: cloudOffers.filter((offer) => offer.kind === "vps").length,
  gpuCount: cloudOffers.filter((offer) => offer.kind === "gpu").length,
};

export function getCloudOffersByKind(kind: CloudOfferKind) {
  return cloudOffers.filter((offer) => offer.kind === kind);
}

export function getCloudStatusLabel(status: CloudDataStatus) {
  if (status === "manual_reference") return "人工参考";
  if (status === "pending_collector") return "待接采集";
  return "待复核";
}
