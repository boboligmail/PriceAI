import type { Metadata } from "next";
import { z } from "zod";
import { mdxGuides } from "@/lib/generated-mdx-guides";

const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  eyebrow: z.string().optional(),
  categoryId: z.enum(["basics", "official", "payment", "channels"]),
  tags: z.array(z.string()).default([]),
  intent: z.string().optional(),
  canonical: z.string(),
  primaryCta: z
    .object({
      href: z.string(),
      label: z.string(),
    })
    .optional(),
  secondaryCta: z
    .object({
      href: z.string(),
      label: z.string(),
    })
    .optional(),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
});

export type MdxGuideFrontmatter = z.infer<typeof frontmatterSchema>;
export type MdxGuide = (typeof mdxGuides)[keyof typeof mdxGuides];

export function readMdxGuide(slug: string): MdxGuide {
  const guide = mdxGuides[slug as keyof typeof mdxGuides];
  if (!guide) {
    throw new Error(`Unknown MDX guide slug: ${slug}`);
  }
  return guide;
}

export function parseMdxGuideFrontmatter(frontmatter: unknown) {
  return frontmatterSchema.parse(frontmatter);
}

export async function buildMdxGuideMetadata(slug: string): Promise<Metadata> {
  const guide = readMdxGuide(slug);
  const frontmatter = parseMdxGuideFrontmatter(guide.frontmatter);

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    alternates: {
      canonical: frontmatter.canonical,
    },
    openGraph: {
      title: `${frontmatter.title} | ai-home`,
      description: frontmatter.description,
      url: `https://www.aideals.cloud${frontmatter.canonical}`,
    },
  };
}

export function buildMdxGuideJsonLd(frontmatter: MdxGuideFrontmatter) {
  const pageUrl = `https://www.aideals.cloud${frontmatter.canonical}`;
  const items: unknown[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: frontmatter.title,
      inLanguage: "zh-CN",
      url: pageUrl,
      description: frontmatter.description,
      author: {
        "@type": "Organization",
        name: "ai-home",
      },
      publisher: {
        "@type": "Organization",
        name: "ai-home",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ai-home", item: "https://www.aideals.cloud" },
        { "@type": "ListItem", position: 2, name: "指南", item: pageUrl },
      ],
    },
  ];

  if (frontmatter.faq.length) {
    items.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: frontmatter.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  return items;
}
