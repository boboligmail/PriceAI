import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright-core";

const root = process.cwd();
const port = Number(process.env.CLOUD_UI_TEST_PORT || 3199);
const baseUrl = `http://127.0.0.1:${port}`;
const evidenceDir = ".omo/evidence";

assertStaticContracts();
mkdirSync(evidenceDir, { recursive: true });

const serverCommand = process.platform === "win32" ? "cmd.exe" : "npm";
const serverArgs = process.platform === "win32" ? ["/d", "/s", "/c", `npm run dev -- -p ${port}`] : ["run", "dev", "--", "-p", String(port)];
const server = spawn(serverCommand, serverArgs, {
  cwd: root,
  detached: process.platform !== "win32",
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  stdio: ["ignore", "pipe", "pipe"],
});

let serverOutput = "";
server.stdout.on("data", (chunk) => {
  serverOutput += String(chunk);
});
server.stderr.on("data", (chunk) => {
  serverOutput += String(chunk);
});

try {
  await waitForServer(`${baseUrl}/cloud`);
  await runBrowserChecks();
  console.log("Cloud UI checks passed: browser interaction + automation contracts");
} finally {
  await stopServer(server.pid);
}

function assertStaticContracts() {
  const workflow = readFileSync(".github/workflows/collect-cloud-offers.yml", "utf8");
  const records = JSON.parse(readFileSync("data/cloud-offer-update-records.json", "utf8"));

  assert(Array.isArray(records.records) && records.records.length > 0, "update records must be present");
  for (const expected of ["schedule:", "npm run collect:cloud-offers", "npm run test:cloud-ui", "gh workflow run deploy-cloudflare-worker.yml"]) {
    assert(workflow.includes(expected), `cloud workflow missing ${expected}`);
  }
}

async function runBrowserChecks() {
  const browser = await chromium.launch(browserLaunchOptions());
  try {
    const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await desktop.goto(`${baseUrl}/cloud#vps`, { waitUntil: "load" });
    await assertVpsDesktop(desktop);
    await desktop.screenshot({ path: `${evidenceDir}/cloud-selector-vps-desktop.png`, fullPage: true });
    await assertGpuDesktop(desktop);
    await desktop.screenshot({ path: `${evidenceDir}/cloud-selector-gpu-desktop.png`, fullPage: true });

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobile.goto(`${baseUrl}/#gpu`, { waitUntil: "load" });
    await assertMobileHome(mobile);
    await mobile.screenshot({ path: `${evidenceDir}/cloud-selector-mobile.png`, fullPage: true });
  } finally {
    await browser.close();
  }
}

async function assertVpsDesktop(page) {
  const bodyText = await page.locator("body").innerText();
  const headerText = await page.locator("header").innerText();
  const storageLabels = await page.locator("label").filter({ hasText: "硬盘" }).allTextContents();

  assert(bodyText.includes("云服务器与 GPU 租赁价格筛选器"), "page must use the selector-first hero title");
  assert(bodyText.includes("当前筛选结果"), "page must show the right-side filter result summary");
  assert(bodyText.includes("最近更新："), "VPS page must show recent update time");
  assert(bodyText.includes("VPS 更新记录"), "VPS tab must show update records");
  assert(bodyText.includes("配置明细"), "table must include a configuration-details column");
  assert(bodyText.includes("商家") && bodyText.includes("CPU/GPU") && bodyText.includes("官网"), "page must render the compact comparison table headers");
  assert(bodyText.includes("官网直达"), "rows must expose official direct links");
  assert(!bodyText.includes("核验/进入"), "old action copy must not render");
  assert(!bodyText.includes("先选配置，再看价格和官网链接"), "old oversized hero copy must not render");
  assert(!/数据源|更新记录/.test(headerText), "top nav must not expose data source/update record entries");
  assert(!/卡网订阅|官方订阅|官方 API|中转 API/.test(headerText), "cloud header must not expose old AI subscription navigation");
  assert(headerText.includes("VPS 比价") && headerText.includes("GPU 租赁"), "cloud header must expose VPS/GPU comparison navigation");
  assert(storageLabels.some((text) => text.includes("硬盘不限") && text.includes("1 TB+")), "storage filter must be capacity-only");
}

