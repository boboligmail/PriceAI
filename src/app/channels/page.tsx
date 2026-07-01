import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { PriceExplorer } from "@/components/PriceExplorer";
import { SubmissionFloater } from "@/components/SubmissionFloater";
import { getExplorerData, listPublicMerchants, listPublicOffers } from "@/lib/data";
import { PUBLIC_MERCHANT_PAGE_SIZE } from "@/lib/public-merchant-policy";
import { PUBLIC_OFFER_DEFAULT_LIMIT } from "@/lib/public-offer-query";
import { getSponsorSettingsSummary } from "@/lib/sponsor-settings";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "卡网订阅比价",
  description:
    "查看 ChatGPT、Claude、Gemini、Grok、邮箱、接码等卡网订阅渠道报价，比较有货最低价、来源、库存和更新时间。",
  alternates: {
    canonical: "/channels",
  },
  openGraph: {
    title: "ai-home 卡网订阅比价",
    description: "购买 AI 订阅前，先比较卡网订阅渠道的价格、库存、来源和更新时间。",
    url: "https://www.aideals.cloud/channels",
    siteName: "ai-home",
  },
};

export default async function ChannelsPage() {
  const [data, initialOffers, initialMerchants, sponsorSettings] = await Promise.all([
    getExplorerData(),
    listPublicOffers({ limit: PUBLIC_OFFER_DEFAULT_LIMIT, offset: 0 }),
    listPublicMerchants({ limit: PUBLIC_MERCHANT_PAGE_SIZE, offset: 0 }),
    getSponsorSettingsSummary().catch(() => null),
  ]);

  return (
    <>
      <JsonLd data={buildChannelsJsonLd()} />
      <PriceExplorer
        data={data}
        initialOffers={initialOffers}
        initialMerchants={initialMerchants}
        sponsorSettings={sponsorSettings}
        restoreStateFromUrl
      />
      <SubmissionFloater />
    </>
  );
}

function buildChannelsJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "ai-home 卡网订阅比价",
      alternateName: ["AI 订阅卡网比价", "AI 比价雷达卡网订阅"],
      url: "https://www.aideals.cloud/channels",
      inLanguage: "zh-CN",
      description:
        "ai-home 卡网订阅比价整理 AI 订阅、账号、卡密、邮箱和接码等渠道报价，展示有货最低价、来源、库存和更新时间。",
      mainEntity: {
        "@type": "Dataset",
        name: "ai-home channel subscription offers",
        description:
          "A curated dataset of AI subscription channel offers, source titles, stock states, prices, and collection timestamps.",
        url: "https://www.aideals.cloud/channels",
        license: "https://github.com/YOUR_GITHUB_USER/ai-home/blob/main/LICENSE",
        creator: {
          "@type": "Organization",
          name: "ai-home",
          url: "https://www.aideals.cloud",
          sameAs: "https://github.com/YOUR_GITHUB_USER/ai-home",
        },
        variableMeasured: ["product", "source", "price", "stock", "updated time", "purchase link"],
        measurementTechnique: "Public channel pages and reviewed source submissions",
        keywords: ["AI subscription", "ChatGPT Plus", "Claude Pro", "Gemini Pro", "AI card shop"],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "ai-home 是卖 AI 订阅的吗？",
          acceptedAnswer: {
            "@type": "Answer",
            text: "不是。ai-home 不卖货、不收款、不参与交易，只整理公开或审核通过的价格和来源信息。",
          },
        },
        {
          "@type": "Question",
          name: "ai-home 的最低价怎么计算？",
          acceptedAnswer: {
            "@type": "Answer",
            text: "外层最低价优先使用当前有货报价的最低价。缺货、下架或隐藏的报价不应作为可购买最低价展示。",
          },
        },
      ],
    },
  ];
}
