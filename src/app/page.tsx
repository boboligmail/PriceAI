import type { Metadata } from "next";
import { CloudComparisonView } from "@/app/cloud/page";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ai-home | VPS 云服务器与 GPU 租赁平台比价",
  description: "比较 VPS 云服务器、轻量云和 GPU 租赁平台的计费方式、适用场景、风险点和价格来源，先筛平台，再回原站核验实时价格。",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ai-home | VPS 云服务器与 GPU 租赁平台比价",
    description: "VPS、轻量云、GPU 租赁平台选型入口：看计费口径、适合场景、价格来源和风险提示。",
    url: "https://ai-home.example.com",
    siteName: "ai-home",
  },
};

export default function Home() {
  return <CloudComparisonView canonicalPath="/" activeSection="home" />;
}
