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
import { ProgramStagePicker } from "@/components/home/ProgramStagePicker";
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
 * faster than comparing four syllabi. The stage icon and label tell the four
 * apart; colour is kept for the one "Start here" card.
 */
const TILE: Record<HomepageCategory, { icon: LucideIcon; hook: string }> = {
  foundation: { icon: Sprout, hook: "New to UPSC?" },
  prelims: { icon: Target, hook: "Prelims up next?" },
  mains: { icon: PenLine, hook: "Mains mode on?" },
  optional: { icon: BookOpen, hook: "Got your optional?" },
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
 *
 * Phones (below `md`) get `ProgramStagePicker` instead: "where are you in
 * your UPSC journey?", then only the programme for the stage picked.
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
      <div className="hidden md:block">
        <SectionHeader
          eyebrow={`Programs · ${EXAM_CYCLE.label}`}
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
      </div>

      {/* Phones: one question, then the one programme that answers it. */}
      <ProgramStagePicker courses={featured} />

      {/* Two across until a card has ~280px of measure, then all four. */}
      <ul className="mt-8 hidden gap-5 md:grid md:grid-cols-2 lg:mt-10 lg:gap-6 xl:grid-cols-4">
        {featured.map((course, index) => {
          const { icon: Icon, hook } = TILE[course.category];
          const first = index === 0;
          const href = `/courses/${course.slug}`;

          return (
            <li
              key={course.id}
              className="reveal relative"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <article
                className={cn(
                  "relative flex h-full flex-col border bg-white transition-colors duration-150 hover:border-indigo",
                  first
                    ? "border-indigo border-t-4 border-t-kesar"
                    : "border-line-strong",
                )}
              >
                {/* Hangs on the top rule, out of the flow, so the first card's
                    content lines up with its neighbours. */}
                {first ? (
                  <span className="absolute -top-3.5 right-5 bg-kesar px-2 py-0.5 text-eyebrow font-bold whitespace-nowrap uppercase text-indigo-900">
                    Start here
                  </span>
                ) : null}

                <div className="flex flex-1 flex-col p-5 lg:p-6">
                  <span className="flex items-center gap-2.5 text-indigo">
                    <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                    <span className="text-eyebrow font-bold uppercase">
                      {COURSE_CATEGORY_LABELS[course.category]}
                    </span>
                  </span>

                  <p className="mt-5 text-small font-semibold text-ink-secondary">
                    {hook}
                  </p>
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
                    <ul className="mt-4 space-y-2">
                      {course.features.slice(0, 3).map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-small text-ink"
                        >
                          <Check
                            aria-hidden
                            className="mt-0.5 size-4 shrink-0 text-kesar-600"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {/* Metadata: plain secondary lines pinned to the foot of the
                      body, so the fee rows of neighbouring cards line up. */}
                  <dl className="mt-auto space-y-1.5 pt-5 text-small text-ink-secondary">
                    {isShortDuration(course.duration) ? (
                      <div className="flex items-start gap-2">
                        <dt className="sr-only">Duration</dt>
                        <Clock aria-hidden className="mt-0.5 size-4 shrink-0" />
                        <dd>{course.duration}</dd>
                      </div>
                    ) : null}
                    {course.mode.length > 0 ? (
                      <div className="flex items-start gap-2">
                        <dt className="sr-only">Mode</dt>
                        <Laptop
                          aria-hidden
                          className="mt-0.5 size-4 shrink-0"
                        />
                        <dd>{course.mode.join(" · ")}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>

                <div className="border-t border-line p-5 lg:p-6">
                  {course.priceInPaise ? (
                    <p className="text-h3 font-bold tabular-nums text-indigo">
                      {RUPEES.format(course.priceInPaise / 100)}
                      <span className="ml-1.5 text-small font-medium text-ink-secondary">
                        programme fee
                      </span>
                    </p>
                  ) : (
                    <p className="text-body font-bold leading-snug text-indigo">
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
                      variant={first ? "kesar" : "primary"}
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
          className="font-bold text-indigo underline decoration-kesar decoration-2 underline-offset-4 hover:decoration-indigo"
        >
          Get a free counselling call
        </Link>
      </p>
    </Section>
  );
}
