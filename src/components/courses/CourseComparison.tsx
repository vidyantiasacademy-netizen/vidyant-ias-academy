import Link from "@/i18n/Link";
import { Card } from "@/components/ui/Card";
import { COURSE_CATEGORY_LABELS } from "@/lib/courses/labels";
import type { Course } from "@/types";

/**
 * Every programme side by side, one column each.
 *
 * Cards answer "what is this programme"; this answers "which one is for me",
 * which is the question a visitor leaves to think about — and often does not
 * come back from. Programmes are columns rather than rows so the eye compares
 * one attribute across all of them, which is the comparison actually being made.
 *
 * Every cell is catalogue data. A blank field shows a dash rather than a
 * filler line, so nothing here is claimed that the course page does not say.
 */

interface Row {
  label: string;
  value: (course: Course) => string;
}

const ROWS: Row[] = [
  { label: "Stage", value: (course) => COURSE_CATEGORY_LABELS[course.category] },
  { label: "Best for", value: (course) => course.audience.slice(0, 2).join("; ") },
  { label: "Duration", value: (course) => course.duration },
  { label: "Mode", value: (course) => course.mode.join(", ") },
  { label: "Tests", value: (course) => course.tests },
  { label: "Mentorship", value: (course) => course.mentorship },
  { label: "Study material", value: (course) => course.studyMaterial.slice(0, 3).join(", ") },
  { label: "Fee", value: (course) => course.fee },
];

export function CourseComparison({ courses }: { courses: Course[] }) {
  return (
    <Card padding="none" className="overflow-x-auto">
      <table className="w-full text-left text-small" style={{ minWidth: `${12 + courses.length * 14}rem` }}>
        <caption className="sr-only">Programmes compared by stage, duration, mode, tests, mentorship and fee</caption>
        <thead>
          <tr className="border-b-2 border-indigo">
            <td className="w-48 p-4" />
            {courses.map((course) => (
              <th key={course.id} scope="col" className="p-4 align-bottom">
                <Link
                  href={`/courses/${course.slug}`}
                  className="text-body font-bold text-indigo underline decoration-kesar decoration-2 underline-offset-4 hover:decoration-indigo"
                >
                  {course.title}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {ROWS.map((row) => (
            <tr key={row.label}>
              <th scope="row" className="bg-paper p-4 align-top font-bold text-indigo">
                {row.label}
              </th>
              {courses.map((course) => (
                <td key={course.id} className="p-4 align-top text-ink-secondary">
                  {row.value(course) || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
