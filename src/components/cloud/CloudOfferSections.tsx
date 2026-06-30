import { ArrowUpRight } from "lucide-react";
import { cloudComparisonSummary, getCloudStatusLabel, type CloudOffer } from "@/lib/cloud-comparison";

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
            <p className="text-sm font-semibold text-[var(--color-success-text)]">{offers.length} 条最低价记录</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-[var(--color-text-primary)]">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--color-text-muted)]">{description}</p>
          </div>
          <p className="text-xs text-[var(--color-text-soft)]">更新日期：{cloudComparisonSummary.updatedAt}</p>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] bg-[var(--color-panel)] shadow-[var(--shadow-panel)] ring-1 ring-[var(--color-border-soft)]">
          <div className="hidden grid-cols-[180px_210px_130px_140px_160px_minmax(150px,1fr)_150px] gap-4 bg-[var(--color-surface)] px-5 py-3 text-xs font-bold text-[var(--color-text-soft)] lg:grid">
            <span>商家</span>
            <span>价格</span>
            <span>CPU / 显卡</span>
            <span>内存 / 显存</span>
            <span>硬盘 / 存储</span>
            <span>流量 / 备注</span>
            <span>跳转链接</span>
          </div>
          {offers.map((offer) => (
            <CloudOfferRow key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CloudOfferRow({ offer }: { offer: CloudOffer }) {
  const priceLabel = offer.kind === "vps" ? "大概价格" : "参考价格";

  return (
    <article className="border-t border-[var(--color-border-soft)] px-5 py-5 first:border-t-0">
      <div className="grid gap-4 lg:grid-cols-[180px_210px_130px_140px_160px_minmax(150px,1fr)_150px] lg:items-start">
        <div>
          <p className="text-xs font-bold text-[var(--color-text-soft)] lg:hidden">商家</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-soft)] lg:mt-0">{offer.kind === "vps" ? "VPS" : "GPU"}</p>
          <h3 className="mt-2 text-xl font-bold text-[var(--color-text-primary)]">{offer.provider}</h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{offer.product}</p>
          <span className="mt-3 inline-flex w-fit rounded-full bg-[var(--color-surface-selected)] px-3 py-1 text-xs font-bold text-[var(--color-success-text)]">
            {getCloudStatusLabel(offer.dataStatus)}
          </span>
        </div>

        <div>
          <p className="text-xs font-bold text-[var(--color-text-soft)] lg:hidden">{priceLabel}</p>
          <p className="mt-1 text-lg font-bold tracking-tight text-[var(--color-text-primary)] lg:mt-0">{offer.priceDisplay}</p>
          <p className="mt-2 text-xs leading-6 text-[var(--color-text-muted)]">{offer.billing}</p>
          <p className="mt-2 text-xs font-semibold text-[var(--color-info-text)]">核验日期：{offer.lastChecked}</p>
        </div>

        <ConfigCell label={offer.kind === "vps" ? "CPU" : "显卡"} value={offer.config.compute} />
        <ConfigCell label={offer.kind === "vps" ? "内存" : "显存"} value={offer.config.memory} />
        <ConfigCell label="硬盘 / 存储" value={offer.config.storage} />
        <ConfigCell label="流量 / 备注" value={`${offer.config.network}；${offer.config.note}`} muted />

        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-[var(--color-text-soft)] lg:hidden">跳转链接</p>
          <a
            href={offer.pricingUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`核验 ${offer.provider} ${offer.priceDisplay} 的对应价格行`}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-text-on-primary)] transition hover:bg-[var(--color-primary-hover)]"
          >
            核验/进入
            <ArrowUpRight size={15} />
          </a>
          <p className="text-center text-xs leading-5 text-[var(--color-text-soft)]">对应当前价格行</p>
        </div>
      </div>
    </article>
  );
}

function ConfigCell({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <p className="text-xs font-bold text-[var(--color-text-soft)] lg:hidden">{label}</p>
      <p className={`mt-1 text-sm font-semibold leading-6 lg:mt-0 ${muted ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-body)]"}`}>
        {value}
      </p>
    </div>
  );
}
