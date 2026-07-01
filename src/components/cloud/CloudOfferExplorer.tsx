"use client";

import { useMemo, useSyncExternalStore, useState } from "react";
import { Clock3, RotateCcw } from "lucide-react";
import { CloudPagination, CloudSelectField, CloudTabButton } from "@/components/cloud/CloudOfferExplorerParts";
import { CloudOfferTable } from "@/components/cloud/CloudOfferSections";
import type { CloudOffer, CloudOfferKind, CloudOfferUpdateRecord } from "@/lib/cloud-comparison";
import {
  billingOptions,
  compareOffers,
  getGpuModel,
  getGpuModelOptions,
  getSortOptions,
  gpuCountOptions,
  hourlyOptions,
  matchesBilling,
  monthlyOptions,
  storageOptions,
  toPageSize,
  toSortMode,
  type SortMode,
  vpsCpuOptions,
  vpsMemoryOptions,
  vramOptions,
} from "@/lib/cloud-offer-filters";
import { getCloudOfferMetrics } from "@/lib/cloud-offer-metrics";

export function CloudOfferExplorer({
  offers,
  updatedAt,
  updateRecords,
}: {
  readonly offers: readonly CloudOffer[];
  readonly updatedAt: string;
  readonly updateRecords: readonly CloudOfferUpdateRecord[];
}) {
  const hashKind = useHashKind();
  const [selectedKind, setSelectedKind] = useState<CloudOfferKind | null>(null);
  const activeKind = selectedKind ?? hashKind;
  const [query, setQuery] = useState("");
  const [cpuMin, setCpuMin] = useState("0");
  const [memoryMin, setMemoryMin] = useState("0");
  const [storageMin, setStorageMin] = useState("0");
  const [monthlyMax, setMonthlyMax] = useState("0");
  const [gpuCountMin, setGpuCountMin] = useState("0");
  const [gpuModel, setGpuModel] = useState("all");
  const [vramMin, setVramMin] = useState("0");
  const [hourlyMax, setHourlyMax] = useState("0");
  const [billingMode, setBillingMode] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("monthly-asc");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

  const tabTotals = useMemo(
    () => ({
      vps: offers.filter((offer) => offer.kind === "vps").length,
      gpu: offers.filter((offer) => offer.kind === "gpu").length,
    }),
    [offers],
  );

  const gpuModelOptions = useMemo(() => getGpuModelOptions(offers), [offers]);

  const filteredOffers = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const rows = offers.filter((offer) => {
      if (offer.kind !== activeKind) return false;
      if (keyword && !`${offer.provider} ${offer.product} ${offer.config.compute} ${offer.sourceName}`.toLowerCase().includes(keyword)) return false;

      const metrics = getCloudOfferMetrics(offer);
      if (activeKind === "vps") {
        return (
          metrics.cpuCores >= Number(cpuMin) &&
          metrics.memoryGb >= Number(memoryMin) &&
          metrics.storageGb >= Number(storageMin) &&
          (Number(monthlyMax) === 0 || offer.monthlyEstimateUsd <= Number(monthlyMax))
        );
      }

      return (
        metrics.gpuCount >= Number(gpuCountMin) &&
        (gpuModel === "all" || getGpuModel(offer) === gpuModel) &&
        metrics.vramGb >= Number(vramMin) &&
        (Number(hourlyMax) === 0 || offer.priceUsd <= Number(hourlyMax)) &&
        matchesBilling(offer.billing, billingMode)
      );
    });

    return [...rows].sort((left, right) => compareOffers(left, right, sortMode));
  }, [activeKind, billingMode, cpuMin, gpuCountMin, gpuModel, hourlyMax, memoryMin, monthlyMax, offers, query, sortMode, storageMin, vramMin]);

  const pageCount = Math.max(1, Math.ceil(filteredOffers.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageStart = (safePage - 1) * pageSize;
  const visibleOffers = filteredOffers.slice(pageStart, pageStart + pageSize);
  const cheapestVpsPrice = getCheapestPrice(offers, "vps");
  const cheapestGpuPrice = getCheapestPrice(offers, "gpu");

  const activateTab = (kind: CloudOfferKind) => {
    setSelectedKind(kind);
    setSortMode(kind === "gpu" ? "price-asc" : "monthly-asc");
    setPage(1);
    window.history.replaceState(null, "", kind === "gpu" ? "#gpu" : "#vps");
  };

  const updateFilter = <Value extends string>(setter: (value: Value) => void, value: Value) => {
    setter(value);
    setPage(1);
  };

  const resetFilters = () => {
    setQuery("");
    setCpuMin("0");
    setMemoryMin("0");
    setStorageMin("0");
    setMonthlyMax("0");
    setGpuCountMin("0");
    setGpuModel("all");
    setVramMin("0");
    setHourlyMax("0");
    setBillingMode("all");
    setSortMode(activeKind === "gpu" ? "price-asc" : "monthly-asc");
    setPage(1);
  };

  const formattedUpdatedAt = formatUpdatedAt(updatedAt);
  return (
    <main className="border-b border-[var(--color-border)]">
      <section className="mx-auto max-w-[1600px] border-x border-[var(--color-border-soft)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col justify-between gap-4 border-b border-[var(--color-border-soft)] pb-5 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-semibold text-[var(--color-success-text)]">云服务器 / GPU 租赁价格筛选器</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-[var(--color-text-primary)] lg:text-5xl">
              云服务器与 GPU 租赁价格筛选器
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--color-text-muted)]">
              按配置、地区、计费方式和风险快速找到可核验的低价方案；每一行都直接指向对应官网价格页。
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-border-soft)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text-muted)]">
            <Clock3 size={16} />
            <span>最近更新：{formattedUpdatedAt}</span>
          </div>
        </div>

        <div className="mb-5 grid max-w-3xl gap-3 sm:grid-cols-2" role="tablist" aria-label="云资源类型">
          <CloudTabButton active={activeKind === "vps"} onClick={() => activateTab("vps")} label={`VPS 云服务器 ${tabTotals.vps}`} />
          <CloudTabButton active={activeKind === "gpu"} onClick={() => activateTab("gpu")} label={`GPU 算力租赁 ${tabTotals.gpu}`} />
        </div>

        <div className="mb-5 rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-white p-4 shadow-[var(--shadow-panel)]">
          <div className="grid gap-3 md:grid-cols-[minmax(220px,1.4fr)_repeat(3,minmax(130px,1fr))] xl:grid-cols-[minmax(240px,1.4fr)_repeat(6,minmax(116px,1fr))_90px]">
            <label className="flex min-h-11 items-center rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-white px-3 text-sm">
              <span className="mr-2 text-xs font-bold text-[var(--color-text-soft)]">搜索</span>
              <input
                value={query}
                onChange={(event) => updateFilter(setQuery, event.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-soft)]"
                placeholder={activeKind === "vps" ? "商家 / 产品 / CPU" : "商家 / GPU 型号"}
              />
            </label>
            {activeKind === "vps" ? (
              <>
                <CloudSelectField label="CPU" value={cpuMin} options={vpsCpuOptions} onChange={(value) => updateFilter(setCpuMin, value)} />
                <CloudSelectField label="内存" value={memoryMin} options={vpsMemoryOptions} onChange={(value) => updateFilter(setMemoryMin, value)} />
                <CloudSelectField label="硬盘" value={storageMin} options={storageOptions} onChange={(value) => updateFilter(setStorageMin, value)} />
                <CloudSelectField label="月价" value={monthlyMax} options={monthlyOptions} onChange={(value) => updateFilter(setMonthlyMax, value)} />
              </>
            ) : (
              <>
                <CloudSelectField label="GPU 数" value={gpuCountMin} options={gpuCountOptions} onChange={(value) => updateFilter(setGpuCountMin, value)} />
                <CloudSelectField label="GPU 型号" value={gpuModel} options={gpuModelOptions} onChange={(value) => updateFilter(setGpuModel, value)} />
                <CloudSelectField label="显存" value={vramMin} options={vramOptions} onChange={(value) => updateFilter(setVramMin, value)} />
                <CloudSelectField label="小时价" value={hourlyMax} options={hourlyOptions} onChange={(value) => updateFilter(setHourlyMax, value)} />
                <CloudSelectField label="计费" value={billingMode} options={billingOptions} onChange={(value) => updateFilter(setBillingMode, value)} />
              </>
            )}
            <CloudSelectField label="排序" value={sortMode} options={getSortOptions(activeKind)} onChange={(value) => updateFilter(setSortMode, toSortMode(value, activeKind))} />
            <CloudSelectField label="每页" value={String(pageSize)} options={[["25", "分页 25 条"], ["50", "分页 50 条"], ["100", "分页 100 条"]]} onChange={(value) => {
              setPageSize(toPageSize(value));
              setPage(1);
            }} />
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-4 text-sm font-bold text-[var(--color-text-body)] transition hover:bg-[var(--color-surface-selected)]"
            >
              <RotateCcw size={15} />
              重置
            </button>
          </div>
        </div>

        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{activeKind === "vps" ? "VPS 比价列表" : "GPU 租赁列表"}</h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  当前显示 {visibleOffers.length} 条，筛选后共 {filteredOffers.length} 条，数据库共 {tabTotals[activeKind]} 条。
                </p>
              </div>
              <CloudPagination page={safePage} pageCount={pageCount} onPageChange={setPage} />
            </div>

            <CloudOfferTable offers={visibleOffers} startIndex={pageStart + 1} />

            <div className="mt-5 flex justify-center">
              <CloudPagination page={safePage} pageCount={pageCount} onPageChange={setPage} />
            </div>
          </div>

          <aside className="space-y-4 2xl:sticky 2xl:top-24 2xl:self-start">
            <CloudResultSummary
              activeKind={activeKind}
              filteredCount={filteredOffers.length}
              tabTotals={tabTotals}
              cheapestVpsPrice={cheapestVpsPrice}
              cheapestGpuPrice={cheapestGpuPrice}
            />
            {activeKind === "vps" ? <VpsUpdateRecords records={updateRecords} formattedUpdatedAt={formattedUpdatedAt} /> : null}
          </aside>
        </div>
      </section>
    </main>
  );
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  });
  return formatter.format(date).replace(/\//g, "-");
}

