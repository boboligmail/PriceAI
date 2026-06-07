import type { Metadata } from "next";
import { Gift, Globe2, HelpCircle, ReceiptText, RotateCcw, ShieldAlert, Wallet } from "lucide-react";
import { SeoGuidePage, type GuideReference } from "@/components/SeoGuidePage";

export const revalidate = 86400;

const pageUrl = "https://priceai.cc/guides/ai-subscription-gift-card";

export const metadata: Metadata = {
  title: "AI 订阅礼品卡：App Store、Google Play 礼品卡和余额有什么限制",
  description:
    "解释 App Store / Google Play 礼品卡、Apple Account balance、Google Play balance、地区绑定、余额、汇率、退款、续费失败和常见风险。",
  alternates: {
    canonical: "/guides/ai-subscription-gift-card",
  },
  openGraph: {
    title: "AI 订阅礼品卡：App Store、Google Play 礼品卡和余额有什么限制 | PriceAI",
    description: "理解礼品卡地区绑定、账户余额、订阅可用性、税费、汇率和退款边界，再决定是否用礼品卡订阅 AI 服务。",
    url: pageUrl,
  },
};

export default function AiSubscriptionGiftCardGuide() {
  return (
    <SeoGuidePage
      eyebrow="礼品卡专题"
      icon={<Gift size={15} />}
      title="AI 订阅礼品卡有什么限制？"
      intro="礼品卡看起来像是解决外币卡门槛的简单方法，但它不是万能支付工具。App Store 礼品卡、Google Play 礼品卡、账户余额、地区价、税费和订阅入口之间有很强的绑定关系，买错地区或买错类型都可能导致无法订阅。"
      quickAnswer="礼品卡的核心限制是地区绑定和使用范围。你要先确认礼品卡地区、账户地区、目标 App、订阅入口和余额是否能用于目标 AI 服务，再把汇率、溢价、税费、退款难度和续费稳定性算进总成本。"
      primaryCta={{ href: "/guides/apple-id-ai-subscription", label: "Apple ID 路径", variant: "primary" }}
      secondaryCta={{ href: "/guides/google-play-ai-subscription", label: "Google Play 路径", variant: "secondary" }}
      conclusionTitle="先说结论：礼品卡解决的是付款入口，不解决所有订阅风险。"
      conclusionText="礼品卡可能适合没有外币卡、只想走 App Store 或 Google Play 的用户，但它仍然受地区、余额、订阅类型、退款和平台规则限制。PriceAI 不推荐具体礼品卡商家，只解释礼品卡路径的成本和边界。"
      sections={sections}
      priceAiHelps={priceAiHelps}
      references={officialReferences}
      faqs={faqs}
      finalTitle="礼品卡路径不确定时，先回到价格锚点。"
      finalText="先用官方地区价判断理论价格，再把礼品卡溢价、余额损耗、税费和续费成本加进去，最后再决定自己订阅还是找渠道。"
      finalLinks={[
        { href: "/official-prices", label: "官方地区价", variant: "light" },
        { href: "/guides/visa-card-for-ai-subscription", label: "支付卡指南", variant: "light" },
        { href: "/guides/ai-subscription-region-price-risks", label: "地区价风险", variant: "secondary" },
        { href: "/?stock=available", label: "查看有货报价", variant: "primary" },
      ]}
      jsonLd={buildGuideJsonLd()}
    />
  );
}

