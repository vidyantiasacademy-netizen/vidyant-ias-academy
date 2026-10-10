import type { Entity, IsoDateTime, PublishStatus, Uid } from "./common";

export type TestKind = "prelims-mcq" | "mains-descriptive" | "csat" | "sectional";

/**
 * Per-paper exam-integrity settings.
 *
 * `null` on a test means "the institute default" (`DEFAULT_EXAM_SECURITY` in
 * `src/lib/exam/policy.ts`) rather than "no protection" — a paper created before
 * this field existed, or by a faculty member who never opened the section, must
 * not be the one that ships unproctored.
 *
 * Every number here is enforced on the server. The browser copy exists only to
 * draw the warning before the limit is reached.
 */
export interface ExamSecurityPolicy {
  /** Attempt starts only from a fullscreen gesture, and leaving is a violation. */
  requireFullscreen: boolean;
  /** Question order is permuted per attempt, so "the answer to Q7" means nothing. */
  shuffleQuestions: boolean;
  /** Option order is permuted per question per attempt, so "it's option C" too. */
  shuffleOptions: boolean;
  /** Copy, cut, paste, right-click and the print/devtools shortcuts are refused. */
  blockCopyPaste: boolean;
  /** Tab switches and window blurs allowed before the paper is submitted for them. */
  maxFocusLosses: number;
  /** Weighted violation budget. See `VIOLATION_WEIGHTS`. */
  maxViolationScore: number;
  /** Submit the paper automatically once a budget is exhausted. */
  autoSubmitOnViolation: boolean;
  /** Draw the student's identity across the paper, against photographs. */
  watermark: boolean;
}

/**
 * Who may sit a paper. `public` papers are the free mock tests on the website,
 * sat by visitors who leave a name and a number instead of signing in — see
 * `mockAttempts`. Absent on papers written before the field existed, which
 * means `enrolled`.
 */
export type TestAudience = "enrolled" | "public";

/** `tests/{testId}` — the paper. Questions live in their own collection. */
export interface TestDoc {
  courseId: string;
  batchId: string | null;
  title: string;
  kind: TestKind;
  /** Subject/paper label used for weakness analysis, e.g. "Polity". */
  subject: string | null;
  questionCount: number;
  totalMarks: number;
  durationMinutes: number;
  /** Negative marking per wrong MCQ, e.g. 0.66. Zero for descriptive papers. */
  negativeMarksPerQuestion: number;
  /** Scheduled window. Outside it, `createAttempt` refuses. */
  opensAt: IsoDateTime | null;
  closesAt: IsoDateTime | null;
  /** Students may see the key and explanations only after this moment. */
  resultsVisibleFrom: IsoDateTime | null;
  /** Exam-integrity settings. `null` falls back to the institute default. */
  security: ExamSecurityPolicy | null;
  /** Missing means `enrolled`. */
  audience?: TestAudience;
  status: PublishStatus;
}

export type Test = Entity<TestDoc>;

export type QuestionKind = "mcq-single" | "mcq-multiple" | "descriptive";

export type Difficulty = "easy" | "moderate" | "hard";

/**
 * `questions/{questionId}` — one question, reusable across tests and the PYQ
 * database.
 *
 * `correctOptionIds` and `explanation` must never reach a student before the
 * result window. The rules deny students this collection outright; the server
 * serves a redacted projection (`QuestionForAttempt`) during an attempt.
 */
export interface QuestionDoc {
  /** Tests this question appears in. Lets one bank serve many papers. */
  testIds: string[];
  kind: QuestionKind;
  subject: string;
  topic: string | null;
  difficulty: Difficulty;
  /** Set for previous-year questions, e.g. `{ exam: "UPSC CSE Prelims", year: 2023 }`. */
  pyq: { exam: string; year: number } | null;
  statement: string;
  /** Storage path of a diagram or passage image, if the question needs one. */
  imagePath: string | null;
  options: { id: string; text: string }[];
  correctOptionIds: string[];
  /** Model answer for descriptive questions. */
  modelAnswer: string | null;
  explanation: string | null;
  marks: number;
  status: PublishStatus;
}

