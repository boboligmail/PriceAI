const DEFAULT_BASE_URL = "https://priceai.cc";

const baseUrl = normalizeBaseUrl(
  process.argv[2] || process.env.CLOUDFLARE_SMOKE_BASE_URL || DEFAULT_BASE_URL,
);
const baseHost = new URL(baseUrl).host;
const allowHostChange = process.env.PRICEAI_SMOKE_ALLOW_HOST_CHANGE === "1";

const fallbackHtmlMarkers = [
  "当前使用内置演示数据",
  "配置 Supabase",
  "数据加载遇到问题",
  "01/01 08:00",
  "2026-01-01T00:00:00.000Z",
  '"configured":false',
  '\\"configured\\":false',
  '"offerTotal":10',
  '\\"offerTotal\\":10',
];

const staticDatasetMarkers = [
  '"source":"static"',
  '\\"source\\":\\"static\\"',
  "source=static",
  "数据源：静态样本",
];

const checks = [
  {
    path: "/",
    status: 200,
    maxBytes: 350_000,
    assets: true,
    text: {
      forbidden: fallbackHtmlMarkers,
      requiredAny: [{ label: "configured=true", patterns: ['"configured":true', '\\"configured\\":true'] }],
    },
  },
  {
    path: "/official-prices",
    status: 200,
    maxBytes: 400_000,
    assets: true,
    text: {
      forbidden: [...fallbackHtmlMarkers, ...staticDatasetMarkers],
      requiredAny: [{ label: "source=supabase", patterns: ['"source":"supabase"', '\\"source\\":\\"supabase\\"'] }],
    },
  },
  {
    path: "/official-prices/chatgpt__plus-monthly",
    status: 200,
    maxBytes: 320_000,
    assets: true,
    text: {
      forbidden: [...fallbackHtmlMarkers, ...staticDatasetMarkers],
    },
  },
  {
    path: "/api-models",
    status: 200,
    maxBytes: 280_000,
    assets: true,
    text: {
      forbidden: [...fallbackHtmlMarkers, ...staticDatasetMarkers],
      requiredAny: [{ label: "source=supabase", patterns: ['"source":"supabase"', '\\"source\\":\\"supabase\\"'] }],
    },
  },
  {
    path: "/guides",
    status: 200,
    maxBytes: 180_000,
    assets: true,
    text: {
      forbidden: [...fallbackHtmlMarkers, ...staticDatasetMarkers],
    },
  },
  {
    path: "/guides/are-ai-subscription-card-shops-reliable",
    status: 200,
    maxBytes: 180_000,
    assets: true,
    text: {
      forbidden: [...fallbackHtmlMarkers, ...staticDatasetMarkers],
    },
  },
  {
    path: "/api/health",
    status: 200,
    maxBytes: 5_000,
    json: validateHealthJson,
  },
  {
    path: "/api/explorer",
    status: 200,
    maxBytes: 120_000,
    cache: true,
    json: validateExplorerJson,
  },
  {
    path: "/api/offers?limit=80",
    status: 200,
    maxBytes: 140_000,
    cache: true,
    json: validateOffersJson,
  },
  { path: "/api/products/chatgpt-plus/offers?limit=80", status: 200, maxBytes: 140_000, cache: true },
  { path: "/api/cron/collect-prices", status: 401, maxBytes: 5_000 },
  { path: "/api/cron/official-prices", status: 401, maxBytes: 5_000 },
  { path: "/robots.txt", status: 200, maxBytes: 5_000 },
  { path: "/sitemap.xml", status: 200, maxBytes: 80_000 },
];

let failures = 0;
console.log(`Cloudflare smoke base: ${baseUrl}`);

