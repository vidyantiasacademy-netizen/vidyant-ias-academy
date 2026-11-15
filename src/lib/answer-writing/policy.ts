import type {
  AnswerSubmissionStatus,
  MainsEvaluation,
  MainsQuestionSlot,
  QuestionEvaluation,
  RubricKey,
  Test,
  TestDoc,
} from "@/types/db";

import { hasPassed, isAhead } from "@/lib/utils/instant";

import { ANSWER_RUBRIC } from "./rubric";

/**
 * The rules of Mains answer writing, shared by the service (which enforces
 * them), the actions, and the screens (which disable what would be refused).
 *
 * Pure and client-safe on purpose: one copy of each rule, so the screen never
 * offers something the server turns down.
 */

/** Files per copy. A GS booklet is about 24 pages; this leaves room for a re-shoot. */
export const MAX_ANSWER_FILES = 30;

/** What Cloudinary reports for the accepted answer-sheet types. */
export const ANSWER_SHEET_FORMATS = ["jpg", "jpeg", "png", "pdf"] as const;

export const SUBMISSION_STATUS_LABELS: Record<AnswerSubmissionStatus, string> = {
  draft: "Not submitted",
  submitted: "Awaiting evaluation",
  "in-review": "Being evaluated",
  evaluated: "Evaluated",
};

export type PaperWindow = "upcoming" | "open" | "closed";

/** Where a paper stands against the clock — compared as instants, see `lib/utils/instant.ts`. */
export function paperWindow(
  test: Pick<TestDoc, "opensAt" | "closesAt">,
  now = Date.now(),
): PaperWindow {
  if (test.opensAt && isAhead(test.opensAt, now)) return "upcoming";
  if (test.closesAt && hasPassed(test.closesAt, now)) return "closed";
  return "open";
}

/** `questionCount` and `totalMarks`, from the scheme they must agree with. */
export function schemeTotals(scheme: readonly MainsQuestionSlot[]): {
  questionCount: number;
  totalMarks: number;
} {
  return {
    questionCount: scheme.length,
    totalMarks: scheme.reduce((sum, slot) => sum + slot.maxMarks, 0),
  };
}

/**
 * Why a Mains paper's PDF, scheme and timing cannot change, or `null`.
 *
 * Once anyone has opened the paper, a new PDF or a re-weighted question would
 * mean their copy was written against a paper that no longer exists. The
 * deadline, result date, title and subject stay editable — extending a deadline
 * is the usual reason to touch a live paper.
 */
export function mainsLockReason(
  test: Pick<Test, "status">,
  hasSubmissions: boolean,
): string | null {
  if (hasSubmissions) {
    return "Students have already opened this paper, so its question paper, marking scheme and timing are locked.";
  }

  if (test.status === "published") {
    return "This paper is published. Move it back to draft to change its question paper, marking scheme or timing.";
  }

  return null;
}

/** Why a Mains paper cannot be published yet, or `null` when it can. */
export function mainsPublishBlocker(
  test: Pick<TestDoc, "questionPaperPath" | "markingScheme" | "questionCount" | "totalMarks">,
): string | null {
  if (!test.questionPaperPath) return "Upload the question paper PDF before publishing.";

  const scheme = test.markingScheme ?? [];
  if (scheme.length === 0) return "Add the marking scheme before publishing.";

  const totals = schemeTotals(scheme);
  if (
    totals.questionCount !== test.questionCount ||
    Math.abs(totals.totalMarks - test.totalMarks) > 0.001
  ) {
    return "The marking scheme does not match the paper's question count and marks. Save the settings again.";
  }

  return null;
}

/** Total marks on a (possibly draft) evaluation. Unmarked questions count zero. */
export function scoreOf(questions: readonly Pick<QuestionEvaluation, "attempted" | "marksAwarded">[]): number {
  return questions.reduce(
    (sum, question) => sum + (question.attempted ? (question.marksAwarded ?? 0) : 0),
    0,
  );
}

/** Why an evaluation cannot be completed yet, or `null`. */
export function completionProblem(
  evaluation: Pick<MainsEvaluation, "questions" | "rubric" | "remarks">,
): string | null {
  const unmarked = evaluation.questions.filter(
    (question) => question.attempted && question.marksAwarded === null,
  );

  if (unmarked.length > 0) {
    return `Award marks for ${unmarked.map((question) => question.label).join(", ")}, or mark ${
      unmarked.length === 1 ? "it" : "them"
    } not attempted.`;
  }

  const unscored = ANSWER_RUBRIC.filter((criterion) => evaluation.rubric[criterion.key] === null);
  if (unscored.length > 0) {
    return `Score the rubric: ${unscored.map((criterion) => criterion.label.toLowerCase()).join(", ")}.`;
  }

  if (!evaluation.remarks?.trim()) return "Write your overall remarks for the student.";

  return null;
}

/** "2 h 51 min", "38 min", "3 days". For "submitted N after opening the paper". */
export function formatSpan(milliseconds: number): string {
  const minutes = Math.max(0, Math.round(milliseconds / 60_000));

  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 48) {
    const rest = minutes % 60;
    return rest ? `${hours} h ${rest} min` : `${hours} h`;
  }

  return `${Math.round(hours / 24)} days`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Analysis ────────────────────────────────────────────────────────────────

export interface RubricAverage {
  key: RubricKey;
  label: string;
  /** Mean on the 1–5 scale, one decimal, or `null` with nothing scored. */
  average: number | null;
}

export interface WritingProfile {
  copies: number;
  /** Mean score as a share of the paper, 0–100. */
  averagePercent: number | null;
  rubric: RubricAverage[];
  /** Highest and lowest criteria — `null` when every criterion is level. */
  strongest: RubricAverage | null;
  weakest: RubricAverage | null;
}

/**
 * Folds evaluated copies into one picture: how a student writes across papers,
 * or how a batch wrote one paper. Callers pass only evaluations the viewer is
 * allowed to see — this function trusts its input.
 */
export function summariseWriting(
  evaluations: readonly Pick<MainsEvaluation, "rubric" | "score" | "totalMarks">[],
): WritingProfile {
  const round = (value: number) => Math.round(value * 10) / 10;

  const percents = evaluations
    .filter((evaluation) => evaluation.totalMarks > 0)
    .map((evaluation) => (evaluation.score / evaluation.totalMarks) * 100);

  const rubric = ANSWER_RUBRIC.map(({ key, label }) => {
    const scores = evaluations
      .map((evaluation) => evaluation.rubric[key])
      .filter((score): score is number => typeof score === "number");

    return {
      key,
      label,
      average: scores.length ? round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null,
    };
  });

  const scored = rubric.filter((criterion) => criterion.average !== null);
  const ordered = [...scored].sort((a, b) => b.average! - a.average!);
  const level = ordered.length < 2 || ordered[0].average === ordered.at(-1)!.average;

  return {
    copies: evaluations.length,
    averagePercent: percents.length
      ? round(percents.reduce((sum, percent) => sum + percent, 0) / percents.length)
      : null,
    rubric,
    strongest: level ? null : ordered[0],
    weakest: level ? null : ordered.at(-1)!,
  };
}
