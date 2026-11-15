import type { Metadata } from "next";

import { MainsPaperForm } from "@/components/admin/answer-writing/MainsPaperForm";
import { mainsLockReason } from "@/lib/answer-writing/policy";
import { answerWritingService } from "@/services/answer-writing/answer-writing.service";
import { courseService } from "@/services/courses/course.service";

import { orNotFound, requireFacultyPage } from "../../shared";

export const metadata: Metadata = {
  title: "Paper settings",
  robots: { index: false, follow: false },
};

export default async function EditMainsPaperPage({
  params,
}: PageProps<"/[lang]/admin/answer-writing/[testId]/edit">) {
  const { testId } = await params;
  await requireFacultyPage(`/admin/answer-writing/${testId}/edit`);

  const [test, opened, courses] = await Promise.all([
    orNotFound(answerWritingService.getPaperForStaff(testId)),
    answerWritingService.hasSubmissions(testId),
    courseService.listForStaff(),
  ]);

  return (
    <>
      <h1 className="text-h2 font-bold">Paper settings</h1>
      <p className="mt-2 text-body text-ink-secondary">{test.title}</p>

      <div className="mt-8 max-w-4xl">
        <MainsPaperForm
          courses={courses.map(({ id, title, status }) => ({ id, title, status }))}
          test={test}
          lockReason={mainsLockReason(test, opened)}
        />
      </div>
    </>
  );
}
