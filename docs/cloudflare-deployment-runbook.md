# Cloudflare / OpenNext 部署运行手册

本文记录 2026-06-15 线上故障暴露出的 Cloudflare 部署问题，并固化后续部署流程。目标是先在非生产入口验证 Worker 版本，再切生产流量，避免“本地正常、上线后全站或局部 500”反复发生。

## 当前结论

- `cf.priceai.cc` 目前不是独立 staging。`wrangler.jsonc` 把 `cf.priceai.cc`、`priceai.cc/*`、`www.priceai.cc/*` 绑定到同一个 Worker：`priceai-cloudflare-poc`。对这个 Worker 执行 `opennextjs-cloudflare deploy` 会影响同一个 Worker 的所有路由。
- `cf.priceai.cc` 当前访问会 308 跳转到 `priceai.cc`。如果 smoke 脚本默认跟随 redirect，所谓“测试 cf 域名”实际会变成测试生产主域。
- 后续不能再用生产域名验证新构建。新版本应先通过 Worker Version Preview URL 或独立 staging Worker 验收。
- `opennextjs-cloudflare deploy` 和 `wrangler deploy` 都属于“上传后直接服务流量”的高风险动作。常规发布应拆成“build / upload / preview smoke / 手动切流量”。
- OpenNext + Next.js 的环境变量必须分 build-time 和 runtime 两层处理。`NEXT_PUBLIC_*` 会在 `next build` 时内联，SSG/ISR 页面也可能在构建时读取非公开变量；只配置 Worker runtime secrets 不能修复已经预渲染进缓存的 fallback HTML。
- R2 incremental cache 是线上行为的一部分，不是无害缓存。旧 build id 下的缓存可能引用已经不存在的 JS chunk，或保存构建期 fallback 数据。

## 官方依据

- OpenNext Cloudflare 建议先用普通 Next.js 工具本地开发，再用 `opennextjs-cloudflare build` 转成 Workers 产物，并用 `opennextjs-cloudflare preview` 在 Workers runtime 本地验证。
  - <https://opennext.js.org/cloudflare/howtos/dev-deploy>
- OpenNext 的 `deploy` 和 `upload` 都会初始化远端 cache 并上传应用；差异是 `upload` 调用 `wrangler versions upload`，而 `deploy` 调用 `wrangler deploy` 并立即更新 active deployment。用于日常发布时应优先 `upload`。
  - <https://opennext.js.org/cloudflare/howtos/dev-deploy>
- Cloudflare Workers Versions / Deployments 把“版本上传”和“当前服务流量”拆开。Worker version 可以先上传，不改变当前 active deployment。
  - <https://developers.cloudflare.com/workers/configuration/versions-and-deployments/>
- Cloudflare gradual deployments 可以分流和回滚，但官方也提示带 static assets 的 Worker 渐进发布可能出现资产兼容问题。Next/OpenNext 的 HTML 和 `_next/static` chunk 必须按这个风险处理。
  - <https://developers.cloudflare.com/workers/configuration/versions-and-deployments/gradual-deployments/>
- Cloudflare Preview URLs 可以预览新的 Worker version，而不用部署到生产；包括自动生成的 versioned preview URL 和可读的 aliased preview URL。
  - <https://developers.cloudflare.com/workers/configuration/previews/>
- Cloudflare Wrangler environments 的 bindings、vars、secrets 是非继承项，必须每个环境单独声明/配置。
  - <https://developers.cloudflare.com/workers/wrangler/environments/>
  - <https://developers.cloudflare.com/workers/configuration/environment-variables/>
- OpenNext 环境变量文档明确区分 Workers Builds 的 build variables/secrets 和 Worker runtime variables；runtime 变量应在 Cloudflare dashboard 配置，使用 `--keep-vars` 避免 Wrangler 部署删除 dashboard 变量。
  - <https://opennext.js.org/cloudflare/howtos/env-vars>
