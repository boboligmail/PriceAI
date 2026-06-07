import type { Metadata } from "next";
import { CreditCard, HelpCircle, Landmark, ReceiptText, RotateCcw, ShieldAlert, Wallet } from "lucide-react";
import { SeoGuidePage, type GuideReference } from "@/components/SeoGuidePage";

export const revalidate = 86400;

const pageUrl = "https://priceai.cc/guides/visa-card-for-ai-subscription";

export const metadata: Metadata = {
  title: "订阅 AI 需要什么支付卡：Visa、Mastercard、虚拟卡和预付卡怎么理解",
  description:
    "解释 AI 订阅常见支付卡类型，包括 Visa、Mastercard、外币信用卡、借记卡、虚拟卡、预付卡、0 刀卡 / 1 刀卡，以及风控、税费和退款风险。",
  alternates: {
    canonical: "/guides/visa-card-for-ai-subscription",
  },
  openGraph: {
    title: "订阅 AI 需要什么支付卡：Visa、Mastercard、虚拟卡和预付卡怎么理解 | PriceAI",
    description: "理解外币卡、借记卡、虚拟卡、预付卡、低额卡和账单验证，再决定是否自己走官方订阅路径。",
    url: pageUrl,
  },
};

export default function VisaCardForAiSubscriptionGuide() {
  return (
    <SeoGuidePage
      eyebrow="支付卡专题"
      icon={<CreditCard size={15} />}
      title="订阅 AI 需要什么支付卡？"
      intro="很多 AI 订阅失败并不是产品不能买，而是付款卡、账单地区、币种、风控验证、余额和退款路径没有对齐。Visa / Mastercard、外币信用卡、借记卡、虚拟卡、预付卡、0 刀卡 / 1 刀卡这些词，看起来都像“能付款”，但风险和适用场景完全不同。"
      quickAnswer="最稳定的官方订阅路径通常是可正常进行跨境线上支付的信用卡或借记卡，并且账单资料与产品、App Store 或 Google Play 的要求一致。虚拟卡和预付卡可能可用，但更容易遇到验证失败、续费失败或退款麻烦。"
      primaryCta={{ href: "/guides/how-to-subscribe-ai-officially", label: "官方自助订阅总览", variant: "primary" }}
      secondaryCta={{ href: "/guides/ai-subscription-gift-card", label: "礼品卡路径", variant: "secondary" }}
      conclusionTitle="先说结论：卡能扣款，不等于适合长期订阅。"
      conclusionText="AI 订阅是一个持续扣费场景。你要看的不只是首月能不能付成功，还包括账单地址、币种、续费、退款、风控验证、卡片有效期和银行拒付规则。PriceAI 不推荐具体卡商，只解释不同卡类型的边界。"
      sections={sections}
      priceAiHelps={priceAiHelps}
      references={officialReferences}
      faqs={faqs}
      finalTitle="支付路径想清楚后，再比较订阅成本。"
      finalText="如果你已经有稳定外币支付能力，可以优先看官方路径；如果支付门槛太高，再回到 PriceAI 比较代订、成品号或其他渠道的当前报价。"
      finalLinks={[
        { href: "/guides/google-play-ai-subscription", label: "Google Play 路径", variant: "light" },
        { href: "/guides/apple-id-ai-subscription", label: "Apple ID 路径", variant: "light" },
        { href: "/official-prices", label: "官方地区价", variant: "secondary" },
        { href: "/?stock=available", label: "查看有货报价", variant: "primary" },
      ]}
      jsonLd={buildGuideJsonLd()}
    />
  );
}

