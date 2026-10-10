import type { Question, ResultDoc } from "@/types/db";

/**
 * How an MCQ paper is marked — the one copy of the rule.
 *
 * Shared by the student exam engine (`testService.finalise`) and the public
 * mock test, so a visitor's free-mock score and an enrolled student's score
 * on the same paper are computed identically. Pure: no reads, no writes; the
 * callers persist what this returns.
 *
 * A question counts as correct only when the selected set equals the key
 * exactly — for a multiple-answer question, a partial selection is wrong and
 * carries the negative mark, as in the real paper.
 */

export type ScorableQuestion = Pick<Question, "id" | "subject" | "marks" | "correctOptionIds">;

export interface ScorableAnswer {
  questionId: string;
  selectedOptionIds: string[];
}

export interface QuestionMark {
  attempted: boolean;
  isCorrect: boolean;
  marksAwarded: number;
}

export type PaperScore = Pick<
  ResultDoc,
  "score" | "correctCount" | "wrongCount" | "unattemptedCount" | "negativeMarks" | "subjectBreakdown"
> & {
  /** Per-question outcome, keyed by question id, for answers that matched a question. */
  marks: Map<string, QuestionMark>;
};

export function scoreMcqPaper(
  questions: ScorableQuestion[],
  answers: ScorableAnswer[],
  negativeMarksPerQuestion: number,
): PaperScore {
  const questionById = new Map(questions.map((question) => [question.id, question]));

  const bySubject = new Map<
    string,
    { score: number; totalMarks: number; correctCount: number; wrongCount: number }
  >();

  for (const question of questions) {
    const bucket =
      bySubject.get(question.subject) ??
      { score: 0, totalMarks: 0, correctCount: 0, wrongCount: 0 };
    bucket.totalMarks += question.marks;
    bySubject.set(question.subject, bucket);
  }

  const marks = new Map<string, QuestionMark>();
  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let negativeMarks = 0;

  for (const answer of answers) {
    const question = questionById.get(answer.questionId);
    if (!question) continue;

    const selected = [...answer.selectedOptionIds].sort();
    const correct = [...question.correctOptionIds].sort();

    const attempted = selected.length > 0;
    const isCorrect =
      attempted &&
      selected.length === correct.length &&
      selected.every((id, index) => id === correct[index]);

    let marksAwarded = 0;

    if (isCorrect) {
      marksAwarded = question.marks;
      correctCount += 1;
    } else if (attempted) {
      marksAwarded = -negativeMarksPerQuestion;
      negativeMarks += negativeMarksPerQuestion;
      wrongCount += 1;
    }

    score += marksAwarded;

    const bucket = bySubject.get(question.subject);
    if (bucket) {
      bucket.score += marksAwarded;
      if (isCorrect) bucket.correctCount += 1;
      else if (attempted) bucket.wrongCount += 1;
    }

    marks.set(question.id, { attempted, isCorrect, marksAwarded });
  }

  return {
    score: Number(score.toFixed(2)),
    correctCount,
    wrongCount,
    unattemptedCount: Math.max(questions.length - correctCount - wrongCount, 0),
    negativeMarks: Number(negativeMarks.toFixed(2)),
    subjectBreakdown: [...bySubject.entries()].map(([subject, bucket]) => ({
      subject,
      score: Number(bucket.score.toFixed(2)),
      totalMarks: bucket.totalMarks,
      correctCount: bucket.correctCount,
      wrongCount: bucket.wrongCount,
    })),
    marks,
  };
}