- Next.js 官方文档说明 `NEXT_PUBLIC_*` 会在 `next build` 时内联到客户端 bundle，构建完成后不会响应 runtime 变量变化。
  - <https://nextjs.org/docs/app/guides/environment-variables>
- OpenNext R2 incremental cache 需要 `NEXT_INC_CACHE_R2_BUCKET` 和 self-reference service binding；默认前缀是 `incremental-cache`，可用 `NEXT_INC_CACHE_R2_PREFIX` 分隔环境。
  - <https://opennext.js.org/cloudflare/caching>

## 本次故障记录

时间：2026-06-15。

已观察到的问题：

1. `/official-prices` 曾从 R2 incremental cache 返回静态 fallback HTML：
   - 旧 build id：`R9mYa_gVKmQAygTHcCvXD`
   - 页面缓存包含 `source=static`、`configured=false`、“数据源：静态样本”
   - 删除对应 R2 cache 后，页面可重新生成 Supabase-backed HTML。
2. 指南页列表和详情曾引用旧 chunk：
   - `/guides` 引用旧 `page-607354bd3fbcf690.js`
   - guide detail 引用旧 `page-4f1fac588bf86161.js`
   - 旧 chunk 404 后触发客户端错误边界。
3. 删除旧 guide detail R2 cache 后，详情页运行时生成 500：
   - Wrangler tail 报错：`readAll '/bundle/content/guides/<slug>.mdx'`
   - 说明当前 Worker 运行时读取 `content/guides/*.mdx` 的路径不可靠，旧缓存曾掩盖这个问题。
4. 从临时 clean worktree 直接执行 OpenNext 部署后，生产短暂进入全站 500：
   - `opennextjs-cloudflare deploy -- --keep-vars` 上传版本 `516da716-ea1c-4b28-b694-05aa0a56e24e`，但 version inspect 显示 build id vars 仍是旧值。
   - 再执行 `opennextjs-cloudflare deploy` 上传版本 `b9e00ee3-1760-442f-8191-e95d3be9092b`，build id vars 缺失。
   - 线上日志出现：`Dynamic require of "/.next/server/middleware-manifest.json" is not supported`。
   - smoke 多个入口 500，包括 `/`、`/api-models`、`/api/health`、公开 API、cron、robots、sitemap。
5. 已回滚：
   - 当前流量已回滚到 Worker version `1ff669cf-023d-4ed4-978c-fa4da419223a`。
   - 回滚后 `/`、`/api/health`、`/official-prices`、官方订阅详情恢复 200。
   - `cf.priceai.cc` smoke 仍有 guide detail 500，需要后续代码/构建修复。
   - 后续复测发现 `cf.priceai.cc` 对 `/`、`/api/health`、`/official-prices`、`/guides` 等路径返回 308 到 `priceai.cc`，因此之前以 `cf.priceai.cc` 为 base 的 smoke 可能实际跟随到了生产域名。

## 当前配置风险

### 单 Worker 多域名风险

当前 `wrangler.jsonc` 的同一个 Worker 同时绑定：

```text
cf.priceai.cc
priceai.cc/*
www.priceai.cc/*
```

这意味着 `cf.priceai.cc` 更像排障备用入口，不是 staging。只要部署 Worker 本体，生产路由也会跟着变。

另外，当前 `cf.priceai.cc` 会被重定向到 `priceai.cc`。后续任何 staging smoke 都必须用 `redirect: "manual"` 或显式校验 `response.url`，确认最终访问的仍是目标测试入口。

推荐改造：

1. 短期：使用 Worker Version Preview URL 做新版本验证，不动 active deployment。
2. 中期：建立独立 staging Worker，例如 `priceai-cloudflare-staging`，只绑定 `cf.priceai.cc` 或 `staging.priceai.cc`。
3. 长期：建立 prod/staging 分离的 Wrangler env 或两份 Wrangler config，且每个环境使用独立 R2 cache prefix 或独立 bucket。

### R2 cache 环境混用风险

