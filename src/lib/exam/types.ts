import type {
  AttemptStatus,
  ExamSecurityPolicy,
  QuestionForAttempt,
  TerminationReason,
} from "@/types/db";

/**
 * The shapes that cross from the server into the exam runner.
 *
 * They live here, away from `src/services`, because the runner is a Client
 * Component: importing a type from a service would pull `import "server-only"`
 * into the browser bundle and fail the build. Keeping the contract in its own
 * module is also a useful discipline — what a sitting's window is allowed to
 * know is one readable file, and the answer key is visibly not in it.
 */

/** One question as the student's window receives it. No key, no explanation. */
export interface ExamQuestion extends QuestionForAttempt {
  /**
   * Short-lived signed URL for a diagram or passage image, signed to outlast the
   * paper's duration. `null` when the question has no image, and also when
   * signing failed — a missing diagram is better than a dead paper.
   */
  imageUrl: string | null;
}

export interface ExamAnswerSnapshot {
  questionId: string;
  selectedOptionIds: string[];
}

/** Everything the runner needs for a live sitting. */
export interface ExamPayload {
  attemptId: string;
  /** Identifies this window to the server on every write. */
  sessionToken: string;
  status: AttemptStatus;
  /** Server-authoritative at the moment of the response. */
  remainingSeconds: number;
  questions: ExamQuestion[];
  answers: ExamAnswerSnapshot[];
  policy: ExamSecurityPolicy;
  focusLossesLeft: number;
  /** True when the sitting was already over — the runner goes straight to the result. */
  finished: boolean;
  terminationReason: TerminationReason | null;
}
