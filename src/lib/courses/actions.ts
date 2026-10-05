"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { action, roleGuard } from "@/lib/auth/guards";
import { AppError, ERROR_CODES } from "@/lib/errors";
import { courseSchema } from "@/lib/validation/entities";
import { courseService } from "@/services/courses/course.service";
import { enrollmentService } from "@/services/enrollments/enrollment.service";
import { studentService } from "@/services/students/student.service";

/**
 * The course and enrolment screens' server surface.
 *
 * Courses are admin-only, mirroring `courseService.create`. Enrolling is
 * counsellor and above, because the front desk is where fees are paid; changing
 * an enrollment's status afterwards is admin-only, mirroring
 * `enrollmentService.setStatus`.
 */

const id = z.string().min(1).max(128);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD.");

/** Faculty assignment has no screen yet, so the form never sends it. */
const courseFieldsSchema = courseSchema.omit({ facultyUids: true });

async function assertSlugFree(slug: string, exceptCourseId?: string) {
  if (await courseService.isSlugTaken(slug, exceptCourseId)) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
      fieldErrors: { slug: ["Another course already uses this slug."] },
    });
  }
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export const createCourseAction = action(
  roleGuard("ADMIN"),
  courseFieldsSchema,
  async (input) => {
    await assertSlugFree(input.slug);

    const course = await courseService.create({
      ...input,
      facultyUids: [],
      stats: { lessonCount: 0, testCount: 0, enrolledCount: 0 },
    });

    revalidatePath("/admin/courses");
    return { id: course.id };
  },
);

export const updateCourseAction = action(
  roleGuard("ADMIN"),
  z.object({ courseId: id, fields: courseFieldsSchema }),
  async ({ courseId, fields }) => {
    await assertSlugFree(fields.slug, courseId);
    await courseService.update(courseId, fields);

    revalidatePath("/admin/courses", "layout");
    return { id: courseId };
  },
);

// ─── Enrolment ───────────────────────────────────────────────────────────────

export interface StudentMatch {
  uid: string;
  fullName: string;
  email: string | null;
  phone: string;
  rollNumber: string | null;
  /** Current enrollment status in this course, if there is one. */
  enrollmentStatus: string | null;
}

export const findStudentAction = action(
  roleGuard("COUNSELLOR"),
  z.object({ courseId: id, query: z.string().trim().min(3).max(120) }),
  async ({ courseId, query }): Promise<StudentMatch[]> => {
    const students = await studentService.findByContact(query);
    const enrolled = await Promise.all(
      students.map((student) => enrollmentService.getForStudentInCourse(student.uid, courseId)),
    );

    // Only what the desk needs to recognise the right person.
    return students.map((student, index) => ({
      uid: student.uid,
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
      rollNumber: student.rollNumber,
      enrollmentStatus: enrolled[index]?.status ?? null,
    }));
  },
);

export const enrolStudentAction = action(
  roleGuard("COUNSELLOR"),
  z
    .object({
      courseId: id,
      studentUid: id,
      startsAt: isoDate,
      endsAt: isoDate.nullable(),
    })
    .refine((data) => !data.endsAt || data.endsAt >= data.startsAt, {
      message: "Access cannot end before it starts.",
      path: ["endsAt"],
    }),
  async ({ courseId, studentUid, startsAt, endsAt }) => {
    // Re-checked rather than trusted from the search result: the uid is a
    // claim from the browser, and an enrollment under an id no sign-in owns
    // would grant access to nobody.
    const [course, [student]] = await Promise.all([
      courseService.getById(courseId),
      studentService.getMany([studentUid]),
    ]);

    if (!course || !student) throw new AppError(ERROR_CODES.NOT_FOUND);

    await enrollmentService.enrollOffline({ studentUid, courseId, startsAt, endsAt });

    revalidatePath(`/admin/courses/${courseId}`);
    return { studentUid };
  },
);

export const setEnrollmentStatusAction = action(
  roleGuard("ADMIN"),
  z.object({
    courseId: id,
    enrollmentId: id,
    status: z.enum(["active", "suspended", "cancelled"]),
  }),
  async ({ courseId, enrollmentId, status }) => {
    await enrollmentService.setStatus(enrollmentId, status);

    revalidatePath(`/admin/courses/${courseId}`);
    return { status };
  },
);
