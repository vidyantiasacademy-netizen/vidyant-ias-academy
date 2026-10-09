import type { Metadata } from "next";
import { Pencil } from "lucide-react";
import { notFound } from "next/navigation";

import { EnrolStudentPanel, EnrollmentStatusButton } from "@/components/admin/EnrolStudentPanel";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { isAdmin } from "@/lib/auth/roles";
import { courseService } from "@/services/courses/course.service";
import { enrollmentService } from "@/services/enrollments/enrollment.service";
import { studentService } from "@/services/students/student.service";

import { requireRolePage } from "../../page-guards";

export const metadata: Metadata = {
  title: "Course",
  robots: { index: false, follow: false },
};

const ROSTER_PAGE = 100;

function formatDate(value: string | null): string {
  if (!value) return "no end date";
  return new Date(`${value}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * One course: its record, the enrolment desk, and who is enrolled.
 */
export default async function CoursePage({ params }: PageProps<"/[lang]/admin/courses/[courseId]">) {
  const { courseId } = await params;
  const session = await requireRolePage(`/admin/courses/${courseId}`, "COUNSELLOR");

  const course = await courseService.getById(courseId);
  if (!course) notFound();

  const roster = await enrollmentService.listForCourse(courseId, { limit: ROSTER_PAGE });
  const students = await studentService.getMany(roster.items.map((item) => item.studentUid));
  const studentByUid = new Map(students.map((student) => [student.uid, student]));
  const admin = isAdmin(session.role);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-h2 font-semibold">{course.title}</h1>
            <Badge tone={course.status === "published" ? "success" : "neutral"}>
              {course.status}
            </Badge>
          </div>
          <p className="mt-2 text-body text-ink-secondary">
            {course.price
              ? `₹${(course.price.amountInPaise / 100).toLocaleString("en-IN")}`
              : "Fee on counselling"}
            {course.durationMonths ? ` · ${course.durationMonths} months` : ""}
            {` · ${course.stats?.enrolledCount ?? 0} enrolled`}
          </p>
        </div>

        {admin ? (
          <ButtonLink href={`/admin/courses/${course.id}/edit`} variant="secondary" size="sm">
            <Pencil aria-hidden className="size-4" />
            Edit course
          </ButtonLink>
        ) : null}
      </div>

      <div className="mt-8 max-w-4xl">
        <EnrolStudentPanel courseId={course.id} />
      </div>

      <section aria-labelledby="roster-heading" className="mt-10">
        <h2 id="roster-heading" className="text-h3 font-semibold">
          Enrolled students
        </h2>

        {roster.items.length === 0 ? (
          <p className="mt-4 text-body text-ink-secondary">Nobody is enrolled yet.</p>
        ) : (
          <Card padding="none" className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-small">
              <thead className="border-b border-line text-ink-secondary">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Student</th>
                  <th scope="col" className="px-5 py-3 font-medium">Contact</th>
                  <th scope="col" className="px-5 py-3 font-medium">Access</th>
                  <th scope="col" className="px-5 py-3 font-medium">Status</th>
                  {admin ? <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {roster.items.map((enrollment) => {
                  const student = studentByUid.get(enrollment.studentUid);
                  const name = student?.fullName ?? "Unknown student";

                  return (
                    <tr key={enrollment.id}>
                      <td className="px-5 py-3 font-medium">
                        {name}
                        {student?.rollNumber ? (
                          <span className="block font-normal text-ink-secondary">
                            {student.rollNumber}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 text-ink-secondary">
                        {[student?.email, student?.phone].filter(Boolean).join(" · ")}
                      </td>
                      <td className="px-5 py-3 text-ink-secondary">
                        {formatDate(enrollment.startsAt)} – {formatDate(enrollment.endsAt)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={enrollment.status === "active" ? "success" : "neutral"}>
                          {enrollment.status}
                        </Badge>
                      </td>
                      {admin ? (
                        <td className="px-5 py-3 text-right">
                          {enrollment.status === "active" || enrollment.status === "suspended" ? (
                            <EnrollmentStatusButton
                              courseId={course.id}
                              enrollmentId={enrollment.id}
                              status={enrollment.status}
                              name={name}
                            />
                          ) : null}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}

        {roster.nextCursor ? (
          <p className="mt-3 text-small text-ink-secondary">
            Showing the {ROSTER_PAGE} most recent enrollments.
          </p>
        ) : null}
      </section>
    </>
  );
}
