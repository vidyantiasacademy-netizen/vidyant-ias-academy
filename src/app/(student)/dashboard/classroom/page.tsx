import type { Metadata } from "next";
import { BookOpen, FileText, PlayCircle, Radio } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { BRAND, ROUTES } from "@/lib/constants/site";
import { courseService } from "@/services/courses/course.service";
import type { LessonKind } from "@/types/db";

/**
 * Classroom — every programme the student is in, and the material released in
 * each one.
 *
 * Lessons are fetched per course rather than in one query: `lessons` is keyed
 * by `courseId`, and a student is in a handful of courses at most, so N small
 * indexed reads beat a collection scan.
 */
export const metadata: Metadata = {
  title: `Classroom | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

const KIND_LABELS: Record<LessonKind, string> = {
  live: "Live class",
  video: "Recording",
  document: "Handout",
  quiz: "Quiz",
};

const KIND_ICONS: Record<LessonKind, typeof Radio> = {
  live: Radio,
  video: PlayCircle,
  document: FileText,
  quiz: BookOpen,
};

export default async function ClassroomPage() {
  const enrolled = await courseService.getEnrolledCourses();

  const lessonsByCourse = await Promise.all(
    enrolled.map(({ course }) => courseService.getLessons(course.id)),
  );

  if (enrolled.length === 0) {
    return (
      <>
        <h1 className="text-h2 font-semibold">Classroom</h1>
        <div className="mt-8">
          <EmptyState
            icon={<BookOpen aria-hidden className="size-5" />}
            title="No active enrollment yet"
            description="Once your admission is confirmed, your classes, recordings and handouts appear here."
            action={
              <ButtonLink href={ROUTES.courses} variant="secondary">
                Explore programmes
              </ButtonLink>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-h2 font-semibold">Classroom</h1>
      <p className="mt-2 text-body text-ink-secondary">
        Live classes, recordings and handouts from your programmes.
      </p>

      <div className="mt-8 space-y-10">
        {enrolled.map(({ course, enrollment }, index) => {
          const lessons = lessonsByCourse[index];

          return (
            <section key={enrollment.id} aria-labelledby={`course-${course.id}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id={`course-${course.id}`} className="text-h3 font-semibold">
                  {course.title}
                </h2>

                <Link
                  href={`/dashboard/courses/${course.id}`}
                  className="text-small font-semibold text-indigo underline"
                >
                  Programme details
                </Link>
              </div>

              {lessons.length === 0 ? (
                <div className="mt-5">
                  <EmptyState
                    icon={<BookOpen aria-hidden className="size-5" />}
                    title="Nothing released yet"
                    description="Classes and material for this programme appear here as they are published."
                  />
                </div>
              ) : (
                <ul className="mt-5 space-y-3">
                  {lessons.map((lesson) => {
                    const Icon = KIND_ICONS[lesson.kind];

                    return (
                      <li key={lesson.id}>
                        <Card tone="white" padding="sm">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-paper text-kesar-600">
                                <Icon aria-hidden className="size-5" />
                              </span>

                              <div>
                                <h3 className="text-body font-semibold">
                                  {lesson.title}
                                </h3>
                                <p className="mt-1 text-small text-ink-secondary">
                                  {KIND_LABELS[lesson.kind]}
                                  {lesson.durationSeconds
                                    ? ` · ${Math.round(lesson.durationSeconds / 60)} min`
                                    : ""}
                                </p>
                              </div>
                            </div>

                            {lesson.isFreePreview ? (
                              <Badge tone="neutral">Preview</Badge>
                            ) : null}
                          </div>
                        </Card>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
