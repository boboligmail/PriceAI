import { z } from "zod";
import { createApiProviderSubmission } from "@/lib/api-models-db";

const MAX_BATCH_SIZE = 10;
const BATCH_RATE_LIMIT_PER_HOUR = 30;

const schema = z.object({
  url: z.string().url().max(2048).optional().nullable(),
  urls: z.array(z.string().url().max(2048)).max(MAX_BATCH_SIZE).optional(),
  name: z.string().trim().max(200).optional().nullable(),
  contact: z.string().trim().max(200).optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
  website: z.string().max(200).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());

    if (payload.website) {
      return Response.json({ ok: true });
    }

    const urls = uniqueUrls(payload);
    if (!urls.length) {
      return Response.json({ ok: false, message: "请至少提交一个 API 渠道链接。" }, { status: 400 });
    }

    const submitterIp = getClientIp(request);
    const results = [];

    for (const url of urls) {
      try {
        const result = await createApiProviderSubmission({
          url,
          name: payload.name ?? null,
          contact: payload.contact ?? null,
          notes: payload.notes ?? null,
          submitterIp,
          rateLimitPerHour: urls.length > 1 ? BATCH_RATE_LIMIT_PER_HOUR : undefined,
        });
        if ("ignored" in result) {
          results.push({ url, ok: true, ignored: true });
        } else {
          results.push({ url, ok: true, id: result.id });
        }
      } catch (error) {
        results.push({ url, ok: false, message: getErrorMessage(error) });
      }
    }

    const accepted = results.filter((result) => result.ok).length;
    const failed = results.length - accepted;
    const summary = { accepted, failed, total: results.length };

    if (!accepted) {
      const message = results[0]?.message || "提交失败，请稍后再试。";
      return Response.json({ ok: false, message, results, summary }, { status: getErrorStatus(message) });
    }

    return Response.json({ ok: true, results, summary });
  } catch (error) {
    const message = getErrorMessage(error);
    return Response.json({ ok: false, message }, { status: error instanceof z.ZodError ? 400 : getErrorStatus(message) });
  }
}

function uniqueUrls(payload: z.infer<typeof schema>): string[] {
  const urls = payload.urls?.length ? payload.urls : payload.url ? [payload.url] : [];
  return Array.from(new Set(urls.map((url) => url.trim()).filter(Boolean)));
}

function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip");
}

function getErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) return "提交内容格式不正确，请检查链接。";
  if (error instanceof Error) return error.message;
  return "提交失败。";
}

function getErrorStatus(message: string): number {
  if (message.includes("刚刚被提交过")) return 409;
  if (message.includes("提交过于频繁")) return 429;
  if (message.includes("URL 格式") || message.includes("仅支持")) return 400;
  return 500;
}
