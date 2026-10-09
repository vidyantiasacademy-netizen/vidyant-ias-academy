import type { Metadata } from "next";

import { ResultScorecard, ReviewList } from "@/components/exam/ResultScorecard";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { BRAND } from "@/lib/constants/site";
import { isAppError } from "@/lib/errors";
import { testService } from "@/services/tests/test.service";
import type { ReviewQuestion } from "@/services/tests/test.service";

/**
 * The scorecard for one paper.
 *
 * Three refusals are normal here and none of them are errors: the paper was never
 * sat, it is still in progress, or the result window has not opened. Each gets its
 * own answer — the last one especially, because "your result is not out yet" and
 * "something went wrong" look identical to a student if both render as an error
 * page.
 */
export const metadata: Metadata = {
  title: `Result | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

export default async function ResultPage({
  params,
}: PageProps<"/[lang]/dashboard/tests/[testId]/result">) {
  const { testId } = await params;

  const test = await testService.getTest(testId);
  const attempt = await testService.findOwnAttempt(testId);

  if (!attempt) {
    return (
      <EmptyState
        title="You have not sat this paper"
        description="There is no attempt on record for this test, so there is nothing to score."
        action={
          <ButtonLink href={`/dashboard/tests/${testId}`} variant="secondary">
            Back to the paper
          </ButtonLink>
        }
      />
    );
  }

  if (attempt.status === "in-progress") {
    return (
      <EmptyState
        title="This paper is still open"
        description="Your sitting has not been submitted. Finish it to see your score — the timer is still running."
        action={
          <ButtonLink href={`/exam/${testId}`} variant="primary">
            Resume the paper
          </ButtonLink>
        }
      />
    );
  }

  let result;
  let notOutYet: string | null = null;

  try {
    result = await testService.getResult(attempt.id);
  } catch (error) {
    if (!isAppError(error)) throw error;
    notOutYet = error.message;
  }

  let review: ReviewQuestion[] | null = null;
  let reviewMessage: string | null = null;

  if (result) {
    try {
      review = await testService.getReview(attempt.id);
    } catch (error) {
      if (!isAppError(error)) throw error;
      reviewMessage = error.message;
    }
  }

  return (
    <>
      <h1 className="text-h2 font-semibold">{test.title}</h1>
      <p className="mt-2 text-body text-ink-secondary">
        {test.questionCount} questions · {test.totalMarks} marks
        {test.subject ? ` · ${test.subject}` : ""}
      </p>

      <div className="mt-8">
        {result ? (
          <ResultScorecard
            result={result}
            attempt={attempt}
            totalQuestions={test.questionCount}
          />
        ) : (
          <EmptyState
            title="Your result is not out yet"
            description={
              notOutYet ??
              "This paper is with the evaluators. Your scorecard appears here as soon as it is released."
            }
            action={
              <ButtonLink href="/dashboard/prelims" variant="secondary">
                Back to the test series
              </ButtonLink>
            }
          />
        )}
      </div>

      {review ? (
        <section className="mt-12">
          <h2 className="text-h3 font-semibold">Answers and explanations</h2>
          <p className="mt-2 text-body text-ink-secondary">
            In the order you sat them — every student gets a different order.
          </p>
          <ReviewList questions={review} />
        </section>
      ) : reviewMessage ? (
        <p className="mt-12 rounded-md bg-paper px-4 py-3 text-small text-ink-secondary">
          {reviewMessage}
        </p>
      ) : null}
    </>
  );
}
