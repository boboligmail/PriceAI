"use client";

import { type FormEvent, type ReactNode, useMemo, useRef, useState } from "react";
import {
  Clock3,
  Fingerprint,
  KeyRound,
  Link2,
  LockKeyhole,
  Network,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";

type DetectorProtocol = "openai" | "claude" | "gemini";
type DetectorMode = "quick" | "standard" | "deep";
type UpstreamType =
  | "unknown"
  | "official_api"
  | "official_cloud"
  | "subscription_pool"
  | "kiro_claude_code"
  | "reverse_client"
  | "mixed_pool";

type EvidenceTone = "pending" | "ready" | "muted" | "warn";
type TaskStatus = "idle" | "preview" | "submitting" | "running" | "done" | "error";

interface DetectorStatusPayload {
  job_id?: string;
  status?: "queued" | "running" | "done" | "error";
  status_url?: string;
  result_url?: string;
  image_url?: string;
  json_url?: string;
  error?: string;
  detail?: string;
}

interface DetectorClientProps {
  serviceUrl?: string;
}

const protocolOptions: Array<{ value: DetectorProtocol; label: string; hint: string }> = [
  { value: "openai", label: "OpenAI 兼容", hint: "/v1/chat/completions" },
  { value: "claude", label: "Claude / Anthropic", hint: "/v1/messages" },
  { value: "gemini", label: "Gemini", hint: "generateContent" },
];

const modeOptions: Array<{ value: DetectorMode; label: string; hint: string }> = [
  { value: "quick", label: "快速", hint: "协议、模型、用量" },
  { value: "standard", label: "标准", hint: "加入基线和能力探针" },
  { value: "deep", label: "深度", hint: "多轮、长上下文、稳定性" },
];

const upstreamOptions: Array<{ value: UpstreamType; label: string }> = [
  { value: "unknown", label: "暂不确定" },
  { value: "official_api", label: "官方 API 转发" },
  { value: "official_cloud", label: "Bedrock / Vertex 等官方云" },
  { value: "subscription_pool", label: "订阅账号池" },
  { value: "kiro_claude_code", label: "Kiro / Claude Code 账号转 API" },
  { value: "reverse_client", label: "客户端逆向" },
  { value: "mixed_pool", label: "混合线路" },
];

const protocolDefaultModel: Record<DetectorProtocol, string> = {
  openai: "gpt-4o-mini",
  claude: "claude-3-5-sonnet-20241022",
  gemini: "gemini-1.5-pro",
};

const protocolBaseHint: Record<DetectorProtocol, string> = {
  openai: "https://example.com/v1",
  claude: "https://example.com",
  gemini: "https://example.com/v1beta",
};

const upstreamRiskCopy: Record<UpstreamType, string> = {
  unknown: "先按未知来源处理，报告会降低结论强度。",
  official_api: "重点核验模型能力、Token 用量和响应头是否接近官方。",
  official_cloud: "需要区分云厂商网关特征，不应简单判为假模型。",
  subscription_pool: "重点观察上下文限制、并发限制和账号池波动。",
  kiro_claude_code: "需要关注 Claude Code / Kiro 类账号通道的限额、封禁和上下文差异。",
  reverse_client: "风险最高，通常要加强稳定性、限流和异常响应检测。",
  mixed_pool: "需要多次采样，不同请求可能命中不同上游。",
};

export function TransitDetectorClient({ serviceUrl = "" }: DetectorClientProps) {
  const runIdRef = useRef(0);
  const [protocol, setProtocol] = useState<DetectorProtocol>("claude");
  const [mode, setMode] = useState<DetectorMode>("standard");
  const [upstream, setUpstream] = useState<UpstreamType>("unknown");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState(protocolDefaultModel.claude);
  const [apiKey, setApiKey] = useState("");
  const [tokenAudit, setTokenAudit] = useState(true);
  const [baselineCompare, setBaselineCompare] = useState(true);
  const [longContext, setLongContext] = useState(false);
  const [publicReport, setPublicReport] = useState(false);
  const [previewGeneratedAt, setPreviewGeneratedAt] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("idle");
  const [taskMessage, setTaskMessage] = useState("后端未连接时只生成报告结构预览。");
  const [jobId, setJobId] = useState("");
  const [resultUrl, setResultUrl] = useState("");

  const normalizedServiceUrl = serviceUrl.trim().replace(/\/$/, "");
  const canSubmit = normalizedServiceUrl
    ? Boolean(baseUrl.trim() && apiKey.trim() && model.trim())
    : Boolean(baseUrl.trim() || apiKey.trim() || model.trim());
  const reportRows = useMemo(
    () => [
      {
        label: "协议外壳",
        value: protocolOptions.find((item) => item.value === protocol)?.label ?? "未知协议",
        detail: "检查接口路径、认证方式、错误结构、流式输出。",
        tone: "ready" as EvidenceTone,
      },
      {
        label: "模型能力",
        value: model || protocolDefaultModel[protocol],
        detail: "用短问答、工具调用、视觉或长上下文探针确认真实能力边界。",
        tone: previewGeneratedAt ? ("pending" as EvidenceTone) : ("muted" as EvidenceTone),
      },
      {
        label: "官方基线",
        value: baselineCompare ? "开启" : "关闭",
        detail: baselineCompare ? "同题对照官方或可信基线，比较拒答、格式和能力特征。" : "跳过官方同题对照，只保留本线路证据。",
        tone: baselineCompare ? ("pending" as EvidenceTone) : ("muted" as EvidenceTone),
      },
      {
        label: "来源识别",
        value: upstreamOptions.find((item) => item.value === upstream)?.label ?? "暂不确定",
        detail: upstreamRiskCopy[upstream],
        tone: upstream === "reverse_client" ? ("warn" as EvidenceTone) : ("pending" as EvidenceTone),
      },
      {
        label: "检测强度",
        value: modeOptions.find((item) => item.value === mode)?.label ?? "标准",
        detail: modeOptions.find((item) => item.value === mode)?.hint ?? "加入基线和能力探针。",
        tone: "ready" as EvidenceTone,
      },
      {
        label: "Token 用量",
        value: tokenAudit ? "审计" : "不审计",
        detail: tokenAudit ? "比较请求、响应和账单口径，识别虚标、四舍五入或额外倍率。" : "不做计费口径核验。",
        tone: tokenAudit ? ("pending" as EvidenceTone) : ("muted" as EvidenceTone),
      },
      {
        label: "长上下文",
        value: longContext ? "开启" : "关闭",
        detail: longContext ? "用阶梯长度测试观察截断、降级和隐藏上下文上限。" : "先不消耗长上下文额度。",
        tone: longContext ? ("pending" as EvidenceTone) : ("muted" as EvidenceTone),
      },
    ],
    [baselineCompare, longContext, mode, model, previewGeneratedAt, protocol, tokenAudit, upstream],
  );

  function handleProtocolChange(nextProtocol: DetectorProtocol) {
    setProtocol(nextProtocol);
    setModel(protocolDefaultModel[nextProtocol]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextRunId = runIdRef.current + 1;
    runIdRef.current = nextRunId;
    setPreviewGeneratedAt(new Date().toLocaleString("zh-CN", { hour12: false }));
    setResultUrl("");
    setJobId("");

    if (!normalizedServiceUrl) {
      setTaskStatus("preview");
      setTaskMessage("当前未配置检测服务地址，因此只生成本地报告结构预览。");
      return;
    }

    setTaskStatus("submitting");
    setTaskMessage("正在提交到独立检测后端...");

    try {
      const payload = new FormData();
      payload.set("base_url", baseUrl.trim());
      payload.set("api_key", apiKey.trim());
      payload.set("model", model.trim());
      payload.set("mode", mode === "deep" ? "full" : mode);
      if (protocol !== "gemini") {
        payload.set("include_long_context", longContext ? "true" : "false");
        payload.set("include_long_context_extreme", "false");
      }

      const endpointProtocol = protocol === "claude" ? "claude" : protocol;
      const response = await fetch(`${normalizedServiceUrl}/api/detect/${endpointProtocol}`, {
        method: "POST",
        body: payload,
      });
      const data = (await response.json().catch(() => ({}))) as DetectorStatusPayload;
      if (!response.ok) {
        throw new Error(data.detail || data.error || "检测后端拒绝了这次请求。");
      }
      if (!data.job_id || !data.status_url) {
        throw new Error("检测后端没有返回任务编号。");
      }
      if (runIdRef.current !== nextRunId) return;

      setJobId(data.job_id);
      setTaskStatus("running");
      setTaskMessage("检测任务已创建，正在等待报告返回...");
      await pollDetectorJob(data.status_url, nextRunId);
    } catch (error) {
      if (runIdRef.current !== nextRunId) return;
      setTaskStatus("error");
      setTaskMessage(error instanceof Error ? error.message : "检测提交失败，请稍后再试。");
    }
  }

  async function pollDetectorJob(statusUrl: string, runId: number) {
    const statusEndpoint = statusUrl.startsWith("http") ? statusUrl : `${normalizedServiceUrl}${statusUrl}`;

    for (let attempt = 0; attempt < 90; attempt += 1) {
      await sleep(attempt < 3 ? 1000 : 2500);
      if (runIdRef.current !== runId) return;

      const response = await fetch(statusEndpoint, { cache: "no-store" });
      const data = (await response.json().catch(() => ({}))) as DetectorStatusPayload;
      if (!response.ok) {
        throw new Error(data.detail || data.error || "读取检测状态失败。");
      }

      if (data.status === "done") {
        const nextResultUrl = data.result_url
          ? data.result_url.startsWith("http")
            ? data.result_url
            : `${normalizedServiceUrl}${data.result_url}`
          : "";
        if (runIdRef.current !== runId) return;
        setTaskStatus("done");
        setTaskMessage("检测完成，报告已经返回。");
        setResultUrl(nextResultUrl);
        return;
      }

      if (data.status === "error") {
        throw new Error(data.error || "检测任务失败。");
      }

      if (runIdRef.current === runId) {
        setTaskStatus(data.status === "queued" ? "submitting" : "running");
        setTaskMessage(data.status === "queued" ? "任务排队中..." : "检测运行中，通常需要 30 到 90 秒。");
      }
    }

    throw new Error("检测等待超时，稍后可用任务编号查询报告。");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(440px,0.58fr)]">
      <section className="rounded-lg bg-white ring-1 ring-[#adb3b4]/15">
        <div className="border-b border-[#edf0f1] px-5 py-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#45bf78]">Detector Console</p>
              <h2 className="mt-1 text-lg font-semibold text-[#202829]">创建一次检测任务</h2>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f2f4f4] px-3 py-1.5 text-xs font-semibold text-[#5a6061]">
              <LockKeyhole className="h-3.5 w-3.5" />
              Key 仅发往检测后端
            </div>
          </div>
        </div>

        <form className="space-y-5 px-5 py-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#202829]">接口协议</label>
            <div className="grid gap-2 md:grid-cols-3">
              {protocolOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleProtocolChange(item.value)}
                  className={`min-h-20 rounded-lg border px-3 py-3 text-left transition ${
                    protocol === item.value
                      ? "border-[#45bf78]/60 bg-[#edf8f1] text-[#202829]"
                      : "border-[#dfe4e5] bg-[#f9f9f9] text-[#5a6061] hover:border-[#adb3b4]"
                  }`}
                >
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="mt-1 block break-all text-xs leading-5">{item.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.45fr)]">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#202829]">Base URL</span>
              <input
                value={baseUrl}
                onChange={(event) => setBaseUrl(event.target.value)}
                placeholder={protocolBaseHint[protocol]}
                className="h-11 w-full rounded-lg border border-[#dfe4e5] bg-white px-3 text-sm text-[#202829] outline-none transition placeholder:text-[#adb3b4] focus:border-[#45bf78]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#202829]">模型名</span>
              <input
                value={model}
                onChange={(event) => setModel(event.target.value)}
                className="h-11 w-full rounded-lg border border-[#dfe4e5] bg-white px-3 text-sm text-[#202829] outline-none transition focus:border-[#45bf78]"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.45fr)]">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#202829]">检测 Key</span>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#adb3b4]" />
                <input
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  type="password"
                  autoComplete="off"
                  placeholder="建议使用低余额、可撤销的临时 Key"
                  className="h-11 w-full rounded-lg border border-[#dfe4e5] bg-white pl-9 pr-3 text-sm text-[#202829] outline-none transition placeholder:text-[#adb3b4] focus:border-[#45bf78]"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#202829]">自报来源</span>
              <select
                value={upstream}
                onChange={(event) => setUpstream(event.target.value as UpstreamType)}
                className="h-11 w-full rounded-lg border border-[#dfe4e5] bg-white px-3 text-sm font-medium text-[#202829] outline-none transition focus:border-[#45bf78]"
              >
                {upstreamOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#202829]">检测强度</label>
            <div className="grid gap-2 md:grid-cols-3">
              {modeOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMode(item.value)}
                  className={`rounded-lg border px-3 py-3 text-left transition ${
                    mode === item.value
                      ? "border-[#45bf78]/60 bg-[#edf8f1] text-[#202829]"
                      : "border-[#dfe4e5] bg-[#f9f9f9] text-[#5a6061] hover:border-[#adb3b4]"
                  }`}
                >
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5">{item.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <ToggleRow checked={tokenAudit} onChange={setTokenAudit} label="Token 与计费审计" />
            <ToggleRow checked={baselineCompare} onChange={setBaselineCompare} label="官方基线同题对照" />
            <ToggleRow checked={longContext} onChange={setLongContext} label="长上下文阶梯测试" />
            <ToggleRow checked={publicReport} onChange={setPublicReport} label="允许生成公开报告" />
          </div>

          <div className="flex flex-col gap-3 border-t border-[#edf0f1] pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-xs leading-5 text-[#5a6061]">
              当前页面先完成前端和任务结构。真实检测会接入独立后端，PriceAI 主站不保存你的 API Key。
            </p>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#202829] px-5 text-sm font-semibold text-white transition hover:bg-[#2d3435] disabled:cursor-not-allowed disabled:bg-[#adb3b4]"
              disabled={!canSubmit || taskStatus === "submitting" || taskStatus === "running"}
            >
              <SlidersHorizontal className="h-4 w-4" />
              生成报告预览
            </button>
          </div>
        </form>
      </section>

      <aside className="space-y-5">
        <section className="rounded-lg bg-white ring-1 ring-[#adb3b4]/15">
          <div className="border-b border-[#edf0f1] px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#45bf78]">Report Preview</p>
                <h2 className="mt-1 text-lg font-semibold text-[#202829]">报告证据链</h2>
              </div>
              <StatusPill tone={taskStatus === "done" || taskStatus === "preview" ? "ready" : taskStatus === "error" ? "warn" : "pending"}>
                {statusLabel(taskStatus)}
              </StatusPill>
            </div>
          </div>
          <div className="divide-y divide-[#edf0f1]">
            {reportRows.map((row) => (
              <div key={row.label} className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 px-5 py-4">
                <span className="text-xs font-semibold text-[#5a6061]">{row.label}</span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="min-w-0 break-words text-sm font-semibold text-[#202829]">{row.value}</span>
                    <StatusPill tone={row.tone}>{toneLabel(row.tone)}</StatusPill>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[#5a6061]">{row.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[#edf0f1] px-5 py-4 text-xs leading-5 text-[#5a6061]">
            {previewGeneratedAt ? `更新时间：${previewGeneratedAt}` : "提交后这里只展示报告结构，真实分数和证据要等检测后端返回。"}
          </div>
        </section>

        <section className="rounded-lg bg-white p-5 ring-1 ring-[#adb3b4]/15">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-[#edf8f1] p-2 text-[#278a57]">
              <Network className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-[#202829]">后端对接状态</h2>
              <p className="mt-2 text-sm leading-6 text-[#5a6061]">
                后端会作为独立服务部署，先基于多协议检测项目做 PriceAI fork。主站只负责发起任务、展示结论和公开证据摘要。
              </p>
              <div className="mt-3 rounded-lg bg-[#f2f4f4] px-3 py-2 text-xs font-medium text-[#5a6061]">
                {normalizedServiceUrl ? (
                  <span className="break-all">已配置：{normalizedServiceUrl}</span>
                ) : (
                  <span>待配置：NEXT_PUBLIC_TRANSIT_DETECTOR_API_BASE_URL</span>
                )}
              </div>
              <div className="mt-3 rounded-lg border border-[#dfe4e5] px-3 py-3 text-xs leading-5 text-[#5a6061]">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-[#202829]">任务状态</span>
                  <StatusPill tone={taskStatus === "done" || taskStatus === "preview" ? "ready" : taskStatus === "error" ? "warn" : "pending"}>
                    {statusLabel(taskStatus)}
                  </StatusPill>
                </div>
                <p className="mt-2">{taskMessage}</p>
                {jobId ? <p className="mt-1 break-all">Job ID：{jobId}</p> : null}
                {resultUrl ? (
                  <a
                    href={resultUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex font-semibold text-[#278a57] hover:text-[#202829]"
                  >
                    打开检测报告
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg bg-white p-5 ring-1 ring-[#adb3b4]/15">
          <h2 className="text-base font-semibold text-[#202829]">检测口径</h2>
          <div className="mt-4 space-y-3">
            <PrincipleItem icon={<Fingerprint className="h-4 w-4" />} title="能力指纹" text="用能力边界和协议细节判断是否只是套壳。" />
            <PrincipleItem icon={<Link2 className="h-4 w-4" />} title="同题基线" text="把官方或可信线路作为参照，而不是只看一次回答像不像。" />
            <PrincipleItem icon={<ShieldAlert className="h-4 w-4" />} title="来源风险" text="官方 API、云厂商、账号池、逆向线路要分开打标签。" />
            <PrincipleItem icon={<Clock3 className="h-4 w-4" />} title="多次采样" text="混合池和账号池需要重复请求，单次结果不能下结论。" />
          </div>
        </section>
      </aside>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function ToggleRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-lg border border-[#dfe4e5] bg-[#f9f9f9] px-3 py-2 text-sm font-semibold text-[#202829]">
      <span className="min-w-0">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[#45bf78]"
      />
    </label>
  );
}

function StatusPill({ tone, children }: { tone: EvidenceTone; children: string }) {
  const className =
    tone === "ready"
      ? "bg-[#edf8f1] text-[#278a57] ring-[#45bf78]/20"
      : tone === "warn"
        ? "bg-[#fff6e8] text-[#9a5b00] ring-[#e7b65d]/30"
        : tone === "muted"
          ? "bg-[#f2f4f4] text-[#5a6061] ring-[#dfe4e5]"
          : "bg-[#eef3f4] text-[#41666b] ring-[#c9d8da]";

  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2 text-[0.68rem] font-semibold ring-1 ${className}`}>
      {children}
    </span>
  );
}

function toneLabel(tone: EvidenceTone) {
  if (tone === "ready") return "已配置";
  if (tone === "warn") return "高风险";
  if (tone === "muted") return "可选";
  return "待检测";
}

function statusLabel(status: TaskStatus) {
  if (status === "preview") return "预览";
  if (status === "submitting") return "提交中";
  if (status === "running") return "检测中";
  if (status === "done") return "完成";
  if (status === "error") return "失败";
  return "待接入";
}

function PrincipleItem({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-[#45bf78]">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-[#202829]">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-[#5a6061]">{text}</p>
      </div>
    </div>
  );
}
