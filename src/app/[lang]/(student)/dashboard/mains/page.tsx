import type { Metadata } from "next";
import { CalendarClock, NotebookPen } from "lucide-react";

import { RubricBars } from "@/components/portal/answer-writing/RubricBars";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SUBMISSION_STATUS_LABELS, formatSpan, summariseWriting } from "@/lib/answer-writing/policy";
import { BRAND, ROUTES } from "@/lib/constants/site";
import { formatIst } from "@/lib/exam/ist";
import {
  answerWritingService,
  type StudentPaperRow,
} from "@/services/answer-writing/answer-writing.service";

/**
 * Mains answer writing — every descriptive paper across the student's
 * enrollments, most urgent first, and how their writing is assessed across the
 * copies that have come back.
 */
export const metadata: Metadata = {
  title: `Mains Answer Writing | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

type Tone = "success" | "kesar" | "indigo" | "neutral";

function statusOf(row: StudentPaperRow): { label: string; tone: Tone } {
  if (row.evaluation) {
    return { label: `${row.evaluation.score} / ${row.evaluation.totalMarks}`, tone: "success" };
  }

  switch (row.status) {
    case "evaluated":
      return { label: "Evaluated — result soon", tone: "indigo" };
    case "submitted":
    case "in-review":
      return { label: SUBMISSION_STATUS_LABELS[row.status], tone: "indigo" };
    case "draft":
      if (row.window === "closed") return { label: "Not submitted", tone: "neutral" };
      return {
        label: row.fileCount > 0 ? `${row.fileCount} file${row.fileCount === 1 ? "" : "s"} · not submitted` : "Started",
        tone: "kesar",
      };
    default:
      if (row.window === "upcoming") return { label: "Opens soon", tone: "neutral" };
      if (row.window === "closed") return { label: "Not submitted", tone: "neutral" };
      return { label: "Not started", tone: "neutral" };
  }
}

function scheduleOf({ test, window }: StudentPaperRow): string {
  if (window === "upcoming") return `Opens ${formatIst(test.opensAt)}`;
  if (window === "closed") return `Closed ${formatIst(test.closesAt)}`;
  return test.closesAt ? `Submit by ${formatIst(test.closesAt)}` : "Open — no deadline";
}

/** Whether the student has something to do on this paper right now. */
function isActionable(row: StudentPaperRow): boolean {
  return row.window === "open" && (row.status === null || row.status === "draft");
}

function ctaOf(row: StudentPaperRow): string {
  if (row.evaluation) return "View evaluation";
  if (isActionable(row)) return row.status ? "Continue" : "Start writing";
  return "Open paper";
}

export default async function MainsPage() {
  const rows = await answerWritingService.listOwnPapers();
  const returned = rows.flatMap((row) => (row.evaluation ? [row.evaluation] : []));
  const profile = returned.length > 0 ? summariseWriting(returned) : null;

  return (
    <>
      <h1 className="text-h2 font-bold">Mains Answer Writing</h1>
      <p className="mt-2 max-w-3xl text-body text-ink-secondary">
        Open a paper, write it by hand — on a printout or on a tablet — and upload it. Faculty return
        it checked, with marks, remarks on the copy itself and feedback on how you write.
      </p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {rows.length === 0 ? (
          <EmptyState
            icon={<NotebookPen aria-hidden className="size-5" />}
            title="No answer-writing papers yet"
            description="Papers appear here as soon as a Mains programme is part of your enrollment and faculty publish one."
            action={
              <ButtonLink href={ROUTES.courses} variant="secondary">
                Explore programmes
              </ButtonLink>
            }
          />
        ) : (
          <ul className="space-y-4">
            {rows.map((row) => {
              const { test } = row;
              const status = statusOf(row);

              return (
                <li key={test.id}>
                  <Card tone="white" padding="md">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-body-lg font-semibold">{test.title}</h2>
                        <p className="mt-2 text-small text-ink-secondary">
                          {test.questionCount} question{test.questionCount === 1 ? "" : "s"} ·{" "}
                          {test.totalMarks} marks · write in {formatSpan(test.durationMinutes * 60_000)}
                        </p>
                      </div>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>

                    <p className="mt-4 flex flex-wrap items-center gap-2 text-small text-ink-secondary">
                      <CalendarClock aria-hidden className="size-4 text-kesar-600" />
                      {scheduleOf(row)}
                      {test.subject ? ` · ${test.subject}` : ""}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-4">
                      <ButtonLink
                        href={`/dashboard/mains/${test.id}`}
                        variant={isActionable(row) ? "primary" : "secondary"}
                        size="sm"
                      >
                        {ctaOf(row)}
                      </ButtonLink>
                      {row.courseTitle ? (
                        <span className="text-small text-ink-secondary">{row.courseTitle}</span>
                      ) : null}
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}

        <Card padding="md" className="lg:sticky lg:top-6">
          <h2 className="text-h4 font-semibold">Your writing profile</h2>

          {profile ? (
            <>
              <p className="mt-2 text-small text-ink-secondary">
                Across {profile.copies} evaluated cop{profile.copies === 1 ? "y" : "ies"}
                {profile.averagePercent !== null ? ` · average ${profile.averagePercent}%` : ""}.
              </p>
              <div className="mt-5">
                <RubricBars
                  scores={Object.fromEntries(profile.rubric.map((item) => [item.key, item.average]))}
                  weakest={profile.weakest?.key ?? null}
                />
              </div>
            </>
          ) : (
            <p className="mt-2 text-small text-ink-secondary">
              Once your first copy is evaluated, this shows how you score on each part of answer
              writing — and which one to work on next.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
