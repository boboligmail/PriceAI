import { ArrowRight, Info, ShieldAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { MdxGuide } from "@/lib/mdx-guides";

type GuideBlock = MdxGuide["blocks"][number];

export function GuideBlockRenderer({ blocks }: { blocks: readonly GuideBlock[] }) {
  return (
    <div className="max-w-[78ch] pt-8">
      {blocks.map((block, index) => (
        <GuideBlockView key={index} block={block} />
      ))}
    </div>
  );
}

function GuideBlockView({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case "heading":
      return block.level === 2 ? (
        <h2 className="mt-12 font-serif text-3xl font-semibold tracking-normal text-[#202829]">{renderInline(block.text)}</h2>
      ) : (
        <h3 className="mt-8 text-lg font-semibold text-[#202829]">{renderInline(block.text)}</h3>
      );
    case "paragraph":
      return <p className="mt-4 text-base leading-8 text-[#5a6061]">{renderInline(block.text)}</p>;
    case "list": {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag className={`mt-4 space-y-2 pl-5 text-base leading-8 text-[#5a6061] ${block.ordered ? "list-decimal" : "list-disc"}`}>
          {block.items.map((item, index) => (
            <li key={index} className="pl-1">
              {renderInline(item)}
            </li>
          ))}
        </ListTag>
      );
    }
    case "table":
      return <GuideTable rows={block.rows} />;
    case "code":
      return (
        <pre className="my-6 overflow-x-auto rounded-md bg-[#202829] p-4 text-sm leading-6 text-[#f8f8f8]">
          <code>{block.text}</code>
        </pre>
      );
    case "callout":
      return <GuideCallout title={block.title} variant={block.variant} text={block.text} />;
    case "ctas":
      return (
        <div className="mt-5 flex flex-wrap gap-3">
          {block.ctas.map((cta) => (
            <GuideCta key={`${cta.href}:${cta.label}`} href={cta.href} variant={cta.variant}>
              {cta.label}
            </GuideCta>
          ))}
        </div>
      );
  }
}

function GuideTable({ rows }: { rows: readonly (readonly string[])[] }) {
  const header = rows[0];
  const body = rows.slice(1);
  if (!header) return null;

  return (
    <div className="my-8 overflow-x-auto border-y border-[var(--color-border)]">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <thead className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">
          <tr>
            {header.map((cell, index) => (
              <th key={index} className="border-b border-[var(--color-border)] px-3 py-3 font-semibold">
                {renderInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {body.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-3 align-top leading-7 text-[var(--color-text-muted)]">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GuideCallout({ title, variant, text }: { title: string; variant: string; text: string }) {
  const isWarning = variant === "warning";

  return (
    <div className={`my-7 rounded-md px-4 py-4 ${isWarning ? "bg-[#fff7e8] text-[#7a541b]" : "bg-[#eef3f8] text-[#47657a]"}`}>
      <div className="flex gap-3">
        {isWarning ? <ShieldAlert size={18} className="mt-0.5 shrink-0" /> : <Info size={18} className="mt-0.5 shrink-0" />}
        <div>
          {title ? <p className="font-semibold text-[#202829]">{renderInline(title)}</p> : null}
          <div className={`${title ? "mt-2 " : ""}text-sm leading-7`}>{renderInline(text)}</div>
        </div>
      </div>
    </div>
  );
}

function GuideCta({
  href,
  children,
  variant,
}: {
  href: string;
  children: ReactNode;
  variant: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition ${
        variant === "secondary"
          ? "bg-[#edf0f1] text-[#2d3435] hover:bg-[#dde4e5]"
          : "bg-[#2d3435] text-[#f8f8f8] hover:bg-[#202829]"
      }`}
    >
      {children}
      <ArrowRight size={15} />
    </Link>
  );
}

function renderInline(text: string): ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);

  return tokens.map((token, index) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-[#202829]">
          {token.slice(2, -2)}
        </strong>
      );
    }

    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code key={index} className="rounded bg-[#edf0f1] px-1.5 py-0.5 text-[0.92em] text-[#2d3435]">
          {token.slice(1, -1)}
        </code>
      );
    }

    const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a key={index} href={linkMatch[2]} className="font-semibold text-[#2f7a4b] underline decoration-[#45bf78]/30 underline-offset-4 hover:text-[#202829]">
          {linkMatch[1]}
        </a>
      );
    }

    return token;
  });
}
