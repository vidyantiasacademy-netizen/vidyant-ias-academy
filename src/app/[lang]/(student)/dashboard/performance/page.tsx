import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, ChartLine } from "lucide-react";

import Link from "@/i18n/Link";
import { AnswerMixBar } from "@/components/portal/performance/AnswerMixBar";
import { ScoreTrendChart } from "@/components/portal/performance/ScoreTrendChart";
import { SubjectBars } from "@/components/portal/performance/SubjectBars";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { BRAND } from "@/lib/constants/site";
import {
  WEAK_SUBJECT_PERCENT,
  summarisePerformance,
  type PerformanceSummary,
} from "@/lib/exam/analytics";
import { cn } from "@/lib/utils/cn";
import { testService } from "@/services/tests/test.service";

/**
 * The student's performance board.
 *
 * Built only from released scorecards: a paper whose results are still sealed
 * does not move a single number here, or the board would leak a score the
 * scorecard page refuses to show. Mains papers join in as soon as faculty
 * release their marks — until then they have no `results` document at all.
 */
export const metadata: Metadata = {
  title: `Performance | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function PerformancePage() {
  const papers = await testService.listOwnPublishedResults();
  const summary = summarisePerformance(papers);

  return (
    <>
      <h1 className="text-h2 font-bold">Performance</h1>
      <p className="mt-2 text-body text-ink-secondary">
        How you are scoring across every paper whose results are out.
      </p>

      {summary.papers === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<ChartLine aria-hidden className="size-5" />}
            title="No results yet"
            description="Your analytics build up here as soon as the results of your first paper are released."
            action={
              <ButtonLink href="/dashboard/prelims" variant="secondary">
                Go to the test series
              </ButtonLink>
            }
          />
        </div>
      ) : (
        <Board summary={summary} />
      )}
    </>
  );
}

function Board({ summary }: { summary: PerformanceSummary }) {
  const tiles: { label: string; value: string; note?: ReactNode }[] = [
    { label: "Papers with results", value: String(summary.papers) },
    {
      label: "Average score",
      value: summary.averagePercent === null ? "—" : `${summary.averagePercent}%`,
      note: summary.recentChange !== null ? <Change value={summary.recentChange} /> : null,
    },
    {
      label: "Best score",
      value: summary.bestPercent === null ? "—" : `${summary.bestPercent}%`,
    },
    {
      label: "Accuracy",
      value: summary.accuracy === null ? "—" : `${summary.accuracy}%`,
      note: "of attempted questions",
    },
    {
      label: "Average percentile",
      value: summary.averagePercentile === null ? "—" : String(summary.averagePercentile),
      note: summary.bestRank !== null ? `Best rank ${summary.bestRank}` : "Ranked once results are released",
    },
  ];

  const recent = [...summary.trend].reverse();

  return (
    <>
      <dl className="mt-8 grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-5">
        {tiles.map((tile) => (
          <div key={tile.label} className="bg-white p-5">
            <dt className="text-eyebrow font-semibold uppercase text-ink-secondary">
              {tile.label}
            </dt>
            <dd className="mt-2 text-h3 font-bold tabular-nums">{tile.value}</dd>
            {tile.note ? (
              <dd className="mt-1 text-small text-ink-secondary">{tile.note}</dd>
            ) : null}
          </div>
        ))}
      </dl>

      <Insights summary={summary} />

      <section aria-labelledby="trend" className="mt-10">
        <Card tone="white" padding="md">
          <h2 id="trend" className="text-h4 font-bold">
            Score trend
          </h2>
          <p className="mt-1 text-small text-ink-secondary">
            Each point is one paper, as a share of its total marks.
          </p>
          <div className="mt-5">
            <ScoreTrendChart points={summary.trend} average={summary.averagePercent} />
          </div>
        </Card>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="subjects">
          <Card tone="white" padding="md" className="h-full">
            <h2 id="subjects" className="text-h4 font-bold">
              By subject
            </h2>
            <p className="mt-1 text-small text-ink-secondary">
              Share of marks won, weakest first.
            </p>
            <div className="mt-5">
              {summary.subjects.length ? (
                <SubjectBars subjects={summary.subjects} />
              ) : (
                <p className="text-small text-ink-secondary">
                  No subject-wise breakdown is available for your papers yet.
                </p>
              )}
            </div>
          </Card>
        </section>

        <section aria-labelledby="mix">
          <Card tone="white" padding="md" className="h-full">
            <h2 id="mix" className="text-h4 font-bold">
              Answer mix
            </h2>
            <p className="mt-1 text-small text-ink-secondary">
              Every question across all your papers.
            </p>
            <div className="mt-5">
              <AnswerMixBar
                correct={summary.correctCount}
                wrong={summary.wrongCount}
                unattempted={summary.unattemptedCount}
              />
            </div>
            {summary.negativeMarks > 0 ? (
              <p className="mt-6 border-t border-line pt-4 text-small text-ink-secondary">
                <span className="font-semibold text-chilli-700 tabular-nums">
                  −{summary.negativeMarks} marks
                </span>{" "}
                lost to negative marking in total.
              </p>
            ) : null}
          </Card>
        </section>
      </div>

      <section aria-labelledby="papers" className="mt-10">
        <h2 id="papers" className="text-h3 font-bold">
          Paper by paper
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-xl border-collapse text-small">
            <thead>
              <tr className="border-b border-line text-left text-ink-secondary">
                <th scope="col" className="py-2 pr-4 font-semibold">Paper</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Date</th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">Score</th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">Accuracy</th>
                <th scope="col" className="py-2 text-right font-semibold">Rank</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((point) => (
                <tr key={point.attemptId} className="border-b border-line last:border-0">
                  <th scope="row" className="py-3 pr-4 text-left font-semibold">
                    <Link
                      href={`/dashboard/tests/${point.testId}/result`}
                      className="text-indigo underline-offset-2 hover:underline"
                    >
                      {point.title}
                    </Link>
                  </th>
                  <td className="py-3 pr-4 whitespace-nowrap text-ink-secondary">
                    {formatDate(point.date)}
                  </td>
                  <td className="py-3 pr-4 text-right whitespace-nowrap tabular-nums">
                    <span className="font-semibold">{point.percent}%</span>
                    <span className="text-ink-secondary">
                      {" "}
                      · {point.score}/{point.totalMarks}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    {point.accuracy === null ? "—" : `${point.accuracy}%`}
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    {point.rank ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function Change({ value }: { value: number }) {
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;

  return (
    <span className={cn("inline-flex items-center gap-1 font-semibold", up ? "text-success" : "text-chilli-700")}>
      <Icon aria-hidden className="size-4" />
      {up ? "+" : "−"}
      {Math.abs(value)} pts
      <span className="font-normal text-ink-secondary">vs previous 3</span>
    </span>
  );
}

/**
 * Two or three plain sentences a student can act on. Only said when the data
 * supports it — a single paper does not make a trend, and one subject is not a
 * comparison.
 */
function Insights({ summary }: { summary: PerformanceSummary }) {
  const lines: string[] = [];

  const weakest = summary.subjects[0];
  const strongest = summary.subjects[summary.subjects.length - 1];

  if (summary.subjects.length > 1 && strongest && weakest) {
    lines.push(
      `Strongest in ${strongest.subject} (${strongest.percent}%). ${
        weakest.percent < WEAK_SUBJECT_PERCENT
          ? `${weakest.subject} needs the most work at ${weakest.percent}%.`
          : `Your weakest subject, ${weakest.subject}, is still at ${weakest.percent}%.`
      }`,
    );
  }

  const attempted = summary.correctCount + summary.wrongCount;
  if (attempted > 0 && summary.accuracy !== null && summary.accuracy < 60 && summary.negativeMarks > 0) {
    lines.push(
      `Accuracy is ${summary.accuracy}% — below the point where guessing pays off with negative marking. Attempt fewer, surer questions.`,
    );
  }

  const total = attempted + summary.unattemptedCount;
  if (total > 0 && summary.unattemptedCount / total > 0.25 && (summary.accuracy ?? 0) >= 70) {
    lines.push(
      `You leave ${Math.round((summary.unattemptedCount / total) * 100)}% of questions blank while answering ${summary.accuracy}% of the rest correctly — you can afford to attempt more.`,
    );
  }

  if (summary.recentChange !== null && Math.abs(summary.recentChange) >= 5) {
    lines.push(
      summary.recentChange > 0
        ? `Your last three papers are ${summary.recentChange} points above the three before them. Keep going.`
        : `Your last three papers are ${Math.abs(summary.recentChange)} points below the three before them — worth a word with your mentor.`,
    );
  }

  if (lines.length === 0) return null;

  return (
    <ul className="mt-6 space-y-2 border-l-2 border-kesar bg-kesar-100 px-5 py-4 text-small text-ink">
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}
