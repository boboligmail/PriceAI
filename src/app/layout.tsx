import type { Metadata } from "next";
import Script from "next/script";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SiteNoticePrompt } from "@/components/SiteNoticePrompt";
import { UmamiAnalytics } from "@/components/UmamiAnalytics";
import "./globals.css";

const themeInitScript = `
(function() {
  try {
    var root = document.documentElement;
    var isAdmin = window.location.pathname.indexOf('/admin') === 0;
    if (isAdmin) {
      root.dataset.theme = 'light';
      root.style.colorScheme = 'light';
      return;
    }
    var stored = window.localStorage.getItem('priceai-theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored === 'dark' || (!stored && prefersDark) ? 'dark' : 'light';
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch (error) {
    document.documentElement.dataset.theme = 'light';
    document.documentElement.style.colorScheme = 'light';
  }
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-home.example.com"),
  title: {
    default: "ai-home | VPS 云服务器与 GPU 租赁平台配置价格表",
    template: "%s | ai-home",
  },
  description: "对比 VPS 云服务器与 GPU 租赁平台的商家、价格、CPU、内存、硬盘、流量和官方核验链接。",
  applicationName: "ai-home",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ai-home | VPS 云服务器与 GPU 租赁平台配置价格表",
    description: "把 VPS、轻量云和 GPU 租赁平台整理成可直接对比配置、价格和核验链接的云算力清单。",
    url: "https://ai-home.example.com",
    siteName: "ai-home",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ai-home | VPS 云服务器与 GPU 租赁平台配置价格表",
    description: "对比 VPS、轻量云和 GPU 租赁平台的价格、CPU、内存、硬盘、流量和官方核验入口。",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Script id="priceai-theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
        <SiteNoticePrompt />
        <GoogleAnalytics />
        <UmamiAnalytics />
      </body>
    </html>
  );
}
