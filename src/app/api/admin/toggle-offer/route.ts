import { getAdminPasswordFromRequest, setRawOfferHidden } from "@/lib/admin";
import { logApiError, safeApiErrorMessage } from "@/lib/api-errors";
import { clearPublicDataCache, refreshPublicApiSnapshots } from "@/lib/data";
import { requireAdminPassword } from "@/lib/env";
import { revalidatePublicOfferPaths } from "@/lib/public-revalidation";
import { z } from "zod";

const schema = z.object({
  id: z.string().min(1),
  hidden: z.boolean(),
  reason: z.string().max(500).nullable().optional(),
});

export async function POST(request: Request) {
  try {
    requireAdminPassword(getAdminPasswordFromRequest(request));

    const payload = schema.parse(await request.json());
    const result = await setRawOfferHidden(payload);
    clearPublicDataCache();
    revalidatePublicOfferPaths();
    const snapshotRefresh = await refreshSnapshotsAfterMutation();

    return Response.json({ ok: true, ...result, snapshotRefresh });
  } catch (error) {
    logApiError("admin toggle offer", error);
    return Response.json(
      { ok: false, message: safeApiErrorMessage(error, "更新失败。") },
      { status: error instanceof z.ZodError ? 400 : 500 },
    );
  }
}

async function refreshSnapshotsAfterMutation(): Promise<Awaited<ReturnType<typeof refreshPublicApiSnapshots>> | null> {
  try {
    return await refreshPublicApiSnapshots();
  } catch (error) {
    console.warn("admin toggle offer: public API snapshot refresh failed", error);
    return null;
  }
}
