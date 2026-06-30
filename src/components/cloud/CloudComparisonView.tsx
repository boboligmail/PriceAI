import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
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
        <CloudOfferSection
          id="vps"
          title="VPS / 云服务器"
          description="直接按商家、价格、CPU、内存、硬盘和流量对比。这里是入门参考规格，下单前点右侧链接核验官方价格。"
          offers={vpsOffers}
        />
        <CloudOfferSection
          id="gpu"
          title="GPU 租赁平台"
          description="直接展示 GPU 型号、显存、存储和附加费用口径。Marketplace 平台的 CPU、内存、带宽会随主机变化。"
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
