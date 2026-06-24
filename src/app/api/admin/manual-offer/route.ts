import { getAdminPasswordFromRequest, upsertRawOffer } from "@/lib/admin";
import { logApiError, safeApiErrorMessage } from "@/lib/api-errors";
import { clearPublicDataCache, refreshPublicApiSnapshots } from "@/lib/data";
import { requireAdminPassword } from "@/lib/env";
import { revalidatePublicOfferPaths } from "@/lib/public-revalidation";
import { z } from "zod";

const schema = z.object({
  sourceName: z.string().min(1),
  sourceUrl: z.string().url(),
  sourceStoreName: z.string().optional(),
  sourceTitle: z.string().min(1),
  price: z.coerce.number().nonnegative().nullable().optional(),
  currency: z.string().default("CNY"),
  status: z.enum(["in_stock", "low_stock", "out_of_stock", "unknown"]).default("unknown"),
  url: z.string().url(),
  tags: z.array(z.string()).optional(),
  stockCount: z.coerce.number().int().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    requireAdminPassword(getAdminPasswordFromRequest(request));
    const payload = schema.parse(await request.json());
    const offer = await upsertRawOffer(payload);
    clearPublicDataCache();
    revalidatePublicOfferPaths();
    const snapshotRefresh = await refreshSnapshotsAfterMutation();

    return Response.json({ ok: true, offer, snapshotRefresh });
  } catch (error) {
    logApiError("admin manual offer", error);
    return Response.json(
      { ok: false, message: safeApiErrorMessage(error, "保存失败。") },
      { status: error instanceof z.ZodError ? 400 : 500 },
    );
  }
}

async function refreshSnapshotsAfterMutation(): Promise<Awaited<ReturnType<typeof refreshPublicApiSnapshots>> | null> {
  try {
    return await refreshPublicApiSnapshots();
  } catch (error) {
    console.warn("admin manual offer: public API snapshot refresh failed", error);
    return null;
  }
}