const sections = [
  {
    title: "先区分几类支付卡",
    text: "不同卡片在“首付成功率、续费稳定性、退款、风控、成本”上差异很大，不适合只用能不能扣款来判断。",
    items: [
      {
        title: "信用卡",
        text: "信用卡通常更适合持续订阅和跨境线上支付，遇到退款、预授权或账单争议时也更容易走标准流程。",
        points: ["适合长期订阅", "看银行跨境策略", "账单地址要一致"],
        icon: <CreditCard size={17} />,
      },
      {
        title: "借记卡",
        text: "借记卡可能支持线上外币支付，但更依赖银行和地区规则。余额、风控、跨境开关和退款到账时间都要单独确认。",
        points: ["余额要充足", "跨境开关要可用", "退款体验不一定稳定"],
        icon: <Landmark size={17} />,
      },
      {
        title: "虚拟卡 / 预付卡",
        text: "虚拟卡和预付卡适合一次性、小额或测试场景，但持续订阅可能遇到验证、续费、退款、关卡或卡 BIN 风控问题。",
        points: ["适合短期测试", "续费风险更高", "不要只看首月成功"],
        icon: <Wallet size={17} />,
      },
    ],
  },
  {
    title: "订阅前按这个顺序检查",
    text: "这是一套风险排查顺序，不是某种卡一定能成功的保证。",
    variant: "steps" as const,
    items: [
      {
        title: "先确认订阅入口",
        text: "官网、App Store、Google Play 对付款方式的要求不同。先确认账单方，再判断需要什么卡。",
      },
      {
        title: "确认币种和跨境支付能力",
        text: "AI 订阅常见美元、欧元或本地币种。卡片要支持对应地区的线上支付、外币结算和必要的 3D Secure / 验证流程。",
      },
      {
        title: "确认账单资料是否合理",
        text: "账单地址、国家/地区、邮编、电话和付款卡可能会被一起用于风控判断。不要把支付失败简单归因于余额不足。",
      },
      {
        title: "确认续费和退款路径",
        text: "首月成功不代表以后稳定。持续订阅要看卡片有效期、余额、银行风控、退款到账和拒付处理。",
      },
      {
        title: "把卡费和失败成本算进总价",
        text: "如果为了订阅额外购买虚拟卡、预付卡或低额卡，要把开卡费、汇率、充值损耗和失败处理时间都算进成本。",
      },
    ],
  },
  {
    title: "常见坑位",
    variant: "checklist" as const,
    items: [
      {
        title: "0 刀卡 / 1 刀卡不等于长期订阅卡",
        text: "低额卡常用于验证或短期测试，不适合作为稳定续费能力的证明。订阅续费通常需要足够余额和可持续扣款能力。",
        icon: <Wallet size={17} />,
      },
      {
        title: "虚拟卡可能被产品或支付网关拒绝",
        text: "部分平台会按卡 BIN、发行地区、历史风险、账单资料和交易行为判断是否接受。",
        icon: <ShieldAlert size={17} />,
      },
      {
        title: "税费和汇率会改变实付金额",
        text: "页面价格、发卡行汇率、手续费、税费和账单入账时间可能导致最终支付金额和预期不同。",
        icon: <ReceiptText size={17} />,
      },
      {
        title: "退款不一定即时或顺利",
        text: "虚拟卡、预付卡、借记卡和跨境支付的退款路径可能更慢，也可能受卡片状态和平台规则影响。",
        icon: <RotateCcw size={17} />,
      },
      {
        title: "同一张卡不一定适合所有平台",
        text: "OpenAI、Google、Apple、Anthropic、xAI 或模型 API 平台的支付网关和风控策略可能不同。",
        icon: <HelpCircle size={17} />,
      },
      {
        title: "代开卡商家不是官方担保",
        text: "如果通过第三方购买卡片或充值服务，交易、售后、冻结、退款和实名风险要自己额外判断。",
        icon: <ShieldAlert size={17} />,
      },
    ],
  },
];

const priceAiHelps = [
  "帮助你把官方正价、地区价、代订价和第三方渠道价分开看。",
  "提醒你不要只比较页面标价，也要计算卡费、汇率、税费和失败成本。",
  "通过官方地区价和指南判断自己是否适合走官网、App Store 或 Google Play。",
  "如果支付能力不足，可以回到渠道比价页核验当前有货报价和来源。",
];

const officialReferences: GuideReference[] = [
  {
    title: "Apple：可用于 Apple 账户的付款方式",
    text: "按国家或地区确认 App Store 和 Apple 订阅支持的付款方式。",
    href: "https://support.apple.com/en-us/111741",
  },
  {
    title: "Google Play：接受的付款方式",
    text: "按地区确认 Google Play 支持的银行卡、余额和其他付款方式。",
    href: "https://support.google.com/googleplay/answer/2651410?hl=en",
  },
  {
    title: "Google Play：付款方式问题排查",
    text: "了解付款失败、拒付和付款方式不可用时的基本排查入口。",
    href: "https://support.google.com/googleplay/answer/1267137?hl=en",
  },
  {
    title: "OpenAI：ChatGPT 订阅取消说明",
    text: "确认官网、App Store 或 Play Store 订阅的账单入口差异。",
    href: "https://help.openai.com/en/articles/7232927-how-do-i-cancel-my-chatgpt-plus-subscription",
  },
];

const faqs: Array<[string, string]> = [
  [
    "订阅 AI 一定要 Visa 或 Mastercard 吗？",
    "不一定。具体取决于订阅入口、国家/地区和平台支持的付款方式。但对中文用户来说，可跨境线上支付的 Visa / Mastercard 往往是最常见的官方自助路径。",
  ],
  [
    "虚拟卡能不能订阅 ChatGPT 或 Gemini？",
    "可能能，也可能失败。虚拟卡是否可用取决于发行地区、卡 BIN、余额、账单资料、平台风控和支付网关。PriceAI 不推荐具体虚拟卡商家。",
  ],
  [
    "0 刀卡 / 1 刀卡有什么用？",
    "它们通常更像低额验证或测试工具，不应被理解成稳定订阅卡。持续订阅需要可续费、可退款、余额充足且风控可接受的付款方式。",
  ],
  [
    "为什么卡里有钱还是支付失败？",
    "可能是跨境开关、3D Secure、账单地址、发卡行风控、平台风控、币种、地区不匹配或卡类型不被接受。余额只是其中一个因素。",
  ],
  [
    "PriceAI 会推荐具体信用卡或虚拟卡吗？",
    "目前不会。PriceAI 只解释卡类型、成本和风险边界，不销售卡片，也不对具体卡商或代开服务背书。",
  ],
];

function buildGuideJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "订阅 AI 需要什么支付卡：Visa、Mastercard、虚拟卡和预付卡怎么理解？",
      inLanguage: "zh-CN",
      url: pageUrl,
      description: "解释 AI 订阅常见支付卡类型、低额卡、虚拟卡、预付卡、账单资料、税费、汇率和失败风险。",
      author: { "@type": "Organization", name: "PriceAI" },
      publisher: { "@type": "Organization", name: "PriceAI" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "PriceAI", item: "https://priceai.cc" },
        { "@type": "ListItem", position: 2, name: "AI 订阅支付卡", item: pageUrl },
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
