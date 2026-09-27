import { renderOgImage } from "@/components/marketing/og/render";
import { getPost } from "@/content/blog";
import type { Locale } from "../types";
import { blogLabels, tagLabels } from "./labels";
import { blogSlugs } from "./paths";

type Params<K extends string> = { params: Promise<Record<K, string>> };

/** Social card of a post: its headline on the shared brand card. */
export function blogPostOgImage(locale: Locale) {
  return {
    alt: blogLabels[locale].eyebrow,
    size: { width: 1200, height: 630 },
    contentType: "image/png",
    generateStaticParams: () => blogSlugs.map((slug) => ({ slug })),
    async Image({ params }: Params<"slug">) {
      const { slug } = await params;
      const post = getPost(locale, slug);
      const tags = (post?.tags ?? []).slice(0, 2).map((tag) => tagLabels[locale][tag]);
      return renderOgImage({ eyebrow: "Blog", title: post?.title ?? blogLabels[locale].title, chips: [...tags, blogLabels[locale].ogChip] });
    },
  };
}
