import { ArrowRight, BookOpen, Bell } from "lucide-react";

import Link from "@/i18n/Link";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { GeoTriad } from "@/components/ui/Geometry";
import { getCurrentStudent } from "@/lib/auth/server";
import { ROUTES } from "@/lib/constants/site";
import { summarisePerformance } from "@/lib/exam/analytics";
import { courseService } from "@/services/courses/course.service";
import { notificationService } from "@/services/notifications/notification.service";
import { testService } from "@/services/tests/test.service";

/**
 * The student portal's entry point.
 *
 * Intentionally thin: it exists to prove the architecture end to end — session
 * cookie → verified role → service layer → Firestore — and to be the place the
 * real portal grows from. Classes, the test calendar, results, doubts and
 * mentorship are each a page under this route group.
 */
export default async function DashboardPage() {
  const [student, enrolled, unread, scored] = await Promise.all([
    getCurrentStudent(),
    courseService.getEnrolledCourses(),
    notificationService.countUnread(),
    testService.listOwnPublishedResults(),
  ]);

  const performance = summarisePerformance(scored);
  const latest = performance.trend.at(-1);

  const firstName = student?.fullName.split(" ")[0] ?? "there";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 border-t-2 border-indigo pt-6">
        <div>
          <GeoTriad className="mb-4 hidden lg:inline-flex" />
          <h1 className="text-h2 font-bold tracking-tight">Welcome back, {firstName}.</h1>
          <p className="mt-2 text-body text-ink-secondary">
            {student?.rollNumber
              ? `Roll number ${student.rollNumber}`
              : "Your roll number is assigned when your enrollment is confirmed."}
          </p>
        </div>

        <span className="flex h-10 items-center gap-2 border border-line bg-white px-3 text-small font-medium">
          <Bell aria-hidden className="size-4 text-kesar-600" />
          {unread} unread
        </span>
      </div>

      {latest ? (
        <section aria-labelledby="performance-snapshot" className="mt-10">
          <Card tone="paper" padding="md" className="border-t-2 border-t-kesar">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <h2 id="performance-snapshot" className="text-h4 font-bold">
                  Your performance
                </h2>
                <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-4">
                  <div>
                    <dt className="text-eyebrow font-semibold uppercase text-ink-secondary">
                      Latest paper
                    </dt>
                    <dd className="mt-1 text-h4 font-bold tabular-nums">{latest.percent}%</dd>
                  </div>
                  <div>
                    <dt className="text-eyebrow font-semibold uppercase text-ink-secondary">
                      Average
                    </dt>
                    <dd className="mt-1 text-h4 font-bold tabular-nums">
                      {performance.averagePercent}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-eyebrow font-semibold uppercase text-ink-secondary">
                      Accuracy
                    </dt>
                    <dd className="mt-1 text-h4 font-bold tabular-nums">
                      {performance.accuracy === null ? "—" : `${performance.accuracy}%`}
                    </dd>
                  </div>
                </dl>
              </div>
              <Link
                href="/dashboard/performance"
                className="inline-flex items-center gap-1 text-small font-semibold text-indigo underline"
              >
                View full analytics
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </Card>
        </section>
      ) : null}

      <section aria-labelledby="my-courses" className="mt-10">
        <h2 id="my-courses" className="text-h3 font-bold tracking-tight">
          My programmes
        </h2>

        {enrolled.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              icon={<BookOpen aria-hidden className="size-5" />}
              title="No active enrollment yet"
              description="Once your admission is confirmed, your programme, classes and test calendar appear here."
              action={
                <ButtonLink href={ROUTES.courses} variant="secondary">
                  Explore programmes
                </ButtonLink>
              }
            />
          </div>
        ) : (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {enrolled.map(({ course, enrollment }, index) => (
              <li key={enrollment.id}>
                <Card tone="white" padding="md" className="border-t-2 border-t-indigo">
                  <span aria-hidden className="block text-small font-bold tabular-nums text-indigo">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-body-lg font-bold">{course.title}</h3>
                  <p className="mt-2 text-small text-ink-secondary">
                    {course.stats.lessonCount} lessons · {course.stats.testCount} tests
                  </p>
                  <Link
                    href={`/dashboard/courses/${course.id}`}
                    className="mt-4 inline-block text-small font-semibold text-indigo underline"
                  >
                    Open programme
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
