import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { CloudChoicePanel } from "@/components/cloud/CloudChoicePanel";
import { CloudOfferSection } from "@/components/cloud/CloudOfferSections";
import { cloudComparisonSummary, getCloudOffersByKind, type CloudOffer } from "@/lib/cloud-comparison";

const siteUrl = "https://ai-home.example.com";

export function CloudComparisonView({
  canonicalPath = "/cloud",
  activeSection = "cloud",
}: {
  canonicalPath?: "/" | "/cloud";
  activeSection?: "home" | "cloud";
}) {
  const vpsOffers = getCloudOffersByKind("vps");
  const gpuOffers = getCloudOffersByKind("gpu");

  return (
    <div className="min-h-screen bg-[var(--color-page)] text-[var(--color-text-body)]">
      <JsonLd data={buildCloudJsonLd([...vpsOffers, ...gpuOffers], canonicalPath)} />
      <div className="sticky top-0 z-40 bg-[var(--color-page-translucent)] shadow-[var(--shadow-control)] backdrop-blur-xl">
        <SiteHeader activeSection={activeSection} />
      </div>

      <main>
        <CloudChoicePanel />
        <CloudOfferSection
          id="vps"
          title="VPS / 云服务器"
          description="适合网站、数据库、小服务、代理节点、Docker 应用和长期在线任务。先看月成本，再看地区、流量、备份和 IPv4。"
          offers={vpsOffers}
        />
        <CloudOfferSection
          id="gpu"
          title="GPU 租赁平台"
          description="适合 AI 绘图、模型训练、LoRA 微调、推理服务和短期算力任务。先看每小时价格，再看显存、库存、存储和中断风险。"
          offers={gpuOffers}
        />
      </main>
    </div>
  );
}

function buildCloudJsonLd(offers: CloudOffer[], canonicalPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "VPS 云服务器与 GPU 租赁平台选择工具",
    url: `${siteUrl}${canonicalPath === "/" ? "" : canonicalPath}`,
    inLanguage: "zh-CN",
    dateModified: cloudComparisonSummary.updatedAt,
    description: "整理 VPS 云服务器与 GPU 租赁平台的用途、参考价格、最大风险和官网核验入口。",
    mainEntity: offers.map((offer) => ({
      "@type": "Service",
      name: `${offer.provider} ${offer.product}`,
      serviceType: offer.kind === "vps" ? "Cloud VPS" : "GPU Cloud",
      url: offer.homepageUrl,
    })),
  };
}
