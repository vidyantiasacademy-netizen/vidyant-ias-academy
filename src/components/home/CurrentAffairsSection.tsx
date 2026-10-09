import { ArrowRight, Newspaper } from "lucide-react";

import { CurrentAffairCard } from "@/components/current-affairs/CurrentAffairCard";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CURRENT_AFFAIRS_COVERAGE } from "@/data/current-affairs";
import { getLocale } from "@/i18n/server";
import { ROUTES } from "@/lib/constants/site";
import { getSiteCurrentAffairs } from "@/lib/content/site";

export async function CurrentAffairsSection() {
  const articles = await getSiteCurrentAffairs(await getLocale(), 3);

  return (
    <Section tone="paper" id="current-affairs" containerSize="wide">
      <SectionHeader
        eyebrow="Current Affairs"
        title="Current affairs, explained for UPSC."
        description="News is only useful when it is connected to the syllabus and to the way questions are asked. That connection is the whole point of our daily analysis."
        action={
          <ButtonLink href={ROUTES.currentAffairs} variant="secondary">
            {articles.length > 0 ? "Read current affairs" : "See what we cover"}
          </ButtonLink>
        }
      />

      {articles.length > 0 ? (
        <ul className="mt-7 grid gap-4 md:grid-cols-2 lg:mt-9 lg:grid-cols-3 lg:gap-5">
          {articles.map((item) => (
            <li key={item.id}>
              <CurrentAffairCard item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8">
          <Card className="flex items-start gap-4 bg-white">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-paper text-kesar-600">
              <Newspaper aria-hidden className="size-5" />
            </span>
            <p className="text-body text-ink-secondary">
              Our current affairs desk publishes shortly. Rather than fill this space with
              sample articles, here is exactly what each analysis will contain: the
              development, why it matters for UPSC, the static syllabus link, and where it
              can be used in Prelims or Mains.
            </p>
          </Card>

          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
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

          <ButtonLink href={ROUTES.resources} variant="link" className="mt-7 px-0">
            Meanwhile, use our free syllabus and booklist
            <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        </div>
      )}
    </Section>
  );
}
