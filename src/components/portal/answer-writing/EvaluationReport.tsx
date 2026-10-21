import { FileCheck } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { summariseWriting } from "@/lib/answer-writing/policy";
import type { ReleasedEvaluation } from "@/services/answer-writing/answer-writing.service";

import { RubricBars } from "./RubricBars";

/**
 * A returned copy, as its student reads it: the score, the checked copy with
 * the evaluator's marks in its margins, marks question by question, the rubric,
 * and the written feedback.
 */
export function EvaluationReport({
  testId,
  evaluation,
}: {
  testId: string;
  evaluation: ReleasedEvaluation;
}) {
  const percent = evaluation.totalMarks
    ? Math.round((evaluation.score / evaluation.totalMarks) * 1000) / 10
    : 0;
  const { weakest } = summariseWriting([evaluation]);

  const feedback = [
    { title: "What worked", body: evaluation.strengths },
    { title: "What to improve", body: evaluation.improvements },
    { title: "Evaluator's remarks", body: evaluation.remarks },
  ].filter((item): item is { title: string; body: string } => Boolean(item.body));

  return (
    <section aria-labelledby="evaluation-heading" className="space-y-6">
      <Card tone="indigo" padding="md">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="evaluation-heading" className="text-eyebrow font-bold uppercase text-white/80">
              Your evaluated copy
            </h2>
            <p className="mt-2 text-h1 font-bold tabular-nums">
              {evaluation.score}
              <span className="text-h3 font-semibold text-white/75"> / {evaluation.totalMarks}</span>
            </p>
            <p className="mt-1 text-body text-white/85">
              {percent}%
              {evaluation.rank !== null ? ` · Rank ${evaluation.rank}` : ""}
              {evaluation.percentile !== null ? ` · ${evaluation.percentile} percentile` : ""}
            </p>
          </div>

          {evaluation.hasCheckedCopy ? (
            <a
              href={`/dashboard/mains/${testId}/file/checked-copy`}
              target="_blank"
              rel="noopener"
              className="inline-flex h-12 items-center justify-center gap-2 border-2 border-white px-5 text-small font-bold text-white transition-colors hover:bg-white hover:text-indigo sm:text-body"
            >
              <FileCheck aria-hidden className="size-4" />
              Open checked copy
            </a>
          ) : null}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="md">
          <h3 className="text-h4 font-semibold">Marks by question</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-line text-ink-secondary">
                <tr>
                  <th scope="col" className="py-2 pr-3 font-semibold">Question</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Marks</th>
                  <th scope="col" className="py-2 font-semibold">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {evaluation.questions.map((question) => (
                  <tr key={question.label} className="align-top">
                    <th scope="row" className="py-2.5 pr-3 font-semibold">{question.label}</th>
                    <td className="whitespace-nowrap py-2.5 pr-3 tabular-nums">
                      {question.attempted ? (
                        `${question.marksAwarded ?? 0} / ${question.maxMarks}`
                      ) : (
                        <span className="text-ink-secondary">Not attempted</span>
                      )}
                    </td>
                    <td className="whitespace-pre-line py-2.5 text-ink-secondary">
                      {question.remark ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card padding="md">
          <h3 className="text-h4 font-semibold">How your writing was assessed</h3>
          <div className="mt-5">
            <RubricBars scores={evaluation.rubric} weakest={weakest?.key ?? null} />
          </div>
        </Card>
      </div>

      {feedback.length > 0 ? (
        <Card padding="md" className="grid gap-6 md:grid-cols-3">
          {feedback.map((item) => (
            <div key={item.title}>
              <h3 className="text-body-lg font-semibold">{item.title}</h3>
              <p className="mt-2 whitespace-pre-line text-body text-ink-secondary">{item.body}</p>
            </div>
          ))}
        </Card>
      ) : null}
    </section>
  );
}
