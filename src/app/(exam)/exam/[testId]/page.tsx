import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ExamGate } from "@/components/exam/ExamGate";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentStudent } from "@/lib/auth/server";
import { BRAND } from "@/lib/constants/site";
import { isAppError } from "@/lib/errors";
import { describeExamRules, resolveExamSecurity } from "@/lib/exam/policy";

import { testService } from "@/services/tests/test.service";

/**
 * One sitting of one paper.
 *
 * The page itself starts nothing: it loads the paper's shape and the rules, and
 * hands them to `ExamGate`, whose Begin button is what creates the attempt. That
 * split is what keeps the clock honest — a student on a slow connection should
 * not lose exam minutes to this page's own render.
 */
export const metadata: Metadata = {
  title: `Examination | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

export default async function ExamPage({ params }: PageProps<"/exam/[testId]">) {
  const { testId } = await params;

  let test;
  try {
    test = await testService.getTest(testId);
  } catch (error) {
    if (isAppError(error)) return <ExamUnavailable message={error.message} />;
    throw error;
  }

  // Descriptive papers are written on paper and photographed; there is nothing
  // for the MCQ runner to render.
  if (test.kind === "mains-descriptive") redirect(`/dashboard/tests/${testId}`);

  const resultHref = `/dashboard/tests/${testId}/result`;

  // A finished sitting goes to its scorecard rather than offering a second one.
  // `createAttempt` would refuse anyway; this is the kind refusal.
  const existing = await testService.findOwnAttempt(testId);
  if (existing && existing.status !== "in-progress") redirect(resultHref);

  const now = new Date().toISOString();

  if (test.opensAt && now < test.opensAt) {
    return (
      <ExamUnavailable message="This paper has not opened yet. Check the schedule on your test series page." />
    );
  }

  if (test.closesAt && now > test.closesAt) {
    return <ExamUnavailable message="This paper has closed." />;
  }

  const policy = resolveExamSecurity(test);
  const student = await getCurrentStudent();

  // Identity, not decoration: the watermark is what makes a photographed paper
  // traceable to the sitting it came from. Roll number first because that is
  // what the institute's own records are keyed on.
  const watermark = student
    ? [student.rollNumber, student.fullName].filter(Boolean).join(" · ")
    : null;

  return (
    <ExamGate
      test={{
        id: test.id,
        title: test.title,
        totalMarks: test.totalMarks,
        questionCount: test.questionCount,
        durationMinutes: test.durationMinutes,
        negativeMarksPerQuestion: test.negativeMarksPerQuestion,
      }}
      rules={describeExamRules(policy)}
      watermark={watermark}
      resultHref={resultHref}
    />
  );
}

function ExamUnavailable({ message }: { message: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper p-6">
      <div className="w-full max-w-lg rounded-lg border border-line bg-white p-7 text-center sm:p-9">
        <h1 className="text-h3 font-semibold">This paper cannot be opened</h1>
        <p className="mt-3 text-body text-ink-secondary">{message}</p>
        <div className="mt-7">
          <ButtonLink href="/dashboard/prelims" variant="secondary">
            Back to the test series
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
