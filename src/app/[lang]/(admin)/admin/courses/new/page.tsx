import type { Metadata } from "next";

import { CourseForm } from "@/components/admin/CourseForm";

import { requireRolePage } from "../../page-guards";

export const metadata: Metadata = {
  title: "New course",
  robots: { index: false, follow: false },
};

export default async function NewCoursePage() {
  await requireRolePage("/admin/courses/new", "ADMIN");

  return (
    <>
      <h1 className="text-h2 font-bold">New course</h1>
      <p className="mt-2 text-body text-ink-secondary">
        The record students are enrolled into and tests are attached to. The public course page
        is written separately, in Sanity Studio.
      </p>

      <div className="mt-8 max-w-4xl">
        <CourseForm />
      </div>
    </>
  );
}
