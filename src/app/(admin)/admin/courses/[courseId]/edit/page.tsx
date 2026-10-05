import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseForm } from "@/components/admin/CourseForm";
import { courseService } from "@/services/courses/course.service";

import { requireRolePage } from "../../../page-guards";

export const metadata: Metadata = {
  title: "Edit course",
  robots: { index: false, follow: false },
};

export default async function EditCoursePage({
  params,
}: PageProps<"/admin/courses/[courseId]/edit">) {
  const { courseId } = await params;
  await requireRolePage(`/admin/courses/${courseId}/edit`, "ADMIN");

  const course = await courseService.getById(courseId);
  if (!course) notFound();

  return (
    <>
      <h1 className="text-h2 font-semibold">Edit course</h1>
      <p className="mt-2 text-body text-ink-secondary">{course.title}</p>

      <div className="mt-8 max-w-4xl">
        <CourseForm course={course} />
      </div>
    </>
  );
}
