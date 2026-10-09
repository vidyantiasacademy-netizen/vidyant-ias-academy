import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { QuestionForm } from "@/components/admin/QuestionForm";
import { testService } from "@/services/tests/test.service";

import { orNotFound, paperLockReason, requireFacultyPage } from "../../../shared";

export const metadata: Metadata = {
  title: "Edit question",
  robots: { index: false, follow: false },
};

export default async function EditQuestionPage({
  params,
}: PageProps<"/[lang]/admin/tests/[testId]/questions/[questionId]">) {
  const { testId, questionId } = await params;
  await requireFacultyPage(`/admin/tests/${testId}/questions/${questionId}`);

  const [test, question, sat] = await Promise.all([
    orNotFound(testService.getTest(testId)),
    orNotFound(testService.getQuestionForStaff(questionId)),
    testService.hasAttempts(testId),
  ]);

  if (!question.testIds.includes(testId)) notFound();
  if (paperLockReason(test, sat)) redirect(`/admin/tests/${testId}`);

  return (
    <>
      <h1 className="text-h2 font-bold">Edit question</h1>
      <p className="mt-2 text-body text-ink-secondary">
        {test.title}
        {question.testIds.length > 1
          ? ` · Also on ${question.testIds.length - 1} other paper${question.testIds.length > 2 ? "s" : ""} — changes apply to all of them.`
          : ""}
      </p>

      <div className="mt-8 max-w-4xl">
        <QuestionForm
          testId={test.id}
          question={question}
          defaults={{ subject: question.subject, marks: question.marks }}
        />
      </div>
    </>
  );
}
