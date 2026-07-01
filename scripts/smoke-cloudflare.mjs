const DEFAULT_BASE_URL = "https://www.aideals.cloud";
const SMOKE_FETCH_TIMEOUT_MS = Number(process.env.CLOUDFLARE_SMOKE_TIMEOUT_MS || 15_000);
const SMOKE_FETCH_RETRIES = Number(process.env.CLOUDFLARE_SMOKE_RETRIES || 3);

const baseUrl = normalizeBaseUrl(
  process.argv[2] || process.env.CLOUDFLARE_SMOKE_BASE_URL || DEFAULT_BASE_URL,
);

const checks = [
  {
    path: "/",
    status: 200,
    text: {
      requiredAny: [
        { label: "homepage-cloud-topic", patterns: ["VPS", "GPU"] },
        { label: "homepage-brand", patterns: ["ai-home", "aideals.cloud"] },
      ],
    },
  },
  {
    path: "/cloud",
    status: 200,
    text: {
      requiredAny: [
        { label: "cloud-vps", patterns: ["VPS"] },
        { label: "cloud-gpu", patterns: ["GPU"] },
        { label: "cloud-data-source", patterns: ["cloud-gpus.com", "CompareVPS", "ServerHunter"] },
      ],
    },
  },
  { path: "/official-prices", status: 200 },
  { path: "/api-models", status: 200 },
  { path: "/guides/are-ai-subscription-card-shops-reliable", status: 200 },
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
    json: validateExplorerJson,
  },
  {
    path: "/api/offers?limit=80",
    status: 200,
    maxBytes: 140_000,
    json: validateOffersJson,
  },
  { path: "/api/products/chatgpt-plus/offers?limit=80", status: 200, maxBytes: 140_000 },
  {
    path: "/api/merchants",
    status: 200,
    maxBytes: 100_000,
    json: validateMerchantsJson,
  },
  { path: "/api/cron/collect-prices", status: 405, maxBytes: 5_000 },
  { path: "/api/cron/collect-prices", method: "POST", status: 401, maxBytes: 5_000 },
  { path: "/api/cron/official-prices", status: 405, maxBytes: 5_000 },
  { path: "/api/cron/official-prices", method: "POST", status: 401, maxBytes: 5_000 },
  { path: "/robots.txt", status: 200, maxBytes: 5_000 },
  { path: "/sitemap.xml", status: 200, maxBytes: 80_000 },
];

let failures = 0;
console.log(`Cloudflare smoke base: ${baseUrl}`);

for (const check of checks) {
  const url = new URL(check.path, baseUrl);
  const startedAt = Date.now();

  try {
    const response = await fetchWithTimeout(url, {
      method: check.method || "GET",
      headers: {
        "user-agent": "ai-home Cloudflare smoke check",
      },
    });
    const body = await response.arrayBuffer();
    const bytes = body.byteLength;
    const text = check.text || check.json ? new TextDecoder().decode(body) : "";
    const elapsed = Date.now() - startedAt;

    const statusOk = response.status === check.status;
    const maxBytes = Number.isFinite(check.maxBytes) ? check.maxBytes : null;
    const sizeOk = maxBytes === null || bytes <= maxBytes;
    const textFailures = check.text ? validateText(text, check.text) : [];
    const jsonFailures = check.json ? validateJson(text, check.json) : [];
    const contentOk = textFailures.length === 0 && jsonFailures.length === 0;
    const ok = statusOk && sizeOk && contentOk;

    if (!ok) failures += 1;

    console.log(
      [
        ok ? "ok" : "fail",
        response.status,
        `${bytes}B`,
        `${elapsed}ms`,
        check.method ? `${check.method} ${check.path}` : check.path,
        !sizeOk && maxBytes !== null ? `size>${maxBytes}B` : "",
        textFailures.length ? `text=${textFailures.join(";")}` : "",
        jsonFailures.length ? `json=${jsonFailures.join(";")}` : "",
      ]
        .filter(Boolean)
        .join(" "),
    );
  } catch (error) {
    failures += 1;
    console.log(`fail error ${check.path} ${error instanceof Error ? error.message : String(error)}`);
  }
}