当前 R2 bucket 是 `priceai-cloudflare-poc-opennext-cache`，默认 prefix 是 `incremental-cache`。如果 staging 和 production 共用 bucket/prefix，旧 build id 或测试构建可能污染线上缓存。

推荐：

```text
生产：NEXT_INC_CACHE_R2_PREFIX=prod/incremental-cache
预览：NEXT_INC_CACHE_R2_PREFIX=staging/incremental-cache
```

或者直接使用不同 R2 bucket。

### 构建期变量风险

本项目存在 SSG/ISR、官方订阅、指南页、Umami 注入等构建期敏感路径。构建环境变量缺失时，构建仍可能成功，但产物已经带 fallback 数据或缺少脚本。

构建前必须验证：

```bash
npm run check:cloudflare-env
npm run build:cloudflare
```

并扫描 `.open-next/cache/**/*.cache` 是否出现：

```text
configured=false
source=static
静态样本
演示数据
seed
```

## 推荐部署流程

### 0. 不从脏工作区部署

主工作区当前有较多未合并/冲突改动。Cloudflare 发布应从 clean worktree 或 CI 运行。

本地发布前检查：

```bash
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
```

如果有无关改动，不在该目录构建部署。

### 1. 本地构建和本地 Workers runtime 验证

```bash
npm run check:cloudflare-env
npm run lint
npm run build:cloudflare
npm run preview:cloudflare
```

本地 preview 必测：

```bash
npm run smoke:cloudflare -- http://127.0.0.1:8788
```

还要单独打开：

```text
/official-prices
/official-prices/chatgpt__plus-monthly
/guides
/guides/are-ai-subscription-card-shops-reliable
/api/health
```

### 2. 上传 Worker version，但不切生产流量

使用 OpenNext upload，避免 active deployment 立即变化。不要直接绕过 OpenNext 调 `wrangler versions upload`，因为 OpenNext wrapper 会先执行远端 incremental cache 初始化并附加部署映射变量：

```bash
opennextjs-cloudflare upload -- --keep-vars --preview-alias staging
```

上传完成后记录：

```text
version id
preview URL
build id
git sha
R2 prefix / bucket
```

### 3. 在 Preview URL 或 staging Worker 验证

使用 preview URL 或独立 staging 域名运行完整 smoke：

```bash
npm run smoke:cloudflare -- <preview-url>
```

smoke 不能默认跟随重定向后仍算通过。必须校验：

```text
response.url 仍在 preview/staging host
3xx Location 不指向 priceai.cc
server / x-opennext / version 标记符合候选版本
```

必须额外检查：

```bash
node scripts/check-cloudflare-env.mjs
```

页面/接口验收：

| 类别 | 路径 | 通过标准 |
|------|------|----------|
| 首页 | `/` | 200，HTML 不含 fallback/seed/static 标记 |
| 官方订阅 | `/official-prices` | 200，真实 Supabase 数据 |
| 官方订阅详情 | `/official-prices/chatgpt__plus-monthly` | 200，地区价数量正常 |
| 指南列表 | `/guides` | 200，引用的新 chunk 可访问 |
| 指南详情 | `/guides/are-ai-subscription-card-shops-reliable` | 200，不能依赖旧 R2 cache 掩盖运行时报错 |
| 健康检查 | `/api/health` | 200，Supabase configured/reachable |
| 公开 API | `/api/explorer`、`/api/offers?limit=80` | 200，体积仍在几十 KB 级，缓存头正常 |
| Cron 鉴权 | `/api/cron/collect-prices`、`/api/cron/official-prices` | 无密钥返回 401 |
| SEO | `/robots.txt`、`/sitemap.xml` | 200 |

### 4. 切流量前检查

不要直接 `deploy`。Next/OpenNext 带有 `_next/static` chunk，默认不要做百分比金丝雀，避免用户拿到 A 版本 HTML 却请求 B 版本资产。标准路径是 preview URL 全量验收后，再把候选版本一次性切到 100%：