async function assertGpuDesktop(page) {
  await page.getByRole("tab", { name: /GPU 算力租赁/ }).click();
  const bodyText = await page.locator("body").innerText();
  const billingOptions = await page.locator("label").filter({ hasText: "计费" }).locator("option").allTextContents();
  const gpuModelOptions = await page.locator("label").filter({ hasText: "GPU 型号" }).locator("option").allTextContents();

  assert(!bodyText.includes("VPS 更新记录"), "GPU tab must not show VPS update records");
  assert(bodyText.includes("当前筛选结果"), "GPU tab must keep the filter result summary");
  assert(bodyText.includes("官网直达"), "GPU rows must expose official direct links");
  assert(billingOptions.some((text) => text.includes("月付")), "billing filter must include monthly");
  assert(billingOptions.some((text) => text.includes("按小时")), "billing filter must include hourly");
  assert(billingOptions.some((text) => text.includes("抢占式低价")), "billing filter must include spot/preemptible label");
  assert(gpuModelOptions.some((text) => /RTX 3090|RTX 4090|A100|H100/.test(text)), "GPU model filter must be built from real model data");

  await page.locator("label").filter({ hasText: "计费" }).locator("select").selectOption("spot");
  assert((await page.locator("label").filter({ hasText: "计费" }).locator("select").inputValue()) === "spot", "spot filter must be selectable");

  const nextButtons = page.getByRole("button", { name: "下一页" });
  assert((await nextButtons.count()) === 2, "page should render top and bottom next-page controls");
  await nextButtons.first().click();
  assert((await page.locator("body").innerText()).includes("第 2 /"), "pagination must move to the next page");
}

async function assertMobileHome(page) {
  const bodyText = await page.locator("body").innerText();
  const headerText = await page.locator("header").innerText();

  assert(bodyText.includes("最近更新："), "mobile page must show recent update time");
  assert(bodyText.includes("VPS 云服务器") && bodyText.includes("GPU 算力租赁"), "mobile page must expose VPS/GPU tabs");
  assert(bodyText.includes("官网直达"), "mobile rows must expose official direct links");
  assert(!bodyText.includes("核验/进入"), "mobile page must not render old action copy");
  assert(!/数据源|更新记录/.test(headerText), "mobile header must not expose data source/update record entries");
  assert(!/卡网订阅|官方订阅|官方 API|中转 API/.test(headerText), "mobile cloud header must not expose old AI subscription navigation");
}

function browserLaunchOptions() {
  const executablePath = findBrowserExecutable();
  if (executablePath) return { executablePath, headless: true };
  return { channel: "chrome", headless: true };
}

function findBrowserExecutable() {
  const candidates =
    process.platform === "win32"
      ? [
          "C:/Program Files/Google/Chrome/Application/chrome.exe",
          "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
          "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
          "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
        ]
      : [
          "/usr/bin/google-chrome-stable",
          "/usr/bin/google-chrome",
          "/usr/bin/chromium-browser",
          "/usr/bin/chromium",
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        ];

  return candidates.find((candidate) => existsSync(candidate));
}

async function waitForServer(url) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 60_000) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The dev server is still booting.
    }
    await delay(500);
  }
  throw new Error(`cloud UI server did not become ready. Output:\n${serverOutput}`);
}

async function stopServer(pid) {
  if (!pid) return;
  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const killer = spawn("taskkill", ["/pid", String(pid), "/t", "/f"], { stdio: "ignore" });
      killer.on("exit", resolve);
      killer.on("error", resolve);
    });
    return;
  }
  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // Already stopped.
    }
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
