import {
  ArrowRight,
  BookOpen,
  Clock,
  PenLine,
  Sprout,
  Target,
  type LucideIcon,
} from "lucide-react";

import Link from "@/i18n/Link";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CTA, EXAM_CYCLE } from "@/lib/constants/site";
import { firstPerCategory } from "@/lib/courses/catalogue";
import { COURSE_CATEGORY_LABELS } from "@/lib/courses/labels";
import { cn } from "@/lib/utils/cn";
import type { Course, CourseCategory } from "@/types";

/** The four stages the homepage strip shows, in order; the test series lives on /courses. */
const HOMEPAGE_CATEGORIES = [
  "foundation",
  "prelims",
  "mains",
  "optional",
] as const;
type HomepageCategory = (typeof HOMEPAGE_CATEGORIES)[number];

/**
 * Each tile opens with the student's own situation as a question, so they
 * recognise themselves before they read a programme name — "that's me" is
 * faster than comparing four syllabi. One primary per stage, as a hard bar
 * across the tile's head, makes the four easy to tell apart.
 */
const TILE: Record<
  HomepageCategory,
  { icon: LucideIcon; hook: string; gets: string; bar: string }
> = {
  foundation: {
    icon: Sprout,
    hook: "New to UPSC?",
    gets: "NCERTs to full GS",
    bar: "bg-kesar",
  },
  prelims: {
    icon: Target,
    hook: "Prelims up next?",
    gets: "MCQs, CSAT and PYQs",
    bar: "bg-ink",
  },
  mains: {
    icon: PenLine,
    hook: "Mains mode on?",
    gets: "Answers, evaluated",
    bar: "bg-chilli",
  },
  optional: {
    icon: BookOpen,
    hook: "Got your optional?",
    gets: "Subject-wise depth",
    bar: "bg-indigo",
  },
};

/** "6 months" fits a chip; the long fallback note belongs on the course page. */
const isShortDuration = (duration: string) => duration.length <= 12;

function isHomepageCategory(
  category: CourseCategory,
): category is HomepageCategory {
  return (HOMEPAGE_CATEGORIES as readonly CourseCategory[]).includes(category);
}

export function ProgramsSection({ courses }: { courses: Course[] }) {
  const featured = firstPerCategory(courses)
    .filter((course): course is Course & { category: HomepageCategory } =>
      isHomepageCategory(course.category),
    )
    .sort(
      (a, b) =>
        HOMEPAGE_CATEGORIES.indexOf(a.category) -
        HOMEPAGE_CATEGORIES.indexOf(b.category),
    );

  if (featured.length === 0) return null;

  return (
    <Section id="programs" containerSize="wide">
      <SectionHeader
        accent="chilli"
        eyebrow={`${EXAM_CYCLE.label} programs`}
        title={
          <>
            Pick{" "}
            <span className="-mx-1 box-decoration-clone bg-kesar-100 px-1">
              your stage.
            </span>
          </>
        }
        description="Each program is built around the same system — teaching, practice, testing, evaluation and mentorship — applied to the stage you are actually at."
        action={
          <ButtonLink href={CTA.courses.href} variant="secondary">
            {CTA.courses.label}
          </ButtonLink>
        }
      />

      {/* All four visible at once — a 2×2 grid on phones, one row from lg —
          so no stage hides off-screen behind a swipe. */}
      <ul className="mt-7 grid grid-cols-2 gap-4 sm:gap-5 lg:mt-9 lg:grid-cols-4 lg:gap-6">
        {featured.map((course, index) => {
          const {
            icon: Icon,
            hook,
            gets,
            bar,
          } = TILE[course.category];
          const label = COURSE_CATEGORY_LABELS[course.category];

          return (
            <li
              key={course.id}
              className="reveal relative"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              {/* A flat tag locked into the tile's top-right corner. */}
              {index === 0 ? (
                <span className="pointer-events-none absolute right-0 top-0 z-10 bg-kesar px-1.5 py-1 text-eyebrow font-bold uppercase text-indigo-900 sm:px-2">
                  Start here
                </span>
              ) : null}
              <TrackedLink
                href={`/courses/${course.slug}`}
                event={ANALYTICS_EVENTS.courseCtaClick}
                payload={{ course: course.id, location: "programs-tile" }}
                className="group relative flex aspect-square flex-col overflow-hidden border-2 border-indigo bg-white p-3.5 pt-5 transition-colors duration-150 hover:bg-indigo sm:p-5 sm:pt-7 lg:p-6 lg:pt-8"
              >
                {/* Stage colour as a hard bar across the head of the tile. */}
                <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1.5", bar)} />

                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="text-small font-bold tabular-nums text-indigo transition-colors duration-150 group-hover:text-white"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon
                    aria-hidden
                    className="size-5 text-indigo transition-colors duration-150 group-hover:text-white sm:size-6"
                  />
                </span>

                <span className="relative mt-auto text-[0.8125rem] font-bold leading-snug text-ink-secondary transition-colors duration-150 group-hover:text-white/85 sm:text-small">
                  {hook}
                </span>
                <span className="relative mt-0.5 flex items-center gap-1.5 text-[1.25rem] font-bold leading-tight tracking-tight text-indigo transition-colors duration-150 group-hover:text-white sm:text-h3 lg:text-h3-lg">
                  {label}
                  <ArrowRight
                    aria-hidden
                    className="size-5 shrink-0"
                  />
                </span>
                <span className="sr-only">: {course.title}.</span>
                <span className="relative mt-1 text-[0.8125rem] font-medium leading-snug text-ink-secondary transition-colors duration-150 group-hover:text-white/85 sm:text-small">
                  {gets}
                </span>

                {isShortDuration(course.duration) ? (
                  <span className="relative mt-2 inline-flex w-fit items-center gap-1 border border-line bg-white px-2 py-0.5 text-eyebrow font-bold text-ink-secondary sm:mt-3 sm:px-2.5">
                    <Clock aria-hidden className="size-3.5" />
                    {course.duration}
                  </span>
                ) : null}
              </TrackedLink>
            </li>
          );
        })}
      </ul>

      {/* The way out for the undecided: a person, not another comparison. */}
      <p className="mt-6 text-small text-ink-secondary lg:mt-8">
        Not sure which one is you?{" "}
        <Link
          href={CTA.counselling.href}
          className="font-bold text-chilli-600 underline decoration-2 underline-offset-4 hover:text-indigo"
        >
          Get a free counselling call
        </Link>
      </p>
    </Section>
  );
}
