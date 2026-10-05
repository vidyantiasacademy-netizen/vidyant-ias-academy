import type { Entity, Uid } from "./common";

/**
 * Student learning events. Nothing consumes these yet — the collection exists so
 * that when personalised study plans and weakness detection arrive, the history
 * is already there instead of starting from zero on launch day.
 *
 * Append-only and flat on purpose: one row per event is a clean BigQuery export
 * and a clean training set. Never aggregate into the student document.
 */
export const ACTIVITY_TYPES = [
  "videoStarted",
  "videoCompleted",
  "pdfOpened",
  "testStarted",
  "questionAnswered",
  "testCompleted",
  "doubtCreated",
  "studySession",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/** `activity/{activityId}` — one learning event. */
export interface ActivityDoc {
  studentUid: Uid;
  type: ActivityType;
  courseId: string | null;
  lessonId: string | null;
  testId: string | null;
  questionId: string | null;
  /** Watch time, read time or session length, depending on `type`. */
  durationSeconds: number | null;
  /** Type-specific payload. Keep it flat and primitive — it becomes columns. */
  meta: Record<string, string | number | boolean | null>;
}

export type Activity = Entity<ActivityDoc>;
