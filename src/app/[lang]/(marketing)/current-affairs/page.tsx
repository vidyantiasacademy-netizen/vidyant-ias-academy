import { Newspaper } from "lucide-react";

import { CurrentAffairCard } from "@/components/current-affairs/CurrentAffairCard";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CTASection } from "@/components/ui/CTASection";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlaceholderVisual } from "@/components/ui/PlaceholderVisual";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CURRENT_AFFAIRS_COVERAGE } from "@/data/current-affairs";
import { getLocale } from "@/i18n/server";
import { ROUTES } from "@/lib/constants/site";
import { getSiteCurrentAffairs } from "@/lib/content/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = () => pageMetadata({
  title: "UPSC Current Affairs Analysis",
  description:
    "Daily current affairs explained for UPSC by vidyantIAS Pune: what happened, why it matters for the examination, the static syllabus link and where it can be used in Prelims or Mains.",
  path: ROUTES.currentAffairs,
  keywords: ["UPSC current affairs", "current affairs for IAS", "UPSC daily news analysis"],
});

export default async function CurrentAffairsPage() {
  const articles = await getSiteCurrentAffairs(await getLocale());

  return (
    <>
      <PageHero
        eyebrow="Current Affairs"
        title="Current affairs, explained for UPSC."
        description="Every analysis answers the same three questions: what happened, why it matters for this examination, and where it connects to the static syllabus."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Current Affairs" }]}
      />

      <Section containerSize="wide">
        {articles.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {articles.map((item) => (
              <li key={item.id}>
                <CurrentAffairCard item={item} />
              </li>
            ))}
          </ul>
        ) : (
          <>
            <EmptyState
              icon={<Newspaper aria-hidden className="size-5" />}
              title="The desk starts publishing shortly"
              description="We are not filling this page with sample articles. Dated analysis that is not real would be worse than an empty page for an aspirant relying on it. Below is exactly what each analysis will contain when publishing begins."
              action={
                <ButtonLink href={ROUTES.resources} variant="primary">
                  Use our free resources meanwhile
                </ButtonLink>
              }
            />

            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {CURRENT_AFFAIRS_COVERAGE.map((topic) => (
                <li key={topic.subject}>
                  <Card className="h-full">
                    <p className="text-eyebrow font-semibold uppercase text-kesar-600">
                      {topic.subject}
                    </p>
                    <p className="mt-3 text-small text-ink-secondary">{topic.note}</p>
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>

      <Section tone="paper" containerSize="default">
        <SectionHeader
          eyebrow="How to use current affairs"
          title="Reading the news is not preparation."
          description="Coverage becomes useful only when it is filtered by the syllabus and attached to something you already know."
        />
        <PlaceholderVisual
          imageKey="newspaper"
          tone="paper"
          className="mt-10 aspect-video w-full sm:aspect-[21/9]"
        />
        <Card className="mt-5">
          <ol className="space-y-4 text-body text-ink-secondary">
            <li>
              <span className="font-semibold text-indigo">Filter first.</span> If a development
              cannot be mapped to a syllabus heading, it is general reading, not preparation.
            </li>
            <li>
              <span className="font-semibold text-indigo">Attach, don&apos;t collect.</span> Add
              the item to the static topic it belongs to instead of maintaining a separate
              pile of notes.
            </li>
            <li>
              <span className="font-semibold text-indigo">Convert into questions.</span> If you
              cannot frame a Prelims statement or a Mains demand from it, you have not
              finished with it.
            </li>
          </ol>
        </Card>
      </Section>

      <CTASection
        title="Turn daily reading into exam marks."
        description="Our programs build current affairs into the teaching cycle rather than leaving it as homework."
        location="current-affairs-final"
      />
    </>
  );
}
