import "server-only";

import { requireAuth, requireSelfOrRole } from "@/lib/auth/server";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { auditOnCreate, collection, paginate } from "@/lib/firebase/firestore";
import type { Activity, ActivityDoc, ActivityType, Page, PageRequest } from "@/types/db";

/**
 * Learning-activity log.
 *
 * Write-only from the application's point of view: nothing in the product reads
 * it yet. It exists now so that the AI and analytics phases start with a year of
 * history instead of an empty table — "when did this student stop watching",
 * "which subject do they avoid", "how long before a test do they revise" are all
 * answerable from these rows and from nothing else we store.
 *
 * Deliberately append-only and flat: one row per event exports to BigQuery as
 * one row, and never grows a student document.
 */

export interface RecordInput {
  studentUid: string;
  type: ActivityType;
  courseId?: string | null;
  lessonId?: string | null;
  testId?: string | null;
  questionId?: string | null;
  durationSeconds?: number | null;
  meta?: ActivityDoc["meta"];
}

/**
 * Records one event. Never throws into the caller: a dropped analytics row must
 * not fail a test submission or a video play.
 */
export async function record(input: RecordInput): Promise<void> {
  try {
    const doc: ActivityDoc = {
      studentUid: input.studentUid,
      type: input.type,
      courseId: input.courseId ?? null,
      lessonId: input.lessonId ?? null,
      testId: input.testId ?? null,
      questionId: input.questionId ?? null,
      durationSeconds: input.durationSeconds ?? null,
      meta: input.meta ?? {},
    };

    await collection(COLLECTIONS.activity)
      .doc()
      .set({ ...doc, ...auditOnCreate(input.studentUid) });
  } catch (error) {
    console.error("[activity] dropped", input.type, error);
  }
}

/** Records an event for the caller. The entry point for client-side events. */
export async function recordOwn(
  input: Omit<RecordInput, "studentUid">,
): Promise<void> {
  const user = await requireAuth();
  await record({ ...input, studentUid: user.uid });
}

export async function listForStudent(
  studentUid: string,
  page: PageRequest = {},
): Promise<Page<Activity>> {
  await requireSelfOrRole(studentUid, "MENTOR");

  const query = collection(COLLECTIONS.activity)
    .where("studentUid", "==", studentUid)
    .orderBy("createdAt", "desc");

  return paginate<ActivityDoc>(query, page) as Promise<Page<Activity>>;
}

export const activityService = { record, recordOwn, listForStudent };
