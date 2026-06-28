import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, FileText, Megaphone, ShieldCheck } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "赞助广告位说明",
  description: "PriceAI 赞助广告位说明：展示位置、适合对象、素材要求和不影响客观排序的投放边界。",
  alternates: {
    canonical: "/commercial",
  },
  openGraph: {
    title: "PriceAI 赞助广告位说明",
    description: "了解 PriceAI 可投放的赞助广告位置、适合对象、资料要求和不影响客观排序的边界。",
    url: "https://priceai.cc/commercial",
    siteName: "PriceAI",
  },
};

const slots = [
  {
    title: "首页顶部横幅",
    fit: "云服务器、监控、开发者工具、域名、支付、算力、API 周边服务",
    format: "可关闭通知条，适合短标题、优惠活动或品牌入口。",
    note: "不承接卡网订阅或中转站排名型推广，避免用户误以为是购买建议。",
  },
  {
    title: "首页生态合作位",
    fit: "AI 周边服务、开发者基础设施、工具类品牌、长期合作公告",
    format: "首页模块之间的轻量图文位。",
    note: "用于品牌说明和轻曝光，不进入四个核心模块的排序逻辑。",
  },
  {
    title: "底部赞助展示区",
    fit: "IP 纯净度检测、云服务器、监控、支付、域名、网络与账号安全工具、API 中转周边服务",
    format: "页面最底部的多图片卡片位，可承接多个赞助对象。",
    note: "可以放中转 API 相关赞助，但必须是独立广告区，不能写成榜单推荐、稳定性背书或自然排序权益。",
  },
  {
    title: "中转 API 频道赞助位",
    fit: "API Gateway、中转站、模型路由平台、公开可核验的优惠码",
    format: "频道页顶部或列表附近的横幅 / 图文卡片。",
    note: "只提供明确标注的广告展示，不承接分佣说明；价格、倍率、可用性和风险提示仍按 PriceAI 规则展示。",
  },
  {
    title: "API 模型雷达合作位",
    fit: "模型 API、Token Plan、开发者工具、统一接口、模型路由相关服务",
    format: "模型 API 页面中的开发者向展示位。",
    note: "更适合开发者向产品，要求提供清晰官网、定价页或公开说明。",
  },
];

const sponsorScope = [
  ["本页只说明付费赞助展示", "适合想购买明确广告位的服务商。免费收录、资料提交和纠错入口会放在对应业务页面。"],
  ["中转 API 不在这里讲分佣", "中转站或 API Gateway 可以购买频道广告位、模型页广告位或底部广告位，但不把分佣作为本页合作卖点。"],
  ["广告位不是排名权益", "赞助展示不会改变价格、倍率、库存、稳定性、用户反馈和自然排序。"],
  ["所有位置都要明确标注", "前台展示会使用“广告 / 赞助”标识，避免用户把商业曝光误解成 PriceAI 推荐。"],
];

const requirements = [
  "官网地址、产品介绍、适合投放的页面位置和希望展示的周期。",
  "公司或个人主体、是否能开发票、合同抬头与付款方式。",
  "广告素材需提供短标题、30 到 80 字说明、落地页、披露语，以及必要的 Logo、品牌图或横幅图。",
  "若投放对象涉及中转 API，需提供公开价格页、模型分组倍率、充值倍率、模型基准价、上游来源说明和可用性监测页。",
  "若使用优惠码，只说明优惠规则和落地页，不在本页展示分佣比例或返佣承诺。",
];

const boundaries = [
  "商业合作不能购买自然排名，不能覆盖价格、可用性、用户反馈和风险提示。",
  "详情页和指南页默认不放广告位，避免影响用户判断和内容可信度。",
  "涉及中转 API 时，赞助展示不等于 PriceAI 担保，用户仍需小额试用并回原站核验。",
  "不接受误导性文案、夸大稳定性、隐藏上游来源或与公开页面不一致的价格宣传。",
];

