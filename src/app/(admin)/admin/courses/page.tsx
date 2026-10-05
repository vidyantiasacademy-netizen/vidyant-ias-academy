import type { Metadata } from "next";
import { GraduationCap, Plus } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { isAdmin } from "@/lib/auth/roles";
import { courseService } from "@/services/courses/course.service";

import { requireRolePage } from "../page-guards";

export const metadata: Metadata = {
  title: "Courses",
  robots: { index: false, follow: false },
};

export default async function CoursesPage() {
  const session = await requireRolePage("/admin/courses", "COUNSELLOR");
  const courses = await courseService.listForStaff();
  const canEdit = isAdmin(session.role);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 font-semibold">Courses</h1>
          <p className="mt-2 text-body text-ink-secondary">
            Open a course to enrol students in it. Tests are attached to a course, and only its
            enrolled students can sit them.
          </p>
        </div>
        {canEdit ? (
          <ButtonLink href="/admin/courses/new" size="sm">
            <Plus aria-hidden className="size-4" />
            New course
          </ButtonLink>
        ) : null}
      </div>

      <div className="mt-8">
        {courses.length === 0 ? (
          <EmptyState
            icon={<GraduationCap aria-hidden className="size-5" />}
            title="No courses yet"
            description={
              canEdit
                ? "Create the first course. Students are enrolled into a course, and tests belong to one."
                : "An admin needs to create a course before students can be enrolled."
            }
            action={
              canEdit ? <ButtonLink href="/admin/courses/new">Create a course</ButtonLink> : undefined
            }
          />
        ) : (
          <ul className="space-y-3">
            {courses.map((course) => (
              <li key={course.id}>
                <Link href={`/admin/courses/${course.id}`} className="block rounded-lg">
                  <Card
                    interactive
                    padding="sm"
                    className="flex flex-wrap items-center gap-x-6 gap-y-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-indigo">{course.title}</p>
                      <p className="mt-1 text-small text-ink-secondary">
                        {course.stats?.enrolledCount ?? 0} enrolled
                        {course.price
                          ? ` · ₹${(course.price.amountInPaise / 100).toLocaleString("en-IN")}`
                          : ""}
                      </p>
                    </div>
                    <Badge tone={course.status === "published" ? "success" : "neutral"}>
                      {course.status}
                    </Badge>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
