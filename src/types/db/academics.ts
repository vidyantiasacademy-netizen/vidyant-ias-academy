import type { Entity, IsoDate, Money, PublishStatus, Uid } from "./common";

export type CourseCategory =
  | "foundation"
  | "prelims"
  | "mains"
  | "optional"
  | "test-series";

export type DeliveryMode = "offline" | "online-live" | "recorded" | "hybrid";

/**
 * `courses/{courseId}` — the sellable programme.
 *
 * Marketing copy (curriculum prose, brochure sections, imagery) belongs in
 * Sanity; `sanitySlug` joins the two. This document holds only what the
 * application has to reason about: price, access, and what a student is owed.
 */
export interface CourseDoc {
  slug: string;
  title: string;
  category: CourseCategory;
  modes: DeliveryMode[];
  /** Null when the fee is quoted on a counselling call. */
  price: Money | null;
  durationMonths: number | null;
  status: PublishStatus;
  sanitySlug: string | null;
  /** Faculty uids permitted to manage this course's lessons and tests. */
  facultyUids: Uid[];
  /** Denormalised counters, maintained by Cloud Functions, never by clients. */
  stats: {
    lessonCount: number;
    testCount: number;
    enrolledCount: number;
  };
}

export type Course = Entity<CourseDoc>;

export type BatchStatus = "upcoming" | "running" | "completed" | "cancelled";

/** `batches/{batchId}` — a dated cohort of one course. */
export interface BatchDoc {
  courseId: string;
  name: string;
  startDate: IsoDate;
  endDate: IsoDate | null;
  mode: DeliveryMode;
  /** Free text, e.g. "Mon–Sat, 7:00–10:00 am". Timetables are per-lesson. */
  timing: string | null;
  centre: string | null;
  seatLimit: number | null;
  seatsFilled: number;
  status: BatchStatus;
}

export type Batch = Entity<BatchDoc>;

export type EnrollmentStatus =
  | "pending"
  | "active"
  | "suspended"
  | "completed"
  | "cancelled";

/**
 * `enrollments/{enrollmentId}` — the grant of access. The single document the
 * Security Rules consult to answer "may this student read this lesson?".
 *
 * `status` is server-written only. A student who could flip `pending` → `active`
 * would have a free course, so the rules forbid students writing this collection
 * at all; `enrollmentService` and the Razorpay webhook own every transition.
 */
export interface EnrollmentDoc {
  studentUid: Uid;
  courseId: string;
  batchId: string | null;
  status: EnrollmentStatus;
  /** Access window. `null` end date means for as long as the status is active. */
  startsAt: IsoDate;
  endsAt: IsoDate | null;
  /** Payment that unlocked this enrollment, if it was paid online. */
  paymentId: string | null;
  /** Set when an admin enrolled offline (cash, cheque, scholarship). */
  enrolledOfflineBy: Uid | null;
}

export type Enrollment = Entity<EnrollmentDoc>;

export type LessonKind = "video" | "live" | "document" | "quiz";

/**
 * `lessons/{lessonId}` — one unit of teaching content.
 *
 * Nothing here is a playable URL: `muxAssetId` / `storagePath` are references
 * that only the server may exchange for a signed playback token or download URL.
 * A student who reads this document still cannot fetch the media.
 */
export interface LessonDoc {
  courseId: string;
  /** Null for lessons shared by every batch of the course. */
  batchId: string | null;
  title: string;
  description: string | null;
  kind: LessonKind;
  /** Position within the course. Sparse integers so inserts need no rewrite. */
  order: number;
  durationSeconds: number | null;
  /** Mux asset, resolved to a signed playback id by `video.service.ts`. */
  muxAssetId: string | null;
  /** Cloudinary media reference for the lesson's PDF/handout. */
  storagePath: string | null;
  /** Visible to enrolled students before purchase — demo and preview lessons. */
  isFreePreview: boolean;
  status: PublishStatus;
  publishedAt: IsoDate | null;
}

export type Lesson = Entity<LessonDoc>;
