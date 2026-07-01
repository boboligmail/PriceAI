import type { ChangeEvent } from "react";

export function CloudTabButton({
  active,
  label,
  onClick,
}: {
  readonly active: boolean;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`min-h-16 rounded-[var(--radius-card)] border px-6 text-base font-bold transition ${
        active
          ? "border-[var(--color-success-text)] bg-[var(--color-success-bg)] text-[var(--color-success-text)]"
          : "border-[var(--color-border-soft)] bg-white text-[var(--color-text-body)] hover:bg-[var(--color-surface)]"
      }`}
    >
      {label}
    </button>
  );
}

export function CloudSelectField({
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
    <label className="flex min-h-11 items-center rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-white px-3 text-sm">
      <span className="mr-2 shrink-0 text-xs font-bold text-[var(--color-text-soft)]">{label}</span>
      <select
        value={value}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)}
        className="w-full bg-transparent text-sm font-semibold outline-none"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CloudPagination({
  page,
  pageCount,
  onPageChange,
}: {
  readonly page: number;
  readonly pageCount: number;
  readonly onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-[var(--radius-card)] bg-[var(--color-surface)] px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      >
        上一页
      </button>
      <span className="min-w-24 text-center text-xs font-bold text-[var(--color-text-muted)]">
        第 {page} / {pageCount} 页
      </span>
      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        className="rounded-[var(--radius-card)] bg-[var(--color-surface)] px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      >
        下一页
      </button>
    </div>
  );
}
