import { notFound } from "next/navigation";

import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/ui/CTASection";
import { blogPostBySlug, publishedBlogPosts } from "@/data/blog";
import { ROUTES } from "@/lib/constants/site";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return publishedBlogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = blogPostBySlug(slug);

  if (!post) {
    return pageMetadata({
      title: "Article not found",
      description: "This article is no longer published.",
      path: `${ROUTES.blog}/${slug}`,
      noIndex: true,
    });
  }

  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `${ROUTES.blog}/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = blogPostBySlug(slug);

  if (!post || post.status !== "published") notFound();

  return (
    <>
      <PageHero
        eyebrow={post.category}
        title={post.title}
        description={post.excerpt}
        breadcrumbs={[
          { label: "Home", href: ROUTES.home },
          { label: "Blog", href: ROUTES.blog },
          { label: post.title },
        ]}
      />

      <Section containerSize="narrow">
        <p className="text-small text-ink-muted">
          {post.author} • {post.readingTimeMinutes} min read
        </p>
        <p className="mt-6 text-body text-ink-secondary sm:text-body-lg">{post.excerpt}</p>
      </Section>

      <CTASection
        title="Apply this to your own preparation."
        description="Book a counselling session and turn the approach into a plan for your attempt."
        location="blog-detail-final"
      />
    </>
  );
}