await validateNextStaticAssets(baseUrl);

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
  if (data?.degraded === true) failures.push("degraded=true");
  if (!Number.isFinite(data?.offerTotal)) failures.push("offerTotal!=number");
  return failures;
}

function validateOffersJson(data) {
  const failures = [];
  if (data?.degraded === true) failures.push("degraded=true");
  if (!Array.isArray(data?.rows)) failures.push("rows!=array");
  if (!Number.isFinite(data?.total)) failures.push("total!=number");
  return failures;
}

function validateMerchantsJson(data) {
  const failures = [];
  if (data?.degraded === true) failures.push("degraded=true");
  if (!Array.isArray(data?.rows)) failures.push("rows!=array");
  if (!Number.isFinite(data?.total)) failures.push("total!=number");
  return failures;
}

async function validateNextStaticAssets(baseUrl) {
  const pageUrl = new URL("/", baseUrl);
  const startedAt = Date.now();
  const strictCache = !isLocalhostBaseUrl(baseUrl);

  try {
    const response = await fetchWithTimeout(pageUrl, {
      headers: {
        "user-agent": "ai-home Cloudflare smoke check",
      },
    });
    const html = await response.text();
    const assetGroups = [
      {
        label: "static-css",
        paths: [
          ...new Set(
            [...html.matchAll(/\/_next\/static\/css\/[^"'<>\\s]+\.css(?:\?[^"'<>\\s]*)?/g)].map((match) => match[0]),
          ),
        ],
      },
      {
        label: "static-js",
        paths: [
          ...new Set(
            [...html.matchAll(/\/_next\/static\/chunks\/[^"'<>\\s]+\.js(?:\?[^"'<>\\s]*)?/g)].map((match) => match[0]),
          ),
        ],
      },
    ];

    for (const group of assetGroups) {
      if (group.paths.length === 0) {
        failures += 1;
        console.log(`fail ${group.label} missing ${pageUrl.pathname}`);
        continue;
      }

      for (const assetPath of group.paths) {
        const assetUrl = new URL(assetPath, baseUrl);
        const assetStartedAt = Date.now();
        const assetResponse = await fetchWithTimeout(assetUrl, {
          headers: {
            "user-agent": "ai-home Cloudflare smoke check",
          },
        });
        const body = await assetResponse.arrayBuffer();
        const cacheControl = assetResponse.headers.get("cache-control") || "";
        const cacheOk = !strictCache || (/\bmax-age=31536000\b/i.test(cacheControl) && /\bimmutable\b/i.test(cacheControl));
        const ok = assetResponse.status === 200 && cacheOk;

        if (!ok) failures += 1;

        console.log(
          [
            ok ? "ok" : "fail",
            group.label,
            assetResponse.status,
            `${body.byteLength}B`,
            `${Date.now() - assetStartedAt}ms`,
            assetUrl.pathname,
            `cache=${cacheControl || "missing"}`,
          ].join(" "),
        );
      }
    }

    console.log(`ok static-assets-page ${Date.now() - startedAt}ms ${pageUrl.pathname}`);
  } catch (error) {
    failures += 1;
    console.log(`fail static-assets error ${pageUrl.pathname} ${error instanceof Error ? error.message : String(error)}`);
  }
}

function isLocalhostBaseUrl(baseUrl) {
  const { hostname } = new URL(baseUrl);
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

async function fetchWithTimeout(input, init = {}) {
  let lastError = null;

  for (let attempt = 0; attempt <= SMOKE_FETCH_RETRIES; attempt += 1) {
    try {
      return await fetch(input, {
        ...init,
        signal: AbortSignal.timeout(SMOKE_FETCH_TIMEOUT_MS),
      });
    } catch (error) {
      lastError = error;
      if (attempt === SMOKE_FETCH_RETRIES) break;
      await new Promise((resolve) => setTimeout(resolve, 1_000 * (attempt + 1)));
    }
  }

  throw lastError;
}
