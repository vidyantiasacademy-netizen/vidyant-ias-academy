import type { Metadata } from "next";
import { BookOpen, CalendarClock, ClipboardList } from "lucide-react";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireAuth } from "@/lib/auth/server";
import { BRAND } from "@/lib/constants/site";
import { COURSE_CATEGORY_LABELS } from "@/lib/courses/labels";
import type { DeliveryMode, Test, TestAttempt } from "@/types/db";
import { courseService } from "@/services/courses/course.service";
import { enrollmentService } from "@/services/enrollments/enrollment.service";
import { testService } from "@/services/tests/test.service";

/**
 * One programme, as the enrolled student sees it: the papers in it and the
 * teaching material released so far.
 *
 * Access is checked here with `hasAccess` as well as inside every service
 * call. That looks redundant and is not: without it the page would render its
 * heading and an empty-looking body for a course the student has not bought,
 * which leaks the programme's existence and reads as a bug.
 */
// The brand suffix is spelled out: the root `title.template` does not reach
// past the portal layout's own string title, so a bare "Programme" would ship.
export const metadata: Metadata = {
  title: `Programme | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

const MODE_LABELS: Record<DeliveryMode, string> = {
  offline: "Classroom",
  "online-live": "Live online",
  recorded: "Recorded",
  hybrid: "Hybrid",
};

const ATTEMPT_LABELS: Record<TestAttempt["status"], string> = {
  "in-progress": "In progress",
  submitted: "Submitted",
  evaluated: "Result out",
  abandoned: "Not submitted",
};

/** `null` windows are the normal case for a paper not yet scheduled. */
function windowLabel(test: Test): string {
  if (!test.opensAt) return "Date to be announced";

  const opens = new Date(test.opensAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return test.closesAt
    ? `${opens} — open till ${new Date(test.closesAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })}`
    : opens;
}

export default async function ProgrammePage({
  params,
}: PageProps<"/[lang]/dashboard/courses/[id]">) {
  const { id } = await params;

  const user = await requireAuth();

  const [course, hasAccess] = await Promise.all([
    courseService.getById(id),
    enrollmentService.hasAccess(user.uid, id),
  ]);

  if (!course || !hasAccess) notFound();

  const [lessons, tests, attempts] = await Promise.all([
    courseService.getLessons(id),
    testService.listForCourse(id),
    testService.listAttempts(user.uid),
  ]);

  // Latest attempt per paper — `listAttempts` is already newest first.
  const attemptByTest = new Map<string, TestAttempt>();
  for (const attempt of attempts) {
    if (!attemptByTest.has(attempt.testId)) attemptByTest.set(attempt.testId, attempt);
  }

  return (
    <>
      <div>
        <h1 className="text-h2 font-bold">{course.title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge>{COURSE_CATEGORY_LABELS[course.category]}</Badge>
          {course.modes.map((mode) => (
            <Badge key={mode} tone="neutral">
              {MODE_LABELS[mode]}
            </Badge>
          ))}
          {course.durationMonths ? (
            <Badge tone="neutral">{course.durationMonths} months</Badge>
          ) : null}
        </div>

        <p className="mt-4 text-body text-ink-secondary">
          {course.stats.testCount} tests · {course.stats.lessonCount} lessons
        </p>
      </div>

      <section aria-labelledby="papers" className="mt-10">
        <h2 id="papers" className="text-h3 font-bold">
          Test calendar
        </h2>

        {tests.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              icon={<ClipboardList aria-hidden className="size-5" />}
              title="No papers released yet"
              description="Each paper appears here with its date as soon as the schedule is published."
            />
          </div>
        ) : (
          <ul className="mt-5 space-y-4">
            {tests.map((test) => {
              const attempt = attemptByTest.get(test.id);

              return (
                <li key={test.id}>
                  <Card tone="white" padding="md">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-body-lg font-semibold">{test.title}</h3>
                        <p className="mt-2 text-small text-ink-secondary">
                          {test.questionCount} questions · {test.totalMarks} marks ·{" "}
                          {test.durationMinutes} minutes
                        </p>
                      </div>

                      <Badge tone={attempt ? "success" : "neutral"}>
                        {attempt ? ATTEMPT_LABELS[attempt.status] : "Not attempted"}
                      </Badge>
                    </div>

                    <p className="mt-4 flex items-center gap-2 text-small text-ink-secondary">
                      <CalendarClock aria-hidden className="size-4 text-kesar-600" />
                      {windowLabel(test)}
                      {test.subject ? ` · ${test.subject}` : ""}
                    </p>

                    {/* One destination whatever the state: the paper's own page
                        decides between starting, resuming and the scorecard, so
                        the branch lives in one place instead of three cards. */}
                    <ButtonLink
                      href={`/dashboard/tests/${test.id}`}
                      variant="secondary"
                      size="sm"
                      className="mt-5"
                    >
                      {attempt && attempt.status !== "in-progress"
                        ? "View scorecard"
                        : "Open paper"}
                    </ButtonLink>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="material" className="mt-10">
        <h2 id="material" className="text-h3 font-bold">
          Classes and material
        </h2>

        {lessons.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              icon={<BookOpen aria-hidden className="size-5" />}
              title="Nothing released yet"
              description="Recordings, handouts and live class links for this programme appear here."
            />
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {lessons.map((lesson) => (
              <li key={lesson.id}>
                <Card tone="paper" padding="sm">
                  <h3 className="text-body font-semibold">{lesson.title}</h3>
                  <p className="mt-1 text-small text-ink-secondary">
                    {lesson.kind === "live"
                      ? "Live class"
                      : lesson.kind === "video"
                        ? "Recording"
                        : lesson.kind === "document"
                          ? "Handout"
                          : "Quiz"}
                    {lesson.durationSeconds
                      ? ` · ${Math.round(lesson.durationSeconds / 60)} min`
                      : ""}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
