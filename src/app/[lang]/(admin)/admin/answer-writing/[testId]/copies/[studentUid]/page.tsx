import type { Metadata } from "next";
import Image from "next/image";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";

import { EvaluationForm } from "@/components/admin/answer-writing/EvaluationForm";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink, buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatSpan } from "@/lib/answer-writing/policy";
import { formatIst } from "@/lib/exam/ist";
import { answerWritingService } from "@/services/answer-writing/answer-writing.service";

import { COPY_STATUS_TONE, STAFF_STATUS_LABELS, orNotFound, requireFacultyPage } from "../../../shared";

export const metadata: Metadata = {
  title: "Evaluate copy",
  robots: { index: false, follow: false },
};

/**
 * One student's copy: their pages on the left, the evaluation on the right.
 *
 * Opening the page claims nothing — a faculty member browsing copies must not
 * lock others out. The first save claims it; a copy someone else is marking
 * shows who, and offers to take it over.
 */
export default async function EvaluateCopyPage({
  params,
}: PageProps<"/[lang]/admin/answer-writing/[testId]/copies/[studentUid]">) {
  const { testId, studentUid } = await params;
  const session = await requireFacultyPage(`/admin/answer-writing/${testId}/copies/${studentUid}`);

  const data = await orNotFound(answerWritingService.getCopyForStaff(testId, studentUid));
  const { test, copy, files } = data;

  const heldBy =
    copy.status === "in-review" && copy.evaluatorUid && copy.evaluatorUid !== session.uid
      ? (data.evaluatorName ?? "Another evaluator")
      : null;

  const visibility = data.releasesAt ? `on ${formatIst(data.releasesAt)}` : "straight away";

  const took =
    copy.paperOpenedAt && copy.submittedAt
      ? formatSpan(Date.parse(copy.submittedAt) - Date.parse(copy.paperOpenedAt))
      : null;

  return (
    <>
      <ButtonLink href={`/admin/answer-writing/${test.id}`} variant="secondary" size="sm">
        <ArrowLeft aria-hidden className="size-4" />
        Back to paper
      </ButtonLink>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-h2 font-bold">{data.studentName}</h1>
            <Badge tone={COPY_STATUS_TONE[copy.status]}>{STAFF_STATUS_LABELS[copy.status]}</Badge>
          </div>
          <p className="mt-2 text-body text-ink-secondary">
            {test.title}
            {data.rollNumber ? ` · ${data.rollNumber}` : ""}
          </p>
          <p className="mt-1 text-small text-ink-secondary">
            Submitted {formatIst(copy.submittedAt)}
            {took
              ? ` · ${took} after first opening the paper (writing time ${formatSpan(test.durationMinutes * 60_000)})`
              : ""}
            {data.evaluatorName ? ` · Evaluator: ${data.evaluatorName}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_30rem]">
        <section aria-labelledby="sheet-heading" className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="sheet-heading" className="text-h3 font-bold">
              Answer sheet
            </h2>
            {data.questionPaperUrl ? (
              <a
                href={data.questionPaperUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 text-small font-semibold text-indigo underline decoration-kesar decoration-2 underline-offset-4"
              >
                Question paper
                <ExternalLink aria-hidden className="size-3.5" />
              </a>
            ) : null}
          </div>

          <ol className="mt-5 space-y-6">
            {files.map((file, index) => {
              const label = `File ${index + 1} of ${files.length}`;

              return (
                <li key={file.path}>
                  <Card padding="none">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2.5">
                      <p className="min-w-0 truncate text-small">
                        <span className="font-semibold">{label}</span>
                        <span className="text-ink-secondary"> · {file.name}</span>
                      </p>
                      {file.url ? (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener"
                          className="inline-flex items-center gap-1.5 text-small font-semibold text-indigo"
                        >
                          Open
                          <ExternalLink aria-hidden className="size-3.5" />
                          <span className="sr-only">{label}</span>
                        </a>
                      ) : null}
                    </div>

                    {!file.url ? (
                      <p className="px-4 py-6 text-small text-danger">This file could not be loaded.</p>
                    ) : file.format === "pdf" ? (
                      <>
                        {/* Phones and tablets cannot draw a PDF inside a frame. */}
                        <iframe
                          src={file.url}
                          title={`${label}, ${data.studentName}'s answer sheet`}
                          className="hidden h-[85vh] w-full lg:block"
                        />
                        <div className="p-4 lg:hidden">
                          <a href={file.url} target="_blank" rel="noopener" className={buttonStyles({ size: "sm" })}>
                            <FileText aria-hidden className="size-4" />
                            Open PDF
                          </a>
                        </div>
                      </>
                    ) : (
                      <Image
                        src={file.url}
                        alt={`${label} of ${data.studentName}'s answer sheet`}
                        width={1600}
                        height={2263}
                        // Private, short-lived signed URL: nothing to optimise or cache.
                        unoptimized
                        className="h-auto w-full bg-white"
                      />
                    )}
                  </Card>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto">
          <EvaluationForm
            testId={test.id}
            studentUid={copy.studentUid}
            studentName={data.studentName}
            scheme={test.markingScheme ?? []}
            evaluation={copy.evaluation}
            status={copy.status}
            heldBy={heldBy}
            checkedCopyUrl={data.checkedCopyUrl}
            visibility={visibility}
          />
        </div>
      </div>
    </>
  );
}
