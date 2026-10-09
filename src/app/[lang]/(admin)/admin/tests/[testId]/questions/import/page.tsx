import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { QuestionImport } from "@/components/admin/QuestionImport";
import { testService } from "@/services/tests/test.service";

import { orNotFound, paperLockReason, requireFacultyPage } from "../../../shared";

export const metadata: Metadata = {
  title: "Import questions",
  robots: { index: false, follow: false },
};

export default async function ImportQuestionsPage({
  params,
}: PageProps<"/[lang]/admin/tests/[testId]/questions/import">) {
  const { testId } = await params;
  await requireFacultyPage(`/admin/tests/${testId}/questions/import`);

  const [test, questions, sat] = await Promise.all([
    orNotFound(testService.getTest(testId)),
    testService.listQuestionsForStaff(testId),
    testService.hasAttempts(testId),
  ]);

  // The paper page says why; the import would only fail on submit.
  if (test.kind === "mains-descriptive" || paperLockReason(test, sat)) {
    redirect(`/admin/tests/${testId}`);
  }

  const live = questions.filter((question) => question.status === "published");

  return (
    <>
      <h1 className="text-h2 font-semibold">Import questions</h1>
      <p className="mt-2 text-body text-ink-secondary">{test.title}</p>

      <div className="mt-8 max-w-4xl">
        <QuestionImport
          testId={test.id}
          defaults={{
            subject: test.subject ?? "",
            // Same first guess as the single-question form.
            marks: Math.round((test.totalMarks / test.questionCount) * 100) / 100,
          }}
          paper={{
            questionCount: test.questionCount,
            totalMarks: test.totalMarks,
            liveCount: live.length,
            liveMarks: live.reduce((sum, question) => sum + question.marks, 0),
          }}
          existingStatements={questions.map((question) => question.statement)}
        />
      </div>
    </>
  );
}
