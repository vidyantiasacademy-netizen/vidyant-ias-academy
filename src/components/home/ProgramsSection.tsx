import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Laptop,
  PenLine,
  Sprout,
  Target,
  type LucideIcon,
} from "lucide-react";

import Link from "@/i18n/Link";
import { BuyCourseButton } from "@/components/checkout/BuyCourseButton";
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
 * Each card opens with the student's own situation as a question, so they
 * recognise themselves before they read a programme name — "that's me" is
 * faster than comparing four syllabi. One primary per stage, as a hard bar
 * across the card's head, makes the four easy to tell apart.
 */
const TILE: Record<HomepageCategory, { icon: LucideIcon; hook: string; bar: string }> = {
  foundation: { icon: Sprout, hook: "New to UPSC?", bar: "bg-kesar" },
  prelims: { icon: Target, hook: "Prelims up next?", bar: "bg-ink" },
  mains: { icon: PenLine, hook: "Mains mode on?", bar: "bg-chilli" },
  optional: { icon: BookOpen, hook: "Got your optional?", bar: "bg-indigo" },
};

/** "6 months" fits a chip; the long fallback note belongs on the course page. */
const isShortDuration = (duration: string) => duration.length <= 12;

const RUPEES = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function isHomepageCategory(
  category: CourseCategory,
): category is HomepageCategory {
  return (HOMEPAGE_CATEGORIES as readonly CourseCategory[]).includes(category);
}

/**
 * The homepage's shop window. Every card carries what a buyer needs to decide
 * without leaving the page — what it is, how long, how it is taught, what it
 * costs — and a way to buy it there and then. A price the institute quotes in
 * person is said so plainly, and that card's button opens the enrolment form.
 */
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
        eyebrow={`${EXAM_CYCLE.label} · ${EXAM_CYCLE.admissionNote}`}
        title={
          <>
            Pick{" "}
            <span className="-mx-1 box-decoration-clone bg-kesar-100 px-1">
              your stage.
            </span>{" "}
            Enrol today.
          </>
        }
        description="Each program is built around the same system — teaching, practice, testing, evaluation and mentorship — applied to the stage you are actually at. Fees are listed up front."
        action={
          <ButtonLink href={CTA.courses.href} variant="secondary">
            View all courses
          </ButtonLink>
        }
      />

      <ul className="mt-7 grid gap-5 sm:grid-cols-2 lg:mt-9 lg:grid-cols-4 lg:gap-6">
        {featured.map((course, index) => {
          const { icon: Icon, hook, bar } = TILE[course.category];
          const href = `/courses/${course.slug}`;

          return (
            <li
              key={course.id}
              className="reveal relative"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <article className="relative flex h-full flex-col border-2 border-indigo bg-white">
                <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1.5", bar)} />
                {index === 0 ? (
                  <span className="pointer-events-none absolute right-0 top-0 z-10 bg-kesar px-2 py-1 text-eyebrow font-bold uppercase text-indigo-900">
                    Start here
                  </span>
                ) : null}

                <div className="flex flex-1 flex-col p-5 pt-7 lg:p-6 lg:pt-8">
                  <span className="flex items-center gap-2.5 text-indigo">
                    <Icon aria-hidden className="size-5" />
                    <span className="text-eyebrow font-bold uppercase">
                      {COURSE_CATEGORY_LABELS[course.category]}
                    </span>
                  </span>

                  <p className="mt-4 text-small font-bold text-ink-secondary">{hook}</p>
                  <h3 className="mt-1 text-h4 font-bold leading-tight text-indigo">
                    <TrackedLink
                      href={href}
                      event={ANALYTICS_EVENTS.courseView}
                      payload={{ course: course.id, location: "programs-card" }}
                      className="hover:underline underline-offset-4"
                    >
                      {course.title}
                    </TrackedLink>
                  </h3>
                  {course.shortDescription ? (
                    <p className="mt-2 line-clamp-3 text-small text-ink-secondary">
                      {course.shortDescription}
                    </p>
                  ) : null}

                  {course.features.length > 0 ? (
                    <ul className="mt-4 space-y-1.5">
                      {course.features.slice(0, 3).map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-small text-ink">
                          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-kesar-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {isShortDuration(course.duration) ? (
                      <span className="inline-flex items-center gap-1 border border-line px-2 py-0.5 text-eyebrow font-bold text-ink-secondary">
                        <Clock aria-hidden className="size-3.5" />
                        {course.duration}
                      </span>
                    ) : null}
                    {course.mode.length > 0 ? (
                      <span className="inline-flex items-center gap-1 border border-line px-2 py-0.5 text-eyebrow font-bold text-ink-secondary">
                        <Laptop aria-hidden className="size-3.5" />
                        {course.mode.join(" · ")}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="border-t-2 border-indigo p-5 lg:p-6">
                  {course.priceInPaise ? (
                    <p className="text-h3 font-bold tabular-nums text-indigo">
                      {RUPEES.format(course.priceInPaise / 100)}
                      <span className="ml-1.5 text-small font-medium text-ink-secondary">
                        programme fee
                      </span>
                    </p>
                  ) : (
                    <p className="text-body font-bold text-indigo">
                      Fee on a free counselling call
                      <span className="block text-small font-medium text-ink-secondary">
                        Instalments available
                      </span>
                    </p>
                  )}

                  <div className="mt-4 flex flex-col gap-2">
                    <BuyCourseButton
                      course={course}
                      location="home-programs"
                      variant={index === 0 ? "kesar" : "primary"}
                      fullWidth
                    >
                      Enrol now
                    </BuyCourseButton>
                    <TrackedLink
                      href={href}
                      event={ANALYTICS_EVENTS.courseCtaClick}
                      payload={{ course: course.id, location: "programs-card" }}
                      className="inline-flex items-center justify-center gap-1.5 py-1 text-small font-bold text-indigo hover:underline underline-offset-4"
                    >
                      Syllabus, schedule &amp; faculty
                      <ArrowRight aria-hidden className="size-4" />
                    </TrackedLink>
                  </div>
                </div>
              </article>
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
