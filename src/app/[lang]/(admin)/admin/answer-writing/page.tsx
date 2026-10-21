import type { Metadata } from "next";
import { Inbox, NotebookPen, Plus } from "lucide-react";

import Link from "@/i18n/Link";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatIst } from "@/lib/exam/ist";
import { answerWritingService } from "@/services/answer-writing/answer-writing.service";
import { courseService } from "@/services/courses/course.service";

import { COPY_STATUS_TONE, STAFF_STATUS_LABELS, requireFacultyPage } from "./shared";

export const metadata: Metadata = {
  title: "Answer Writing",
  robots: { index: false, follow: false },
};

/** Rows of the queue drawn here. The rest are a click away on each paper. */
const QUEUE_PREVIEW = 25;

/**
 * Mains answer writing for faculty: the copies waiting to be evaluated across
 * every paper, oldest first, and the papers themselves.
 */
export default async function AnswerWritingAdminPage() {
  await requireFacultyPage("/admin/answer-writing");

  const [papers, queue, courses] = await Promise.all([
    answerWritingService.listPapersForStaff(),
    answerWritingService.listQueue(),
    courseService.listForStaff(),
  ]);

  const courseTitle = new Map(courses.map((course) => [course.id, course.title]));
  const waitingByPaper = new Map<string, number>();
  for (const row of queue) {
    waitingByPaper.set(row.copy.testId, (waitingByPaper.get(row.copy.testId) ?? 0) + 1);
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 font-bold">Answer Writing</h1>
          <p className="mt-2 max-w-3xl text-body text-ink-secondary">
            Mains papers students download, write by hand and upload. Evaluate each copy with marks,
            a rubric, written feedback and the checked copy.
          </p>
        </div>
        {courses.length > 0 ? (
          <ButtonLink href="/admin/answer-writing/new" size="sm">
            <Plus aria-hidden className="size-4" />
            New paper
          </ButtonLink>
        ) : null}
      </div>

      <section aria-labelledby="queue-heading" className="mt-10">
        <h2 id="queue-heading" className="flex items-center gap-3 text-h3 font-bold">
          Waiting for evaluation
          <Badge tone={queue.length > 0 ? "kesar" : "neutral"}>{queue.length}</Badge>
        </h2>

        <div className="mt-5">
          {queue.length === 0 ? (
            <Card padding="md">
              <p className="text-body text-ink-secondary">
                Nothing waiting. Submitted copies appear here, oldest first.
              </p>
            </Card>
          ) : (
            <>
              <ul className="space-y-3">
                {queue.slice(0, QUEUE_PREVIEW).map((row) => (
                  <li key={row.copy.id}>
                    <Link
                      href={`/admin/answer-writing/${row.copy.testId}/copies/${row.copy.studentUid}`}
                      className="block"
                    >
                      <Card interactive padding="sm" className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-indigo">
                            {row.studentName}
                            {row.rollNumber ? (
                              <span className="font-normal text-ink-secondary"> · {row.rollNumber}</span>
                            ) : null}
                          </p>
                          <p className="mt-1 text-small text-ink-secondary">{row.paperTitle}</p>
                        </div>
                        <p className="text-small text-ink-secondary">
                          Submitted {formatIst(row.copy.submittedAt)}
                        </p>
                        <Badge tone={COPY_STATUS_TONE[row.copy.status]}>
                          {row.copy.status === "in-review" && row.evaluatorName
                            ? `With ${row.evaluatorName}`
                            : STAFF_STATUS_LABELS[row.copy.status]}
                        </Badge>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
              {queue.length > QUEUE_PREVIEW ? (
                <p className="mt-3 text-small text-ink-secondary">
                  And {queue.length - QUEUE_PREVIEW} more — open a paper to see all of its copies.
                </p>
              ) : null}
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="papers-heading" className="mt-12">
        <h2 id="papers-heading" className="text-h3 font-bold">
          Papers
        </h2>

        <div className="mt-5">
          {courses.length === 0 ? (
            <EmptyState
              icon={<NotebookPen aria-hidden className="size-5" />}
              title="No courses yet"
              description="Every paper belongs to a course, and only students enrolled in it can write it. Create a course first."
              action={<ButtonLink href="/admin/courses">Go to courses</ButtonLink>}
            />
          ) : papers.length === 0 ? (
            <EmptyState
              icon={<Inbox aria-hidden className="size-5" />}
              title="No answer-writing papers yet"
              description="Create a paper, upload its question paper PDF and marking scheme, then publish it to the students of its course."
              action={<ButtonLink href="/admin/answer-writing/new">Create the first paper</ButtonLink>}
            />
          ) : (
            <ul className="space-y-3">
              {papers.map((test) => {
                const waiting = waitingByPaper.get(test.id) ?? 0;

                return (
                  <li key={test.id}>
                    <Link href={`/admin/answer-writing/${test.id}`} className="block">
                      <Card interactive padding="sm" className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-indigo">{test.title}</p>
                          <p className="mt-1 text-small text-ink-secondary">
                            {courseTitle.get(test.courseId) ?? "Unknown course"}
                            {test.subject ? ` · ${test.subject}` : ""} · {test.questionCount} questions ·{" "}
                            {test.totalMarks} marks
                          </p>
                        </div>
                        <p className="text-small text-ink-secondary">
                          {test.closesAt ? `Due ${formatIst(test.closesAt)}` : "No deadline"}
                        </p>
                        {waiting > 0 ? <Badge tone="kesar">{waiting} to evaluate</Badge> : null}
                        <Badge tone={test.status === "published" ? "success" : "neutral"}>{test.status}</Badge>
                      </Card>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
