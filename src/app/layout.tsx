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
    default: "ai-home | VPS 云服务器与 GPU 租赁平台比价",
    template: "%s | ai-home",
  },
  description: "比较 VPS 云服务器、轻量云和 GPU 租赁平台的计费方式、适用场景、价格来源和风险提示。",
  applicationName: "ai-home",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ai-home | VPS 云服务器与 GPU 租赁平台比价",
    description: "把 VPS、轻量云和 GPU 租赁平台整理成可筛选、可核验的云算力选型入口。",
    url: "https://ai-home.example.com",
    siteName: "ai-home",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ai-home | VPS 云服务器与 GPU 租赁平台比价",
    description: "查看 VPS、轻量云和 GPU 租赁平台的计费方式、适用场景和价格来源。",
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
