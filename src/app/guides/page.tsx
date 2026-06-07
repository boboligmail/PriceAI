import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, BookOpenText, CreditCard, Gift, Globe2, Layers3, ShieldAlert, Smartphone } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";

export const revalidate = 86400;

const pageUrl = "https://priceai.cc/guides";

export const metadata: Metadata = {
  title: "AI 订阅指南：价格分层、官方订阅、支付卡、礼品卡和渠道风险",
  description:
    "PriceAI AI 订阅指南目录，整理 AI 订阅价格为什么不同、如何自己官方订阅、Apple ID、Google Play、支付卡、礼品卡、地区价风险和卡网渠道判断。",
  alternates: {
    canonical: "/guides",
  },
  openGraph: {
    title: "AI 订阅指南：价格分层、官方订阅、支付卡、礼品卡和渠道风险 | PriceAI",
    description: "从价格分层、官方自助订阅、支付方式到第三方渠道风险，按问题理解 AI 订阅获取路径。",
    url: pageUrl,
  },
};

const guideGroups = [
  {
    title: "先理解价格为什么不同",
    text: "适合第一次看到官网价、地区价、代充价、卡网价差很多的用户。",
    guides: [
      {
        title: "AI 订阅价格为什么差很多",
        text: "拆开官网正价、官方地区价、资格价、代充价和第三方渠道价。",
        href: "/guides/why-ai-subscription-prices-differ",
        icon: <Layers3 size={17} />,
      },
      {
        title: "官方地区价风险",
        text: "理解低价区、税费、汇率、账户地区、付款方式和续费风险。",
        href: "/guides/ai-subscription-region-price-risks",
        icon: <Globe2 size={17} />,
      },
    ],
  },
  {
    title: "再判断能不能自己订阅",
    text: "适合想走官网、App Store 或 Google Play 路径，但不确定支付和地区规则的用户。",
    guides: [
      {
        title: "如何自己完成官方订阅",
        text: "从官网、App Store、Google Play、支付方式和售后入口理解官方路径。",
        href: "/guides/how-to-subscribe-ai-officially",
        icon: <BookOpenText size={17} />,
      },
      {
        title: "Apple ID 订阅 AI",
        text: "解释 Apple 账户地区、App Store 内购、礼品卡、余额和税费边界。",
        href: "/guides/apple-id-ai-subscription",
        icon: <Smartphone size={17} />,
      },
      {
        title: "Google Play 订阅 AI",
        text: "解释 Google Play 国家/地区、付款资料、余额、礼品卡和订阅管理。",
        href: "/guides/google-play-ai-subscription",
        icon: <Smartphone size={17} />,
      },
    ],
  },
  {
    title: "再处理支付和余额问题",
    text: "适合卡在外币卡、虚拟卡、预付卡、礼品卡、余额和续费失败上的用户。",
    guides: [
      {
        title: "订阅 AI 需要什么支付卡",
        text: "解释 Visa、Mastercard、信用卡、借记卡、虚拟卡、预付卡和低额验证卡。",
        href: "/guides/visa-card-for-ai-subscription",
        icon: <CreditCard size={17} />,
      },
      {
        title: "AI 订阅礼品卡限制",
        text: "解释 App Store 礼品卡、Google Play 礼品卡、余额、地区绑定和退款风险。",
        href: "/guides/ai-subscription-gift-card",
        icon: <Gift size={17} />,
      },
    ],
  },
  {
    title: "最后看渠道和具体平台",
    text: "适合决定看第三方渠道前，先确认交付物、售后、投诉路径和当前有货报价的用户。",
    guides: [
      {
        title: "卡网渠道靠谱吗",
        text: "把卡网理解成信息源和交易入口，学习购买前的核验清单。",
        href: "/guides/are-ai-subscription-card-shops-reliable",
        icon: <ShieldAlert size={17} />,
      },
      {
        title: "ChatGPT 获取方式",
        text: "理解官方订阅、地区价、代充、成品号、Team、Plus CDK 和 API/CDK。",
        href: "/guides/chatgpt-subscription-options",
        icon: <BookOpenText size={17} />,
      },
    ],
  },
];

const quickPaths = [
  { href: "/official-prices", label: "查看官方地区价" },
  { href: "/?stock=available", label: "查看有货报价" },
  { href: "/api-models", label: "查看模型 API" },
];

