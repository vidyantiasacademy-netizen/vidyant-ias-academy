import type { Metadata } from "next";
import { ExternalLink, Pencil } from "lucide-react";

import Link from "@/i18n/Link";
import {
  MainsPaperStatusButton,
  ReleaseEvaluationsButton,
} from "@/components/admin/answer-writing/MainsPaperActions";
import { QuestionPaperUpload } from "@/components/admin/answer-writing/QuestionPaperUpload";
import { RubricBars } from "@/components/portal/answer-writing/RubricBars";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatSpan, mainsLockReason, mainsPublishBlocker, summariseWriting } from "@/lib/answer-writing/policy";
import { formatIst } from "@/lib/exam/ist";
import { answerWritingService } from "@/services/answer-writing/answer-writing.service";
import { courseService } from "@/services/courses/course.service";
import { storageService } from "@/services/storage/storage.service";

import { COPY_STATUS_TONE, STAFF_STATUS_LABELS, orNotFound, requireFacultyPage } from "../shared";

export const metadata: Metadata = {
  title: "Answer-writing paper",
  robots: { index: false, follow: false },
};

/**
 * One Mains paper: its settings and question paper, the publish switch, every
 * copy submitted against it, and how the batch wrote it.
 */
export default async function MainsPaperAdminPage({
  params,
}: PageProps<"/[lang]/admin/answer-writing/[testId]">) {
  const { testId } = await params;
  await requireFacultyPage(`/admin/answer-writing/${testId}`);

  const [test, rows] = await Promise.all([
    orNotFound(answerWritingService.getPaperForStaff(testId)),
    answerWritingService.listCopiesForStaff(testId),
  ]);

  const [course, questionPaperUrl] = await Promise.all([
    courseService.getById(test.courseId),
    test.questionPaperPath
      ? storageService.getSignedUrl(test.questionPaperPath, 60).catch(() => null)
      : Promise.resolve(null),
  ]);

  // Any copy at all — including a student who has only opened the paper.
  const lockReason = mainsLockReason(test, rows.length > 0);
  const blocker = test.status === "published" ? null : mainsPublishBlocker(test);
  const scheme = test.markingScheme ?? [];

  const count = (status: string) => rows.filter((row) => row.copy.status === status).length;
  const evaluated = rows.filter((row) => row.copy.status === "evaluated" && row.copy.evaluation);
  const held = evaluated.filter((row) => !row.released).length;
  const cohort = evaluated.length > 0 ? summariseWriting(evaluated.map((row) => row.copy.evaluation!)) : null;
  const submittedRows = rows.filter((row) => row.copy.status !== "draft");

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-h2 font-bold">{test.title}</h1>
            <Badge tone={test.status === "published" ? "success" : "neutral"}>{test.status}</Badge>
          </div>
          <p className="mt-2 text-body text-ink-secondary">
            {course?.title ?? "Unknown course"}
            {test.subject ? ` · ${test.subject}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <ButtonLink href={`/admin/answer-writing/${test.id}/edit`} variant="secondary" size="sm">
            <Pencil aria-hidden className="size-4" />
            Settings
          </ButtonLink>
          {test.status === "published" && rows.length > 0 ? null : (
            <MainsPaperStatusButton testId={test.id} status={test.status} blocker={blocker} />
          )}
        </div>
      </div>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Questions and marks" value={`${test.questionCount} · ${test.totalMarks} marks`} />
        <Stat label="Writing time" value={formatSpan(test.durationMinutes * 60_000)} />
        <Stat
          label="Window"
          value={test.opensAt ? formatIst(test.opensAt) : "Open any time"}
          detail={test.closesAt ? `Due ${formatIst(test.closesAt)}` : "No deadline"}
        />
        <Stat
          label="Evaluations visible"
          value={test.resultsVisibleFrom ? formatIst(test.resultsVisibleFrom) : "As each is evaluated"}
        />
      </dl>

      {lockReason ? (
        <p className="mt-6 border border-line-strong bg-paper px-4 py-3 text-small">{lockReason}</p>
      ) : blocker ? (
        <p className="mt-6 border border-line-strong bg-paper px-4 py-3 text-small">
          Not ready to publish: {blocker}
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card padding="md">
          <h2 className="text-h4 font-semibold">Question paper</h2>
          <p className="mt-1 text-small text-ink-secondary">
            The PDF students download and write on — questions with answer space beneath each.
          </p>

          <div className="mt-5 space-y-4">
            {questionPaperUrl ? (
              <a
                href={questionPaperUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 font-semibold text-indigo underline decoration-kesar decoration-2 underline-offset-4"
              >
                Open the question paper
                <ExternalLink aria-hidden className="size-4" />
              </a>
            ) : test.questionPaperPath ? (
              <p className="text-small text-danger">The question paper could not be opened.</p>
            ) : (
              <p className="text-small text-ink-secondary">Not uploaded yet.</p>
            )}

            {lockReason ? null : (
              <QuestionPaperUpload testId={test.id} hasPaper={Boolean(test.questionPaperPath)} />
            )}
          </div>
        </Card>

        <Card padding="md">
          <h2 className="text-h4 font-semibold">Marking scheme</h2>
          {scheme.length === 0 ? (
            <p className="mt-3 text-small text-ink-secondary">No questions yet — add them in Settings.</p>
          ) : (
            <div className="mt-4 max-h-72 overflow-y-auto">
              <table className="w-full text-left text-small">
                <thead className="sticky top-0 border-b border-line bg-white text-ink-secondary">
                  <tr>
                    <th scope="col" className="py-2 pr-3 font-semibold">Question</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Max marks</th>
                    <th scope="col" className="py-2 font-semibold">Word limit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line tabular-nums">
                  {scheme.map((slot) => (
                    <tr key={slot.label}>
                      <th scope="row" className="py-2 pr-3 font-semibold">{slot.label}</th>
                      <td className="py-2 pr-3">{slot.maxMarks}</td>
                      <td className="py-2 text-ink-secondary">{slot.wordLimit ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <section aria-labelledby="copies-heading" className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="copies-heading" className="text-h3 font-bold">
            Copies
          </h2>
          {evaluated.length > 0 ? <ReleaseEvaluationsButton testId={test.id} held={held} /> : null}
        </div>

        <p className="mt-2 text-small text-ink-secondary">
          {count("submitted")} awaiting · {count("in-review")} being evaluated · {count("evaluated")} evaluated
          {held > 0 ? ` (${held} not yet released)` : ""} · {count("draft")} opened but not submitted
        </p>

        <div className="mt-5">
          {submittedRows.length === 0 ? (
            <EmptyState
              title="No copies submitted yet"
              description="Copies appear here as students submit them, oldest first."
            />
          ) : (
            <div className="overflow-x-auto border border-line bg-white">
              <table className="w-full min-w-176 text-left text-small">
                <thead className="border-b border-line bg-paper text-ink-secondary">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Student</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Submitted</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Score</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Evaluator</th>
                    <th scope="col" className="px-4 py-3">
                      <span className="sr-only">Open</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {submittedRows.map(({ copy, studentName, rollNumber, evaluatorName, result }) => (
                    <tr key={copy.id}>
                      <td className="px-4 py-3">
                        <span className="font-semibold">{studentName}</span>
                        {rollNumber ? <span className="block text-ink-secondary">{rollNumber}</span> : null}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={COPY_STATUS_TONE[copy.status]}>{STAFF_STATUS_LABELS[copy.status]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-ink-secondary">{formatIst(copy.submittedAt)}</td>
                      <td className="px-4 py-3 tabular-nums">
                        {copy.status === "evaluated" && copy.evaluation
                          ? `${copy.evaluation.score} / ${copy.evaluation.totalMarks}${
                              result?.rank ? ` · #${result.rank}` : ""
                            }`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-ink-secondary">{evaluatorName ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/answer-writing/${test.id}/copies/${copy.studentUid}`}
                          className="font-semibold text-indigo underline decoration-kesar decoration-2 underline-offset-4"
                        >
                          {copy.status === "evaluated" ? "Review" : "Evaluate"}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {cohort ? (
        <section aria-labelledby="cohort-heading" className="mt-12">
          <h2 id="cohort-heading" className="text-h3 font-bold">
            How the batch wrote
          </h2>
          <Card padding="md" className="mt-5 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
            <dl className="space-y-4">
              <div>
                <dt className="text-small text-ink-secondary">Evaluated copies</dt>
                <dd className="text-h3 font-bold text-indigo">{cohort.copies}</dd>
              </div>
              <div>
                <dt className="text-small text-ink-secondary">Average score</dt>
                <dd className="text-h3 font-bold text-indigo">
                  {cohort.averagePercent !== null ? `${cohort.averagePercent}%` : "—"}
                </dd>
              </div>
              {cohort.weakest ? (
                <div>
                  <dt className="text-small text-ink-secondary">Weakest area</dt>
                  <dd className="font-semibold">{cohort.weakest.label}</dd>
                </div>
              ) : null}
            </dl>
            <RubricBars
              scores={Object.fromEntries(cohort.rubric.map((item) => [item.key, item.average]))}
              weakest={cohort.weakest?.key ?? null}
            />
          </Card>
        </section>
      ) : null}
    </>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <Card padding="sm">
      <dt className="text-small text-ink-secondary">{label}</dt>
      <dd className="mt-1 font-semibold text-indigo">{value}</dd>
      {detail ? <dd className="mt-0.5 text-small text-ink-secondary">{detail}</dd> : null}
    </Card>
  );
}
