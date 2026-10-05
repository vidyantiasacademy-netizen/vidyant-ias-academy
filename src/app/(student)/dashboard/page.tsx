import { BookOpen, Bell } from "lucide-react";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCurrentStudent } from "@/lib/auth/server";
import { ROUTES } from "@/lib/constants/site";
import { courseService } from "@/services/courses/course.service";
import { notificationService } from "@/services/notifications/notification.service";

/**
 * The student portal's entry point.
 *
 * Intentionally thin: it exists to prove the architecture end to end — session
 * cookie → verified role → service layer → Firestore — and to be the place the
 * real portal grows from. Classes, the test calendar, results, doubts and
 * mentorship are each a page under this route group.
 */
export default async function DashboardPage() {
  const [student, enrolled, unread] = await Promise.all([
    getCurrentStudent(),
    courseService.getEnrolledCourses(),
    notificationService.countUnread(),
  ]);

  const firstName = student?.fullName.split(" ")[0] ?? "there";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h2 font-semibold">Welcome back, {firstName}.</h1>
          <p className="mt-2 text-body text-ink-secondary">
            {student?.rollNumber
              ? `Roll number ${student.rollNumber}`
              : "Your roll number is assigned when your enrollment is confirmed."}
          </p>
        </div>

        <span className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-small font-medium ring-1 ring-line">
          <Bell aria-hidden className="size-4 text-kesar-600" />
          {unread} unread
        </span>
      </div>

      <section aria-labelledby="my-courses" className="mt-10">
        <h2 id="my-courses" className="text-h3 font-semibold">
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
            {enrolled.map(({ course, enrollment }) => (
              <li key={enrollment.id}>
                <Card tone="white" padding="md">
                  <span className="flex size-10 items-center justify-center rounded-md bg-white text-kesar-600 ring-1 ring-line">
                    <BookOpen aria-hidden className="size-5" />
                  </span>
                  <h3 className="mt-4 text-body-lg font-semibold">{course.title}</h3>
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