for (const check of checks) {
  const url = new URL(check.path, baseUrl);
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      redirect: "manual",
      headers: {
        "user-agent": "PriceAI Cloudflare smoke check",
      },
    });
    const body = await response.arrayBuffer();
    const bytes = body.byteLength;
    const text = check.text || check.json || check.assets ? new TextDecoder().decode(body) : "";
    const elapsed = Date.now() - startedAt;
    const cacheHeader =
      response.headers.get("cloudflare-cdn-cache-control") ||
      response.headers.get("cdn-cache-control") ||
      response.headers.get("cache-control") ||
      "";
    const location = response.headers.get("location");
    const locationHost = location ? new URL(location, url).host : null;

    const statusOk = response.status === check.status;
    const sizeOk = bytes <= check.maxBytes;
    const cacheOk = !check.cache || /s-maxage|max-age/i.test(cacheHeader);
    const redirectOk =
      response.status < 300 ||
      response.status >= 400 ||
      (allowHostChange ? true : locationHost === null || locationHost === baseHost);
    const textFailures = check.text ? validateText(text, check.text) : [];
    const jsonFailures = check.json ? validateJson(text, check.json) : [];
    const assetResult = check.assets && statusOk ? await checkHtmlAssets(text, url) : { ok: true, checked: 0 };
    const contentOk = textFailures.length === 0 && jsonFailures.length === 0;
    const ok = statusOk && sizeOk && cacheOk && redirectOk && contentOk && assetResult.ok;

    if (!ok) failures += 1;

    console.log(
      [
        ok ? "ok" : "fail",
        response.status,
        `${bytes}B`,
        `${elapsed}ms`,
        check.path,
        location ? `location=${location}` : "",
        check.cache ? `cache=${cacheHeader || "missing"}` : "",
        !redirectOk ? `redirect-host=${locationHost || "missing"}` : "",
        textFailures.length ? `text=${textFailures.join(";")}` : "",
        jsonFailures.length ? `json=${jsonFailures.join(";")}` : "",
        check.assets ? `assets=${assetResult.checked}${assetResult.ok ? "" : ` bad=${assetResult.badUrl}`}` : "",
      ]
        .filter(Boolean)
        .join(" "),
    );
  } catch (error) {
    failures += 1;
    console.log(`fail error ${check.path} ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures > 0) {
  console.error(`Cloudflare smoke check failed: ${failures} check(s).`);
  process.exitCode = 1;
}

function normalizeBaseUrl(value) {
  const url = new URL(value);
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url.toString();
}

function validateText(text, expectations) {
  const failures = [];

  for (const marker of expectations.forbidden || []) {
    if (text.includes(marker)) {
      failures.push(`forbidden:${marker}`);
    }
  }

  for (const requirement of expectations.requiredAny || []) {
    const matched = requirement.patterns.some((pattern) => text.includes(pattern));
    if (!matched) {
      failures.push(`missing:${requirement.label}`);
    }
  }

  return failures;
}

function validateJson(text, validator) {
  try {
    return validator(JSON.parse(text));
  } catch (error) {
    return [`invalid-json:${error instanceof Error ? error.message : String(error)}`];
  }
}

async function checkHtmlAssets(html, pageUrl) {
  const assets = new Set();
  const patterns = [
    /<script\b[^>]*\bsrc=["']([^"']*\/_next\/static\/[^"']+\.js[^"']*)["'][^>]*>/gi,
    /<link\b[^>]*\bhref=["']([^"']*\/_next\/static\/[^"']+\.(?:css|js)[^"']*)["'][^>]*>/gi,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      assets.add(new URL(match[1], pageUrl).toString());
    }
  }

  for (const assetUrl of assets) {
    const response = await fetch(assetUrl, {
      redirect: "manual",
      headers: {
        "user-agent": "PriceAI Cloudflare smoke check",
      },
    });

    if (response.status !== 200) {
      return { ok: false, checked: assets.size, badUrl: `${assetUrl}:${response.status}` };
    }
  }

  return { ok: true, checked: assets.size };
}

function validateHealthJson(data) {
  const failures = [];
  if (data?.ok !== true) failures.push("ok!=true");
  if (data?.supabaseConfigured !== true) failures.push("supabaseConfigured!=true");
  if (data?.supabaseReachable !== true) failures.push("supabaseReachable!=true");
  return failures;
}

function validateExplorerJson(data) {
  const failures = [];
  if (data?.configured !== true) failures.push("configured!=true");
  if (data?.degraded !== false) failures.push("degraded!=false");
  if (!Number.isFinite(data?.offerTotal) || data.offerTotal < 100) failures.push("offerTotal<100");
  return failures;
}

function validateOffersJson(data) {
  const failures = [];
  if (data?.degraded !== false) failures.push("degraded!=false");
  if (!Number.isFinite(data?.total) || data.total < 100) failures.push("total<100");
  return failures;
}
