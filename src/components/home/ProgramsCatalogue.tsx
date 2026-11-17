"use client";

import { ArrowRight, Clock, MonitorPlay } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState, type KeyboardEvent } from "react";

import { BuyCourseButton } from "@/components/checkout/BuyCourseButton";
import { TrackedButtonLink, TrackedLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { COURSE_CATEGORY_LABELS } from "@/lib/courses/labels";
import { STAGE_CATEGORIES, usePrepStage } from "@/lib/prep-stage";
import { cn } from "@/lib/utils/cn";
import type { Course, CourseCategory } from "@/types";

/** Tab order follows the student's journey; the test series sits last. */
const CATEGORY_ORDER: CourseCategory[] = ["foundation", "prelims", "mains", "optional", "test-series"];

type Tab = "all" | CourseCategory;

/** "6 months" fits the meta line; the long fallback note belongs on the course page. */
const isShortDuration = (duration: string) => duration.length <= 12;

/**
 * The homepage programme shelf: category tabs over a grid of poster cards.
 * The poster says what the programme is at a glance; the card under it
 * carries the name, how it is taught, and the two ways forward — read the
 * details, or enrol. Phones get the same cards as a swipeable row.
 */
export function ProgramsCatalogue({
  courses,
  onDark = false,
}: {
  courses: Course[];
  /** On a navy band: the selected tab turns kesar, the rest outline in white. */
  onDark?: boolean;
}) {
  const tabs: Tab[] = [
    "all",
    ...CATEGORY_ORDER.filter((category) => courses.some((course) => course.category === category)),
  ];
  // Opens on the stage the student picked in the hero. A tab click wins until
  // they pick a different stage, which re-points the shelf.
  const stage = usePrepStage();
  const stageTab = stage ? STAGE_CATEGORIES[stage].find((category) => tabs.includes(category)) : undefined;
  const [chosen, setChosen] = useState<{ tab: Tab; stage: typeof stage } | null>(null);
  const active: Tab = (chosen?.stage === stage ? chosen.tab : undefined) ?? stageTab ?? "all";
  const setActive = (tab: Tab) => setChosen({ tab, stage });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  const shown = active === "all" ? courses : courses.filter((course) => course.category === active);

  // Arrow keys move between tabs, as the WAI-ARIA tabs pattern expects.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (tabs.indexOf(active) + step + tabs.length) % tabs.length;
    setActive(tabs[next]);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="mt-8 lg:mt-10">
      {tabs.length > 2 ? (
        <div
          role="tablist"
          aria-label="Filter programs by stage"
          onKeyDown={onKeyDown}
          className={cn(
            "-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:w-fit sm:flex-wrap sm:rounded-full sm:p-1.5",
            onDark ? "sm:bg-white/[0.06] sm:ring-1 sm:ring-white/12" : "sm:bg-paper sm:ring-1 sm:ring-line",
          )}
        >
          {tabs.map((tab, index) => {
            const selected = tab === active;
            return (
              <button
                key={tab}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${tab}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(tab)}
                className={cn(
                  "h-11 shrink-0 rounded-full px-5 text-small font-bold whitespace-nowrap transition-colors duration-150",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
                  onDark
                    ? selected
                      ? "bg-kesar text-indigo-900 shadow-soft"
                      : "text-white/85 ring-1 ring-white/25 hover:text-kesar hover:ring-kesar sm:ring-0"
                    : selected
                      ? "bg-indigo text-white shadow-soft"
                      : "text-indigo ring-1 ring-line-strong hover:bg-white sm:ring-0",
                )}
              >
                {tab === "all" ? "All programs" : COURSE_CATEGORY_LABELS[tab]}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* The tabpanel role sits on a wrapper: on the <ul> itself it would
          replace the list role and orphan every <li>. */}
      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
      >
        <ul
          className={cn(
            "mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none]",
            "-mx-5 px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4",
          )}
        >
          {shown.map((course, index) => (
            <li
              key={course.id}
              className="w-[72%] shrink-0 snap-start sm:w-auto"
            >
              <ProgramCard course={course} priority={index < 3} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ProgramCard({ course, priority }: { course: Course; priority: boolean }) {
  const href = `/courses/${course.slug}`;
  const mode = course.mode.join(" · ");
  const duration = isShortDuration(course.duration) ? course.duration : null;

  return (
    <article className="group/card flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white p-3 text-ink shadow-soft transition-shadow duration-200 hover:shadow-soft-hover">
      {/* The poster repeats the title, so it is a duplicate link kept out of the tab order. */}
      <TrackedLink
        href={href}
        event={ANALYTICS_EVENTS.courseView}
        payload={{ course: course.id, location: "programs-poster" }}
        tabIndex={-1}
        aria-hidden
        className="relative block aspect-3/2 overflow-hidden rounded-[0.875rem] bg-paper"
      >
        <Image
          src={course.image.src}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 72vw"
          placeholder={course.image.lqip ? "blur" : "empty"}
          blurDataURL={course.image.lqip}
          className="object-cover transition-transform duration-300 ease-[var(--ease-brand)] group-hover/card:scale-[1.03]"
        />
      </TrackedLink>

      <div className="flex flex-1 flex-col px-2 pt-4 pb-1">
        <p className="w-fit rounded-full bg-kesar-100 px-3 py-1 text-[0.8125rem] font-bold text-kesar-700">
          {COURSE_CATEGORY_LABELS[course.category]}
        </p>
        <h3 className="mt-3 flex gap-2.5 font-display text-h4 leading-tight font-bold text-indigo">
          <span aria-hidden className="mt-1 h-5 w-1 shrink-0 rounded-full bg-kesar" />
          <TrackedLink
            href={href}
            event={ANALYTICS_EVENTS.courseView}
            payload={{ course: course.id, location: "programs-card" }}
            className="underline-offset-4 hover:underline"
          >
            {course.title}
          </TrackedLink>
        </h3>

        {mode || duration ? (
          <ul className="mt-3 space-y-1.5 text-small text-ink-secondary">
            {mode ? (
              <li className="flex items-start gap-2">
                <MonitorPlay aria-hidden className="mt-0.5 size-4 shrink-0 text-kesar-500" strokeWidth={1.75} />
                {mode}
              </li>
            ) : null}
            {duration ? (
              <li className="flex items-start gap-2">
                <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-kesar-500" strokeWidth={1.75} />
                {duration}
              </li>
            ) : null}
          </ul>
        ) : null}

        <div aria-hidden className="min-h-5 flex-1" />
        <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
          <TrackedButtonLink
            href={href}
            event={ANALYTICS_EVENTS.courseCtaClick}
            payload={{ course: course.id, location: "programs-card" }}
            size="sm"
            className="rounded-full px-5 hover:bg-kesar hover:text-indigo-900"
          >
            View details
            <ArrowRight aria-hidden className="size-4" />
          </TrackedButtonLink>
          <BuyCourseButton
            course={course}
            location="home-programs"
            variant="link"
            size="sm"
            className="px-0"
          >
            Enrol now
          </BuyCourseButton>
        </div>
      </div>
    </article>
  );
}
