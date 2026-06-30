import Link from "next/link";
import { Cpu, Gauge, Server, ShieldAlert } from "lucide-react";
import { cloudChoiceCards, cloudFilterGroups } from "@/lib/cloud-selector";
import { cloudComparisonSummary } from "@/lib/cloud-comparison";

const pageStats = [
  { label: "VPS 平台", value: cloudComparisonSummary.vpsCount, icon: Server },
  { label: "GPU 平台", value: cloudComparisonSummary.gpuCount, icon: Cpu },
  { label: "数据状态", value: "人工参考价", icon: Gauge },
] as const;

export function CloudChoicePanel() {
  return (
    <>
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-[1500px] border-x border-[var(--color-border-soft)] px-5 py-12 sm:px-8 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-[var(--color-success-text)]">云服务器 / GPU 租赁选择工具</p>
              <h1 className="mt-4 max-w-4xl text-balance font-serif text-[2.2rem] font-semibold leading-tight tracking-normal text-[var(--color-text-primary)] sm:text-5xl">
                先选用途，再选云服务器或 GPU 平台
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--color-text-muted)]">
                不先堆参数。先判断你是要长期在线，还是短期算力；下面直接用商家、价格、配置明细和跳转链接做清单，方便快速扫一遍再去官网核价。
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {cloudChoiceCards.map((card) => (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="group rounded-[1.5rem] bg-[var(--color-panel)] p-5 shadow-[var(--shadow-panel)] ring-1 ring-[var(--color-border-soft)] transition hover:-translate-y-0.5 hover:bg-[var(--color-surface-hover)]"
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-soft)]">{card.subtitle}</span>
                    <strong className="mt-2 block text-xl font-bold text-[var(--color-text-primary)]">{card.title}</strong>
                    <span className="mt-2 block text-sm leading-7 text-[var(--color-text-muted)]">{card.description}</span>
                    <span className="mt-4 inline-flex min-h-10 items-center rounded-full bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-text-on-primary)]">
                      {card.cta}
                    </span>
                  </Link>
                ))}
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
              <p className="rounded-2xl bg-[var(--color-warning-bg)] px-4 py-3 text-xs leading-6 text-[var(--color-warning-text)]">
                这里不是实时最低价榜单。价格是入门参考，真正下单前必须回官网核验地区、库存、税费、备份、流量和关机计费。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-[1500px] border-x border-[var(--color-border-soft)] px-5 py-8 sm:px-8">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--color-text-primary)]">
            <ShieldAlert size={18} className="text-[var(--color-success-text)]" />
            顶部筛选区：先缩小范围，下方按商家列表对比
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {cloudFilterGroups.map((group) => (
              <div key={group.title} className="rounded-[1.5rem] bg-[var(--color-panel)] p-4 shadow-[var(--shadow-panel)] ring-1 ring-[var(--color-border-soft)]">
                <p className="text-xs font-bold text-[var(--color-text-soft)]">{group.title}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.chips.map((chip) => (
                    <span key={chip} className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-text-body)]">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
