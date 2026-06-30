"use client";

import { useMemo, useSyncExternalStore, useState, type ChangeEvent } from "react";
import { CloudOfferTable } from "@/components/cloud/CloudOfferSections";
import type { CloudOffer, CloudOfferKind } from "@/lib/cloud-comparison";
import { getCloudOfferMetrics } from "@/lib/cloud-offer-metrics";

type SortMode = "price-asc" | "monthly-asc" | "cpu-desc" | "memory-desc" | "storage-desc" | "gpu-desc" | "vram-desc" | "provider-asc";

const pageSizeOptions = [25, 50, 100] as const;
const vpsCpuOptions = [["0", "CPU 全部"], ["1", "1 核+"], ["2", "2 核+"], ["4", "4 核+"], ["8", "8 核+"]] as const;
const vpsMemoryOptions = [["0", "内存全部"], ["1", "1 GB+"], ["2", "2 GB+"], ["4", "4 GB+"], ["8", "8 GB+"], ["16", "16 GB+"]] as const;
const storageOptions = [["0", "硬盘全部"], ["20", "20 GB+"], ["40", "40 GB+"], ["80", "80 GB+"], ["160", "160 GB+"], ["512", "512 GB+"]] as const;
const monthlyOptions = [["0", "月价不限"], ["5", "$5 内"], ["10", "$10 内"], ["20", "$20 内"], ["50", "$50 内"]] as const;
const gpuCountOptions = [["0", "GPU 数全部"], ["0.5", "半卡+"], ["1", "1 张+"], ["2", "2 张+"], ["4", "4 张+"], ["8", "8 张+"]] as const;
const vramOptions = [["0", "显存全部"], ["8", "8 GB+"], ["16", "16 GB+"], ["24", "24 GB+"], ["48", "48 GB+"], ["80", "80 GB+"]] as const;
const hourlyOptions = [["0", "小时价不限"], ["0.2", "$0.20 内"], ["0.5", "$0.50 内"], ["1", "$1 内"], ["2", "$2 内"], ["5", "$5 内"]] as const;
const billingOptions = [["all", "计费全部"], ["spot", "Spot"], ["ondemand", "On-demand"], ["reserved", "Reserved"], ["hour", "按小时"], ["month", "按月"]] as const;
const vpsSortOptions: readonly (readonly [SortMode, string])[] = [["monthly-asc", "月价从低到高"], ["cpu-desc", "CPU 从高到低"], ["memory-desc", "内存从高到低"], ["storage-desc", "硬盘从高到低"], ["provider-asc", "商家 A-Z"]];
const gpuSortOptions: readonly (readonly [SortMode, string])[] = [["price-asc", "价格从低到高"], ["vram-desc", "显存从高到低"], ["gpu-desc", "GPU 数从高到低"], ["provider-asc", "商家 A-Z"]];

export function CloudOfferExplorer({
  offers,
  updatedAt,
}: {
  readonly offers: readonly CloudOffer[];
  readonly updatedAt: string;
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
        metrics.vramGb >= Number(vramMin) &&
        (Number(hourlyMax) === 0 || offer.priceUsd <= Number(hourlyMax)) &&
        matchesBilling(offer.billing, billingMode)
      );
    });

    return [...rows].sort((left, right) => compareOffers(left, right, sortMode));
  }, [activeKind, billingMode, cpuMin, gpuCountMin, hourlyMax, memoryMin, monthlyMax, offers, query, sortMode, storageMin, vramMin]);

  const pageCount = Math.max(1, Math.ceil(filteredOffers.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageStart = (safePage - 1) * pageSize;
  const visibleOffers = filteredOffers.slice(pageStart, pageStart + pageSize);

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

  return (
    <main className="border-b border-[var(--color-border)]">
      <section className="mx-auto max-w-[1500px] border-x border-[var(--color-border-soft)] px-5 py-8 sm:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-[var(--color-success-text)]">云服务器 / GPU 租赁选择工具</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold text-[var(--color-text-primary)]">先筛配置，再看价格和链接</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-text-muted)]">
              默认展示全部入库结果；用 CPU、内存、硬盘、显存和预算筛掉不合适的低配项，再点每行的核验/进入查看对应价格来源。
            </p>
          </div>
          <div className="rounded-[1.25rem] bg-[var(--color-warning-bg)] px-4 py-3 text-xs leading-6 text-[var(--color-warning-text)]">
            数据不是实时成交价。下单前必须核验地区、库存、税费、IPv4、流量和存储费用。更新日期：{updatedAt}
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="云资源类型">
          <TabButton active={activeKind === "vps"} onClick={() => activateTab("vps")} label={`VPS ${tabTotals.vps}`} />
          <TabButton active={activeKind === "gpu"} onClick={() => activateTab("gpu")} label={`GPU ${tabTotals.gpu}`} />
        </div>

        <div className="mb-6 rounded-[1.5rem] bg-[var(--color-panel)] p-4 shadow-[var(--shadow-panel)] ring-1 ring-[var(--color-border-soft)]">
          <div className="grid gap-3 md:grid-cols-[minmax(220px,1.4fr)_repeat(3,minmax(130px,1fr))] xl:grid-cols-[minmax(260px,1.5fr)_repeat(6,minmax(120px,1fr))]">
            <label className="flex min-h-11 items-center rounded-full bg-white px-4 text-sm ring-1 ring-[var(--color-border-soft)]">
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
                <SelectField label="CPU" value={cpuMin} options={vpsCpuOptions} onChange={(value) => updateFilter(setCpuMin, value)} />
                <SelectField label="内存" value={memoryMin} options={vpsMemoryOptions} onChange={(value) => updateFilter(setMemoryMin, value)} />
                <SelectField label="硬盘" value={storageMin} options={storageOptions} onChange={(value) => updateFilter(setStorageMin, value)} />
                <SelectField label="月价" value={monthlyMax} options={monthlyOptions} onChange={(value) => updateFilter(setMonthlyMax, value)} />
              </>
            ) : (
              <>
                <SelectField label="GPU 数" value={gpuCountMin} options={gpuCountOptions} onChange={(value) => updateFilter(setGpuCountMin, value)} />
                <SelectField label="显存" value={vramMin} options={vramOptions} onChange={(value) => updateFilter(setVramMin, value)} />
                <SelectField label="小时价" value={hourlyMax} options={hourlyOptions} onChange={(value) => updateFilter(setHourlyMax, value)} />
                <SelectField label="计费" value={billingMode} options={billingOptions} onChange={(value) => updateFilter(setBillingMode, value)} />
              </>
            )}
            <SelectField label="排序" value={sortMode} options={getSortOptions(activeKind)} onChange={(value) => updateFilter(setSortMode, toSortMode(value, activeKind))} />
            <SelectField label="每页" value={String(pageSize)} options={[["25", "分页 25 条"], ["50", "分页 50 条"], ["100", "分页 100 条"]]} onChange={(value) => {
              setPageSize(toPageSize(value));
              setPage(1);
            }} />
          </div>
        </div>

        <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{activeKind === "vps" ? "VPS 全量列表" : "GPU 全量列表"}</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              当前显示 {visibleOffers.length} 条，筛选后共 {filteredOffers.length} 条，数据库共 {tabTotals[activeKind]} 条。
            </p>
          </div>
          <Pagination page={safePage} pageCount={pageCount} onPageChange={setPage} />
        </div>

        <CloudOfferTable offers={visibleOffers} />

        <div className="mt-5 flex justify-end">
          <Pagination page={safePage} pageCount={pageCount} onPageChange={setPage} />
        </div>
      </section>
    </main>
  );
}

