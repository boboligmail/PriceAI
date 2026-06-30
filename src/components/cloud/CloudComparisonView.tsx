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
          title="VPS / 云服务器最低价榜"
          description="从公开比价数据里抽取当前最低月价 15 条，直接看商家、价格、CPU、内存、硬盘、流量和对应跳转链接。"
          offers={vpsOffers}
        />
        <CloudOfferSection
          id="gpu"
          title="GPU 租赁最低小时价榜"
          description="从公开 GPU 价格数据里抽取当前最低小时价 15 条。Spot、Reserved、地区和库存会强烈影响最终可用价格。"
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
    description: cloudComparisonSummary.selection,
    mainEntity: offers.map((offer) => ({
      "@type": "Service",
      name: `${offer.provider} ${offer.product}`,
      serviceType: offer.kind === "vps" ? "Cloud VPS" : "GPU Cloud",
      url: offer.homepageUrl,
    })),
  };
}
