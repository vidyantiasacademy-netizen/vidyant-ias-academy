import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { redirect } from "next/navigation";

import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CTASection } from "@/components/ui/CTASection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TrackedButtonLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CTA, ROUTES } from "@/lib/constants/site";
import { isAppError } from "@/lib/errors";
import { formatIst } from "@/lib/exam/ist";
import { readAttemptToken } from "@/lib/mock-test/access";
import type { MockResultView } from "@/lib/mock-test/types";
import { cn } from "@/lib/utils/cn";
import { mockTestService } from "@/services/mock-tests/mock-test.service";

export const metadata: Metadata = {
  title: "Your mock test result",
  robots: { index: false, follow: false },
};

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

/**
 * A visitor's scorecard. Private to the browser that sat the paper — the
 * attempt token in its cookie is checked before anything is read — so the URL
 * can be bookmarked but not passed around.
 *
 * The page's job after the numbers is the next step: the weak subjects are
 * named, and the counselling call is offered as the way to fix them.
 */
export default async function MockResultPage({
  params,
}: PageProps<"/[lang]/mock-test/result/[attemptId]">) {
  const { attemptId } = await params;

  let view: MockResultView | null;
  try {
    view = await mockTestService.getResult(attemptId, await readAttemptToken(attemptId));
  } catch (error) {
    if (isAppError(error)) return <Private />;
    throw error;
  }

  // Still being sat: back to the paper.
  if (!view) redirect(`/mock-test/sit/${attemptId}`);

  const { result, paper } = view;
  const firstName = view.name.split(/\s+/)[0] ?? view.name;

  const stats: [string, string][] = [
    ["Correct", String(result.correctCount)],
    ["Wrong", String(result.wrongCount)],
    ["Unattempted", String(result.unattemptedCount)],
    ["Negative marks", result.negativeMarks > 0 ? `−${result.negativeMarks}` : "0"],
  ];

  return (
    <>
      <PageHero
        eyebrow="Mock test result"
        title={`Your result, ${firstName}.`}
        description={paper.title}
        breadcrumbs={[
          { label: "Home", href: ROUTES.home },
          { label: "Free mock test", href: ROUTES.mockTest },
          { label: "Result" },
        ]}
      />

      <Section containerSize="wide">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card tone="indigo" padding="lg">
            <p className="text-eyebrow font-semibold uppercase text-white/70">Your score</p>
            <p className="mt-2 text-hero font-semibold tabular-nums">
              {view.score}
              <span className="text-h3 font-bold text-white/70"> / {result.totalMarks}</span>
            </p>
            <dl className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {stats.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-eyebrow font-semibold uppercase text-white/70">{label}</dt>
                  <dd className="mt-1 text-h4 font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
            {view.autoSubmitted ? (
              <p className="mt-6 text-small text-white/80">
                Time ran out, so the paper was scored on the answers saved before the deadline.
              </p>
            ) : null}
          </Card>

          <Card padding="lg" className="flex flex-col justify-center">
            <p className="text-eyebrow font-semibold uppercase text-kesar-600">Your rank</p>
            <p className="mt-2 text-hero font-semibold tabular-nums text-indigo">
              #{view.rank}
              <span className="text-h3 font-bold text-ink-secondary"> of {view.totalCandidates}</span>
            </p>
            <p className="mt-3 text-body text-ink-secondary">
              {view.percentile !== null
                ? `You scored higher than ${view.percentile}% of the aspirants who have taken this paper.`
                : "Among everyone who has taken this paper so far. Your rank updates as more aspirants finish it."}
            </p>
          </Card>
        </div>
      </Section>

      <Section tone="paper" containerSize="wide">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
          <div>
            <SectionHeader layout="stack" eyebrow="By subject" title="Where your marks came from" />
            <ul className="mt-8 space-y-5">
              {result.subjectBreakdown.map((row) => {
                const share = row.totalMarks > 0 ? Math.max(0, row.score) / row.totalMarks : 0;
                const weak = view.weakSubjects.includes(row.subject);

                return (
                  <li key={row.subject}>
                    <div className="flex items-baseline justify-between gap-4 text-small">
                      <span className={cn("font-bold", weak ? "text-chilli-700" : "text-indigo")}>
                        {row.subject}
                        {weak ? " · needs work" : ""}
                      </span>
                      <span className="tabular-nums text-ink-secondary">
                        {row.score} / {row.totalMarks} · {row.correctCount} right, {row.wrongCount} wrong
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 bg-white" aria-hidden>
                      <div
                        className={cn("h-full", weak ? "bg-chilli" : "bg-indigo")}
                        style={{ width: `${Math.round(share * 100)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <Card padding="lg" className="self-start">
            <h2 className="text-h3 font-bold text-indigo">What to do with this</h2>
            <p className="mt-3 text-body text-ink-secondary">
              {view.weakSubjects.length > 0
                ? `${view.weakSubjects.join(" and ")} cost you the most marks on this paper. That is the place to start — and the fastest gains are usually there.`
                : "One paper is a snapshot. A plan built around it is what moves the score on the next one."}
            </p>
            <p className="mt-3 text-body text-ink-secondary">
              A counsellor can go through this result with you on a free 20-minute call and turn it
              into a study plan for your attempt.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <TrackedButtonLink
                href={CTA.counselling.href}
                event={ANALYTICS_EVENTS.counsellingClick}
                payload={{ location: "mock-result" }}
              >
                Discuss my result — free
              </TrackedButtonLink>
              <ButtonLink href={ROUTES.courses} variant="secondary">
                See the programs
              </ButtonLink>
            </div>
          </Card>
        </div>
      </Section>

      <Section containerSize="default">
        <SectionHeader
          eyebrow="Answer key"
          title="Every question, with the answer"
          description={
            view.review
              ? "Your choice is marked against the correct answer. Read the explanation for every one you got wrong."
              : undefined
          }
        />

        {view.review ? (
          <ol className="mt-10 space-y-6">
            {view.review.map((question, number) => {
              const answered = question.selectedOptionIds.length > 0;
              const correct =
                answered &&
                question.selectedOptionIds.length === question.correctOptionIds.length &&
                question.selectedOptionIds.every((id) => question.correctOptionIds.includes(id));

              return (
                <li key={question.id}>
                  <Card padding="md">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <p className="text-eyebrow font-semibold uppercase text-ink-secondary">
                        Question {number + 1} · {question.subject}
                      </p>
                      <p
                        className={cn(
                          "text-eyebrow font-bold uppercase",
                          !answered ? "text-ink-secondary" : correct ? "text-success" : "text-danger",
                        )}
                      >
                        {!answered ? "Not answered" : correct ? "Correct" : "Wrong"}
                      </p>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-body">{question.statement}</p>

                    <ul className="mt-4 space-y-2">
                      {question.options.map((option, optionIndex) => {
                        const isKey = question.correctOptionIds.includes(option.id);
                        const isPicked = question.selectedOptionIds.includes(option.id);

                        return (
                          <li
                            key={option.id}
                            className={cn(
                              "flex items-start gap-3 border px-4 py-3 text-small",
                              isKey
                                ? "border-success bg-success-50"
                                : isPicked
                                  ? "border-danger bg-danger-50"
                                  : "border-line",
                            )}
                          >
                            <span className="font-semibold">{LETTERS[optionIndex] ?? optionIndex + 1}.</span>
                            <span className="flex-1">{option.text}</span>
                            {isKey ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-success">
                                <Check aria-hidden className="size-4" />
                                Answer
                              </span>
                            ) : isPicked ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-danger">
                                <X aria-hidden className="size-4" />
                                Your choice
                              </span>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>

                    {question.explanation ? (
                      <p className="mt-4 whitespace-pre-line border-l-4 border-kesar bg-paper p-4 text-small text-ink">
                        {question.explanation}
                      </p>
                    ) : null}
                  </Card>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-8 text-body text-ink-secondary">
            The answer key and explanations open on {formatIst(view.keyVisibleFrom)}, once everyone
            has had the chance to sit the paper. Come back to this page from this browser to see them.
          </p>
        )}
      </Section>

      <CTASection
        title="Turn this score into a plan."
        description="A free counselling call ends with a written roadmap for your attempt — whether or not you join."
        location="mock-result-final"
      />
    </>
  );
}

function Private() {
  return (
    <Section containerSize="narrow">
      <div className="border border-line bg-white p-7 text-center sm:p-9">
        <h1 className="text-h3 font-bold">This result is private</h1>
        <p className="mt-3 text-body text-ink-secondary">
          A mock test result opens only in the browser that took the test. Our counsellors also
          have a copy — ask for it on a free counselling call.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href={CTA.counselling.href}>{CTA.counselling.label}</ButtonLink>
          <ButtonLink href={ROUTES.mockTest} variant="secondary">
            Free mock test
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