export type Question = Entity<QuestionDoc>;

/** What a student is allowed to see while attempting: no key, no explanation. */
export type QuestionForAttempt = Pick<
  Question,
  "id" | "kind" | "subject" | "statement" | "imagePath" | "options" | "marks"
>;

export type AttemptStatus = "in-progress" | "submitted" | "evaluated" | "abandoned";

/** Why an attempt ended without the student pressing Submit. */
export type TerminationReason = "expired" | "violations" | "staff";

/**
 * `testAttempts/{attemptId}` — one sitting.
 *
 * Written only by the server. Scores are written by the evaluator (this service
 * for MCQ, faculty for Mains), which is why `score` is absent here and lives on
 * `results` — a separate document a student cannot write at all.
 *
 * The proctoring fields are counters rather than a log: the log is
 * `proctorEvents`, and a counter on the attempt is what the submit path can read
 * in one document to decide whether the budget is spent.
 */
export interface TestAttemptDoc {
  testId: string;
  studentUid: Uid;
  startedAt: IsoDateTime;
  submittedAt: IsoDateTime | null;
  /** Server-computed deadline: `startedAt + test.durationMinutes`. */
  expiresAt: IsoDateTime;
  status: AttemptStatus;
  /** Answered question count, for resume and progress UI. */
  answeredCount: number;

  /**
   * Identifies the one browser window allowed to write to this attempt. Every
   * answer, heartbeat and submit carries it; a mismatch is refused and logged.
   * Re-issued when the student deliberately resumes elsewhere, which evicts the
   * old window — two windows open on one paper is the cheapest way to cheat.
   */
  sessionToken: string;
  /** Permutation seed for this sitting. Two students never get the same order. */
  shuffleSeed: string;
  /** Last heartbeat. A stale attempt is what the sweeper finalises. */
  lastSeenAt: IsoDateTime;
  /** Tab switches and window blurs observed. */
  focusLossCount: number;
  /** Exits from fullscreen. */
  fullscreenExitCount: number;
  /** Copy, paste, right-click and shortcut attempts refused by the browser. */
  blockedActionCount: number;
  /** Weighted total of the above. Compared against `maxViolationScore`. */
  violationScore: number;
  /** Rows written to `proctorEvents` for this sitting. Caps the log, not the budget. */
  proctorEventCount: number;
  /** True when the server submitted the paper rather than the student. */
  autoSubmitted: boolean;
  terminationReason: TerminationReason | null;
}

export type TestAttempt = Entity<TestAttemptDoc>;

/** What a student's own window is allowed to know about their sitting. */
export interface AttemptStateForStudent {
  attemptId: string;
  status: AttemptStatus;
  /** Server-authoritative. The client clock is never the timer. */
  remainingSeconds: number;
  focusLossCount: number;
  violationScore: number;
  /** Violation budget left before the paper is submitted automatically. */
  focusLossesLeft: number;
  terminationReason: TerminationReason | null;
}

export const PROCTOR_EVENT_TYPES = [
  "fullscreenExit",
  "fullscreenRestored",
  "focusLoss",
  "focusRestored",
  "blockedCopy",
  "blockedPaste",
  "blockedShortcut",
  "blockedContextMenu",
  "secondWindow",
  "sessionTakeover",
  "networkLoss",
  "autoSubmit",
] as const;

export type ProctorEventType = (typeof PROCTOR_EVENT_TYPES)[number];

/**
 * `proctorEvents/{eventId}` — the integrity log for one sitting.
 *
 * Append-only and server-written. It is evidence, so nothing in the product
 * updates or deletes a row: a disputed paper is settled by reading this
 * collection next to `answers`.
 *
 * Students cannot read it either. Showing a student which of their tricks was
 * detected is a tutorial in which ones were not.
 */
export interface ProctorEventDoc {
  attemptId: string;
  testId: string;
  studentUid: Uid;
  type: ProctorEventType;
  /** Weight applied to the attempt's `violationScore` by this row. */
  weight: number;
  /** Short machine-readable detail, e.g. the refused shortcut. Never free text. */
  detail: string | null;
  /** The browser's own clock, kept only to spot a tampered one. */
  clientTime: IsoDateTime | null;
  userAgent: string | null;
}