const sections = [
  {
    title: "先分清礼品卡和账户余额",
    text: "很多人把礼品卡、余额、充值和地区价混在一起看。真正要判断的是：余额来自哪里、属于哪个地区、能不能用于目标订阅。",
    items: [
      {
        title: "Apple Gift Card / Apple 账户余额",
        text: "Apple 礼品卡兑换后通常进入 Apple Account balance。余额能买什么、能否用于订阅、地区限制和退款规则都要以 Apple 官方说明为准。",
        points: ["与 Apple 账户地区相关", "余额不等于现金", "订阅入口通常在 Apple 管理"],
        icon: <Gift size={17} />,
      },
      {
        title: "Google Play 礼品卡 / Play 余额",
        text: "Google Play 礼品卡兑换后形成 Play 余额。余额和国家/地区、付款资料、可用内容和订阅限制紧密相关。",
        points: ["国家/地区绑定", "可能受付款资料影响", "不能只看汇率"],
        icon: <Wallet size={17} />,
      },
      {
        title: "礼品卡溢价和损耗",
        text: "礼品卡市场价可能高于面值，也可能有汇率损耗、充值损耗、余额剩余和无法退款的问题。",
        points: ["面值不等于成本", "小额余额可能浪费", "失败处理更复杂"],
        icon: <ReceiptText size={17} />,
      },
    ],
  },
  {
    title: "购买礼品卡前按这个顺序判断",
    variant: "steps" as const,
    items: [
      {
        title: "确认目标订阅入口",
        text: "先确认你要买的 AI 套餐是官网账单、App Store 内购还是 Google Play 内购。礼品卡通常只适用于对应平台余额路径。",
      },
      {
        title: "确认账户地区和礼品卡地区一致",
        text: "礼品卡通常不能跨地区随意使用。账号地区、礼品卡地区和目标 App 可用地区要一起核验。",
      },
      {
        title: "确认余额能否用于订阅",
        text: "余额能买 App 或内容，不一定代表能用于所有订阅。某些订阅、国家/地区或付款场景可能仍需要其他付款方式。",
      },
      {
        title: "确认税费、汇率和溢价",
        text: "礼品卡路径要把面值、购买溢价、汇率、税费、手续费、余额剩余和失败成本一起算。",
      },
      {
        title: "确认续费和退款路径",
        text: "礼品卡余额耗尽后，续费可能失败。退款也可能回到余额或受平台规则限制，不一定像银行卡退款那样处理。",
      },
    ],
  },
  {
    title: "常见风险",
    variant: "checklist" as const,
    items: [
      {
        title: "买错地区",
        text: "礼品卡地区和账户地区不匹配，可能直接无法兑换或无法用于目标订阅。",
        icon: <Globe2 size={17} />,
      },
      {
        title: "余额不能覆盖税费",
        text: "订阅价格可能加上税费或汇率差，余额刚好等于页面标价时也可能扣款失败。",
        icon: <ReceiptText size={17} />,
      },
      {
        title: "续费失败",
        text: "首月用余额成功后，如果下个周期余额不足或平台规则变化，续费可能失败。",
        icon: <RotateCcw size={17} />,
      },
      {
        title: "退款路径复杂",
        text: "礼品卡余额、平台余额和第三方购买渠道之间的退款路径可能很绕，追回成本高。",
        icon: <HelpCircle size={17} />,
      },
      {
        title: "礼品卡来源风险",
        text: "如果从第三方购买礼品卡，要额外判断卡源、售后、冻结、黑卡、盗刷和平台投诉路径。",
        icon: <ShieldAlert size={17} />,
      },
      {
        title: "不适合所有 AI 产品",
        text: "有些 AI 产品或套餐没有开放 App Store / Google Play 内购，礼品卡自然也解决不了官网账单问题。",
        icon: <ShieldAlert size={17} />,
      },
    ],
  },
];

const priceAiHelps = [
  "把礼品卡路径放进官方自助订阅体系里，和官网账单、App Store、Google Play 分开理解。",
  "用官方地区价页面先看价格锚点，再计算礼品卡溢价、税费和余额损耗。",
  "提醒你核验礼品卡地区、账户地区、余额可用性和订阅入口。",
  "如果礼品卡路径过于麻烦，可以回到卡网渠道页比较当前有货报价和来源。",
];

const officialReferences: GuideReference[] = [
  {
    title: "Apple：兑换 Apple Gift Card",
    text: "了解 Apple 礼品卡如何兑换到 Apple 账户余额。",
    href: "https://support.apple.com/en-us/118242",
  },
  {
    title: "Apple：Apple 账户余额可以买什么",
    text: "了解 Apple Account balance 的使用范围和限制。",
    href: "https://support.apple.com/en-us/118243",
  },
  {
    title: "Google Play：兑换礼品卡或代码",
    text: "了解 Google Play 礼品卡和兑换码的基本使用方式。",
    href: "https://support.google.com/googleplay/answer/3422659?hl=en",
  },
  {
    title: "Google Play：查看余额",
    text: "了解 Google Play 余额的查看和基本管理方式。",
    href: "https://support.google.com/googleplay/answer/3423011?hl=en",
  },
];

const faqs: Array<[string, string]> = [
  [
    "礼品卡能不能订阅 ChatGPT、Gemini 或 Claude？",
    "要看目标产品是否支持 App Store 或 Google Play 内购，以及该地区、账户和余额是否允许用于订阅。礼品卡不能解决所有官网账单问题。",
  ],
  [
    "礼品卡地区和账号地区必须一致吗？",
    "通常需要高度匹配。Apple 和 Google 都有地区、账户和余额相关规则。买礼品卡前应先看官方帮助中心和购买页面提示。",
  ],
  [
    "礼品卡是不是比银行卡更安全？",
    "不一定。礼品卡可以减少直接暴露银行卡，但会引入卡源、地区、余额、退款、冻结和续费失败等新风险。",
  ],
  [
    "为什么礼品卡面值够了还扣款失败？",
    "可能是税费、余额不足、地区不匹配、订阅类型不支持余额、账户风控或目标 App 不支持该入口。",
  ],
  [
    "PriceAI 会推荐礼品卡卖家吗？",
    "不会。PriceAI 只解释礼品卡路径和风险，不销售礼品卡，也不对具体礼品卡卖家背书。",
  ],
];

function buildGuideJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "AI 订阅礼品卡：App Store、Google Play 礼品卡和余额有什么限制？",
      inLanguage: "zh-CN",
      url: pageUrl,
      description: "解释 App Store / Google Play 礼品卡、账户余额、地区绑定、汇率、退款、续费失败和常见风险。",
      author: { "@type": "Organization", name: "PriceAI" },
      publisher: { "@type": "Organization", name: "PriceAI" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "PriceAI", item: "https://priceai.cc" },
        { "@type": "ListItem", position: 2, name: "AI 订阅礼品卡", item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ];
}
