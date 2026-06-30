# ai-home VPS 部署清单

这份清单用于把当前项目部署到一台 Ubuntu VPS。不要把真实密钥提交到 GitHub。

## 需要先准备

- 一个域名，例如 `ai-home.example.com`，A 记录解析到 VPS IP。
- 一个 Supabase 项目，并在 SQL Editor 执行 `supabase/schema.sql`。
- 三个 Supabase 值：
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- 两个强随机密钥：
  - `ADMIN_SESSION_SECRET`
  - `CRON_SECRET`
- 一个后台登录密码：`ADMIN_PASSWORD`

## 1. VPS 安装基础环境

```bash
sudo apt update
sudo apt install -y git curl nginx
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
node -v
npm -v
```

成功标志：`node -v` 显示 `v24.x.x`。

## 2. 拉取代码

```bash
sudo mkdir -p /opt/ai-home
sudo chown -R $USER:$USER /opt/ai-home
git clone <你的 GitHub 仓库地址> /opt/ai-home
cd /opt/ai-home
npm ci
```

如果你还没有 fork，可以临时使用：

```bash
git clone https://github.com/physics-dimension/PriceAI.git /opt/ai-home
```

但正式运营建议使用你自己的 fork。

## 3. 写入生产环境变量

在 `/opt/ai-home/.env.local` 写入：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的-anon-key
SUPABASE_SERVICE_ROLE_KEY=你的-service-role-key

ADMIN_PASSWORD=换成强密码
ADMIN_SESSION_SECRET=换成长随机字符串
ADMIN_SESSION_VERSION=1

CRON_SECRET=换成另一个长随机字符串
CRON_PUBLIC_BASE_URL=https://你的域名

NEXT_PUBLIC_UMAMI_ALLOWED_DOMAINS=你的域名,www.你的域名
```

成功标志：这个文件只在 VPS 上存在，不提交到 GitHub。

## 4. 构建并启动

```bash
cd /opt/ai-home
npm run build
pm2 start npm --name ai-home -- run start
pm2 save
pm2 startup
```

成功标志：

```bash
pm2 status
```

能看到 `ai-home` 状态是 `online`。

## 5. 配置 Nginx

创建 `/etc/nginx/sites-available/ai-home`：

```nginx
server {
    listen 80;
    server_name 你的域名 www.你的域名;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/ai-home /etc/nginx/sites-enabled/ai-home
sudo nginx -t
sudo systemctl reload nginx
```

成功标志：访问 `http://你的域名` 能打开网站。

### 没有域名时先用 IP 访问

如果暂时没有域名，可以先把 `server_name` 写成 `_`：

```nginx
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

成功标志：访问 `http://你的 VPS IP/cloud` 能看到 VPS / GPU 平台页面。

注意：IP 访问不适合长期 SEO，也不方便做 HTTPS。等确定方向后再买域名。

## 6. 配置 HTTPS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d 你的域名 -d www.你的域名
```

成功标志：访问 `https://你的域名`，浏览器显示 HTTPS 正常。

## 7. 配置定时采集

编辑 crontab：

```bash
crontab -e
```

加入：

```cron
*/30 * * * * cd /opt/ai-home && npm run collect:prices -- --all --post --endpoint https://你的域名 >> /opt/ai-home/collect.log 2>&1
```

成功标志：半小时后后台能看到新的采集记录，`/opt/ai-home/collect.log` 有采集日志。

## 8. 常用维护命令

查看网站状态：

```bash
pm2 status
pm2 logs ai-home
```

更新代码：

```bash
cd /opt/ai-home
git pull
npm ci
npm run build
pm2 restart ai-home
```

手动跑一次采集：

```bash
cd /opt/ai-home
npm run collect:prices -- --all --post --endpoint https://你的域名
```

## 重要提醒

- 当前项目是 `AGPL-3.0-only`，公开运行修改版时要保留对应源码入口。
- 不要复制官方生产数据、渠道快照、报价数据。
- 不要继续使用上游官方 Logo、品牌资产或让用户误以为是官方站。
- 采集边界是公开接口和公开页面，不绕验证码、登录墙、WAF。