export default function CommercialPage() {
  return (
    <div className="min-h-screen bg-[var(--color-page)] text-[var(--color-text-body)]">
      <JsonLd data={buildCommercialJsonLd()} />
      <div className="sticky top-0 z-40 bg-[var(--color-page-translucent)] shadow-[var(--shadow-control)] backdrop-blur-xl">
        <SiteHeader />
      </div>

      <main>
        <section className="border-b border-[var(--color-border)]">
          <div className="mx-auto max-w-[1500px] border-x border-[var(--color-border-soft)] px-5 py-12 sm:px-8 md:py-16">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-semibold text-[var(--color-success-text)]">商务合作</p>
              <h1 className="mt-5 text-balance font-serif text-[2.18rem] font-semibold leading-tight tracking-normal text-[var(--color-text-primary)] sm:text-5xl md:text-6xl">
                赞助可以做，但必须和客观比较分开。
              </h1>
              <p className="mx-auto mt-5 max-w-[72ch] text-pretty text-base leading-8 text-[var(--color-text-muted)]">
                这个页面只说明 PriceAI 的付费赞助广告位。广告展示会明确标注，不购买自然排序，不改变价格、倍率、库存和风险提示，也不替任何商家担保。
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <a
                  href="https://t.me/dimthink"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 text-sm font-semibold text-[var(--color-text-on-primary)] transition hover:bg-[var(--color-primary-hover)]"
                >
                  联系 Telegram @dimthink
                  <ArrowRight size={16} />
                </a>
                <Link
                  href="#slots"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-panel)] px-6 text-sm font-semibold text-[var(--color-text-primary)] ring-1 ring-[var(--color-border-soft)] transition hover:bg-[var(--color-surface-hover)]"
                >
                  查看广告位
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="slots" className="border-b border-[var(--color-border)] bg-[var(--color-panel)]">
          <div className="mx-auto max-w-[1500px] border-x border-[var(--color-border-soft)] px-5 py-12 sm:px-8 md:py-14">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.7fr_1fr] lg:items-start">
              <div>
                <p className="text-sm font-semibold text-[var(--color-success-text)]">可合作位置</p>
                <h2 className="mt-3 text-balance font-serif text-3xl font-semibold tracking-normal text-[var(--color-text-primary)] sm:text-4xl">
                  不同页面承接不同类型的赞助。
                </h2>
                <p className="mt-4 text-sm leading-7 text-[var(--color-text-muted)]">
                  越靠近价格和详情判断的位置，披露要求越高。中转 API 可以买独立广告位，但不能购买排名、背书或评测结论。
                </p>
              </div>
              <div className="divide-y divide-[var(--color-border-subtle)] overflow-hidden rounded-lg bg-[var(--color-surface)] ring-1 ring-[var(--color-border-soft)]">
                {slots.map((slot) => (
                  <article key={slot.title} className="grid gap-3 px-5 py-5 md:grid-cols-[190px_minmax(0,1fr)] md:gap-6">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-[var(--color-text-primary)]">
                      <Megaphone size={17} />
                      {slot.title}
                    </h3>
                    <div className="min-w-0">
                      <p className="text-sm leading-7 text-[var(--color-text-body)]">{slot.fit}</p>
                      <p className="mt-1 text-sm leading-7 text-[var(--color-text-body)]">{slot.format}</p>
                      <p className="mt-1 text-sm leading-7 text-[var(--color-text-muted)]">{slot.note}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[var(--color-border)]">
          <div className="mx-auto max-w-[1500px] border-x border-[var(--color-border-soft)] px-5 py-12 sm:px-8 md:py-14">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-semibold text-[var(--color-success-text)]">页面范围</p>
              <h2 className="mt-3 text-balance font-serif text-3xl font-semibold tracking-normal text-[var(--color-text-primary)] sm:text-4xl">
                这页先讲赞助广告，不讲免费合作。
              </h2>
            </div>
            <div className="mx-auto mt-8 grid max-w-6xl gap-3 md:grid-cols-2">
              {sponsorScope.map(([title, body]) => (
                <article key={title} className="rounded-lg bg-[var(--color-panel)] p-5 ring-1 ring-[var(--color-border-soft)]">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-primary)] ring-1 ring-[var(--color-border-soft)]">
                    <Megaphone size={18} />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-[var(--color-text-primary)]">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="rules" className="border-b border-[var(--color-border)] bg-[var(--color-panel)]">
          <div className="mx-auto grid max-w-[1500px] gap-8 border-x border-[var(--color-border-soft)] px-5 py-12 sm:px-8 md:py-14 lg:grid-cols-2">
            <section className="rounded-lg bg-[var(--color-surface)] p-5 ring-1 ring-[var(--color-border-soft)]">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text-primary)]">
                <FileText size={18} />
                需要提供的信息
              </h2>
              <div className="mt-5 divide-y divide-[var(--color-border-subtle)]">
                {requirements.map((item) => (
                  <p key={item} className="py-3 text-sm leading-7 text-[var(--color-text-muted)]">
                    {item}
                  </p>
                ))}
              </div>
            </section>

            <section className="rounded-lg bg-[var(--color-surface)] p-5 ring-1 ring-[var(--color-border-soft)]">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text-primary)]">
                <ShieldCheck size={18} />
                披露与边界
              </h2>
              <div className="mt-5 divide-y divide-[var(--color-border-subtle)]">
                {boundaries.map((item) => (
                  <p key={item} className="py-3 text-sm leading-7 text-[var(--color-text-muted)]">
                    {item}
                  </p>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="border-b border-[var(--color-border)]">
          <div className="mx-auto max-w-[1500px] border-x border-[var(--color-border-soft)] px-5 py-12 sm:px-8 md:py-14">
            <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-lg bg-[var(--color-panel)] p-5 ring-1 ring-[var(--color-border-soft)] md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--color-text-primary)]">
                  <BadgeCheck size={18} />
                  投放前建议先准备资料
                </h2>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                  如果是中转 API 相关赞助，请优先准备公开价格页、监测页、分组倍率、充值倍率、落地页和广告素材。PriceAI 会先判断适合放频道赞助位、模型页赞助位还是底部赞助展示区。
                </p>
              </div>
              <a
                href="https://t.me/dimthink"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-text-on-primary)] transition hover:bg-[var(--color-primary-hover)]"
              >
                发资料沟通
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function buildCommercialJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "PriceAI 赞助广告位说明",
    url: "https://priceai.cc/commercial",
    inLanguage: "zh-CN",
    description: "说明 PriceAI 的赞助广告位、适合对象、资料要求和不影响客观排序的投放边界。",
    isPartOf: {
      "@type": "WebSite",
      name: "PriceAI",
      url: "https://priceai.cc",
    },
  };
}
