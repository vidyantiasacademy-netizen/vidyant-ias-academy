import { notFound } from "next/navigation";

import { RichText } from "@/components/content/RichText";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/Badge";
import { CTASection } from "@/components/ui/CTASection";
import { getLocale } from "@/i18n/server";
import { ROUTES } from "@/lib/constants/site";
import { getBlogPost, getBlogSlugs } from "@/lib/sanity/queries";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateStaticParams() {
  return (await getBlogSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { slug } = await params;
  const post = await getBlogPost(slug, await getLocale());

  if (!post) {
    return pageMetadata({
      title: "Article not found",
      description: "This article is no longer published.",
      path: `${ROUTES.blog}/${slug}`,
      noIndex: true,
    });
  }

  return pageMetadata({
    title: post.seo?.title ?? post.title,
    description: post.seo?.description ?? post.excerpt ?? post.title,
    path: `${ROUTES.blog}/${post.slug}`,
    noIndex: post.seo?.noIndex ?? false,
  });
}

const DATE = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default async function BlogPostPage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { slug } = await params;
  const post = await getBlogPost(slug, await getLocale());

  if (!post) notFound();

  const byline = [
    post.authorName ?? "vidyantIAS Academic Team",
    DATE.format(new Date(post.publishedAt)),
    post.readingMinutes ? `${post.readingMinutes} min read` : null,
  ].filter(Boolean);

  return (
    <>
      <PageHero
        eyebrow={post.categories?.[0] ?? "Blog"}
        title={post.title}
        description={post.excerpt ?? undefined}
        breadcrumbs={[
          { label: "Home", href: ROUTES.home },
          { label: "Blog", href: ROUTES.blog },
          { label: post.title },
        ]}
      />

      <Section containerSize="narrow">
        <p className="text-small text-ink-muted">{byline.join(" • ")}</p>
        <RichText value={post.content} className="mt-8" />

        {post.tags?.length ? (
          <ul className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Badge tone="neutral">{tag}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </Section>

      <CTASection
        title="Apply this to your own preparation."
        description="Book a counselling session and turn the approach into a plan for your attempt."
        location="blog-detail-final"
      />
    </>
  );
}
