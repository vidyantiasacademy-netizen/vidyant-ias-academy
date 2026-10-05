import type { Metadata } from "next";

import { TestForm } from "@/components/admin/TestForm";
import { courseService } from "@/services/courses/course.service";
import { testService } from "@/services/tests/test.service";

import { orNotFound, paperLockReason, requireFacultyPage } from "../../shared";

export const metadata: Metadata = {
  title: "Paper settings",
  robots: { index: false, follow: false },
};

export default async function TestSettingsPage({
  params,
}: PageProps<"/admin/tests/[testId]/settings">) {
  const { testId } = await params;
  await requireFacultyPage(`/admin/tests/${testId}/settings`);

  const [test, courses, sat] = await Promise.all([
    orNotFound(testService.getTest(testId)),
    courseService.listForStaff(),
    testService.hasAttempts(testId),
  ]);

  return (
    <>
      <h1 className="text-h2 font-semibold">Paper settings</h1>
      <p className="mt-2 text-body text-ink-secondary">{test.title}</p>

      <div className="mt-8 max-w-4xl">
        <TestForm
          test={test}
          courses={courses.map(({ id, title, status }) => ({ id, title, status }))}
          lockReason={paperLockReason(test, sat)}
        />
      </div>
    </>
  );
}
