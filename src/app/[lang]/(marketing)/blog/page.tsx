import { PenLine } from "lucide-react";

import { BlogCard } from "@/components/blog/BlogCard";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CTASection } from "@/components/ui/CTASection";
import { EmptyState } from "@/components/ui/EmptyState";
import { BLOG_CATEGORIES } from "@/data/blog";
import { getLocale } from "@/i18n/server";
import { ROUTES } from "@/lib/constants/site";
import { getSitePosts } from "@/lib/content/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = () => pageMetadata({
  title: "UPSC Preparation Blog",
  description:
    "Strategy, Prelims, Mains, Optional and interview guidance from the vidyantIAS academic team in Pune — written to be used, not just read.",
  path: ROUTES.blog,
  keywords: ["UPSC preparation strategy", "UPSC blog", "IAS preparation tips"],
});

export default async function BlogPage() {
  const posts = await getSitePosts(await getLocale());

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Ideas that improve your preparation."
        description="Practical writing on strategy, revision, answer writing and test analysis from the people teaching our programs."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Blog" }]}
      />

      <Section containerSize="wide">
        {posts.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {posts.map((post) => (
              <li key={post.id}>
                <BlogCard post={post} />
              </li>
            ))}
          </ul>
        ) : (
          <>
            <EmptyState
              icon={<PenLine aria-hidden className="size-5" />}
              title="First articles are being written"
              description="Rather than publish filler, the academic team is writing the first set of articles — each one on a decision an aspirant actually has to make. These are the categories they will appear under."
              action={
                <ButtonLink href={ROUTES.resources} variant="primary">
                  Free resources available now
                </ButtonLink>
              }
            />
            <ul className="mt-10 flex flex-wrap justify-center gap-2">
              {BLOG_CATEGORIES.map((category) => (
                <li key={category}>
                  <Badge tone="neutral">{category}</Badge>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>

      <CTASection
        title="Have a preparation question right now?"
        description="Ask the academic team directly instead of waiting for an article about it."
        location="blog-final"
      />
    </>
  );
}
