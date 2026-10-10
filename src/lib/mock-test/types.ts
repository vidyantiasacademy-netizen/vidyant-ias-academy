import type { ExamQuestion } from "@/lib/exam/types";
import type { MockResultDoc, TestKind } from "@/types/db";

/**
 * What crosses from the mock test service into the visitor's browser.
 *
 * Kept apart from the service (which is `server-only`) so the client runner
 * can import the shapes. Like `lib/exam/types.ts`, this file is the complete
 * list of what a visitor's window may know — the answer key is not in it.
 */

/** A public paper as the landing page and the instructions screen show it. */
export interface PublicPaper {
  id: string;
  title: string;
  kind: TestKind;
  subject: string | null;
  questionCount: number;
  totalMarks: number;
  durationMinutes: number;
  negativeMarksPerQuestion: number;
  /** After this no new sitting may start. `null` for an always-open paper. */
  closesAt: string | null;
}

/** The sitting before Begin: instructions only, the clock has not started. */
export interface MockInstructions {
  stage: "instructions";
  attemptId: string;
  firstName: string;
  paper: PublicPaper;
}

/** A live sitting. */
export interface MockSitting {
  stage: "sitting";
  attemptId: string;
  paper: PublicPaper;
  /** Server-authoritative at the moment of the response. */
  remainingSeconds: number;
  questions: ExamQuestion[];
  answers: Record<string, string[]>;
}

export interface MockFinished {
  stage: "finished";
  attemptId: string;
}

export type MockState = MockInstructions | MockSitting | MockFinished;

/** One question replayed with its key, once the paper's key is visible. */
export interface MockReviewQuestion {
  id: string;
  subject: string;
  statement: string;
  options: { id: string; text: string }[];
  correctOptionIds: string[];
  selectedOptionIds: string[];
  explanation: string | null;
  marks: number;
}

export interface MockResultView {
  attemptId: string;
  paper: PublicPaper;
  name: string;
  score: number;
  result: MockResultDoc;
  autoSubmitted: boolean;
  /** 1-based, ties share a rank. */
  rank: number;
  /** Everyone scored on this paper so far, the visitor included. */
  totalCandidates: number;
  /** Share of other candidates scored below the visitor, 0–100. `null` while the field is too small to mean anything. */
  percentile: number | null;
  /** Subjects with the lowest share of marks, weakest first. */
  weakSubjects: string[];
  /** `null` until the paper's answer key is released. */
  review: MockReviewQuestion[] | null;
  keyVisibleFrom: string | null;
}
