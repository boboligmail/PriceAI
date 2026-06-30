import type { CloudOffer } from "@/lib/cloud-comparison";

export type CloudChoiceCard = {
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly href: "#vps" | "#gpu";
  readonly cta: string;
};

export type CloudFilterGroup = {
  readonly title: string;
  readonly chips: readonly string[];
};

export type CloudOfferDecision = {
  readonly summary: string;
  readonly fit: string;
  readonly risk: string;
};

export const cloudChoiceCards: readonly CloudChoiceCard[] = [
  {
    title: "我要长期在线",
    subtitle: "选 VPS（虚拟专用服务器）",
    description: "适合网站、API、数据库、代理节点和 Docker 小服务。重点看月成本、地区、带宽和 IPv4 费用。",
    href: "#vps",
    cta: "看 VPS",
  },
  {
    title: "我要短期算力",
    subtitle: "选 GPU（图形处理器）",
    description: "适合 AI 绘图、模型微调、推理和批量实验。重点看每小时价格、显存、库存和中断风险。",
    href: "#gpu",
    cta: "看 GPU",
  },
];

export const cloudFilterGroups: readonly CloudFilterGroup[] = [
  { title: "用途", chips: ["部署网站", "跑数据库", "训练模型", "短时推理"] },
  { title: "预算", chips: ["月付低价", "按小时", "大显存优先", "新手省心"] },
  { title: "风险", chips: ["账号审核", "库存波动", "性能波动", "附加费用"] },
];

const cloudOfferDecisions: Record<string, CloudOfferDecision> = {
  "hetzner-cloud-shared": {
    summary: "长期 VPS 的低成本候选，适合稳定跑小服务。",
    fit: "预算敏感、长期在线、主要服务欧洲用户的人。",
    risk: "账号审核、地区库存和 IPv4 附加费用要提前确认。",
  },
  "vultr-cloud-compute": {
    summary: "多地区快速开机，适合需要全球节点的轻量应用。",
    fit: "需要北美、欧洲、亚洲多地部署，且想快速开机的人。",
    risk: "低价档资源小，快照、备份、流量和高配机器会让总价上升。",
  },
  "digitalocean-droplets": {
    summary: "新手友好的标准云主机，文档和产品体验清楚。",
    fit: "第一次部署网站、API、教程项目或标准化云服务的人。",
    risk: "同等硬件不一定最低价，托管数据库、备份和负载均衡会单独计费。",
  },
  "contabo-vps": {
    summary: "月付规格大，适合低预算拿大内存和大存储。",
    fit: "预算敏感、能接受自己做稳定性观察的人。",
    risk: "开通费、地区费、退款规则和高峰期性能波动要留余量。",
  },
  "runpod-gpu-cloud": {
    summary: "按小时跑 GPU 任务，适合短时训练和推理。",
    fit: "做 AI 绘图、LoRA 微调、短时推理或需要模板镜像的人。",
    risk: "Community Cloud 和 Secure Cloud 的稳定性、价格、存储和关机规则不同。",
  },
  "vastai-marketplace": {
    summary: "低价 GPU 市场，适合愿意筛选机器的人。",
    fit: "追求低 GPU 小时价、能接受主机差异和手动筛选的人。",
    risk: "机器质量、带宽、磁盘、可靠性和数据安全差异很大。",
  },
  "lambda-cloud-gpu": {
    summary: "更偏稳定团队训练，价格不一定最低。",
    fit: "机器学习训练、团队开发、需要官方支持和稳定环境的人。",
    risk: "热门 GPU 可能缺货，小任务或极低价需求不一定划算。",
  },
  "tensordock-gpu": {
    summary: "按规格找 GPU，价格有竞争力。",
    fit: "需要按 CPU、RAM、GPU 和地区组合筛选短期算力的人。",
    risk: "不同供应节点体验不一，取消规则、磁盘费用和可用性要核验。",
  },
};

export function getCloudOfferDecision(offer: CloudOffer): CloudOfferDecision {
  return (
    cloudOfferDecisions[offer.id] ?? {
      summary: offer.bestFor[0] ?? "适合作为候选平台进一步核验。",
      fit: offer.bestFor.join(" / "),
      risk: offer.cautions[0] ?? "价格、库存和附加费用需要回到官网核验。",
    }
  );
}
