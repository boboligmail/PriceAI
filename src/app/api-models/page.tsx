import type { Metadata } from "next";
import { ApiModelsExplorer } from "@/components/ApiModelsExplorer";
import { getApiModelDataset } from "@/lib/api-models-db";

export const metadata: Metadata = {
  title: "API 模型雷达",
  description: "整理 DeepSeek、Qwen、Kimi、MiniMax、MiMo、StepFun、NVIDIA NIM、OpenCode Go 等精选模型 API 渠道、Token Plan、免费限制和来源链接。",
  alternates: {
    canonical: "/api-models",
  },
  openGraph: {
    title: "PriceAI API 模型雷达",
    description: "对比官方 API、Token Plan 和免费测试入口。",
    url: "https://priceai.cc/api-models",
  },
};

export const revalidate = 300;

export default async function ApiModelsPage() {
  const dataset = await getApiModelDataset();

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#2d3435]">
      <ApiModelsExplorer dataset={dataset} />
    </div>
  );
}
