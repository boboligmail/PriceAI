import "server-only";

import {
  officialPriceApps,
  officialPriceFxSummary,
  officialPriceGeneratedAt,
  staticOfficialPricesDataset,
  type OfficialPriceApp,
  type OfficialPriceAppSlug,
  type OfficialPriceFxSummary,
  type OfficialPricePlan,
  type OfficialPriceRow,
  type OfficialPricesDataset,
} from "@/lib/official-prices";
import { getSupabaseServerClient } from "@/lib/supabase";

type DbRow = Record<string, unknown>;

const OFFICIAL_PRICE_CACHE_TTL_MS = 30_000;

let officialPriceCache: { expiresAt: number; value: OfficialPricesDataset } | null = null;
let officialPricePromise: Promise<OfficialPricesDataset> | null = null;

export function clearOfficialPricesCache() {
  officialPriceCache = null;
  officialPricePromise = null;
}

export async function getOfficialPricesDataset(): Promise<OfficialPricesDataset> {
  const now = Date.now();
  if (officialPriceCache && officialPriceCache.expiresAt > now) {
    return officialPriceCache.value;
  }

  if (officialPricePromise) return officialPricePromise;

  officialPricePromise = readOfficialPricesDataset()
    .then((value) => {
      officialPriceCache = {
        expiresAt: Date.now() + OFFICIAL_PRICE_CACHE_TTL_MS,
        value,
      };
      return value;
    })
    .finally(() => {
      officialPricePromise = null;
    });

  return officialPricePromise;
}

async function readOfficialPricesDataset(): Promise<OfficialPricesDataset> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return staticOfficialPricesDataset;

  try {
    const [appsResult, regionsResult] = await Promise.all([
      supabase
        .from("official_subscription_apps")
        .select("id,slug,display_name,provider,app_store_id,app_store_slug,enabled,sort_order,updated_at")
        .eq("enabled", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("official_subscription_regions")
        .select("id,country_code,country_label,currency_code,enabled,priority")
        .eq("enabled", true)
        .order("priority", { ascending: true }),
    ]);

    if (appsResult.error || regionsResult.error) {
      throw appsResult.error || regionsResult.error;
    }

    const appRows = dbRows(appsResult.data);
    const regionRows = dbRows(regionsResult.data);
    if (!appRows.length || !regionRows.length) return staticOfficialPricesDataset;

    const appSlugById = new Map<string, OfficialPriceAppSlug>();
    const apps = appRows
      .map((row): OfficialPriceApp | null => {
        const slug = officialAppSlug(row.slug);
        if (!slug) return null;
        appSlugById.set(String(row.id), slug);
        return {
          slug,
          displayName: stringValue(row.display_name),
          provider: stringValue(row.provider),
          appStoreId: stringValue(row.app_store_id),
          appStoreSlug: stringValue(row.app_store_slug),
          summary: officialPriceApps.find((app) => app.slug === slug)?.summary || "",
        };
      })
      .filter((app): app is OfficialPriceApp => Boolean(app));

    const regionById = new Map(
      regionRows.map((row) => [
        String(row.id),
        {
          countryCode: stringValue(row.country_code),
          countryLabel: stringValue(row.country_label),
          currencyCode: stringValue(row.currency_code),
        },
      ]),
    );

    const planRows = await readPlanRows(Array.from(appSlugById.keys()));
    const planKeyById = new Map<string, { appSlug: OfficialPriceAppSlug; planSlug: string }>();
    const plans = planRows
      .map((row): OfficialPricePlan | null => {
        const appSlug = appSlugById.get(String(row.app_id));
        if (!appSlug) return null;

        const plan: OfficialPricePlan = {
          appSlug,
          slug: stringValue(row.slug),
          label: stringValue(row.label),
          billingPeriod: row.billing_period === "annual" ? "annual" : "monthly",
          notes: nullableString(row.notes) || undefined,
        };
        planKeyById.set(String(row.id), { appSlug, planSlug: plan.slug });
        return plan;
      })
      .filter((plan): plan is OfficialPricePlan => Boolean(plan));

    const priceRows = await readCurrentPriceRows();
    const rows = priceRows
      .map((row): OfficialPriceRow | null => {
        const planKey = planKeyById.get(String(row.plan_id));
        const region = regionById.get(String(row.region_id));
        if (!planKey || !region) return null;
        if (row.status !== "available") return null;

        const priceText = nullableString(row.price_text);
        const priceValue = numberValue(row.price_value);
        const cnyPrice = numberValue(row.cny_price);
        const fxRateToCny = numberValue(row.fx_rate_to_cny);
        if (!priceText || priceValue == null || cnyPrice == null || fxRateToCny == null) return null;

        return {
          ...region,
          appSlug: planKey.appSlug,
          planSlug: planKey.planSlug,
          priceText,
          priceValue,
          sourceUrl: stringValue(row.source_url),
          evidenceSource: "app_store_html",
          fetchedAt: stringValue(row.last_success_at || row.last_checked_at || row.updated_at),
          status: "available",
          cnyPrice,
          fxRateToCny,
          fxDate: stringValue(row.fx_date),
        };
      })
      .filter((row): row is OfficialPriceRow => Boolean(row));

    if (!apps.length || !plans.length || !rows.length) return staticOfficialPricesDataset;

    const fxSummary = await readFxSummary(rows);
    const generatedAt = rows.reduce((latest, row) => (row.fetchedAt > latest ? row.fetchedAt : latest), officialPriceGeneratedAt);

    return {
      configured: true,
      source: "supabase",
      generatedAt,
      apps,
      plans,
      rows,
      fxSummary,
    };
  } catch (error) {
    console.warn("Falling back to static official prices because Supabase read failed:", error);
    return {
      ...staticOfficialPricesDataset,
      configured: true,
    };
  }
}