function getCheapestPrice(offers: readonly CloudOffer[], kind: CloudOfferKind) {
  const rows = offers.filter((offer) => offer.kind === kind);
  if (rows.length === 0) return "暂无";
  const cheapest = rows.reduce((best, offer) => {
    const bestPrice = kind === "vps" ? best.monthlyEstimateUsd : best.priceUsd;
    const offerPrice = kind === "vps" ? offer.monthlyEstimateUsd : offer.priceUsd;
    return offerPrice < bestPrice ? offer : best;
  }, rows[0]);
  return cheapest?.priceDisplay ?? "暂无";
}

function CloudResultSummary({
  activeKind,
  filteredCount,
  tabTotals,
  cheapestVpsPrice,
  cheapestGpuPrice,
}: {
  readonly activeKind: CloudOfferKind;
  readonly filteredCount: number;
  readonly tabTotals: Readonly<Record<CloudOfferKind, number>>;
  readonly cheapestVpsPrice: string;
  readonly cheapestGpuPrice: string;
}) {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-white p-5 shadow-[var(--shadow-panel)]">
      <h2 className="text-xl font-bold text-[var(--color-text-primary)]">当前筛选结果</h2>
      <div className="mt-5 space-y-4 text-sm">
        <SummaryMetric label="VPS 云服务器" value={`${tabTotals.vps} 条`} active={activeKind === "vps"} />
        <SummaryMetric label="GPU 算力租赁" value={`${tabTotals.gpu} 条`} active={activeKind === "gpu"} />
      </div>
      <div className="mt-5 border-t border-[var(--color-border-soft)] pt-5 text-sm">
        <SummaryMetric label="当前结果" value={`${filteredCount} 条`} active />
        <SummaryMetric label="最低 VPS 价格" value={cheapestVpsPrice} />
        <SummaryMetric label="最低 GPU 价格" value={cheapestGpuPrice} />
      </div>
      <p className="mt-5 rounded-[var(--radius-card)] bg-[var(--color-warning-bg)] px-4 py-3 text-xs leading-6 text-[var(--color-warning-text)]">
        价格仅作入口参考，购买前必须点「官网直达」核验地区、库存、税费、IPv4、流量和存储费用。
      </p>
    </section>
  );
}

