import type { Metadata } from "next";
import { CloudComparisonView } from "@/components/cloud/CloudComparisonView";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "VPS 云服务器与 GPU 租赁平台选择工具",
  description: "按用途、价格和风险快速筛选 VPS 云服务器与 GPU 租赁平台，并回到官网核验实时价格、库存、地区和计费规则。",
  alternates: { canonical: "/cloud" },
  openGraph: {
    title: "VPS 云服务器与 GPU 租赁平台选择工具 | ai-home",
    description: "先判断长期在线还是短期算力，再看每个平台适合谁、大概多少钱、最大风险和官网核验入口。",
    url: "https://ai-home.example.com/cloud",
    siteName: "ai-home",
  },
};

export default function CloudComparisonPage() {
  return <CloudComparisonView canonicalPath="/cloud" activeSection="cloud" />;
}
