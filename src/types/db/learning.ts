import type { LessonKind } from "./academics";
import type { Entity, IsoDateTime, Uid } from "./common";

/**
 * `lessonProgress/{studentUid_lessonId}` — where a student is in one lesson.
 *
 * The resume position for a recording and the completion flag for every kind.
 * Kept out of `activity` on purpose: activity is an append-only event log, and
 * "where did I stop" is a single mutable value that a resume beat overwrites
 * every few seconds — one row per beat would be a write-cost leak.
 *
 * Server-written only, after the lesson access check. Nothing here confers
 * access or a grade, but a client-writable progress record would let one
 * student write into another's history.
 */
export interface LessonProgressDoc {
  studentUid: Uid;
  lessonId: string;
  courseId: string;
  kind: LessonKind;
  /** Last reported playback position. Zero for documents. */
  positionSeconds: number;
  /** Media duration as the player reported it, when known. */
  durationSeconds: number | null;
  /** 0–100, derived server-side from the two values above. */
  percent: number;
  /** Sticky: re-watching a finished lesson never un-completes it. */
  completed: boolean;
  completedAt: IsoDateTime | null;
  lastViewedAt: IsoDateTime;
}

export type LessonProgress = Entity<LessonProgressDoc>;

export const BOOKMARK_KINDS = ["lesson", "article", "question"] as const;

export type BookmarkKind = (typeof BOOKMARK_KINDS)[number];

/**
 * `bookmarks/{studentUid_kind_refId}` — something a student saved to revisit.
 *
 * `title` / `subtitle` are a snapshot so the saved list renders in one query;
 * opening a bookmark always goes back to the source, which re-checks access.
 * A `question` bookmark points at a reviewed attempt, never at the question
 * bank, so saving one cannot be used to reach an answer key early.
 */
export interface BookmarkDoc {
  studentUid: Uid;
  kind: BookmarkKind;
  /** Lesson id, current-affairs slug, or `{attemptId}_{questionId}`. */
  refId: string;
  title: string;
  subtitle: string | null;
  courseId: string | null;
  attemptId: string | null;
  questionId: string | null;
}

export type Bookmark = Entity<BookmarkDoc>;

export type PushPlatform = "ios" | "android";

/**
 * `pushDevices/{userUid_installationId}` — one app installation that can
 * receive push notifications.
 *
 * Not on `users/{uid}`: a student with a phone and a tablet has two tokens,
 * tokens rotate, and an array on the user document would grow without bound
 * as old installations are abandoned. Server-only — a token is a delivery
 * address, and nobody but the sender needs to read it.
 */
export interface PushDeviceDoc {
  userUid: Uid;
  installationId: string;
  platform: PushPlatform;
  /** Expo push token (`ExponentPushToken[...]`). */
  token: string;
  appVersion: string | null;
  lastSeenAt: IsoDateTime;
}

export type PushDevice = Entity<PushDeviceDoc>;