export default function GuidesIndexPage() {
  return (
    <>
      <JsonLd data={buildGuidesJsonLd()} />
      <main className="min-h-screen bg-[#f9f9f9] text-[#2d3435]">
        <div className="sticky top-0 z-40 bg-[#f9f9f9]/95 shadow-[0_10px_24px_rgba(45,52,53,0.035)] backdrop-blur-xl">
          <SiteHeader />
        </div>

        <article className="mx-auto max-w-[1120px] px-5 pb-14 pt-8 sm:px-8 lg:pt-12">
          <section className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_320px] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f3ec] px-3 py-1.5 text-xs font-semibold text-[#2f7a4b] ring-1 ring-[#45bf78]/15">
                <BookOpenText size={15} />
                AI 订阅指南
              </div>
              <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight tracking-normal text-[#202829] sm:text-5xl">
                购买 AI 订阅前，先把路径看清楚。
              </h1>
              <p className="mt-5 max-w-[72ch] text-base leading-8 text-[#5a6061]">
                这里整理的是 PriceAI 的基础指南：为什么同一个 AI 订阅会有不同价格，官方订阅需要哪些条件，Apple ID、Google Play、支付卡、礼品卡和第三方渠道分别要注意什么。
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {quickPaths.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition ${
                      index === 0
                        ? "bg-[#2d3435] text-[#f8f8f8] hover:-translate-y-0.5 hover:bg-[#202829]"
                        : "bg-white text-[#2d3435] ring-1 ring-[#adb3b4]/20 hover:bg-[#f5f7f7]"
                    }`}
                  >
                    {item.label}
                    <ArrowRight size={16} />
                  </Link>
                ))}
              </div>
            </div>

            <aside className="rounded-lg bg-white p-5 shadow-[0_20px_55px_rgba(45,52,53,0.045)] ring-1 ring-[#adb3b4]/15">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5a6061]">Reading order</p>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-[#5a6061]">
                <li>1. 先理解价格分层和地区价。</li>
                <li>2. 再判断自己能否走官方订阅。</li>
                <li>3. 继续核验支付卡、礼品卡和余额。</li>
                <li>4. 最后再看第三方渠道和具体商品。</li>
              </ol>
            </aside>
          </section>

          <section className="mt-10 rounded-lg bg-[#202829] p-6 text-[#f8f8f8] md:p-8">
            <div className="grid gap-6 md:grid-cols-[0.72fr_1fr] md:items-start">
              <div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f8f8]/10 text-[#45bf78]">
                  <ShieldAlert size={19} />
                </div>
                <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight tracking-normal">
                  这些指南只解释路径和边界。
                </h2>
              </div>
              <p className="text-sm leading-7 text-[#d7dddd]">
                PriceAI 不销售订阅、不处理付款、不替任何渠道担保，也不提供绕过地区、风控或身份限制的方法。指南的作用是帮你在购买或接入前知道自己要核验什么。
              </p>
            </div>
          </section>

          <section className="mt-12 space-y-10">
            {guideGroups.map((group) => (
              <div key={group.title}>
                <div className="max-w-3xl">
                  <h2 className="font-serif text-3xl font-semibold tracking-normal text-[#202829]">{group.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[#5a6061]">{group.text}</p>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {group.guides.map((guide) => (
                    <GuideCard key={guide.href} {...guide} />
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="mt-12 flex flex-col gap-4 rounded-lg bg-[#f2f4f4] p-6 ring-1 ring-[#adb3b4]/15 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold tracking-normal text-[#202829]">读完指南，再回到工具核验当前价格。</h2>
              <p className="mt-2 text-sm leading-6 text-[#5a6061]">
                指南负责解释价格和路径，PriceAI 首页负责展示当前系统可见的有货报价、来源和更新时间。
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/?stock=available"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#2d3435] px-5 text-sm font-semibold text-[#f8f8f8] transition hover:bg-[#202829]"
              >
                查看有货报价
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/about"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#2d3435] ring-1 ring-[#adb3b4]/20 transition hover:bg-[#f5f7f7]"
              >
                了解 PriceAI
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}

function GuideCard({
  title,
  text,
  href,
  icon,
}: {
  title: string;
  text: string;
  href: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[180px] flex-col justify-between rounded-lg bg-white p-5 shadow-[0_18px_45px_rgba(45,52,53,0.035)] ring-1 ring-[#adb3b4]/15 transition hover:-translate-y-0.5 hover:bg-[#fbfcfc]"
    >
      <span>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f3ec] text-[#2f7a4b]">{icon}</span>
        <span className="mt-4 block font-semibold text-[#202829]">{title}</span>
        <span className="mt-2 block text-sm leading-7 text-[#5a6061]">{text}</span>
      </span>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2d3435]">
        阅读指南
        <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function buildGuidesJsonLd() {
  const allGuides = guideGroups.flatMap((group) => group.guides);

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "AI 订阅指南",
      inLanguage: "zh-CN",
      url: pageUrl,
      description: "PriceAI AI 订阅指南目录，整理价格分层、官方订阅、支付方式、礼品卡、地区价风险和第三方渠道判断。",
      isPartOf: {
        "@type": "WebSite",
        name: "PriceAI",
        url: "https://priceai.cc",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "PriceAI", item: "https://priceai.cc" },
        { "@type": "ListItem", position: 2, name: "AI 订阅指南", item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "PriceAI AI 订阅指南列表",
      itemListElement: allGuides.map((guide, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: guide.title,
        url: `https://priceai.cc${guide.href}`,
      })),
    },
  ];
}
