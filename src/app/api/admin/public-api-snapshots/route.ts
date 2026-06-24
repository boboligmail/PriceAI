import { getAdminPasswordFromRequest } from "@/lib/admin";
import { logApiError, safeApiErrorMessage } from "@/lib/api-errors";
import { refreshPublicApiSnapshots } from "@/lib/data";
import { requireAdminOrCronPassword } from "@/lib/env";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    requireAdminOrCronPassword(getAdminPasswordFromRequest(request));
    const result = await refreshPublicApiSnapshots();
    return Response.json({ ok: true, ...result });
  } catch (error) {
    logApiError("admin public api snapshots", error);
    return Response.json(
      { ok: false, message: safeApiErrorMessage(error, "刷新公开 API 快照失败。") },
      { status: 500 },
    );
  }
}
