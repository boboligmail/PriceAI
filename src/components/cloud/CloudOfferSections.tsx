import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cloudComparisonSummary, getCloudStatusLabel, type CloudOffer } from "@/lib/cloud-comparison";
import { getCloudOfferDecision } from "@/lib/cloud-selector";

export function CloudOfferSection({
  id,
  title,
  description,
  offers,
}: {
  id: string;
  title: string;
  description: string;
  offers: CloudOffer[];
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-[1500px] border-x border-[var(--color-border-soft)] px-5 py-10 sm:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-[var(--color-success-text)]">{offers.length} 个候选平台</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-[var(--color-text-primary)]">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--color-text-muted)]">{description}</p>
          </div>
          <p className="text-xs text-[var(--color-text-soft)]">更新日期：{cloudComparisonSummary.updatedAt}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {offers.map((offer) => (
            <CloudOfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CloudOfferCard({ offer }: { offer: CloudOffer }) {
  const decision = getCloudOfferDecision(offer);
  const priceLabel = offer.kind === "vps" ? "大概价格" : "参考价格";

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

      <p className="mt-4 text-sm leading-7 text-[var(--color-text-body)]">{decision.summary}</p>

      <dl className="mt-5 grid gap-3">
        <DecisionItem label="适合谁" value={decision.fit} />
        <DecisionItem label={priceLabel} value={offer.priceDisplay} strong />
        <DecisionItem label="最大风险" value={decision.risk} warning />
      </dl>

      <p className="mt-4 text-xs leading-6 text-[var(--color-text-muted)]">
        价格口径：官网公开价人工整理，具体以地区、规格和库存为准。核验日期：{offer.lastChecked}
      </p>

      <div className="mt-5 grid gap-3">
        <DetailBlock title="查看计费细节">
          <p>{offer.priceBasis}</p>
          <p className="mt-3 font-semibold text-[var(--color-text-body)]">计费方式：{offer.billing}</p>
          <ul className="mt-3 space-y-2">
            {offer.priceHighlights.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-info-text)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </DetailBlock>
        <DetailBlock title="查看地区和规格">
          <MiniTagGroup title="覆盖地区" items={offer.regions} />
          <MiniTagGroup title="关键规格" items={offer.specs} />
          <MiniTagGroup title="适合场景" items={offer.bestFor} />
        </DetailBlock>
        <DetailBlock title="查看风险说明">
          <ul className="space-y-2">
            {offer.cautions.map((item) => (
              <li key={item} className="rounded-2xl bg-[#fff4e5] px-3 py-2 text-[#8a5a00]">
                {item}
              </li>
            ))}
          </ul>
        </DetailBlock>
      </div>

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

function DecisionItem({ label, value, strong = false, warning = false }: { label: string; value: string; strong?: boolean; warning?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${warning ? "bg-[#fff4e5]" : "bg-[var(--color-surface)]"}`}>
      <dt className={`text-xs font-bold ${warning ? "text-[#8a5a00]" : "text-[var(--color-text-soft)]"}`}>{label}</dt>
      <dd className={`mt-1 leading-7 ${strong ? "text-lg font-bold tracking-tight text-[var(--color-text-primary)]" : "text-sm font-semibold text-[var(--color-text-body)]"}`}>
        {value}
      </dd>
    </div>
  );
}

function DetailBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group rounded-2xl bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text-muted)] ring-1 ring-[var(--color-border-soft)]">
      <summary className="cursor-pointer list-none font-bold text-[var(--color-text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">
        <span className="inline-flex items-center gap-2">
          {title}
          <span className="text-xs text-[var(--color-text-soft)] group-open:hidden">展开</span>
          <span className="hidden text-xs text-[var(--color-text-soft)] group-open:inline">收起</span>
        </span>
      </summary>
      <div className="mt-3 leading-7">{children}</div>
    </details>
  );
}

function MiniTagGroup({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div className="mt-3 first:mt-0">
      <p className="text-xs font-bold text-[var(--color-text-soft)]">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full bg-[var(--color-panel)] px-3 py-1 text-xs font-semibold text-[var(--color-text-body)]">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
