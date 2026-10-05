import "server-only";

import { isAtLeast } from "@/lib/auth/roles";
import { getCurrentUser, requireAuth, requireRole } from "@/lib/auth/server";
import { AppError, ERROR_CODES } from "@/lib/errors";
import { COLLECTIONS } from "@/lib/firebase/collections";
import {
  auditOnCreate,
  auditOnUpdate,
  collection,
  requireEntity,
  toEntities,
  toEntity,
} from "@/lib/firebase/firestore";
import type {
  Course,
  CourseCategory,
  CourseDoc,
  Enrollment,
  Lesson,
  LessonDoc,
} from "@/types/db";

import { enrollmentService } from "../enrollments/enrollment.service";

/**
 * Courses, batches and lessons.
 *
 * The public course pages do not use this service — they render from
 * `src/data/courses.ts` today and from Sanity once content moves there. This is
 * the enrolled-student and admin view: what a learner may actually open.
 */

export async function getById(courseId: string): Promise<Course | null> {
  const snapshot = await collection(COLLECTIONS.courses).doc(courseId).get();
  const course = toEntity<Course>(snapshot);

  // Drafts exist so staff can prepare a programme before it is announced.
  if (course && course.status !== "published") {
    const user = await getCurrentUser();
    if (!user || !isAtLeast(user.role, "FACULTY")) return null;
  }

  return course;
}

export async function getBySlug(slug: string): Promise<Course | null> {
  const snapshot = await collection(COLLECTIONS.courses)
    .where("slug", "==", slug)
    .where("status", "==", "published")
    .limit(1)
    .get();

  return snapshot.empty ? null : toEntity<Course>(snapshot.docs[0]);
}

export async function listPublished(category?: CourseCategory): Promise<Course[]> {
  let query = collection(COLLECTIONS.courses).where("status", "==", "published");

  if (category) query = query.where("category", "==", category);

  const snapshot = await query.orderBy("title").get();
  return toEntities<CourseDoc>(snapshot.docs) as Course[];
}

/** The caller's own courses, resolved through their active enrollments. */
export async function getEnrolledCourses(): Promise<
  { course: Course; enrollment: Enrollment }[]
> {
  const user = await requireAuth();
  const enrollments = await enrollmentService.listForStudent(user.uid);
  const active = enrollments.filter((item) => item.status === "active");

  if (active.length === 0) return [];

  // `getAll` is one round trip for up to 500 ids, where N `get()` calls would
  // be N. Enrollment counts per student are small, but the admin views reuse it.
  const refs = active.map((item) => collection(COLLECTIONS.courses).doc(item.courseId));
  const snapshots = await collection(COLLECTIONS.courses).firestore.getAll(...refs);

  return snapshots
    .map((snapshot, index) => {
      const course = toEntity<Course>(snapshot);
      return course ? { course, enrollment: active[index] } : null;
    })
    .filter((pair): pair is { course: Course; enrollment: Enrollment } => pair !== null);
}

/**
 * Lessons a caller may open.
 *
 * Free-preview lessons are returned to anyone; everything else requires an
 * active enrollment. Note what is *not* returned: `muxAssetId` and
 * `storagePath` stay server-side, and the media itself is only reachable
 * through `videoService` / `storageService`, which re-check access.
 */
export async function getLessons(courseId: string): Promise<Lesson[]> {
  const user = await getCurrentUser();

  const staff = user ? isAtLeast(user.role, "FACULTY") : false;
  const enrolled = user ? await enrollmentService.hasAccess(user.uid, courseId) : false;

  let query = collection(COLLECTIONS.lessons).where("courseId", "==", courseId);

  if (!staff) {
    query = query.where("status", "==", "published");
    if (!enrolled) query = query.where("isFreePreview", "==", true);
  }

  const snapshot = await query.orderBy("order").get();
  return toEntities<LessonDoc>(snapshot.docs) as Lesson[];
}

/** One lesson, with the access check. Throws rather than returning null. */
export async function requireLessonAccess(lessonId: string): Promise<Lesson> {
  const lesson = requireEntity<Lesson>(
    await collection(COLLECTIONS.lessons).doc(lessonId).get(),
    "lesson",
  );

  const user = await getCurrentUser();

  if (user && isAtLeast(user.role, "FACULTY")) return lesson;
  if (lesson.status !== "published") throw new AppError(ERROR_CODES.NOT_FOUND);
  if (lesson.isFreePreview) return lesson;

  if (!user) throw new AppError(ERROR_CODES.AUTH_REQUIRED);

  if (!(await enrollmentService.hasAccess(user.uid, lesson.courseId))) {
    throw new AppError(ERROR_CODES.FORBIDDEN, {
      message: "This lesson is part of a course you are not enrolled in.",
    });
  }

  return lesson;
}

export async function create(input: CourseDoc): Promise<Course> {
  const actor = await requireRole("ADMIN");

  const ref = collection(COLLECTIONS.courses).doc();
  await ref.set({ ...input, ...auditOnCreate(actor.uid) });

  return requireEntity<Course>(await ref.get(), "course");
}

export async function update(
  courseId: string,
  patch: Partial<CourseDoc>,
): Promise<void> {
  const actor = await requireRole("ADMIN");

  await collection(COLLECTIONS.courses)
    .doc(courseId)
    .update({ ...patch, ...auditOnUpdate(actor.uid) });
}

/**
 * Every course, drafts included, for staff pickers such as the test authoring
 * form and the enrolment desk. A paper is often written, and a student often
 * enrolled, before the programme is announced. Counsellor and above: the front
 * desk enrols students, and nothing here is more than a public course card.
 */
export async function listForStaff(): Promise<Course[]> {
  await requireRole("COUNSELLOR");

  const snapshot = await collection(COLLECTIONS.courses).orderBy("title").get();
  return toEntities<CourseDoc>(snapshot.docs) as Course[];
}

/** Whether a slug is taken by any course other than `exceptCourseId`. */
export async function isSlugTaken(slug: string, exceptCourseId?: string): Promise<boolean> {
  await requireRole("ADMIN");

  const snapshot = await collection(COLLECTIONS.courses)
    .where("slug", "==", slug)
    .limit(2)
    .get();

  return snapshot.docs.some((doc) => doc.id !== exceptCourseId);
}

export const courseService = {
  getById,
  getBySlug,
  listPublished,
  listForStaff,
  isSlugTaken,
  getEnrolledCourses,
  getLessons,
  requireLessonAccess,
  create,
  update,
};
