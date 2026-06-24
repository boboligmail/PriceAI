# PriceAI 自建 Origin 预案

> 状态：仅规划，不迁移。当前生产入口仍是 Cloudflare Workers + OpenNext。
> 日期：2026-06-24

## 背景

PriceAI 当前运行在 Cloudflare Workers + OpenNext。Workers 的优点是部署简单、全球边缘、静态资源和动态入口一体化；问题是动态 API 的 CPU 账单会随流量和冷请求波动，且平台绑定、WAF/规则权限、调试方式都有约束。

短期优先级不是迁移，而是先把公开价格 API 快照化，降低任何运行平台上的现场聚合成本。自建服务器只作为中期备选。

## 目标架构

```text
用户
  -> Cloudflare DNS / CDN / WAF / Cache Rules
  -> Nginx 或 Caddy
  -> Next.js standalone Node 服务
  -> Redis
  -> Supabase
```

Cloudflare 仍保留在最外层，负责 DNS、TLS、静态资源缓存、基础 WAF 和异常流量处理。云服务器只作为 origin，不裸露 Node 服务。

## 建议配置

### 起步配置

- 2 vCPU
- 4 GB RAM
- 40-80 GB SSD
- Ubuntu 24.04 LTS
- 2 TB/月以上流量包

适合只跑 PriceAI Web origin，数据库继续使用 Supabase，采集任务和监控不全部压在同机。

### 稳妥配置

- 4 vCPU
- 8 GB RAM
- 80 GB+ SSD
- Ubuntu 24.04 LTS
- 4 TB/月以上流量包

适合同机运行 Next.js、Redis、轻量任务队列、日志和基础监控。后续如果要把更多采集、Umami 或后台任务放上来，优先用这一档。

## 必备组件

- Nginx 或 Caddy：TLS、反向代理、gzip/brotli、请求体限制、基础限流。
- systemd：守护 Next.js 服务，避免 PM2 配置漂移。
- Redis：公开 API 快照缓存、任务锁、轻量限流。
- UFW：仅开放 80、443、SSH。
- fail2ban：保护 SSH 和常见扫描。
- logrotate：限制 Nginx 和应用日志增长。
- GitHub Actions：CI 构建产物，服务器只接收产物并重启服务。
- Uptime 监控：检查 `/api/health`、首页和关键公开 API。

## 部署原则

- 不在生产服务器上跑 `npm install`、`npm run build`、测试或大规模扫描。
- 构建在 GitHub Actions 或本地完成。
- 服务器只做 runtime：接收产物、切换软链、重启 systemd、健康检查。
- 回滚使用上一版构建目录或容器镜像。

## CDN 策略

| 路径 | 建议 |
|---|---|
| `/_next/static/*` | 长期缓存，immutable |
| 图片、CSS、JS | 长期缓存 |
| `/api/explorer` | 1-5 分钟缓存，读取快照 |
| `/api/products/*/offers` 默认第一页 | 1-5 分钟缓存，读取快照 |
| `/api/offers?limit=80` | 1-5 分钟缓存 |
| `/admin/*` | 不缓存 |
| `/api/admin/*` | 不缓存 |
| `/api/cron/*` | 不缓存，只允许 secret 访问 |

不建议为了降低成本关闭正常用户的 Next.js 预取。预取体验保留；异常数据中心和高频 API 访问用 WAF、rate limit 或 challenge 控制。

## 迁移路线

1. 当前阶段：继续 Workers，完成公开 API 快照化。
2. 预备阶段：搭建 `origin.priceai.cc` 或临时域名，不接主流量。
3. 对比阶段：并行压测和真实访问采样 3-7 天，记录 TTFB、CPU、内存、带宽、错误率。
4. 切换阶段：Cloudflare DNS/CDN 指向自建 origin，Workers 保留为回滚路径。
5. 稳定阶段：观察账单、日志和健康检查，再决定是否长期保留 Workers 作为备用。

## 风险

- 运维责任增加：安全更新、日志、磁盘、服务守护都要自己负责。
- 带宽和攻击成本转移到服务器和 CDN。
- 如果没有 CDN/WAF，自建 origin 会比 Workers 更脆弱。
- 如果构建直接放在小服务器上，会影响生产稳定性。

## 决策建议

短期不迁移。先完成快照化并观察 Workers CPU 2-3 天。

如果快照化后 Workers 成本稳定在可接受范围，继续使用 Workers，省运维。

如果 CPU 仍随爬虫或动态流量明显上涨，再启动自建 origin 并行验证。
