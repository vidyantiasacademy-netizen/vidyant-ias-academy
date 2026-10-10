import type { Result, Test, TestKind } from "@/types/db";

/**
 * A student's performance, folded out of their published scorecards.
 *
 * Pure on purpose: everything here is arithmetic over `results` the server has
 * already agreed to show, so it can be unit-tested without Firestore and can
 * never widen what a student sees. Unreleased results must be filtered out by
 * the caller — this file trusts that every input is one the student may read.
 */

/** One scored sitting, joined to the paper it was for. */
export interface ScoredPaper {
  result: Result;
  /** `null` when the paper has since been deleted or unpublished. */
  test: Test | null;
}

export interface TrendPoint {
  attemptId: string;
  testId: string;
  title: string;
  kind: TestKind | null;
  date: string;
  score: number;
  totalMarks: number;
  /** Score as a share of the paper, 0–100. Negative marking can push it below 0. */
  percent: number;
  accuracy: number | null;
  rank: number | null;
  percentile: number | null;
}

export interface SubjectStat {
  subject: string;
  score: number;
  totalMarks: number;
  percent: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number | null;
  papers: number;
}

export interface PerformanceSummary {
  papers: number;
  averagePercent: number | null;
  bestPercent: number | null;
  /** Mean of the last three papers minus the mean of the three before them. */
  recentChange: number | null;
  accuracy: number | null;
  averagePercentile: number | null;
  bestRank: number | null;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  negativeMarks: number;
  /** Oldest first, for plotting. */
  trend: TrendPoint[];
  /** Weakest first. */
  subjects: SubjectStat[];
}

/** Below this share of marks a subject is called out as needing work. */
export const WEAK_SUBJECT_PERCENT = 40;

function round(value: number, places = 1): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function mean(values: number[]): number | null {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function accuracyOf(correct: number, wrong: number): number | null {
  const attempted = correct + wrong;
  return attempted ? round((correct / attempted) * 100) : null;
}

export function summarisePerformance(papers: ScoredPaper[]): PerformanceSummary {
  const trend: TrendPoint[] = papers
    .filter(({ result }) => result.totalMarks > 0)
    .map(({ result, test }) => ({
      attemptId: result.attemptId,
      testId: result.testId,
      title: test?.title ?? "Paper no longer available",
      kind: test?.kind ?? null,
      date: test?.opensAt ?? result.createdAt,
      score: result.score,
      totalMarks: result.totalMarks,
      percent: round((result.score / result.totalMarks) * 100),
      accuracy: accuracyOf(result.correctCount, result.wrongCount),
      rank: result.rank,
      percentile: result.percentile,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const percents = trend.map((point) => point.percent);
  const lastThree = mean(percents.slice(-3));
  const priorThree = mean(percents.slice(-6, -3));

  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;
  let negativeMarks = 0;

  const bySubject = new Map<string, Omit<SubjectStat, "percent" | "accuracy">>();

  for (const { result } of papers) {
    correctCount += result.correctCount;
    wrongCount += result.wrongCount;
    unattemptedCount += result.unattemptedCount;
    negativeMarks += result.negativeMarks;

    for (const row of result.subjectBreakdown) {
      const bucket = bySubject.get(row.subject) ?? {
        subject: row.subject,
        score: 0,
        totalMarks: 0,
        correctCount: 0,
        wrongCount: 0,
        papers: 0,
      };

      bucket.score += row.score;
      bucket.totalMarks += row.totalMarks;
      bucket.correctCount += row.correctCount;
      bucket.wrongCount += row.wrongCount;
      bucket.papers += 1;
      bySubject.set(row.subject, bucket);
    }
  }

  const subjects: SubjectStat[] = [...bySubject.values()]
    .filter((bucket) => bucket.totalMarks > 0)
    .map((bucket) => ({
      ...bucket,
      score: round(bucket.score, 2),
      percent: round((bucket.score / bucket.totalMarks) * 100),
      accuracy: accuracyOf(bucket.correctCount, bucket.wrongCount),
    }))
    .sort((a, b) => a.percent - b.percent || a.subject.localeCompare(b.subject));

  const percentiles = trend
    .map((point) => point.percentile)
    .filter((value): value is number => value !== null);
  const ranks = trend
    .map((point) => point.rank)
    .filter((value): value is number => value !== null);

  const average = mean(percents);
  const averagePercentile = mean(percentiles);

  return {
    papers: trend.length,
    averagePercent: average === null ? null : round(average),
    bestPercent: percents.length ? Math.max(...percents) : null,
    recentChange:
      lastThree !== null && priorThree !== null ? round(lastThree - priorThree) : null,
    accuracy: accuracyOf(correctCount, wrongCount),
    averagePercentile: averagePercentile === null ? null : round(averagePercentile),
    bestRank: ranks.length ? Math.min(...ranks) : null,
    correctCount,
    wrongCount,
    unattemptedCount,
    negativeMarks: round(negativeMarks, 2),
    trend,
    subjects,
  };
}
