import type { Entity, IsoDateTime, Uid } from "./common";

/**
 * Mains answer writing: a student downloads a paper's PDF, writes on it — on a
 * printout or in a stylus app — and uploads the pages; faculty mark the copy
 * and return it with an annotated "checked copy" and structured feedback.
 *
 * The paper itself is a `tests` document of kind `mains-descriptive`; see
 * `TestDoc.questionPaperPath` and `TestDoc.markingScheme`.
 */

/**
 * Where a copy is in its life.
 *
 * - `draft`: the student has opened the paper or uploaded pages, not submitted.
 * - `submitted`: waiting for an evaluator.
 * - `in-review`: an evaluator has started marking. The student can no longer
 *   withdraw it.
 * - `evaluated`: marked. Visible to the student once its `results` document's
 *   `publishedAt` has passed.
 */
export type AnswerSubmissionStatus = "draft" | "submitted" | "in-review" | "evaluated";

/** One uploaded file of an answer sheet — a photographed page or a whole PDF. */
export interface AnswerSheetFile {
  /** Media reference under `students/{uid}/answers/{submissionId}/`. */
  path: string;
  /** The format Cloudinary stored: `jpg`, `png` or `pdf`. */
  format: string;
  /** The file name on the student's device, for their own list. Display only. */
  name: string;
  /** Size as uploaded, reported by the browser. Display only. */
  bytes: number;
  uploadedAt: IsoDateTime;
}

/** The answer-writing rubric. Labels live in `lib/answer-writing/rubric.ts`. */
export type RubricKey = "demand" | "content" | "structure" | "presentation" | "language";

/** 1–5 per criterion. `null` while an evaluation is still a draft. */
export type RubricScores = Record<RubricKey, number | null>;

/** One question's marks on an evaluated copy. Copied from the marking scheme. */
export interface QuestionEvaluation {
  label: string;
  maxMarks: number;
  /** False when the student left the question out. */
  attempted: boolean;
  /** `null` for an unattempted question, or one not yet marked in a draft. */
  marksAwarded: number | null;
  remark: string | null;
}

export interface MainsEvaluation {
  questions: QuestionEvaluation[];
  rubric: RubricScores;
  strengths: string | null;
  improvements: string | null;
  /** The evaluator's overall remarks. Required to complete an evaluation. */
  remarks: string | null;
  /**
   * The student's copy as the evaluator annotated it — media reference under
   * `tests/{testId}/evaluated/{studentUid}/`, never under the student's own
   * folder, so it stays unreadable until the result is released.
   */
  checkedCopyPath: string | null;
  score: number;
  totalMarks: number;
}

/**
 * `answerSubmissions/{testId}_{studentUid}` — one student's copy of one paper.
 *
 * Server-written only, and not readable by students directly: an evaluation is
 * drafted on this document before release, and Firestore cannot hide a field
 * from a read. The student portal reads a projection through
 * `answerWritingService` instead.
 */
export interface AnswerSubmissionDoc {
  testId: string;
  courseId: string;
  studentUid: Uid;
  status: AnswerSubmissionStatus;
  /** First time the student opened the question paper during its window. */
  paperOpenedAt: IsoDateTime | null;
  /** In page order. */
  files: AnswerSheetFile[];
  submittedAt: IsoDateTime | null;
  /** Who is marking, or marked, this copy. */
  evaluatorUid: Uid | null;
  reviewStartedAt: IsoDateTime | null;
  /** Draft while `in-review`, final once `evaluated`. */
  evaluation: MainsEvaluation | null;
  /** First completion. Later corrections move `updatedAt`, not this. */
  evaluatedAt: IsoDateTime | null;
}

export type AnswerSubmission = Entity<AnswerSubmissionDoc>;
