import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { CloudOfferExplorer } from "@/components/cloud/CloudOfferExplorer";
import { cloudComparisonSummary, cloudOffers, type CloudOffer } from "@/lib/cloud-comparison";

const siteUrl = "https://www.aideals.cloud";

export function CloudComparisonView({
  canonicalPath = "/cloud",
  activeSection = "cloud",
}: {
  canonicalPath?: "/" | "/cloud";
  activeSection?: "home" | "cloud";
}) {
  return (
    <div className="min-h-screen bg-[var(--color-page)] text-[var(--color-text-body)]">
      <JsonLd data={buildCloudJsonLd(cloudOffers, canonicalPath)} />
      <div className="sticky top-0 z-40 bg-[var(--color-page-translucent)] shadow-[var(--shadow-control)] backdrop-blur-xl">
        <SiteHeader activeSection={activeSection} />
      </div>

      <CloudOfferExplorer offers={cloudOffers} updatedAt={cloudComparisonSummary.updatedAt} />
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
