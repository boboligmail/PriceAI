import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Cpu, Database, Gauge, Server, ShieldAlert } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { cloudComparisonSummary, getCloudOffersByKind, getCloudStatusLabel, type CloudOffer } from "@/lib/cloud-comparison";

export const revalidate = 3600;
const siteUrl = "https://ai-home.example.com";

export const metadata: Metadata = {
  title: "VPS 云服务器与 GPU 租赁平台比价",
  description: "整理 VPS 云服务器、轻量云和 GPU 租赁平台的计费方式、适用场景、风险点和价格来源，作为部署、训练、推理前的选型入口。",
  alternates: { canonical: "/cloud" },
  openGraph: {
    title: "VPS 云服务器与 GPU 租赁平台比价 | ai-home",
    description: "先按 VPS / GPU 场景筛选平台，再回到原站核验实时价格、库存、地区和计费规则。",
    url: "https://ai-home.example.com/cloud",
    siteName: "ai-home",
  },
};

const pageStats = [
  { label: "VPS / 云服务器", value: cloudComparisonSummary.vpsCount, icon: Server },
  { label: "GPU 租赁平台", value: cloudComparisonSummary.gpuCount, icon: Cpu },
  { label: "数据状态", value: "MVP", icon: Gauge },
];

export default function CloudComparisonPage() {
  return <CloudComparisonView canonicalPath="/cloud" activeSection="cloud" />;
}

export function CloudComparisonView({ canonicalPath = "/cloud", activeSection = "cloud" }: { canonicalPath?: "/" | "/cloud"; activeSection?: "home" | "cloud" }) {
  const vpsOffers = getCloudOffersByKind("vps");
  const gpuOffers = getCloudOffersByKind("gpu");

  return (
    <div className="min-h-screen bg-[var(--color-page)] text-[var(--color-text-body)]">
      <JsonLd data={buildCloudJsonLd([...vpsOffers, ...gpuOffers], canonicalPath)} />
      <div className="sticky top-0 z-40 bg-[var(--color-page-translucent)] shadow-[var(--shadow-control)] backdrop-blur-xl">
        <SiteHeader activeSection={activeSection} />
      </div>

      <main>
        <section className="border-b border-[var(--color-border)]">
          <div className="mx-auto max-w-[1500px] border-x border-[var(--color-border-soft)] px-5 py-12 sm:px-8 md:py-16">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
              <div>
                <p className="text-sm font-semibold text-[var(--color-success-text)]">云算力比价 MVP</p>
                <h1 className="mt-4 max-w-4xl text-balance font-serif text-[2.2rem] font-semibold leading-tight tracking-normal text-[var(--color-text-primary)] sm:text-5xl">
                  VPS 云服务器和 GPU 租赁平台，先按用途筛，再回原站核价。
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--color-text-muted)]">
                  这个页面先把常见平台、计费口径、适用场景和风险点整理出来。第一版不冒充实时最低价；价格字段会优先指向官方价格页或 marketplace，后续再接采集器自动更新。
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="#vps"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-primary)] px-6 text-sm font-semibold text-[var(--color-text-on-primary)] transition hover:bg-[var(--color-primary-hover)]"
                  >
                    看 VPS 平台
                  </Link>
                  <Link
                    href="#gpu"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-panel)] px-6 text-sm font-semibold text-[var(--color-text-primary)] ring-1 ring-[var(--color-border-soft)] transition hover:bg-[var(--color-surface-hover)]"
                  >
                    看 GPU 平台
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 rounded-[2rem] bg-[var(--color-panel)] p-4 shadow-[var(--shadow-panel)] ring-1 ring-[var(--color-border-soft)]">
                {pageStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="flex items-center justify-between rounded-2xl bg-[var(--color-surface)] px-4 py-3">
                      <span className="inline-flex items-center gap-3 text-sm font-semibold text-[var(--color-text-body)]">
                        <Icon size={18} className="text-[var(--color-success-text)]" />
                        {stat.label}
                      </span>
                      <span className="text-lg font-bold text-[var(--color-text-primary)]">{stat.value}</span>
                    </div>
                  );
                })}
                <p className="rounded-2xl bg-[#fff8e6] px-4 py-3 text-xs leading-6 text-[#7a5a00]">
                  成功标志：后续每个平台都要有价格来源、更新时间、采集状态和回原站核验入口。没有来源的价格不展示成最低价。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[var(--color-border)]">
          <div className="mx-auto grid max-w-[1500px] gap-5 border-x border-[var(--color-border-soft)] px-5 py-8 sm:px-8 md:grid-cols-3">
            <InfoCard
              icon={<Database size={19} />}
              title="第一版先做目录和口径"
              body="先统一平台、规格、计费方式、地区、适用场景和价格来源，等口径稳定后再做自动采集。"
            />
            <InfoCard
              icon={<Gauge size={19} />}
              title="VPS 和 GPU 分开算"
              body="VPS 常看月付封顶、带宽、IPv4 和地区；GPU 常看 $/hour、显存、可靠性、存储和中断风险。"
            />
            <InfoCard
              icon={<ShieldAlert size={19} />}
              title="不只看最低价"
              body="GPU marketplace 的低价可能伴随低可靠性、慢带宽或主机差异；VPS 低价也可能有备份、流量和开通费。"
            />
          </div>
        </section>

        <OfferSection id="vps" title="VPS / 云服务器" description="适合网站、数据库、小服务、代理节点、Docker 应用和长期在线任务。" offers={vpsOffers} />
        <OfferSection id="gpu" title="GPU 租赁平台" description="适合 AI 绘图、模型训练、LoRA 微调、推理服务和短期算力任务。" offers={gpuOffers} />
      </main>
    </div>
  );
}

function InfoCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-[1.5rem] bg-[var(--color-panel)] p-5 shadow-[var(--shadow-panel)] ring-1 ring-[var(--color-border-soft)]">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-surface-selected)] text-[var(--color-success-text)]">{icon}</div>
      <h2 className="mt-4 text-base font-bold text-[var(--color-text-primary)]">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">{body}</p>
    </div>
  );
}

function OfferSection({ id, title, description, offers }: { id: string; title: string; description: string; offers: CloudOffer[] }) {
  return (
    <section id={id} className="border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-[1500px] border-x border-[var(--color-border-soft)] px-5 py-10 sm:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-[var(--color-success-text)]">{offers.length} 个平台</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-[var(--color-text-primary)]">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--color-text-muted)]">{description}</p>
          </div>
          <p className="text-xs text-[var(--color-text-soft)]">更新时间：{cloudComparisonSummary.updatedAt}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function OfferCard({ offer }: { offer: CloudOffer }) {
  return (
    <article className="rounded-[1.75rem] bg-[var(--color-panel)] p-5 shadow-[var(--shadow-panel)] ring-1 ring-[var(--color-border-soft)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-soft)]">{offer.kind === "vps" ? "VPS" : "GPU"}</p>
          <h3 className="mt-2 text-xl font-bold text-[var(--color-text-primary)]">{offer.provider}</h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{offer.product}</p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-[var(--color-surface-selected)] px-3 py-1 text-xs font-bold text-[var(--color-success-text)]">
          {getCloudStatusLabel(offer.dataStatus)}
        </span>
      </div>

      <div className="mt-5 rounded-2xl bg-[var(--color-surface)] p-4">
        <p className="text-sm font-bold text-[var(--color-text-primary)]">{offer.priceDisplay}</p>
        <p className="mt-2 text-xs leading-6 text-[var(--color-text-muted)]">{offer.priceBasis}</p>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <MetaItem label="计费方式" value={offer.billing} />
        <MetaItem label="覆盖地区" value={offer.regions.join(" / ")} />
      </dl>

      <TagGroup title="关键规格" items={offer.specs} />
      <TagGroup title="适合场景" items={offer.bestFor} />
      <TagGroup title="注意事项" items={offer.cautions} tone="warning" />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <a
          href={offer.pricingUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-text-on-primary)] transition hover:bg-[var(--color-primary-hover)]"
        >
          核验价格
          <ArrowUpRight size={15} />
        </a>
        <a
          href={offer.homepageUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--color-surface)] px-4 text-sm font-semibold text-[var(--color-text-primary)] ring-1 ring-[var(--color-border-soft)] transition hover:bg-[var(--color-surface-hover)]"
        >
          打开官网
        </a>
      </div>
    </article>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-3">
      <dt className="text-xs font-semibold text-[var(--color-text-soft)]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-[var(--color-text-body)]">{value}</dd>
    </div>
  );
}

function TagGroup({ title, items, tone = "default" }: { title: string; items: string[]; tone?: "default" | "warning" }) {
  return (
    <div className="mt-5">
      <p className="text-xs font-semibold text-[var(--color-text-soft)]">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              tone === "warning" ? "bg-[#fff4e5] text-[#8a5a00]" : "bg-[var(--color-surface)] text-[var(--color-text-body)]"
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function buildCloudJsonLd(offers: CloudOffer[], canonicalPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "VPS 云服务器与 GPU 租赁平台比价",
    url: `${siteUrl}${canonicalPath === "/" ? "" : canonicalPath}`,
    inLanguage: "zh-CN",
    dateModified: cloudComparisonSummary.updatedAt,
    description: "整理 VPS 云服务器和 GPU 租赁平台的计费方式、适用场景、风险点和价格来源。",
    mainEntity: offers.map((offer) => ({
      "@type": "Service",
      name: `${offer.provider} ${offer.product}`,
      serviceType: offer.kind === "vps" ? "Cloud VPS" : "GPU Cloud",
      url: offer.homepageUrl,
    })),
  };
}
