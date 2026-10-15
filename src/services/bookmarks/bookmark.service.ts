import "server-only";

import { requireAuth } from "@/lib/auth/server";
import { AppError, ERROR_CODES } from "@/lib/errors";
import { COLLECTIONS, docId } from "@/lib/firebase/collections";
import { auditOnCreate, collection, toEntities, toEntity } from "@/lib/firebase/firestore";
import type { Bookmark, BookmarkDoc, BookmarkKind } from "@/types/db";

import { courseService } from "../courses/course.service";
import { testService } from "../tests/test.service";

/**
 * Saved lessons, articles and reviewed questions.
 *
 * Saving is authorised against the thing being saved, not just the caller: a
 * lesson must be one the student may open, and a question must come from their
 * own attempt whose answers are already released. A bookmark is therefore never
 * a way to learn that something exists, or to reach it early.
 */

const MAX_BOOKMARKS = 500;

export interface AddBookmarkInput {
  kind: BookmarkKind;
  refId: string;
  title: string;
  subtitle?: string | null;
}

export async function listOwn(kind?: BookmarkKind): Promise<Bookmark[]> {
  const user = await requireAuth();

  let query = collection(COLLECTIONS.bookmarks).where("studentUid", "==", user.uid);
  if (kind) query = query.where("kind", "==", kind);

  const snapshot = await query.orderBy("createdAt", "desc").limit(MAX_BOOKMARKS).get();
  return toEntities<BookmarkDoc>(snapshot.docs) as Bookmark[];
}

export async function addOwn(input: AddBookmarkInput): Promise<Bookmark> {
  const user = await requireAuth();

  let courseId: string | null = null;
  let attemptId: string | null = null;
  let questionId: string | null = null;

  switch (input.kind) {
    case "lesson": {
      const lesson = await courseService.requireLessonAccess(input.refId);
      courseId = lesson.courseId;
      break;
    }
    case "question": {
      const [attempt, question] = input.refId.split("_");
      if (!attempt || !question) {
        throw new AppError(ERROR_CODES.VALIDATION_ERROR, { message: "Unknown question." });
      }
      // `getResult` refuses another student's attempt and an unreleased one.
      const result = await testService.getResult(attempt);
      if (!result) {
        throw new AppError(ERROR_CODES.FORBIDDEN, {
          message: "Questions can be saved once your result is out.",
        });
      }
      attemptId = attempt;
      questionId = question;
      break;
    }
    case "article":
      // Published editorial content from the public CMS: nothing to authorise.
      break;
  }

  const ref = collection(COLLECTIONS.bookmarks).doc(
    docId.bookmark(user.uid, input.kind, input.refId),
  );

  const doc: BookmarkDoc = {
    studentUid: user.uid,
    kind: input.kind,
    refId: input.refId,
    title: input.title,
    subtitle: input.subtitle ?? null,
    courseId,
    attemptId,
    questionId,
  };

  await ref.set({ ...doc, ...auditOnCreate(user.uid) });

  return toEntity<BookmarkDoc>(await ref.get()) as Bookmark;
}

export async function removeOwn(kind: BookmarkKind, refId: string): Promise<void> {
  const user = await requireAuth();

  // The id is derived from the session uid, so this can only ever address the
  // caller's own bookmark — there is no id in the request to swap.
  await collection(COLLECTIONS.bookmarks)
    .doc(docId.bookmark(user.uid, kind, refId))
    .delete();
}

export const bookmarkService = { listOwn, addOwn, removeOwn };
