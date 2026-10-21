import type { Metadata } from "next";
import { ClipboardList, Plus } from "lucide-react";

import Link from "@/i18n/Link";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatIst } from "@/lib/exam/ist";
import { courseService } from "@/services/courses/course.service";
import { testService } from "@/services/tests/test.service";

import { KIND_LABELS, STATUS_TONE, requireFacultyPage } from "./shared";

export const metadata: Metadata = {
  title: "Tests",
  robots: { index: false, follow: false },
};

export default async function TestsPage() {
  await requireFacultyPage("/admin/tests");

  const [allTests, courses] = await Promise.all([
    testService.listForStaff(),
    courseService.listForStaff(),
  ]);

  // Mains papers are written offline and evaluated; they live under Answer Writing.
  const tests = allTests.filter((test) => test.kind !== "mains-descriptive");

  const courseTitle = new Map(courses.map((course) => [course.id, course.title]));

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 font-bold">Tests</h1>
          <p className="mt-2 text-body text-ink-secondary">
            MCQ papers for the online exam runner. A paper is a draft until you publish it.
            Descriptive Mains papers are under{" "}
            <Link href="/admin/answer-writing" className="font-semibold text-indigo underline">
              Answer Writing
            </Link>
            .
          </p>
        </div>
        {courses.length > 0 ? (
          <ButtonLink href="/admin/tests/new" size="sm">
            <Plus aria-hidden className="size-4" />
            New paper
          </ButtonLink>
        ) : null}
      </div>

      <div className="mt-8">
        {courses.length === 0 ? (
          <EmptyState
            icon={<ClipboardList aria-hidden className="size-5" />}
            title="No courses yet"
            description="Every paper belongs to a course, and only students enrolled in that course can sit it. Create a course first, then come back here."
            action={<ButtonLink href="/admin/courses">Go to courses</ButtonLink>}
          />
        ) : tests.length === 0 ? (
          <EmptyState
            icon={<ClipboardList aria-hidden className="size-5" />}
            title="No papers yet"
            description="Create a paper, add its questions, then publish it to the students of its course."
            action={<ButtonLink href="/admin/tests/new">Create the first paper</ButtonLink>}
          />
        ) : (
          <ul className="space-y-3">
            {tests.map((test) => (
              <li key={test.id}>
                <Link href={`/admin/tests/${test.id}`} className="block">
                  <Card
                    interactive
                    padding="sm"
                    className="flex flex-wrap items-center gap-x-6 gap-y-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-indigo">{test.title}</p>
                      <p className="mt-1 text-small text-ink-secondary">
                        {courseTitle.get(test.courseId) ?? "Unknown course"} ·{" "}
                        {KIND_LABELS[test.kind]} · {test.questionCount} questions ·{" "}
                        {test.durationMinutes} min
                      </p>
                    </div>
                    <p className="text-small text-ink-secondary">
                      {test.opensAt ? `Opens ${formatIst(test.opensAt)}` : "No opening time"}
                    </p>
                    <Badge tone={STATUS_TONE[test.status]}>{test.status}</Badge>
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