function TabButton({ active, label, onClick }: { readonly active: boolean; readonly label: string; readonly onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-full px-5 py-3 text-sm font-bold transition ${active ? "bg-[var(--color-primary)] text-[var(--color-text-on-primary)]" : "bg-[var(--color-surface)] text-[var(--color-text-body)] hover:bg-[var(--color-surface-selected)]"}`}
    >
      {label}
    </button>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly options: readonly (readonly [string, string])[];
  readonly onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-h-11 items-center rounded-full bg-white px-4 text-sm ring-1 ring-[var(--color-border-soft)]">
      <span className="mr-2 shrink-0 text-xs font-bold text-[var(--color-text-soft)]">{label}</span>
      <select value={value} onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)} className="w-full bg-transparent text-sm font-semibold outline-none">
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function Pagination({ page, pageCount, onPageChange }: { readonly page: number; readonly pageCount: number; readonly onPageChange: (page: number) => void }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="rounded-full bg-[var(--color-surface)] px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-40">
        上一页
      </button>
      <span className="min-w-24 text-center text-xs font-bold text-[var(--color-text-muted)]">
        第 {page} / {pageCount} 页
      </span>
      <button type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} className="rounded-full bg-[var(--color-surface)] px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-40">
        下一页
      </button>
    </div>
  );
}

function matchesBilling(billing: string, mode: string) {
  return mode === "all" || billing.toLowerCase().includes(mode);
}

function compareOffers(left: CloudOffer, right: CloudOffer, sortMode: SortMode) {
  const leftMetrics = getCloudOfferMetrics(left);
  const rightMetrics = getCloudOfferMetrics(right);

  if (sortMode === "provider-asc") return left.provider.localeCompare(right.provider);
  if (sortMode === "monthly-asc") return left.monthlyEstimateUsd - right.monthlyEstimateUsd;
  if (sortMode === "cpu-desc") return rightMetrics.cpuCores - leftMetrics.cpuCores;
  if (sortMode === "memory-desc") return rightMetrics.memoryGb - leftMetrics.memoryGb;
  if (sortMode === "storage-desc") return rightMetrics.storageGb - leftMetrics.storageGb;
  if (sortMode === "gpu-desc") return rightMetrics.gpuCount - leftMetrics.gpuCount;
  if (sortMode === "vram-desc") return rightMetrics.vramGb - leftMetrics.vramGb;
  return left.priceUsd - right.priceUsd;
}

function getSortOptions(kind: CloudOfferKind): readonly (readonly [SortMode, string])[] {
  return kind === "gpu" ? gpuSortOptions : vpsSortOptions;
}

function toSortMode(value: string, kind: CloudOfferKind): SortMode {
  for (const [optionValue] of getSortOptions(kind)) {
    if (optionValue === value) return optionValue;
  }
  return kind === "gpu" ? "price-asc" : "monthly-asc";
}

function toPageSize(value: string) {
  const parsed = Number(value);
  for (const option of pageSizeOptions) {
    if (option === parsed) return option;
  }
  return 25;
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
