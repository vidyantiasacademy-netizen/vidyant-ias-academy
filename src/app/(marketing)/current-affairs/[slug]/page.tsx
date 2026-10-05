import { notFound } from "next/navigation";

import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/Badge";
import { CTASection } from "@/components/ui/CTASection";
import { currentAffairBySlug, publishedCurrentAffairs } from "@/data/current-affairs";
import { ROUTES } from "@/lib/constants/site";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return publishedCurrentAffairs.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps<"/current-affairs/[slug]">) {
  const { slug } = await params;
  const item = currentAffairBySlug(slug);

  if (!item) {
    return pageMetadata({
      title: "Analysis not found",
      description: "This analysis is no longer published.",
      path: `${ROUTES.currentAffairs}/${slug}`,
      noIndex: true,
    });
  }

  return pageMetadata({
    title: item.title,
    description: item.whyItMatters,
    path: `${ROUTES.currentAffairs}/${item.slug}`,
  });
}

export default async function CurrentAffairPage({
  params,
}: PageProps<"/current-affairs/[slug]">) {
  const { slug } = await params;
  const item = currentAffairBySlug(slug);

  if (!item || item.status !== "published") notFound();

  return (
    <>
      <PageHero
        eyebrow={item.subject}
        title={item.title}
        description={item.whyItMatters}
        breadcrumbs={[
          { label: "Home", href: ROUTES.home },
          { label: "Current Affairs", href: ROUTES.currentAffairs },
          { label: item.title },
        ]}
      >
        <ul className="flex flex-wrap gap-2">
          {item.relevance.map((stage) => (
            <li key={stage}>
              <Badge tone="kesar">{stage}</Badge>
            </li>
          ))}
        </ul>
      </PageHero>

      <Section containerSize="narrow">
        <p className="text-body text-ink-secondary sm:text-body-lg">{item.whyItMatters}</p>
      </Section>

      <CTASection
        title="Current affairs, connected to the syllabus."
        description="See how a class turns a development like this into Prelims facts and Mains arguments."
        location="current-affair-detail-final"
      />
    </>
  );
}