```bash
wrangler versions deploy <new-version-id>@100 \
  --name priceai-cloudflare-poc \
  --message "promote <git-sha>" \
  --yes
```

如果一定要做生产入口烟测，可以先创建 0% 候选版本部署，再用 Cloudflare version override header 只让内部请求命中候选版本；这个方法仍要注意资产请求是否也带同样 override header：

```bash
wrangler versions deploy <new-version-id>@0 <current-version-id>@100 \
  --name priceai-cloudflare-poc \
  --message "stage override test <git-sha>" \
  --yes

curl -sS https://priceai.cc/ \
  -H 'Cloudflare-Workers-Version-Overrides: priceai-cloudflare-poc="<new-version-id>"'
```

只有在已经解决静态资产版本兼容、配置 version affinity、或确认 Cloudflare 的静态资源与 Worker 版本绑定行为满足 Next/OpenNext 时，才考虑百分比分流：

```bash
wrangler versions deploy <new-version-id>@5 <current-version-id>@95 \
  --name priceai-cloudflare-poc \
  --message "canary <git-sha>" \
  --yes
```

如果任一 smoke 失败，立即回滚到上一个稳定版本：

```bash
wrangler versions deploy <previous-version-id>@100 \
  --name priceai-cloudflare-poc \
  --message "rollback from <failed-version-id>" \
  --yes
```

### 5. 生产切换后验证

只在前面全部通过后执行生产验证：

```bash
npm run smoke:cloudflare -- https://priceai.cc
npm run smoke:cloudflare -- https://www.priceai.cc
```

同时记录：

```text
active deployment version
status / bytes / cache-control
Worker 5xx
R2 cache 增长
Supabase egress
Umami 脚本是否仍为 https://umami.dimthink.com/script.js
```

## 需要补的工程化任务

P0：

1. 把 `cf.priceai.cc` 从生产 Worker 路由里拆出来，迁到独立 staging Worker 或确认只走 Worker Preview URL。
2. 修改部署脚本：默认只 `upload` 新版本，不 `deploy` 到 100%。
3. 为 R2 incremental cache 加环境隔离：独立 bucket 或 `NEXT_INC_CACHE_R2_PREFIX`。
4. 在 smoke 中加入 HTML 内容断言：不能含 `configured=false`、`source=static`、`静态样本`、`数据加载遇到问题`。
5. 增加 chunk 可访问检查：解析 HTML 中 `/_next/static/...js` 后逐个 HEAD/GET 验证。
6. 在 smoke 中禁止静默跟随到生产域名：记录最终 URL，并把 unexpected 3xx 或 host 变化视为失败。
7. 修复 guide detail 对 runtime filesystem 的依赖：不要在 Worker 请求时读取 `/bundle/content/guides/*.mdx`，应在构建期内联或生成静态数据。

P1：

1. 给 `wrangler versions upload` 输出的 preview URL 做自动 smoke。
2. 给当前 active version 和 candidate version 做配置 diff，重点看 build id vars、bindings、assets、R2 bucket、vars。
3. 把 `npm run deploy:cloudflare` 改名为 `npm run upload:cloudflare` / `npm run promote:cloudflare`，避免误用。
4. 在 GitHub Actions 中增加人工 approval 后再执行 `wrangler versions deploy`。
5. 为 Cloudflare Preview URLs 配 Cloudflare Access，避免公网预览被搜索或误访问。

## 后续判定标准

以后只有同时满足以下条件，才可以切生产：

1. clean worktree 或 CI 构建。
2. 构建期 env 校验通过。
3. 本地 Workers runtime preview 通过。
4. Worker version preview 或 staging 域名通过完整 smoke。
5. R2 cache 与 build id 一致，未混入 fallback 数据。
6. 官方订阅和指南详情都不是靠旧 R2 cache 才能访问。
7. 已记录 previous version id，回滚命令可立即执行。
