import { CourseCard } from "@/components/courses/CourseCard";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTA } from "@/lib/constants/site";
import { firstPerCategory } from "@/lib/courses/catalogue";
import { COURSE_CATEGORY_LABELS } from "@/lib/courses/labels";
import type { Course, CourseCategory } from "@/types";

/** The four stages the homepage strip shows, in order; the test series lives on /courses. */
const HOMEPAGE_CATEGORIES: CourseCategory[] = ["foundation", "prelims", "mains", "optional"];

export function ProgramsSection({ courses }: { courses: Course[] }) {
  const featured = firstPerCategory(courses)
    .filter((course) => HOMEPAGE_CATEGORIES.includes(course.category))
    .sort(
      (a, b) => HOMEPAGE_CATEGORIES.indexOf(a.category) - HOMEPAGE_CATEGORIES.indexOf(b.category),
    );

  if (featured.length === 0) return null;

  return (
    <Section id="programs" containerSize="wide">
      <SectionHeader
        eyebrow="Programs"
        title="Choose the preparation path that fits you."
        description="Each program is built around the same system — teaching, practice, testing, evaluation and mentorship — applied to the stage you are actually at."
        action={
          <ButtonLink href={CTA.courses.href} variant="secondary">
            {CTA.courses.label}
          </ButtonLink>
        }
      />

      {/* One row: a snap-scrolling strip on phones and tablets, four columns from lg. */}
      <ul className="-mx-4 mt-7 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:mt-9 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0">
        {featured.map((course) => (
          <li key={course.id} className="w-[85%] shrink-0 snap-start sm:w-[46%] lg:w-auto">
            <CourseCard
              course={course}
              ctaLabel={`Explore ${COURSE_CATEGORY_LABELS[course.category]}`}
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
