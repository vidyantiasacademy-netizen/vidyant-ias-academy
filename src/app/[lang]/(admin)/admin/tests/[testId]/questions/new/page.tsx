import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { QuestionForm } from "@/components/admin/QuestionForm";
import { testService } from "@/services/tests/test.service";

import { orNotFound, paperLockReason, requireFacultyPage } from "../../../shared";

export const metadata: Metadata = {
  title: "Add question",
  robots: { index: false, follow: false },
};

export default async function NewQuestionPage({
  params,
}: PageProps<"/[lang]/admin/tests/[testId]/questions/new">) {
  const { testId } = await params;
  await requireFacultyPage(`/admin/tests/${testId}/questions/new`);

  const [test, questions, sat] = await Promise.all([
    orNotFound(testService.getTest(testId)),
    testService.listQuestionsForStaff(testId),
    testService.hasAttempts(testId),
  ]);

  // The paper page says why; this form would only fail on save.
  if (test.kind === "mains-descriptive" || paperLockReason(test, sat)) {
    redirect(`/admin/tests/${testId}`);
  }

  return (
    <>
      <h1 className="text-h2 font-bold">Question {questions.length + 1}</h1>
      <p className="mt-2 text-body text-ink-secondary">{test.title}</p>

      <div className="mt-8 max-w-4xl">
        <QuestionForm
          testId={test.id}
          defaults={{
            subject: test.subject ?? "",
            // Equal marks per question is the norm (2 each on GS Paper I), so the
            // paper's own total over its count is the best first guess.
            marks: Math.round((test.totalMarks / test.questionCount) * 100) / 100,
          }}
        />
      </div>
    </>
  );
}
