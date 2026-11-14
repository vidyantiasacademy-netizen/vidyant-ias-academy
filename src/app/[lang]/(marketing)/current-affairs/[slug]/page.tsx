import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";

import { RichText } from "@/components/content/RichText";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/Badge";
import { CTASection } from "@/components/ui/CTASection";
import { getLocale } from "@/i18n/server";
import { ROUTES } from "@/lib/constants/site";
import { getCurrentAffair, getCurrentAffairs } from "@/lib/sanity/queries";
import { pageMetadata } from "@/lib/seo/metadata";
import { articleSchema, jsonLd } from "@/lib/seo/structured-data";

export async function generateStaticParams() {
  return (await getCurrentAffairs(200)).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/current-affairs/[slug]">) {
  const { slug } = await params;
  const item = await getCurrentAffair(slug, await getLocale());

  if (!item) {
    return pageMetadata({
      title: "Analysis not found",
      description: "This analysis is no longer published.",
      path: `${ROUTES.currentAffairs}/${slug}`,
      noIndex: true,
    });
  }

  return pageMetadata({
    title: item.seo?.title ?? item.title,
    description: item.seo?.description ?? item.summary ?? item.title,
    path: `${ROUTES.currentAffairs}/${item.slug}`,
    noIndex: item.seo?.noIndex ?? false,
    type: "article",
    publishedTime: item.date,
  });
}

const DATE = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default async function CurrentAffairPage({
  params,
}: PageProps<"/[lang]/current-affairs/[slug]">) {
  const { slug } = await params;
  const locale = await getLocale();
  const item = await getCurrentAffair(slug, locale);

  if (!item) notFound();

  const relevance = item.relevance ?? [];
  const sources = item.sources ?? [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            articleSchema({
              headline: item.title,
              description: item.summary,
              path: `${ROUTES.currentAffairs}/${item.slug}`,
              locale,
              datePublished: item.date,
              section: item.category,
            }),
          ),
        }}
      />
      <PageHero
        eyebrow={item.category}
        title={item.title}
        description={item.summary ?? undefined}
        breadcrumbs={[
          { label: "Home", href: ROUTES.home },
          { label: "Current Affairs", href: ROUTES.currentAffairs },
          { label: item.title },
        ]}
      >
        {relevance.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {relevance.map((stage) => (
              <li key={stage}>
                <Badge tone="kesar">{stage}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </PageHero>

      <Section containerSize="narrow">
        {/* `date` is a calendar date with no time; format it in UTC so it
            never shifts a day in either direction. */}
        <p className="text-small text-ink-muted">
          {DATE.format(new Date(`${item.date}T00:00:00Z`))}
        </p>
        <RichText value={item.content} className="mt-8" />

        {sources.length > 0 ? (
          <div className="mt-12 border-t border-line pt-6">
            <h2 className="text-eyebrow font-semibold uppercase text-ink-muted">Sources</h2>
            <ul className="mt-3 space-y-2">
              {sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-small font-medium text-indigo underline underline-offset-2 hover:text-indigo-900"
                  >
                    {source.label}
                    <ExternalLink aria-hidden className="size-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>

      <CTASection
        title="Current affairs, connected to the syllabus."
        description="See how a class turns a development like this into Prelims facts and Mains arguments."
        location="current-affair-detail-final"
      />
    </>
  );
}
