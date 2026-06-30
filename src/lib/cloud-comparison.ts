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
  priceHighlights: readonly string[];
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
    priceDisplay: "CX23：EUR 6.53/月 或 EUR 0.0105/小时起",
    priceBasis: "2026-06-15 起新订单/升降配执行新价；示例为德国/芬兰 CX23，不含 VAT 和 IPv4。",
    priceHighlights: [
      "入门参考：CX23，2 vCPU / 4 GB RAM / 40 GB SSD",
      "德国/芬兰：EUR 0.0105/小时，EUR 6.53/月",
      "美国和新加坡价格、流量包不同，必须按地区重算",
    ],
    billing: "小时计费，月封顶",
    regions: ["Germany", "Finland", "USA", "Singapore"],
    specs: ["Shared vCPU", "NVMe SSD", "IPv4/IPv6", "Snapshot / Volume"],
    bestFor: ["低成本网站", "Docker 小服务", "欧洲节点", "长期运行实例"],
    cautions: ["2026 年有价格调整，必须以官方价格页为准。", "部分地区库存和网络表现差异较大。"],
    dataStatus: "manual_reference",
    lastChecked: "2026-06-30",
  },
  {
    id: "vultr-cloud-compute",
    kind: "vps",
    provider: "Vultr",
    product: "Cloud Compute",
    homepageUrl: "https://www.vultr.com/products/cloud-compute/",
    pricingUrl: "https://www.vultr.com/pricing/",
    priceDisplay: "Regular Performance：$2.50/月起",
    priceBasis: "Regular Performance 官方产品页给出 $2.50/月起；云主机按小时使用，月度费用有上限口径。",
    priceHighlights: [
      "入门参考：Regular Performance 共享 CPU",
      "月价起点：$2.50/月，具体小时价看配置表",
      "生产部署要核 IP、快照、备份、带宽超额费用",
    ],
    billing: "小时计费 / 月封顶",
    regions: ["North America", "Europe", "Asia", "Australia"],
    specs: ["Shared CPU", "High Frequency", "IPv4", "Block / Object Storage"],
    bestFor: ["全球节点", "轻量应用", "开发测试", "需要多地区部署"],
    cautions: ["低价档通常资源较小，注意流量、快照和备份费用。", "不同地区价格和可用规格可能不同。"],
    dataStatus: "manual_reference",
    lastChecked: "2026-06-30",
  },
  {
    id: "digitalocean-droplets",
    kind: "vps",
    provider: "DigitalOcean",
    product: "Droplets",
    homepageUrl: "https://www.digitalocean.com/products/droplets",
    pricingUrl: "https://www.digitalocean.com/pricing/droplets",
    priceDisplay: "Basic Droplet：$4/月起",
    priceBasis: "官方 Droplets 价格页显示最低 $4/月；价格随 RAM、CPU、SSD、带宽配置变化。",
    priceHighlights: [
      "入门参考：Basic Droplet，$4/月起",
      "最低档包含 500 GiB/月出站流量，入站流量免费",
      "托管数据库、备份、负载均衡、额外流量另计费",
    ],
    billing: "按使用量计费，月价封顶",
    regions: ["North America", "Europe", "Asia"],
    specs: ["Basic / Premium CPU", "SSD", "Managed add-ons", "Marketplace images"],
    bestFor: ["开发者项目", "教程型部署", "中小网站", "标准化云服务器"],
    cautions: ["托管数据库、负载均衡、备份等会单独计费。", "同等硬件成本不一定最低。"],
    dataStatus: "manual_reference",
    lastChecked: "2026-06-30",
  },
  {
    id: "contabo-vps",
    kind: "vps",
    provider: "Contabo",
    product: "VPS plans",
    homepageUrl: "https://contabo.com/en/vps/",
    pricingUrl: "https://contabo.com/en/vps/",
    priceDisplay: "Cloud VPS 10：EUR 5.50/月起",
    priceBasis: "官方 pricing 页展示 Cloud VPS 10 为 EUR 5.50/月；地区、期限和附加项可能改变总价。",
    priceHighlights: [
      "入门参考：Cloud VPS 10，EUR 5.50/月",
      "套餐月付，卖点是较大的内存、存储和流量包",
      "下单前要核 setup fee、地区费用、退款和续费规则",
    ],
    billing: "月付套餐",
    regions: ["Europe", "USA", "Asia"],
    specs: ["vCPU", "Large RAM", "SSD / NVMe", "Traffic allowance"],
    bestFor: ["大内存低成本", "测试环境", "轻量数据库", "预算敏感用户"],
    cautions: ["注意开通费、地区费用和退款规则。", "高峰期性能需要长期样本验证。"],
    dataStatus: "manual_reference",
    lastChecked: "2026-06-30",
  },
  {
    id: "runpod-gpu-cloud",
    kind: "gpu",
    provider: "RunPod",
    product: "GPU Cloud",
    homepageUrl: "https://www.runpod.io/",
    pricingUrl: "https://www.runpod.io/pricing",
    priceDisplay: "RTX 4090：$0.69/小时起",
    priceBasis: "官方 RTX 4090 型号页给出 $0.69/hr 起；Pods、Serverless、Clusters 的计费口径不同。",
    priceHighlights: [
      "入门参考：RTX 4090 24GB，$0.69/hr 起",
      "GPU、CPU/RAM、存储卷、网络和镜像会影响总成本",
      "Community Cloud 与 Secure Cloud 的价格和稳定性要分开看",
    ],
    billing: "按秒 / 按小时",
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
    priceDisplay: "RTX 3090：$0.13/hr；RTX 4090：$0.35/hr 起",
    priceBasis: "官方 GPU Cloud 页展示实时平台参考价；实际 offer 随主机、可靠性、带宽、磁盘和地区变化。",
    priceHighlights: [
      "参考价：RTX 3090 $0.13/hr，RTX 4090 $0.35/hr 起",
      "H100 可低至 $0.90/hr 级别，但要看具体 offer",
      "必须同时看 reliability、带宽、磁盘、静态 IP 和中断风险",
    ],
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
    priceDisplay: "Quadro RTX 6000：$0.69/GPU/hr 起",
    priceBasis: "官方 Instances pricing 按 PRICE/GPU/HR 展示；税费另计，热门实例按先到先得可用。",
    priceHighlights: [
      "1x 入门参考：Quadro RTX 6000 24GB，$0.69/GPU/hr",
      "常见参考：A10 24GB $1.29，A100 40GB $1.99，H100 PCIe $3.29/GPU/hr",
      "B200/H100 集群价格另按 GPU 数和期限报价",
    ],
    billing: "按 GPU 小时计费",
    regions: ["USA", "Cloud regions vary"],
    specs: ["NVIDIA GPUs", "Persistent storage", "SSH / Jupyter", "ML images"],
    bestFor: ["机器学习训练", "稳定 GPU 云", "团队开发环境", "需要官方支持"],
    cautions: ["热门 GPU 可能缺货。", "与 marketplace 型平台相比，最低价不一定最低。"],
    dataStatus: "manual_reference",
    lastChecked: "2026-06-30",
  },
  {
    id: "tensordock-gpu",
    kind: "gpu",
    provider: "TensorDock",
    product: "GPU Cloud",
    homepageUrl: "https://tensordock.com/",
    pricingUrl: "https://marketplace.tensordock.com/",
    priceDisplay: "RTX 4090：$0.35/hr 起",
    priceBasis: "官方 GPU Cloud 页面展示 RTX 4090 $0.35/hr 起；CPU/RAM/存储配置和 marketplace 可用性会改变最终价格。",
    priceHighlights: [
      "官方 GPU Cloud：RTX 4090 $0.35/hr 起",
      "4090 专页示例：按 CPU/RAM 分配可从 $0.37/hr 部署",
      "spot、on-demand、地区和主机库存会影响可用性",
    ],
    billing: "hourly marketplace",
    regions: ["Marketplace hosts"],
    specs: ["Consumer GPUs", "Data center GPUs", "Custom CPU/RAM", "Storage"],
    bestFor: ["按规格找低价 GPU", "短期训练", "推理测试", "多地区选择"],
    cautions: ["不同主机质量差异较大。", "需要记录可用性、取消规则和磁盘费用。"],
    dataStatus: "manual_reference",
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
  if (status === "manual_reference") return "已录入参考价";
  if (status === "pending_collector") return "待接自动采集";
  return "待复核";
}
