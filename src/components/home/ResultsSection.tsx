import { BadgeCheck } from "lucide-react";

import { Section } from "@/components/layout/Section";
import { ResultCard } from "@/components/results/ResultCard";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { publishedResults, RESULT_STAGES } from "@/data/results";
import { CTA, ROUTES } from "@/lib/constants/site";

export function ResultsSection() {
  const results = publishedResults.slice(0, 4);

  return (
    <Section id="results" containerSize="wide">
      <SectionHeader
        eyebrow="Results"
        title="Results that can be verified."
        description="We believe credibility should be built on transparent, verifiable outcomes — a named candidate, a stage cleared, and a record we can confirm."
        action={
          results.length > 0 ? (
            <ButtonLink href={ROUTES.results} variant="secondary">
              View Results
            </ButtonLink>
          ) : undefined
        }
      />

      {results.length > 0 ? (
        <>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {results.map((result) => (
              <li key={result.id}>
                <ResultCard result={result} />
              </li>
            ))}
          </ul>
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-small text-ink-secondary">
            {RESULT_STAGES.map((stage) => (
              <li key={stage.id}>{stage.label}</li>
            ))}
          </ul>
        </>
      ) : (
        <EmptyState
          className="mt-12"
          icon={<BadgeCheck aria-hidden className="size-5" />}
          title="No results published yet"
          description="vidyantIAS has not completed an examination cycle, so there is nothing verified to publish. When there is, this page will list the stage cleared for each candidate — Prelims, Mains, Interview or Final Selection — with their consent. We will never publish a number we cannot substantiate."
          action={
            <ButtonLink href={CTA.counselling.href} variant="primary">
              {CTA.counselling.label}
            </ButtonLink>
          }
        />
      )}
    </Section>
  );
}
