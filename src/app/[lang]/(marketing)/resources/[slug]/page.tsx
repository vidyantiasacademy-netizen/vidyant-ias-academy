import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { RichText } from "@/components/content/RichText";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { Badge } from "@/components/ui/Badge";
import { CTASection } from "@/components/ui/CTASection";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { RESOURCE_TYPE_LABELS } from "@/data/resources";
import { getLocale } from "@/i18n/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { ROUTES } from "@/lib/constants/site";
import { getSiteResources } from "@/lib/content/site";
import { getFreeResource, getFreeResourceSlugs } from "@/lib/sanity/queries";
import { pageMetadata } from "@/lib/seo/metadata";
import { articleSchema, jsonLd } from "@/lib/seo/structured-data";

export async function generateStaticParams() {
  return (await getFreeResourceSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/resources/[slug]">) {
  const { slug } = await params;
  const resource = await getFreeResource(slug, await getLocale());

  if (!resource) {
    return pageMetadata({
      title: "Resource not found",
      description: "This resource is no longer published.",
      path: `${ROUTES.resources}/${slug}`,
      noIndex: true,
    });
  }

  return pageMetadata({
    title: resource.seo?.title ?? `${resource.title} — Free UPSC Resource`,
    description: resource.seo?.description ?? resource.description ?? resource.title,
    path: `${ROUTES.resources}/${resource.slug}`,
    noIndex: resource.seo?.noIndex ?? false,
    type: "article",
    modifiedTime: resource._updatedAt,
  });
}

const TRACK_LABELS: Record<string, string> = {
  beginner: "Beginner",
  prelims: "Prelims",
  mains: "Mains",
  optional: "Optional",
  "current-affairs": "Current Affairs",
};

const UPDATED = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });

/**
 * A free resource, read on the page. View-only: no file is offered for
 * download, even if one is attached in the Studio.
 */
export default async function ResourcePage({ params }: PageProps<"/[lang]/resources/[slug]">) {
  const { slug } = await params;
  const locale = await getLocale();
  const [resource, all] = await Promise.all([getFreeResource(slug, locale), getSiteResources(locale)]);

  if (!resource) notFound();

  const path = `${ROUTES.resources}/${resource.slug}`;
  const payload = { location: "resource-page", resource: resource._id };
  // Other free reading, preferring resources that share a track with this one.
  const others = all.filter((item) => item.slug !== resource.slug && item.price === null);
  const related = [
    ...others.filter((item) => item.tracks.some((track) => resource.tracks.includes(track))),
    ...others.filter((item) => !item.tracks.some((track) => resource.tracks.includes(track))),
  ].slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            articleSchema({
              headline: resource.title,
              description: resource.description,
              path,
              locale,
              dateModified: resource._updatedAt,
              section: resource.category ?? RESOURCE_TYPE_LABELS[resource.resourceType],
            }),
          ),
        }}
      />
      <PageHero
        eyebrow="Free Resource"
        title={resource.title}
        description={resource.description ?? undefined}
        breadcrumbs={[
          { label: "Home", href: ROUTES.home },
          { label: "Resources", href: ROUTES.resources },
          { label: resource.title },
        ]}
      >
        <ul className="flex flex-wrap gap-2">
          <li>
            <Badge tone="success">Free</Badge>
          </li>
          {/* Read on the page, not downloaded — no "PDF" label. */}
          {resource.resourceType !== "pdf" ? (
            <li>
              <Badge tone="neutral">{RESOURCE_TYPE_LABELS[resource.resourceType]}</Badge>
            </li>
          ) : null}
          {resource.tracks.map((track) => (
            <li key={track}>
              <Badge tone="kesar">{TRACK_LABELS[track] ?? track}</Badge>
            </li>
          ))}
        </ul>
      </PageHero>

      <Section containerSize="narrow">
        <p className="text-small text-ink-muted">
          Updated {UPDATED.format(new Date(resource._updatedAt))}
        </p>
        <RichText value={resource.content} className="mt-8" />


        <TrackedLink
          href={ROUTES.resources}
          event={ANALYTICS_EVENTS.resourceOpen}
          payload={{ ...payload, action: "back-to-library" }}
          className="mt-10 inline-flex min-h-11 items-center gap-2 text-small font-bold text-indigo"
        >
          <ArrowLeft aria-hidden className="size-4" />
          All free resources
        </TrackedLink>
      </Section>

      {related.length > 0 ? (
        <Section tone="paper" containerSize="wide">
          <h2 className="border-t-2 border-indigo pt-3 text-h3 font-bold text-indigo">Keep reading</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {related.map((item) => (
              <li key={item.id}>
                <ResourceCard resource={item} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <CTASection
        title="Want this turned into a plan for your attempt?"
        description="A counselling call converts what you just read into a sequence with dates, tests and review points."
        location="resource-detail-final"
      />
    </>
  );
}
