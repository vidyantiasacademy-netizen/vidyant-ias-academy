import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { CalendarClock, FileDown, Lock } from "lucide-react";

import { AnswerSheetUploader } from "@/components/portal/answer-writing/AnswerSheetUploader";
import { EvaluationReport } from "@/components/portal/answer-writing/EvaluationReport";
import { Badge } from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SUBMISSION_STATUS_LABELS, formatSpan } from "@/lib/answer-writing/policy";
import { BRAND } from "@/lib/constants/site";
import { isAppError } from "@/lib/errors";
import { formatIst } from "@/lib/exam/ist";
import { cn } from "@/lib/utils/cn";
import {
  answerWritingService,
  type StudentWorkspace,
} from "@/services/answer-writing/answer-writing.service";

/**
 * One Mains paper, as the student works through it: get the paper, write,
 * upload and submit — and, once it is back, the evaluated copy.
 */
export const metadata: Metadata = {
  title: `Answer Writing | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

/** The one-line state of the copy, above the steps. `null` when the steps say it all. */
function statusNote(workspace: StudentWorkspace): string | null {
  const { copy, window, test, heldUntil, evaluation } = workspace;

  if (evaluation) return null;
  if (heldUntil) return `Your copy has been evaluated. Results for this paper are released on ${formatIst(heldUntil)}.`;
  if (copy?.status === "evaluated") return "Your copy has been evaluated. Results are released by faculty shortly.";
  if (copy?.status === "in-review") return "An evaluator is marking your copy. You will be notified when it is back.";
  if (copy?.status === "submitted") {
    return `Submitted ${formatIst(copy.submittedAt)}. Your copy is in the queue for evaluation.`;
  }
  if (window === "upcoming") return `The question paper is released ${formatIst(test.opensAt)}.`;
  if (window === "closed") return `The deadline passed ${formatIst(test.closesAt)}. This paper can no longer be submitted.`;

  return null;
}

export default async function AnswerPaperPage({
  params,
}: PageProps<"/[lang]/dashboard/mains/[testId]">) {
  const { testId } = await params;

  let workspace: StudentWorkspace;

  try {
    // The authorisation: published, and part of a course this student is in.
    workspace = await answerWritingService.getOwnWorkspace(testId);
  } catch (error) {
    if (isAppError(error) && error.code === "NOT_FOUND") notFound();
    if (isAppError(error) && error.code === "FORBIDDEN") {
      return (
        <EmptyState
          icon={<Lock aria-hidden className="size-5" />}
          title="Not part of your programme"
          description={error.message}
        />
      );
    }
    throw error;
  }

  const { test, copy, window, evaluation } = workspace;
  const scheme = test.markingScheme ?? [];
  const note = statusNote(workspace);
  const paperAvailable = window !== "upcoming" && Boolean(test.questionPaperPath);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-h2 font-bold">{test.title}</h1>
          <p className="mt-2 text-body text-ink-secondary">
            {test.questionCount} question{test.questionCount === 1 ? "" : "s"} · {test.totalMarks} marks ·
            write in {formatSpan(test.durationMinutes * 60_000)}
            {test.subject ? ` · ${test.subject}` : ""}
          </p>
        </div>

        {copy ? (
          <Badge tone={copy.status === "draft" ? "kesar" : copy.status === "evaluated" ? "success" : "indigo"}>
            {SUBMISSION_STATUS_LABELS[copy.status]}
          </Badge>
        ) : null}
      </div>

      <p className="mt-5 flex flex-wrap items-center gap-2 text-small text-ink-secondary">
        <CalendarClock aria-hidden className="size-4 text-kesar-600" />
        {test.opensAt ? `Opens ${formatIst(test.opensAt)}` : "Open now"}
        {test.closesAt ? ` · Submit by ${formatIst(test.closesAt)}` : " · No deadline"}
      </p>

      {note ? (
        <p className="mt-6 border-l-4 border-kesar bg-white px-4 py-3 text-body" role="status">
          {note}
        </p>
      ) : null}

      {evaluation ? (
        <div className="mt-8">
          <EvaluationReport testId={test.id} evaluation={evaluation} />
        </div>
      ) : null}

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ol className="space-y-6">
          <Step number={1} title="Get the question paper">
            {paperAvailable ? (
              <a
                href={`/dashboard/mains/${test.id}/file/paper`}
                target="_blank"
                rel="noopener"
                className={buttonStyles({ variant: evaluation ? "secondary" : "primary" })}
              >
                <FileDown aria-hidden className="size-4" />
                Open question paper (PDF)
              </a>
            ) : (
              <span
                className={cn(buttonStyles({ variant: "secondary" }), "pointer-events-none opacity-55")}
                aria-disabled
              >
                <FileDown aria-hidden className="size-4" />
                {window === "upcoming" ? `Released ${formatIst(test.opensAt)}` : "Not uploaded yet"}
              </span>
            )}

            <p className="mt-4 text-body text-ink-secondary">
              Print it single-sided on A4 and write in the space under each question — or open it in a
              stylus app on a tablet (Xodo, Samsung Notes, Notability and the like), write on it, and
              export it as a PDF.
            </p>
            {copy?.paperOpenedAt ? (
              <p className="mt-2 text-small text-ink-secondary">
                You first opened it {formatIst(copy.paperOpenedAt)}.
              </p>
            ) : null}
          </Step>

          <Step number={2} title="Write your answers">
            <ul className="space-y-2 text-body text-ink-secondary">
              {[
                `Time yourself: ${formatSpan(test.durationMinutes * 60_000)} for the whole paper, as in the exam.`,
                "Keep to the word limit printed with each question — content matters more than length.",
                "Write in blue or black ink and leave the left margin for the evaluator.",
                "Strike off any page or part of a page you leave blank.",
              ].map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 bg-indigo" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Step>

          <Step number={3} title={copy && copy.status !== "draft" ? "Your answer sheet" : "Upload and submit"}>
            {workspace.canEdit ? (
              <p className="mb-4 text-body text-ink-secondary">
                Photograph every page flat, in good light and in order — or upload the scanned or exported
                PDF. Then submit before the deadline.
              </p>
            ) : null}

            {workspace.canEdit || (copy && copy.files.length > 0) ? (
              <AnswerSheetUploader
                testId={test.id}
                studentUid={workspace.studentUid}
                submissionId={workspace.submissionId}
                files={copy?.files ?? []}
                canEdit={workspace.canEdit}
                canWithdraw={workspace.canWithdraw}
              />
            ) : (
              <p className="text-body text-ink-secondary">
                {window === "upcoming"
                  ? "Uploads open with the paper."
                  : "Nothing was uploaded for this paper."}
              </p>
            )}
          </Step>
        </ol>

        {scheme.length > 0 ? (
          <Card padding="md" className="lg:sticky lg:top-6">
            <h2 className="text-h4 font-semibold">On this paper</h2>
            <table className="mt-4 w-full text-left text-small">
              <thead className="border-b border-line text-ink-secondary">
                <tr>
                  <th scope="col" className="py-2 pr-3 font-semibold">Question</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Marks</th>
                  <th scope="col" className="py-2 font-semibold">Words</th>
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
          </Card>
        ) : null}
      </div>
    </>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <li>
      <Card padding="md">
        <div className="flex gap-4">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center bg-indigo text-small font-bold text-white"
          >
            {number}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-h4 font-semibold">
              <span className="sr-only">Step {number}: </span>
              {title}
            </h2>
            <div className="mt-4">{children}</div>
          </div>
        </div>
      </Card>
    </li>
  );
}
