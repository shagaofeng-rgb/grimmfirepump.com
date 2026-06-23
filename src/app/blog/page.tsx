import { BlogSection } from "@/components/home/blog-section";
import { SimplePage } from "@/components/simple-page";
import { posts } from "@/data/site";

export default function BlogPage() {
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
