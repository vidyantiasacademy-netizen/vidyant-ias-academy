import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { ReleaseResultsButton } from "@/components/admin/PaperActions";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatIst } from "@/lib/exam/ist";
import { testService } from "@/services/tests/test.service";
import type { AttemptStatus, TerminationReason } from "@/types/db";

import { KIND_LABELS, orNotFound, requireFacultyPage } from "../../shared";

export const metadata: Metadata = {
  title: "Results",
  robots: { index: false, follow: false },
};

const ATTEMPT_LABELS: Record<AttemptStatus, string> = {
  "in-progress": "Sitting",
  submitted: "Awaiting marking",
  evaluated: "Scored",
  abandoned: "Abandoned",
};

const TERMINATION_LABELS: Record<TerminationReason, string> = {
  expired: "time ran out",
  violations: "too many violations",
  staff: "ended by staff",
};

/**
 * Everyone who has sat one paper, their scores, and the switch that releases
 * those scores to them.
 */
export default async function TestResultsPage({
  params,
}: PageProps<"/[lang]/admin/tests/[testId]/results">) {
  const { testId } = await params;
  await requireFacultyPage(`/admin/tests/${testId}/results`);

  const [test, rows] = await Promise.all([
    orNotFound(testService.getTest(testId)),
    testService.listResultsForStaff(testId),
  ]);

  const nowIso = new Date().toISOString();
  const scored = rows.flatMap((row) => (row.result ? [row.result] : []));
  const sitting = rows.filter((row) => row.attempt.status === "in-progress").length;
  const hidden = scored.filter((result) => !result.publishedAt || result.publishedAt > nowIso);
  const average = scored.length
    ? scored.reduce((sum, result) => sum + result.score, 0) / scored.length
    : null;
  const stillOpen = !test.closesAt || test.closesAt > nowIso;
  const isMcq = test.kind !== "mains-descriptive";

  const release =
    scored.length === 0
      ? { label: "Nothing to release yet", tone: "neutral" as const }
      : hidden.length === 0
        ? { label: "Visible to students", tone: "success" as const }
        : { label: `Hidden from ${hidden.length}`, tone: "kesar" as const };

  return (
    <>
      <ButtonLink href={`/admin/tests/${test.id}`} variant="secondary" size="sm">
        <ArrowLeft aria-hidden className="size-4" />
        Back to paper
      </ButtonLink>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-h2 font-bold">Results</h1>
            <Badge tone={release.tone}>{release.label}</Badge>
          </div>
          <p className="mt-2 text-body text-ink-secondary">
            {test.title} · {KIND_LABELS[test.kind]}
          </p>
        </div>

        {isMcq && scored.length > 0 && sitting === 0 ? (
          <ReleaseResultsButton testId={test.id} stillOpen={stillOpen} />
        ) : null}
      </div>

      {sitting > 0 ? (
        <p className="mt-6 border border-line-strong bg-paper px-4 py-3 text-small">
          {sitting} student{sitting === 1 ? " is" : "s are"} still sitting this paper. Results can be
          released once every sitting has ended.
        </p>
      ) : hidden.length > 0 && test.resultsVisibleFrom && test.resultsVisibleFrom > nowIso ? (
        <p className="mt-6 border border-line-strong bg-paper px-4 py-3 text-small">
          Scheduled to release {formatIst(test.resultsVisibleFrom)}. Release now to show them
          earlier and fill in ranks.
        </p>
      ) : null}

      {!isMcq ? (
        <p className="mt-6 border border-line-strong bg-paper px-4 py-3 text-small">
          Mains papers are marked by faculty, so scores appear here only once they are evaluated.
        </p>
      ) : null}

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Sat the paper" value={String(rows.length)} />
        <Stat label="Scored" value={String(scored.length)} />
        <Stat
          label="Average score"
          value={average === null ? "—" : `${average.toFixed(2)} / ${test.totalMarks}`}
        />
        <Stat
          label="Top score"
          value={scored.length ? `${scored[0].score} / ${test.totalMarks}` : "—"}
        />
      </dl>

      <section aria-labelledby="attempts-heading" className="mt-10">
        <h2 id="attempts-heading" className="text-h3 font-bold">
          Students
        </h2>

        {rows.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title="Nobody has sat this paper yet"
              description="Each student appears here as soon as they start, with their score once they submit."
            />
          </div>
        ) : (
          <Card padding="none" className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[56rem] text-left text-small">
              <thead className="border-b border-line text-ink-secondary">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Rank</th>
                  <th scope="col" className="px-5 py-3 font-medium">Student</th>
                  <th scope="col" className="px-5 py-3 font-medium">Score</th>
                  <th scope="col" className="px-5 py-3 font-medium">Right · wrong · skipped</th>
                  <th scope="col" className="px-5 py-3 font-medium">Percentile</th>
                  <th scope="col" className="px-5 py-3 font-medium">Submitted</th>
                  <th scope="col" className="px-5 py-3 font-medium">Violations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(({ attempt, result, studentName, rollNumber }) => (
                  <tr key={attempt.id}>
                    <td className="px-5 py-3 font-semibold text-indigo">
                      {result?.rank ?? "—"}
                    </td>
                    <td className="px-5 py-3 font-medium">
                      {studentName}
                      {rollNumber ? (
                        <span className="block font-normal text-ink-secondary">{rollNumber}</span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3">
                      {result ? (
                        <span className="font-semibold">
                          {result.score} / {result.totalMarks}
                          {result.negativeMarks > 0 ? (
                            <span className="block font-normal text-ink-secondary">
                              −{result.negativeMarks} negative
                            </span>
                          ) : null}
                        </span>
                      ) : (
                        <Badge tone="neutral">{ATTEMPT_LABELS[attempt.status]}</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-ink-secondary">
                      {result
                        ? `${result.correctCount} · ${result.wrongCount} · ${result.unattemptedCount}`
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-ink-secondary">
                      {result?.percentile != null ? result.percentile : "—"}
                    </td>
                    <td className="px-5 py-3 text-ink-secondary">
                      {attempt.submittedAt ? formatIst(attempt.submittedAt) : "—"}
                      {attempt.autoSubmitted ? (
                        <span className="block">
                          Auto-submitted
                          {attempt.terminationReason
                            ? `: ${TERMINATION_LABELS[attempt.terminationReason]}`
                            : ""}
                        </span>
                      ) : null}
                    </td>
                    <td
                      className={
                        attempt.violationScore > 0
                          ? "px-5 py-3 font-medium text-danger"
                          : "px-5 py-3 text-ink-secondary"
                      }
                    >
                      {attempt.violationScore > 0
                        ? `${attempt.focusLossCount} tab · ${attempt.fullscreenExitCount} fullscreen · ${attempt.blockedActionCount} blocked`
                        : "None"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {scored.length > 0 && scored.every((result) => result.rank === null) ? (
          <p className="mt-3 text-small text-ink-secondary">
            Ranks and percentiles are filled in when results are released.
          </p>
        ) : null}
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="sm">
      <dt className="text-small text-ink-secondary">{label}</dt>
      <dd className="mt-1 font-semibold text-indigo">{value}</dd>
    </Card>
  );
}
