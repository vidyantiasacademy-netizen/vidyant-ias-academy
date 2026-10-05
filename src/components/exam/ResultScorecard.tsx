import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import type { ReviewQuestion } from "@/services/tests/test.service";
import type { Result, TestAttempt } from "@/types/db";

/**
 * The scorecard, and the paper replayed with its key.
 *
 * Numbers come from `results`, which no client can write — the figures a student
 * reads here are the same ones the institute's rank list is built from, by
 * construction rather than by convention.
 *
 * The review half renders only once the server has agreed to hand over the key
 * (`getReview` enforces the result window). If it did not, the page passes `null`
 * and this component says why rather than drawing an empty paper.
 */

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function ResultScorecard({
  result,
  attempt,
  totalQuestions,
}: {
  result: Result;
  attempt: TestAttempt;
  totalQuestions: number;
}) {
  const stats: [string, string][] = [
    ["Correct", String(result.correctCount)],
    ["Wrong", String(result.wrongCount)],
    ["Unattempted", String(result.unattemptedCount)],
    [
      "Negative marks",
      result.negativeMarks > 0 ? `−${result.negativeMarks}` : "0",
    ],
  ];

  return (
    <>
      <Card tone="indigo" padding="lg">
        <p className="text-eyebrow font-semibold uppercase text-white/70">Your score</p>
        <p className="mt-2 text-hero font-semibold tabular-nums">
          {result.score}
          <span className="text-h3 font-semibold text-white/70"> / {result.totalMarks}</span>
        </p>

        <dl className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label}>
              <dt className="text-eyebrow font-semibold uppercase text-white/70">
                {label}
              </dt>
              <dd className="mt-1 text-h4 font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {result.rank !== null ? (
          <p className="mt-6 text-small text-white/80">
            Rank {result.rank}
            {result.percentile !== null ? ` · ${result.percentile} percentile` : ""}
          </p>
        ) : null}
      </Card>

      {attempt.autoSubmitted ? (
        <p className="mt-5 rounded-md bg-kesar-100 px-4 py-3 text-small font-semibold text-kesar-700">
          {attempt.terminationReason === "violations"
            ? "This paper was submitted automatically because the exam rules were broken during the sitting. Speak to the centre if you believe that was an error."
            : "This paper was submitted automatically when the time ran out."}
        </p>
      ) : null}

      {result.subjectBreakdown.length > 1 ? (
        <section className="mt-10">
          <h2 className="text-h3 font-semibold">Where the marks went</h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-md border-collapse text-body">
              <thead>
                <tr className="border-b border-line text-left text-small text-ink-secondary">
                  <th scope="col" className="py-2 pr-4 font-semibold">Subject</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Score</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Correct</th>
                  <th scope="col" className="py-2 font-semibold">Wrong</th>
                </tr>
              </thead>
              <tbody>
                {result.subjectBreakdown.map((row) => (
                  <tr key={row.subject} className="border-b border-line last:border-0">
                    <th scope="row" className="py-3 pr-4 text-left font-semibold">
                      {row.subject}
                    </th>
                    <td className="py-3 pr-4 tabular-nums">
                      {row.score} / {row.totalMarks}
                    </td>
                    <td className="py-3 pr-4 tabular-nums">{row.correctCount}</td>
                    <td className="py-3 tabular-nums">{row.wrongCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-small text-ink-secondary tabular-nums">
        {totalQuestions} questions · submitted{" "}
        {attempt.submittedAt
          ? new Date(attempt.submittedAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "numeric",
              minute: "2-digit",
            })
          : "—"}
      </p>
    </>
  );
}

export function ReviewList({ questions }: { questions: ReviewQuestion[] }) {
  return (
    <ol className="mt-6 space-y-5">
      {questions.map((question, index) => {
        const attempted = question.selectedOptionIds.length > 0;

        return (
          <li key={question.id}>
            <Card tone="white" padding="md">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="text-eyebrow font-semibold uppercase text-ink-secondary">
                  Question {index + 1}
                  {question.subject ? ` · ${question.subject}` : ""}
                </p>
                <p
                  className={cn(
                    "text-small font-semibold",
                    question.isCorrect
                      ? "text-success"
                      : attempted
                        ? "text-danger"
                        : "text-ink-secondary",
                  )}
                >
                  {question.isCorrect
                    ? `Correct · +${question.marksAwarded ?? question.marks}`
                    : attempted
                      ? `Wrong · ${question.marksAwarded ?? 0}`
                      : "Not attempted"}
                </p>
              </div>

              <p className="mt-3 whitespace-pre-line text-body">{question.statement}</p>

              <ul className="mt-4 space-y-2">
                {question.options.map((option, optionIndex) => {
                  const isCorrect = question.correctOptionIds.includes(option.id);
                  const wasChosen = question.selectedOptionIds.includes(option.id);

                  return (
                    <li
                      key={option.id}
                      className={cn(
                        "rounded-md border px-4 py-3 text-body",
                        isCorrect
                          ? "border-success bg-success-50"
                          : wasChosen
                            ? "border-danger bg-danger-50"
                            : "border-line",
                      )}
                    >
                      <span className="mr-2 font-semibold">
                        {LETTERS[optionIndex] ?? optionIndex + 1}.
                      </span>
                      {option.text}
                      {/* Spelled out rather than shown by colour alone. */}
                      {isCorrect ? (
                        <span className="ml-2 text-small font-semibold text-success">
                          correct answer
                        </span>
                      ) : null}
                      {wasChosen && !isCorrect ? (
                        <span className="ml-2 text-small font-semibold text-danger">
                          your answer
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>

              {question.explanation ? (
                <div className="mt-4 rounded-md bg-paper p-4">
                  <p className="text-eyebrow font-semibold uppercase text-ink-secondary">
                    Explanation
                  </p>
                  <p className="mt-2 whitespace-pre-line text-body">
                    {question.explanation}
                  </p>
                </div>
              ) : null}
            </Card>
          </li>
        );
      })}
    </ol>
  );
}
