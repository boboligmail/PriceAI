import type { Metadata } from "next";
import { CloudComparisonView } from "@/components/cloud/CloudComparisonView";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "VPS 云服务器与 GPU 租赁平台配置价格表",
  description: "对比 VPS 云服务器与 GPU 租赁平台的商家、价格、CPU、内存、硬盘、流量和官方核验链接。",
  alternates: { canonical: "/cloud" },
  openGraph: {
    title: "VPS 云服务器与 GPU 租赁平台配置价格表 | ai-home",
    description: "按商家、价格、CPU、内存、硬盘、流量和核验链接整理 VPS 与 GPU 租赁参考规格。",
    url: "https://www.aideals.cloud/cloud",
    siteName: "ai-home",
  },
};

export default function CloudComparisonPage() {
  return <CloudComparisonView canonicalPath="/cloud" activeSection="cloud" />;
}
