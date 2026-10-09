import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TestForm } from "@/components/admin/TestForm";
import { courseService } from "@/services/courses/course.service";

import { requireFacultyPage } from "../shared";

export const metadata: Metadata = {
  title: "New paper",
  robots: { index: false, follow: false },
};

export default async function NewTestPage() {
  await requireFacultyPage("/admin/tests/new");

  const courses = await courseService.listForStaff();
  // The index explains why there is nothing to pick; this form cannot.
  if (courses.length === 0) redirect("/admin/tests");

  return (
    <>
      <h1 className="text-h2 font-semibold">New paper</h1>
      <p className="mt-2 text-body text-ink-secondary">
        Set the paper up first. You add its questions on the next screen.
      </p>

      <div className="mt-8 max-w-4xl">
        <TestForm
          courses={courses.map(({ id, title, status }) => ({ id, title, status }))}
        />
      </div>
    </>
  );
}