async function readPlanRows(appIds: string[]): Promise<DbRow[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase || !appIds.length) return [];

  const { data, error } = await supabase
    .from("official_subscription_plans")
    .select("id,app_id,slug,label,billing_period,notes,enabled,sort_order")
    .in("app_id", appIds)
    .eq("enabled", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return dbRows(data);
}

async function readCurrentPriceRows(): Promise<DbRow[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("official_subscription_region_prices")
    .select(
      [
        "app_id",
        "plan_id",
        "region_id",
        "price_text",
        "price_value",
        "currency_code",
        "cny_price",
        "fx_rate_to_cny",
        "fx_date",
        "source_url",
        "evidence_source",
        "status",
        "last_success_at",
        "last_checked_at",
        "updated_at",
      ].join(","),
    )
    .eq("status", "available")
    .not("cny_price", "is", null)
    .order("cny_price", { ascending: true });

  if (error) throw error;
  return dbRows(data);
}

async function readFxSummary(rows: OfficialPriceRow[]): Promise<OfficialPriceFxSummary> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return officialPriceFxSummary;

  const latestFxDate = rows.reduce((latest, row) => (row.fxDate > latest ? row.fxDate : latest), "");
  if (!latestFxDate) return officialPriceFxSummary;

  const { data, error } = await supabase
    .from("fx_rates")
    .select("base_currency,target_currency,rate,date,source")
    .eq("date", latestFxDate)
    .order("target_currency", { ascending: true });

  if (error || !data?.length) {
    return {
      ...officialPriceFxSummary,
      date: latestFxDate || officialPriceFxSummary.date,
    };
  }

  const rates = Object.fromEntries(
    dbRows(data).map((row) => [stringValue(row.target_currency), numberValue(row.rate) || 0]),
  );

  return {
    baseCurrency: stringValue(data[0]?.base_currency) || "USD",
    source: stringValue(data[0]?.source) || "Frankfurter",
    sourceUrl: officialPriceFxSummary.sourceUrl,
    date: latestFxDate,
    rates: { USD: 1, ...rates },
  };
}

function dbRows(value: unknown): DbRow[] {
  return Array.isArray(value) ? (value as DbRow[]) : [];
}

function officialAppSlug(value: unknown): OfficialPriceAppSlug | null {
  return value === "chatgpt" || value === "claude" || value === "gemini" || value === "grok"
    ? value
    : null;
}

function stringValue(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

function nullableString(value: unknown): string | null {
  if (value == null) return null;
  const normalized = String(value);
  return normalized ? normalized : null;
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
