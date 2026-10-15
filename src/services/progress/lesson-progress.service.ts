import "server-only";

import { requireAuth } from "@/lib/auth/server";
import { COLLECTIONS, docId } from "@/lib/firebase/collections";
import {
  auditOnCreate,
  auditOnUpdate,
  collection,
  requireEntity,
  toEntities,
  toEntity,
} from "@/lib/firebase/firestore";
import type { LessonProgress, LessonProgressDoc } from "@/types/db";

import { activityService } from "../activity/activity.service";
import { courseService } from "../courses/course.service";

/**
 * Lesson progress — resume positions and completion.
 *
 * Every write goes through `requireLessonAccess` first, so a student can only
 * record progress on a lesson they may open; the uid always comes from the
 * session, never from the request. Completion is sticky and is logged once to
 * `activity`, which is where the analytics phase reads it from.
 */

/** Watching this share of a recording counts as finishing it. */
export const COMPLETION_PERCENT = 95;

export interface SaveProgressInput {
  positionSeconds: number;
  durationSeconds?: number | null;
  /** Explicit "mark as done" — documents and live classes have no position. */
  completed?: boolean;
}

function percentOf(positionSeconds: number, durationSeconds: number | null): number {
  if (!durationSeconds || durationSeconds <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((positionSeconds / durationSeconds) * 100)));
}

export async function saveOwn(
  lessonId: string,
  input: SaveProgressInput,
): Promise<LessonProgress> {
  const user = await requireAuth();
  const lesson = await courseService.requireLessonAccess(lessonId);

  const ref = collection(COLLECTIONS.lessonProgress).doc(
    docId.lessonProgress(user.uid, lessonId),
  );
  const existing = toEntity<LessonProgressDoc>(await ref.get());

  // The lesson's own duration wins over the player's when the faculty set one:
  // a player that reports 0 before metadata loads must not reset the percent.
  const durationSeconds =
    lesson.durationSeconds ?? input.durationSeconds ?? existing?.durationSeconds ?? null;
  const positionSeconds = Math.max(0, Math.floor(input.positionSeconds));
  const percent = percentOf(positionSeconds, durationSeconds);

  const nowIso = new Date().toISOString();
  const reachedEnd = input.completed === true || percent >= COMPLETION_PERCENT;
  const completed = existing?.completed === true || reachedEnd;
  const newlyCompleted = completed && existing?.completed !== true;

  const doc: LessonProgressDoc = {
    studentUid: user.uid,
    lessonId,
    courseId: lesson.courseId,
    kind: lesson.kind,
    positionSeconds,
    durationSeconds,
    percent: completed ? Math.max(percent, existing?.percent ?? 0) : percent,
    completed,
    completedAt: existing?.completedAt ?? (newlyCompleted ? nowIso : null),
    lastViewedAt: nowIso,
  };

  await ref.set(
    { ...doc, ...(existing ? auditOnUpdate(user.uid) : auditOnCreate(user.uid)) },
    { merge: true },
  );

  if (newlyCompleted) {
    await activityService.record({
      studentUid: user.uid,
      type: lesson.kind === "document" ? "pdfOpened" : "videoCompleted",
      lessonId,
      courseId: lesson.courseId,
      durationSeconds: lesson.kind === "document" ? null : positionSeconds,
    });
  }

  return requireEntity<LessonProgress>(await ref.get(), "lesson progress");
}

/** The caller's progress across one course — two equality filters, no composite index. */
export async function listOwnForCourse(courseId: string): Promise<LessonProgress[]> {
  const user = await requireAuth();

  const snapshot = await collection(COLLECTIONS.lessonProgress)
    .where("studentUid", "==", user.uid)
    .where("courseId", "==", courseId)
    .get();

  return toEntities<LessonProgressDoc>(snapshot.docs) as LessonProgress[];
}

/** Most recently opened lessons first — the "continue learning" rail. */
export async function listOwnRecent(limit = 10): Promise<LessonProgress[]> {
  const user = await requireAuth();

  const snapshot = await collection(COLLECTIONS.lessonProgress)
    .where("studentUid", "==", user.uid)
    .orderBy("lastViewedAt", "desc")
    .limit(Math.min(Math.max(limit, 1), 50))
    .get();

  return toEntities<LessonProgressDoc>(snapshot.docs) as LessonProgress[];
}

export async function getOwn(lessonId: string): Promise<LessonProgress | null> {
  const user = await requireAuth();

  return toEntity<LessonProgressDoc>(
    await collection(COLLECTIONS.lessonProgress)
      .doc(docId.lessonProgress(user.uid, lessonId))
      .get(),
  ) as LessonProgress | null;
}

export const lessonProgressService = { saveOwn, listOwnForCourse, listOwnRecent, getOwn };
