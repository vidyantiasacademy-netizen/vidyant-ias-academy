import type { QuestionDoc, Test, TestDoc } from "@/types/db";

/**
 * The rules for when a paper may change, shared by the authoring actions (which
 * enforce them) and the authoring pages (which disable what would be refused).
 * One copy, so the screen never offers an edit the server turns down.
 */

/**
 * Fields that decide how a sitting is timed or scored. Changing any of them on
 * a published or sat paper would leave students, or scorecards already written,
 * measured against a paper that no longer exists.
 */
export const LOCKED_TEST_FIELDS = [
  "courseId",
  "kind",
  "questionCount",
  "totalMarks",
  "durationMinutes",
  "negativeMarksPerQuestion",
  "opensAt",
  "security",
] as const satisfies readonly (keyof TestDoc)[];

/**
 * Why a paper's questions and scoring fields cannot change, or `null`.
 *
 * Published counts as well as sat: publishing checked that the questions add up
 * to the paper's count and marks, and an edit after that would undo the check
 * while students can already see the paper. A sat paper can never be moved back
 * to draft, so for it the lock is permanent.
 */
export function paperLockReason(test: Pick<Test, "status">, hasAttempts: boolean): string | null {
  if (hasAttempts) {
    return "Students have already started this paper, so its questions, marks and timing are locked.";
  }

  if (test.status === "published") {
    return "This paper is published. Move it back to draft to change its questions, marks or timing.";
  }

  return null;
}

/**
 * Why a paper cannot be published yet, or `null` when it can.
 *
 * The planned `questionCount` and `totalMarks` are what the student is told
 * before they start and what the scorecard divides by, so a paper with 98 of its
 * 100 questions written must not go live claiming 100.
 */
export function publishBlocker(
  test: Pick<TestDoc, "questionCount" | "totalMarks">,
  questions: Pick<QuestionDoc, "status" | "marks">[],
): string | null {
  const live = questions.filter((question) => question.status === "published");
  const marks = live.reduce((sum, question) => sum + question.marks, 0);

  if (live.length === 0) return "Add at least one question before publishing.";

  if (live.length !== test.questionCount) {
    return `The paper is set for ${test.questionCount} questions but has ${live.length} published.`;
  }

  if (Math.abs(marks - test.totalMarks) > 0.001) {
    return `The paper is set for ${test.totalMarks} marks but its questions add up to ${marks}.`;
  }

  return null;
}
