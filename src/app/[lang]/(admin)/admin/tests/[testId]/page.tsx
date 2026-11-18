import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BarChart3, FileUp, Pencil, Plus } from "lucide-react";

import Link from "@/i18n/Link";
import {
  PaperStatusButton,
  PublishDraftsButton,
  RemoveQuestionButton,
} from "@/components/admin/PaperActions";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { QuestionStatement } from "@/components/exam/QuestionStatement";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { publishBlocker } from "@/lib/exam/authoring";
import { formatIst } from "@/lib/exam/ist";
import { courseService } from "@/services/courses/course.service";
import { testService } from "@/services/tests/test.service";

import {
  KIND_LABELS,
  STATUS_TONE,
  orNotFound,
  paperLockReason,
  requireFacultyPage,
} from "../shared";

export const metadata: Metadata = {
  title: "Paper",
  robots: { index: false, follow: false },
};

/**
 * One paper: its settings at a glance, the publish switch, and its questions
 * with their answer keys. Staff-only — this page is the one place the key is
 * shown next to the question.
 */
export default async function TestPage({
  params,
}: PageProps<"/[lang]/admin/tests/[testId]">) {
  const { testId } = await params;
  await requireFacultyPage(`/admin/tests/${testId}`);

  const [test, questions, sat] = await Promise.all([
    orNotFound(testService.getTest(testId)),
    testService.listQuestionsForStaff(testId),
    testService.hasAttempts(testId),
  ]);

  // Mains papers are authored and evaluated under Answer Writing.
  if (test.kind === "mains-descriptive") redirect(`/admin/answer-writing/${test.id}`);

  const course = await courseService.getById(test.courseId);

  const lockReason = paperLockReason(test, sat);
  const blocker =
    test.status === "published" ? null : publishBlocker(test, questions);

  const live = questions.filter((question) => question.status === "published");
  const liveMarks = live.reduce((sum, question) => sum + question.marks, 0);
  const draftCount = questions.filter(
    (question) => question.status === "draft",
  ).length;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-h2 font-bold">{test.title}</h1>
            <Badge tone={STATUS_TONE[test.status]}>{test.status}</Badge>
          </div>
          <p className="mt-2 text-body text-ink-secondary">
            {course?.title ?? "Unknown course"} · {KIND_LABELS[test.kind]}
            {test.subject ? ` · ${test.subject}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {sat ? (
            <ButtonLink
              href={`/admin/tests/${test.id}/results`}
              variant="secondary"
              size="sm"
            >
              <BarChart3 aria-hidden className="size-4" />
              Results
            </ButtonLink>
          ) : null}
          <ButtonLink
            href={`/admin/tests/${test.id}/settings`}
            variant="secondary"
            size="sm"
          >
            <Pencil aria-hidden className="size-4" />
            Settings
          </ButtonLink>
          {sat && test.status === "published" ? null : (
            <PaperStatusButton testId={test.id} status={test.status} />
          )}
        </div>
      </div>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Questions"
          value={`${live.length} of ${test.questionCount}`}
          warn={live.length !== test.questionCount}
        />
        <Stat
          label="Marks"
          value={`${liveMarks} of ${test.totalMarks}`}
          warn={Math.abs(liveMarks - test.totalMarks) > 0.001}
        />
        <Stat
          label="Time and negative marking"
          value={`${test.durationMinutes} min · −${test.negativeMarksPerQuestion}`}
        />
        <Stat
          label="Window"
          value={test.opensAt ? formatIst(test.opensAt) : "Open any time"}
          detail={
            test.closesAt ? `Closes ${formatIst(test.closesAt)}` : undefined
          }
        />
      </dl>

      {lockReason ? (
        <p className="mt-6 border border-line-strong bg-paper px-4 py-3 text-small">
          {lockReason}
        </p>
      ) : blocker ? (
        <p className="mt-6 border border-line-strong bg-paper px-4 py-3 text-small">
          Not ready to publish: {blocker}
        </p>
      ) : null}

      <section aria-labelledby="questions-heading" className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="questions-heading" className="text-h3 font-bold">
            Questions
          </h2>
          {!lockReason ? (
            <div className="flex flex-wrap gap-3">
              {draftCount > 0 ? (
                <PublishDraftsButton testId={test.id} count={draftCount} />
              ) : null}
              <ButtonLink
                href={`/admin/tests/${test.id}/questions/import`}
                variant="secondary"
                size="sm"
              >
                <FileUp aria-hidden className="size-4" />
                Import CSV
              </ButtonLink>
              <ButtonLink
                href={`/admin/tests/${test.id}/questions/new`}
                size="sm"
              >
                <Plus aria-hidden className="size-4" />
                Add question
              </ButtonLink>
            </div>
          ) : null}
        </div>

        <div className="mt-5">
          {questions.length === 0 ? (
            <EmptyState
              title="No questions yet"
              description="Add questions one at a time, or import a whole paper from a CSV file. Each is marked against its own answer key, and the paper counts only the published ones."
            />
          ) : (
            <ol className="space-y-4">
              {questions.map((question, index) => {
                const label = `Question ${index + 1}`;

                return (
                  <li key={question.id}>
                    <Card padding="sm">
                      <div className="flex items-start gap-4">
                        <span className="text-small font-semibold text-ink-secondary">
                          {index + 1}.
                        </span>

                        <div className="min-w-0 flex-1">
                          <QuestionStatement statement={question.statement} />

                          <ul className="mt-3 space-y-1.5">
                            {question.options.map((option) => {
                              const correct =
                                question.correctOptionIds.includes(option.id);

                              return (
                                <li
                                  key={option.id}
                                  className={
                                    correct
                                      ? "font-medium text-success"
                                      : "text-ink-secondary"
                                  }
                                >
                                  <span className="uppercase">
                                    ({option.id})
                                  </span>{" "}
                                  {option.text}
                                  {correct ? (
                                    <span className="sr-only"> — correct</span>
                                  ) : null}
                                </li>
                              );
                            })}
                          </ul>

                          <p className="mt-3 text-small text-ink-secondary">
                            {question.marks} marks · {question.subject}
                            {question.topic
                              ? ` · ${question.topic}`
                              : ""} · {question.difficulty}
                            {question.pyq
                              ? ` · ${question.pyq.exam} ${question.pyq.year}`
                              : ""}
                            {question.status === "published"
                              ? ""
                              : ` · ${question.status}`}
                          </p>
                        </div>

                        {!lockReason ? (
                          <div className="flex shrink-0 items-center">
                            <Link
                              href={`/admin/tests/${test.id}/questions/${question.id}`}
                              className="flex size-10 items-center justify-center text-ink-secondary hover:bg-paper hover:text-indigo"
                              aria-label={`Edit ${label}`}
                            >
                              <Pencil aria-hidden className="size-4" />
                            </Link>
                            <RemoveQuestionButton
                              testId={test.id}
                              questionId={question.id}
                              label={label}
                            />
                          </div>
                        ) : null}
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  detail,
  warn = false,
}: {
  label: string;
  value: string;
  detail?: string;
  warn?: boolean;
}) {
  return (
    <Card padding="sm">
      <dt className="text-small text-ink-secondary">{label}</dt>
      <dd
        className={
          warn
            ? "mt-1 font-semibold text-danger"
            : "mt-1 font-semibold text-indigo"
        }
      >
        {value}
      </dd>
      {detail ? (
        <dd className="mt-0.5 text-small text-ink-secondary">{detail}</dd>
      ) : null}
    </Card>
  );
}
