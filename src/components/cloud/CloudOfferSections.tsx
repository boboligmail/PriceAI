import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { getCloudStatusLabel, type CloudOffer } from "@/lib/cloud-comparison";

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
        </div>

        <CloudOfferTable offers={offers} />
      </div>
    </section>
  );
}

export function CloudOfferTable({ offers, startIndex = 1 }: { readonly offers: readonly CloudOffer[]; readonly startIndex?: number }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-white shadow-[var(--shadow-panel)]">
      {offers.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-[var(--color-text-muted)]">没有符合条件的结果，放宽筛选条件再试。</div>
      ) : (
        <table className="min-w-[1180px] w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--color-surface)] text-xs font-bold text-[var(--color-text-soft)]">
            <tr>
              <TableHead className="w-10">#</TableHead>
              <TableHead className="w-32">商家</TableHead>
              <TableHead className="w-40">配置明细</TableHead>
              <TableHead className="w-28">CPU/GPU</TableHead>
              <TableHead className="w-28">内存/显存</TableHead>
              <TableHead className="w-28">硬盘</TableHead>
              <TableHead className="w-32">流量/带宽</TableHead>
              <TableHead className="w-28">地区</TableHead>
              <TableHead className="w-24">计费</TableHead>
              <TableHead className="w-28">价格</TableHead>
              <TableHead>风险</TableHead>
              <TableHead className="w-28 text-center">官网</TableHead>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer, index) => (
              <CloudOfferRow key={offer.id} offer={offer} rowNumber={startIndex + index} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function CloudOfferRow({ offer, rowNumber }: { readonly offer: CloudOffer; readonly rowNumber: number }) {
  const regionText = offer.regions.length > 0 ? offer.regions.slice(0, 3).join(" / ") : "地区未列出";
  const riskText = offer.cautions[0] || offer.config.note || "购买前核验库存和附加费用。";

  return (
    <tr className="border-t border-[var(--color-border-soft)] align-top transition hover:bg-[var(--color-surface-hover)]">
      <td className="px-3 py-4 text-xs font-bold text-[var(--color-text-soft)]">{rowNumber}</td>
      <td className="px-3 py-4">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-soft)]">{offer.kind === "vps" ? "VPS" : "GPU"}</p>
        <h3 className="mt-1 text-base font-bold text-[var(--color-text-primary)]">{offer.provider}</h3>
        <span className="mt-2 inline-flex w-fit rounded-full bg-[var(--color-surface-selected)] px-2.5 py-1 text-xs font-bold text-[var(--color-success-text)]">
          {getCloudStatusLabel(offer.dataStatus)}
        </span>
      </td>
      <TableCell>
        <p className="font-semibold text-[var(--color-text-body)]">{offer.product}</p>
        <p className="mt-1 text-xs text-[var(--color-text-soft)]">{offer.sourceName}</p>
      </TableCell>
      <TableCell strong>{offer.config.compute}</TableCell>
      <TableCell strong>{offer.config.memory}</TableCell>
      <TableCell strong>{offer.config.storage}</TableCell>
      <TableCell>{offer.config.network}</TableCell>
      <TableCell>{regionText}</TableCell>
      <TableCell>{offer.billing}</TableCell>
      <td className="px-3 py-4">
        <p className="text-lg font-bold tracking-tight text-[var(--color-success-text)]">{offer.priceDisplay}</p>
        <p className="mt-1 text-xs font-semibold text-[var(--color-info-text)]">核验日：{offer.lastChecked}</p>
      </td>
      <TableCell>{riskText}</TableCell>
      <td className="px-3 py-4 text-center">
        <a
          href={offer.pricingUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`打开 ${offer.provider} ${offer.product} 官网价格页`}
          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[var(--radius-card)] border border-[var(--color-success-text)] bg-[var(--color-success-bg)] px-3 text-xs font-bold text-[var(--color-success-text)] transition hover:bg-white"
        >
          官网直达
          <ArrowUpRight size={14} />
        </a>
      </td>
    </tr>
  );
}

function TableHead({ children, className = "" }: { readonly children: ReactNode; readonly className?: string }) {
  return (
    <th scope="col" className={`px-3 py-3 ${className}`}>
      {children}
    </th>
  );
}

function TableCell({ children, strong = false }: { readonly children: ReactNode; readonly strong?: boolean }) {
  return (
    <td className={`px-3 py-4 leading-6 ${strong ? "font-bold text-[var(--color-text-primary)]" : "font-medium text-[var(--color-text-muted)]"}`}>
      {children}
    </td>
  );
}
