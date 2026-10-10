import { BadgeCheck, ShieldCheck } from "lucide-react";

import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { ResultsExplorer } from "@/components/results/ResultsExplorer";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CTASection } from "@/components/ui/CTASection";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { publishedResults, RESULT_STAGES } from "@/data/results";
import { CTA, ROUTES } from "@/lib/constants/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = () => pageMetadata({
  title: "Results",
  description:
    "vidyantIAS publishes only verified UPSC results — the candidate, the stage cleared and the year — with the student's consent. No estimated or aggregated selection counts.",
  path: ROUTES.results,
});

export default function ResultsPage() {
  const hasResults = publishedResults.length > 0;

  return (
    <>
      <PageHero
        eyebrow="Results"
        title="Results that can be verified."
        description="We believe credibility should be built on transparent, verifiable outcomes — not on numbers that cannot be checked."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Results" }]}
      />

      <Section containerSize="wide">
        {hasResults ? (
          <ResultsExplorer results={publishedResults} />
        ) : (
          <EmptyState
            icon={<BadgeCheck aria-hidden className="size-5" />}
            title="No results published yet"
            description="vidyantIAS has not completed an examination cycle, so there is nothing verified to publish. This page will list each candidate's stage — Prelims, Mains, Interview or Final Selection — once results exist and students consent to being named."
            action={
              <ButtonLink href={CTA.counselling.href} variant="primary">
                {CTA.counselling.label}
              </ButtonLink>
            }
          />
        )}
      </Section>

      <Section tone="paper" containerSize="wide">
        <SectionHeader
          eyebrow="Our standard"
          title="What we will and will not publish"
          description="Stated up front, so you can hold us to it."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:gap-5">
          <Card>
            <ShieldCheck aria-hidden className="size-5 text-kesar-600" />
            <h3 className="mt-5 text-h4 font-bold">We will publish</h3>
            <ul className="mt-4 space-y-2.5 text-body text-ink-secondary">
              <li>Named candidates who have consented, with the stage cleared.</li>
              <li>The year and, where relevant, the optional subject.</li>
              <li>Which vidyantIAS program the student was enrolled in.</li>
            </ul>
          </Card>
          <Card>
            <ShieldCheck aria-hidden className="size-5 text-danger" />
            <h3 className="mt-5 text-h4 font-bold">We will not publish</h3>
            <ul className="mt-4 space-y-2.5 text-body text-ink-secondary">
              <li>Selection counts that mix test-series users with enrolled students.</li>
              <li>Ranks of candidates who only attended a free session.</li>
              <li>Any figure we cannot substantiate on request.</li>
            </ul>
          </Card>
        </div>

        <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-small text-ink-secondary">
          {RESULT_STAGES.map((stage) => (
            <li key={stage.id}>{stage.label}</li>
          ))}
        </ul>
      </Section>

      <CTASection
        title="Start the attempt you intend to clear."
        description="Speak with the academic team about the programs, the testing calendar and what your target attempt realistically needs."
        location="results-final"
      />
    </>
  );
}
