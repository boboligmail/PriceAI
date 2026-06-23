import { NextRequest, NextResponse } from "next/server";
import { priceDataCacheHeaders } from "@/lib/cache-headers";
import { listPublicProductOffers } from "@/lib/data";
import { parseOfferFilterTags } from "@/lib/offer-filter-tags";
import { parsePublicOfferPaginationForRoute } from "@/lib/public-offer-route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const pagination = parsePublicOfferPaginationForRoute(request.nextUrl.searchParams);
  if (pagination instanceof NextResponse) return pagination;

  const result = await listPublicProductOffers(id, {
    ...pagination,
    filterTags: parseOfferFilterTags(request.nextUrl.searchParams.get("tags")),
    query: request.nextUrl.searchParams.get("q"),
    excludeQuery: request.nextUrl.searchParams.get("exclude"),
  });

  return NextResponse.json(result, {
    headers: priceDataCacheHeaders(),
  });
}