export type ProctorEvent = Entity<ProctorEventDoc>;

/**
 * `answers/{answerId}` — one answer in one attempt. Id is
 * `{attemptId}_{questionId}` so a retry overwrites instead of duplicating.
 *
 * `isCorrect` and `marksAwarded` are evaluator-written. Students write only
 * `selectedOptionIds` / `text` / `answerSheetPath`, and only while the parent
 * attempt is `in-progress`.
 */
export interface AnswerDoc {
  attemptId: string;
  testId: string;
  questionId: string;
  studentUid: Uid;
  selectedOptionIds: string[];
  /** Typed Mains answer. */
  text: string | null;
  /** Storage path of a photographed handwritten answer sheet. */
  answerSheetPath: string | null;
  /** Seconds spent on this question — raw material for weakness detection. */
  timeSpentSeconds: number;
  isCorrect: boolean | null;
  marksAwarded: number | null;
  /** Faculty remarks on a descriptive answer. */
  evaluatorNote: string | null;
  evaluatedBy: Uid | null;
}

export type Answer = Entity<AnswerDoc>;

/**
 * `results/{resultId}` — the scorecard. Id is `{attemptId}` so one attempt has
 * exactly one result. Read-only for everyone except the evaluator.
 */
export interface ResultDoc {
  attemptId: string;
  testId: string;
  studentUid: Uid;
  score: number;
  totalMarks: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  negativeMarks: number;
  /** Rank within the test, filled by a Cloud Function once a batch submits. */
  rank: number | null;
  percentile: number | null;
  /** Per-subject breakdown. The input the AI phase needs for weak-area work. */
  subjectBreakdown: {
    subject: string;
    score: number;
    totalMarks: number;
    correctCount: number;
    wrongCount: number;
  }[];
  publishedAt: IsoDateTime | null;
}

export type Result = Entity<ResultDoc>;

export type MockAttemptStatus = "registered" | "in-progress" | "evaluated";

/** The scorecard of a public mock sitting. `score` sits on the attempt itself, for ranking. */
export type MockResultDoc = Pick<
  ResultDoc,
  "totalMarks" | "correctCount" | "wrongCount" | "unattemptedCount" | "negativeMarks" | "subjectBreakdown"
>;

/**
 * `mockAttempts/{attemptId}` — one website visitor's sitting of a public mock.
 *
 * Visitors have no account, so this is deliberately not `testAttempts`: there
 * is no uid to hang `answers`, `results` and the invigilation log off, and the
 * student engine's guarantees (enrolment, one window, proctoring) do not apply
 * to a free practice paper. Everything lives on this one document instead —
 * bounded, because a paper's question count is.
 *
 * The visitor proves ownership with a random token held in an httpOnly cookie;
 * only its SHA-256 is stored here. Server-written only, like `testAttempts`.
 */
export interface MockAttemptDoc {
  testId: string;
  /** The CRM record created at registration — the reason this paper exists. */
  enquiryId: string;
  name: string;
  /** 10 digits, normalised by `phoneField`. One sitting per number per paper. */
  phone: string;
  email: string | null;
  targetAttempt: string | null;
  accessTokenHash: string;
  shuffleSeed: string;
  status: MockAttemptStatus;
  /** Set by Begin, not by registration — reading the instructions costs no time. */
  startedAt: IsoDateTime | null;
  expiresAt: IsoDateTime | null;
  submittedAt: IsoDateTime | null;
  /** True when time ran out rather than the visitor pressing Submit. */
  autoSubmitted: boolean;
  /** The paper's published question ids, fixed at Begin. Answers are checked against it. */
  questionIds: string[];
  /** questionId → selected option ids. */
  answers: Record<string, string[]>;
  answeredCount: number;
  /** Null until scored. Top-level so rank is one count query. */
  score: number | null;
  result: MockResultDoc | null;
}

export type MockAttempt = Entity<MockAttemptDoc>;