function SummaryMetric({ label, value, active = false }: { readonly label: string; readonly value: string; readonly active?: boolean }) {
  return (
    <p className="flex items-center justify-between gap-4">
      <span className={active ? "font-bold text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"}>{label}</span>
      <span className={active ? "text-lg font-bold text-[var(--color-success-text)]" : "font-bold text-[var(--color-text-primary)]"}>{value}</span>
    </p>
  );
}

function VpsUpdateRecords({
  records,
  formattedUpdatedAt,
}: {
  readonly records: readonly CloudOfferUpdateRecord[];
  readonly formattedUpdatedAt: string;
}) {
  const visibleRecords = records.slice(0, 3);

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-4 py-3 text-xs leading-6 text-[var(--color-text-muted)]">
      <p className="font-bold text-[var(--color-text-primary)]">VPS 更新记录</p>
      {visibleRecords.length > 0 ? (
        <ul className="mt-1 space-y-1">
          {visibleRecords.map((record) => (
            <li key={`${record.generatedAt}-${record.totalOffers}`}>
              {formatUpdatedAt(record.generatedAt)}：入库 {record.totalOffers} 条，其中 VPS {record.vpsOffers} 条、GPU {record.gpuOffers} 条；已解析来源 {record.sources.parsed} 个。
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1">{formattedUpdatedAt}：完成数据抓取入库。后续按每天一次自动更新。</p>
      )}
    </div>
  );
}

function useHashKind(): CloudOfferKind {
  const hash = useSyncExternalStore(subscribeHashChange, getHashSnapshot, getServerHashSnapshot);
  return hash === "#gpu" ? "gpu" : "vps";
}

function subscribeHashChange(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

function getHashSnapshot() {
  return window.location.hash;
}

function getServerHashSnapshot() {
  return "#vps";
}
