import { Clock3, ExternalLink, Layers3 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandIcon } from "@/components/BrandIcon";
import { ProductDetailHeader, ProductReturnLink } from "@/components/ProductDetailHeader";
import { ProductOffersPanel } from "@/components/ProductOffersPanel";
import { getPublicProductSummary, listPublicProductOffers } from "@/lib/data";
import {
  getOfficialPricePlanSummaryFromDataset,
  getOfficialPriceRowsByIdFromDataset,
  officialPricePlanId,
  type OfficialPricePlanSummary,
  type OfficialPriceRow,
  type OfficialPricesDataset,
} from "@/lib/official-prices";
import { getOfficialPricesDataset } from "@/lib/official-prices-db";
import type { ExplorerProductSummary } from "@/lib/types";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export const revalidate = 0;
export const dynamic = "force-dynamic";
export const dynamicParams = true;

const productTypeLabels: Record<string, string> = {
  "订阅/会员": "订阅/会员",
  会员充值: "订阅/会员",
  成品账号: "成品账号",
  成品号: "成品账号",
  "邮箱/账号": "邮箱/账号",
  API额度: "API额度",
  "接码/验证": "接码/验证",
  虚拟卡: "虚拟卡",
  工具账号: "工具账号",
  其他: "其他",
};

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, initialOffers, officialPricesDataset] = await Promise.all([
    getPublicProductSummary(id),
    listPublicProductOffers(id, { limit: 80, offset: 0 }),
    getOfficialPricesDataset(),
  ]);

  if (!product) notFound();

  const officialReference = buildOfficialPriceReference(product, officialPricesDataset);

  return (
    <main className="min-h-screen bg-[#f9f9f9] text-[#2d3435]">
      <ProductDetailHeader />

      <div className="mx-auto max-w-[1300px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-5">
          <ProductReturnLink />
        </div>

        <section className="rounded-lg bg-[#f2f4f4] p-6 shadow-[0_20px_60px_rgba(45,52,53,0.04)] lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] lg:items-end">
            <div className="min-w-0 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{platformIcon(product.platform)} {product.platform}</Badge>
                <Badge>{productTypeLabel(product.productType)}</Badge>
                <Badge>{product.spec}</Badge>
              </div>
              <h1 className="mt-5 font-serif text-3xl font-bold tracking-normal text-[#202829] sm:text-4xl md:text-5xl">
                {product.displayName}
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#5a6061]">{product.summary}</p>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="最低价" value={formatCurrency(product.lowestPrice, product.lowestOffer?.currency)} />
              <Metric label="有货" value={`${product.inStockCount}`} />
              <Metric label="缺货" value={`${product.outOfStockCount}`} />
              <Metric label="渠道" value={`${product.offerCount}`} />
            </div>
          </div>
        </section>

        {officialReference ? (
          <OfficialPriceReferencePanel reference={officialReference} product={product} />
        ) : null}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl font-semibold tracking-normal text-[#202829]">渠道报价表</h2>
            <p className="mt-2 text-sm text-[#5a6061]">
              {product.offerCount} 条报价 · 只区分有货和缺货
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm text-[#5a6061]">
            <Clock3 size={16} />
            最近记录 {formatRelativeTime(product.latestSeenAt)}
          </div>
        </div>

        <ProductOffersPanel
          productId={product.id}
          productSlug={product.slug}
          productName={product.displayName}
          initialCount={product.offerCount}
          initialData={initialOffers}
        />

        <p className="mt-8 text-xs leading-6 text-[#5a6061]">
          免责声明：本站仅聚合公开采集或审核通过的报价信息，不参与交易，实际价格、库存、质保和售后规则以原平台为准。
        </p>
      </div>
    </main>
  );
}

type OfficialPriceReference = {
  summary: OfficialPricePlanSummary;
  rows: OfficialPriceRow[];
  usRow: OfficialPriceRow | null;
};

const officialPlanByProductId: Record<string, { appSlug: "chatgpt" | "claude" | "gemini" | "grok"; planSlug: string }> = {
  "chatgpt-plus": { appSlug: "chatgpt", planSlug: "plus-monthly" },
  "chatgpt-pro-5x": { appSlug: "chatgpt", planSlug: "pro-5x" },
  "chatgpt-pro-20x": { appSlug: "chatgpt", planSlug: "pro-20x" },
  "claude-pro-month": { appSlug: "claude", planSlug: "pro-monthly" },
  "claude-max-5x": { appSlug: "claude", planSlug: "max-5x-monthly" },
  "claude-max-20x": { appSlug: "claude", planSlug: "max-20x-monthly" },
  "gemini-pro-year": { appSlug: "gemini", planSlug: "ai-pro" },
  "gemini-ultra": { appSlug: "gemini", planSlug: "ai-ultra" },
  "super-grok": { appSlug: "grok", planSlug: "supergrok" },
};

function buildOfficialPriceReference(
  product: ExplorerProductSummary,
  dataset: OfficialPricesDataset,
): OfficialPriceReference | null {
  const mapping = officialPlanByProductId[product.id] || officialPlanByProductId[product.slug];
  if (!mapping) return null;

  const id = officialPricePlanId(mapping.appSlug, mapping.planSlug);
  const summary = getOfficialPricePlanSummaryFromDataset(dataset, id);
  if (!summary?.lowestRow) return null;

  const rows = getOfficialPriceRowsByIdFromDataset(dataset, id);
  return {
    summary,
    rows,
    usRow: rows.find((row) => row.countryCode === "US") || null,
  };
}

function OfficialPriceReferencePanel({
  reference,
  product,
}: {
  reference: OfficialPriceReference;
  product: ExplorerProductSummary;
}) {
  const { summary, rows, usRow } = reference;
  const lowest = summary.lowestRow;
  if (!lowest) return null;

  return (
    <section className="mt-6 rounded-lg bg-white p-5 shadow-[0_20px_55px_rgba(45,52,53,0.045)] ring-1 ring-[#adb3b4]/15 lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef3f8] px-3 py-1 text-xs font-semibold text-[#47657a]">
              <BrandIcon platform={summary.platform} className="h-[15px] w-[15px]" />
              官方地区价参考
            </span>
            <span className="rounded-full bg-[#f2f4f4] px-3 py-1 text-xs font-medium text-[#5a6061]">
              App Store 公开价
            </span>
          </div>
          <h2 className="mt-3 font-serif text-2xl font-semibold tracking-normal text-[#202829]">
            {summary.label} 官方基准价
          </h2>
          <p className="mt-2 max-w-[78ch] text-sm leading-7 text-[#5a6061]">
            这里展示同款官方订阅在不同 App Store 地区的公开价格，用作对比第三方渠道报价的基准。实际支付价格、税费、支付汇率和开通条件以官方页面与支付时显示为准。
          </p>
        </div>
        <Link
          href={`/official-prices/${summary.id}`}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#2d3435] px-4 text-sm font-semibold text-[#f8f8f8] transition hover:bg-[#202829]"
        >
          查看所有地区
          <ExternalLink size={15} />
        </Link>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <ReferenceMetric
          label="官方最低地区价"
          value={formatCurrency(lowest.cnyPrice, "CNY")}
          detail={`${lowest.countryLabel} ${lowest.priceText}`}
        />
        <ReferenceMetric
          label="美国公开价"
          value={usRow ? formatCurrency(usRow.cnyPrice, "CNY") : "暂无样本"}
          detail={usRow ? `${usRow.priceText} · ${usRow.currencyCode}` : "等待后续采集补齐"}
        />
        <ReferenceMetric
          label="当前第三方最低有货价"
          value={formatCurrency(product.lowestPrice, product.lowestOffer?.currency)}
          detail={product.lowestOffer ? product.lowestOffer.sourceStoreName || product.lowestOffer.sourceName : "暂无有货报价"}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-5 text-[#adb3b4]">
        <span>地区样本：{rows.length}</span>
        <span className="hidden h-1 w-1 rounded-full bg-[#adb3b4] sm:inline-block" />
        <span>汇率日期：{lowest.fxDate}</span>
        <span className="hidden h-1 w-1 rounded-full bg-[#adb3b4] sm:inline-block" />
        <span>最近记录：{formatRelativeTime(summary.latestFetchedAt)}</span>
      </div>
    </section>
  );
}

function ReferenceMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-[#f7f9f9] px-4 py-3 ring-1 ring-[#adb3b4]/15">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[#5a6061]">{label}</p>
      <p className="mt-1 truncate text-xl font-bold text-[#202829]">{value}</p>
      <p className="mt-1 truncate text-xs text-[#5a6061]">{detail}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-white px-4 py-3 shadow-[0_12px_35px_rgba(45,52,53,0.035)] ring-1 ring-[#adb3b4]/15">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[#5a6061]">{label}</p>
      <p className="mt-1 truncate text-xl font-bold text-[#202829]">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#5a6061] ring-1 ring-[#adb3b4]/15">
      {children}
    </span>
  );
}

function platformIcon(platform: string) {
  const className = "h-[15px] w-[15px]";

  if (platform !== "其他") return <BrandIcon platform={platform} className={className} />;
  return <Layers3 className={`${className} text-[#5a6061]`} />;
}

function productTypeLabel(productType: string): string {
  return productTypeLabels[productType] || productType;
}
