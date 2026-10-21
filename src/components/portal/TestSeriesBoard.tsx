import { CalendarClock, ClipboardList } from "lucide-react";

import Link from "@/i18n/Link";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireAuth } from "@/lib/auth/server";
import { ROUTES } from "@/lib/constants/site";
import { latestFirst } from "@/lib/utils/instant";
import { courseService } from "@/services/courses/course.service";
import { testService } from "@/services/tests/test.service";
import type { Course, Test, TestAttempt, TestKind } from "@/types/db";

/**
 * The test calendar over a set of paper kinds — the Prelims tab. Mains papers
 * have their own board (`/dashboard/mains`), since a copy written offline has a
 * different life from a timed sitting.
 *
 * Papers are gathered across every active enrollment: a student on both a
 * foundation course and a standalone test series should see one calendar, not
 * have to remember which programme a paper belongs to.
 */

const ATTEMPT_LABELS: Record<TestAttempt["status"], string> = {
  "in-progress": "In progress",
  submitted: "Submitted",
  evaluated: "Result out",
  abandoned: "Not submitted",
};

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

/**
 * Where the card's button goes.
 *
 * A sitting in progress jumps straight back into the paper — a student who was
 * dropped by their connection is losing exam time on every extra click. Anything
 * else goes to the paper's page, which is where the rules and the window are.
 */
function paperHref(test: Test, attempt: TestAttempt | undefined): string {
  if (attempt?.status === "in-progress" && test.kind !== "mains-descriptive") {
    return `/exam/${test.id}`;
  }

  return `/dashboard/tests/${test.id}`;
}

function ctaLabel(test: Test, attempt: TestAttempt | undefined): string {
  if (attempt?.status === "in-progress") {
    return test.kind === "mains-descriptive" ? "Open paper" : "Resume paper";
  }

  if (attempt) return "View scorecard";

  return "Open paper";
}

export async function TestSeriesBoard({
  kinds,
  emptyTitle,
  emptyDescription,
}: {
  kinds: readonly TestKind[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  const user = await requireAuth();
  const enrolled = await courseService.getEnrolledCourses();

  const [attempts, ...perCourse] = await Promise.all([
    testService.listAttempts(user.uid),
    ...enrolled.map(({ course }) => testService.listForCourse(course.id)),
  ]);

  const courseById = new Map<string, Course>(
    enrolled.map(({ course }) => [course.id, course]),
  );

  const papers = perCourse.flat().filter((test) => kinds.includes(test.kind));

  // Newest first, with unscheduled papers after the dated ones.
  papers.sort((a, b) => latestFirst(a.opensAt, b.opensAt));

  const attemptByTest = new Map<string, TestAttempt>();
  for (const attempt of attempts) {
    if (!attemptByTest.has(attempt.testId)) attemptByTest.set(attempt.testId, attempt);
  }

  if (papers.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList aria-hidden className="size-5" />}
        title={emptyTitle}
        description={emptyDescription}
        action={
          <ButtonLink href={ROUTES.courses} variant="secondary">
            Explore programmes
          </ButtonLink>
        }
      />
    );
  }

  return (
    <ul className="space-y-4">
      {papers.map((test) => {
        const attempt = attemptByTest.get(test.id);
        const course = courseById.get(test.courseId);

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

              <p className="mt-4 flex flex-wrap items-center gap-2 text-small text-ink-secondary">
                <CalendarClock aria-hidden className="size-4 text-kesar-600" />
                {windowLabel(test)}
                {test.subject ? ` · ${test.subject}` : ""}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <ButtonLink
                  href={paperHref(test, attempt)}
                  variant={attempt?.status === "in-progress" ? "primary" : "secondary"}
                  size="sm"
                >
                  {ctaLabel(test, attempt)}
                </ButtonLink>

                {course ? (
                  <Link
                    href={`/dashboard/courses/${course.id}`}
                    className="text-small font-semibold text-indigo underline"
                  >
                    {course.title}
                  </Link>
                ) : null}
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
