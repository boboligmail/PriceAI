import { getAdminPasswordFromRequest } from "@/lib/admin";
import { listAdminOfferMaintenancePage } from "@/lib/data";
import { requireAdminPassword } from "@/lib/env";
import { z } from "zod";

const querySchema = z.object({
  scope: z.enum(["visible", "hidden"]).default("visible"),
  q: z.string().max(200).optional().default(""),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: Request) {
  try {
    requireAdminPassword(getAdminPasswordFromRequest(request));

    const url = new URL(request.url);
    const input = querySchema.parse({
      scope: url.searchParams.get("scope") || undefined,
      q: url.searchParams.get("q") || undefined,
      limit: url.searchParams.get("limit") || undefined,
      offset: url.searchParams.get("offset") || undefined,
    });
    const page = await listAdminOfferMaintenancePage({
      scope: input.scope,
      query: input.q,
      limit: input.limit,
      offset: input.offset,
    });

    return Response.json({ ok: true, ...page });
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : "读取报价失败。" },
      { status: error instanceof z.ZodError ? 400 : 500 },
    );
  }
}
