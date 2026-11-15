import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MainsPaperForm } from "@/components/admin/answer-writing/MainsPaperForm";
import { courseService } from "@/services/courses/course.service";

import { requireFacultyPage } from "../shared";

export const metadata: Metadata = {
  title: "New answer-writing paper",
  robots: { index: false, follow: false },
};

export default async function NewMainsPaperPage() {
  await requireFacultyPage("/admin/answer-writing/new");

  const courses = await courseService.listForStaff();
  // The index explains why there is nothing to pick; this form cannot.
  if (courses.length === 0) redirect("/admin/answer-writing");

  return (
    <>
      <h1 className="text-h2 font-bold">New answer-writing paper</h1>
      <p className="mt-2 text-body text-ink-secondary">
        Set the paper up and its marking scheme. You upload the question paper PDF on the next screen.
      </p>

      <div className="mt-8 max-w-4xl">
        <MainsPaperForm courses={courses.map(({ id, title, status }) => ({ id, title, status }))} />
      </div>
    </>
  );
}
