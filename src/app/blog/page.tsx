import type { Metadata } from "next";
import { BlogSection } from "@/components/home/blog-section";
import { SimplePage } from "@/components/simple-page";
import { localizedAlternates } from "@/lib/i18n";
import { getPublicPosts } from "@/lib/public-cms";

export const metadata: Metadata = {
  title: "Fire Pump News and Industry Updates",
  description: "Read GRIMM company news, fire pump delivery updates, industry trends and fire protection project insights.",
  alternates: localizedAlternates("/blog"),
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPublicPosts();
  return (
    <SimplePage
      eyebrow="News Center"
      title="Official GRIMM news and fire pump industry updates."
      text="Synchronized from the current GRIMM website, including company news, delivery updates, fire pump articles and industry application insights."
    >
      <BlogSection items={posts} basePath="/blog" eyebrow="News Center" title="Official news and fire pump industry updates." />
    </SimplePage>
  );
}
