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
 * faster than comparing four syllabi. One colour per stage makes the four
 * tiles easy to tell apart and to remember.
 */
const TILE: Record<
  HomepageCategory,
  { icon: LucideIcon; hook: string; gets: string; chip: string; shadow: string }
> = {
  foundation: {
    icon: Sprout,
    hook: "New to UPSC?",
    gets: "NCERTs to full GS",
    chip: "bg-kesar-100 text-kesar-700",
    shadow: "shadow-[5px_5px_0_0_var(--color-kesar)]",
  },
  prelims: {
    icon: Target,
    hook: "Prelims up next?",
    gets: "MCQs, CSAT and PYQs",
    chip: "bg-cameo-100 text-indigo",
    shadow: "shadow-[5px_5px_0_0_var(--color-cameo)]",
  },
  mains: {
    icon: PenLine,
    hook: "Mains mode on?",
    gets: "Answers, evaluated",
    chip: "bg-chilli-100 text-chilli-700",
    shadow: "shadow-[5px_5px_0_0_var(--color-chilli)]",
  },
  optional: {
    icon: BookOpen,
    hook: "Got your optional?",
    gets: "Subject-wise depth",
    chip: "bg-indigo-100 text-indigo",
    shadow: "shadow-[5px_5px_0_0_var(--color-indigo)]",
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
            <span className="-mx-1 box-decoration-clone rounded-sm bg-cameo px-1">
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
            chip,
            shadow,
          } = TILE[course.category];
          const label = COURSE_CATEGORY_LABELS[course.category];

          return (
            <li
              key={course.id}
              className="reveal relative"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              {/* Sits on the tile's edge, outside the clipped link, like a sticker. */}
              {index === 0 ? (
                <span className="pointer-events-none absolute -top-3 right-2 z-10 -rotate-6 rounded-md border-2 border-indigo bg-kesar px-1.5 py-0.5 text-eyebrow font-bold uppercase text-indigo-900 shadow-[2px_2px_0_0_var(--color-indigo)] sm:right-4 sm:px-2">
                  Start here
                </span>
              ) : null}
              <TrackedLink
                href={`/courses/${course.slug}`}
                event={ANALYTICS_EVENTS.courseCtaClick}
                payload={{ course: course.id, location: "programs-tile" }}
                className={cn(
                  "group relative flex aspect-square flex-col overflow-hidden rounded-xl border-2 border-indigo bg-white p-3.5 transition-[transform,box-shadow,background-color] duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-cameo-100 hover:shadow-[7px_7px_0_0_var(--color-chilli)] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none sm:p-5 lg:p-6",
                  shadow,
                )}
              >
                {/* Oversized stage number — texture, not information. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-4 -right-1 select-none text-[4rem] font-black leading-none tracking-tighter text-indigo-100 transition-colors duration-150 group-hover:text-chilli/25 sm:text-[7rem]"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span
                  className={cn(
                    "relative flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-12",
                    chip,
                    "transition-transform duration-200 ease-[var(--ease-brand)] group-hover:-rotate-6",
                  )}
                >
                  <Icon aria-hidden className="size-5 sm:size-6" />
                </span>

                <span className="relative mt-auto text-[0.8125rem] font-semibold leading-snug text-ink-secondary sm:text-small">
                  {hook}
                </span>
                <span className="relative mt-0.5 flex items-center gap-1.5 text-[1.25rem] font-black leading-tight tracking-tight text-indigo sm:text-h3 lg:text-h3-lg">
                  {label}
                  <ArrowRight
                    aria-hidden
                    className="size-5 shrink-0 transition-transform duration-200 ease-[var(--ease-brand)] group-hover:translate-x-1"
                  />
                </span>
                <span className="sr-only">: {course.title}.</span>
                <span className="relative mt-1 text-[0.8125rem] font-medium leading-snug text-ink-secondary sm:text-small">
                  {gets}
                </span>

                {isShortDuration(course.duration) ? (
                  <span className="relative mt-2 inline-flex w-fit items-center gap-1 rounded-full border border-line bg-white px-2 py-0.5 text-eyebrow font-semibold text-ink-secondary sm:mt-3 sm:px-2.5">
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
          className="font-semibold text-chilli-600 underline decoration-2 underline-offset-4 hover:text-indigo"
        >
          Get a free counselling call
        </Link>
      </p>
    </Section>
  );
}
