"use client";

import { ArrowRight } from "lucide-react";
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
export function ProgramsCatalogue({ courses }: { courses: Course[] }) {
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
          className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
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
                  "h-10 shrink-0 border-2 px-4 text-small font-bold whitespace-nowrap transition-colors duration-150",
                  selected
                    ? "border-indigo bg-indigo text-white"
                    : "border-line-strong bg-white text-indigo hover:border-indigo",
                )}
              >
                {tab === "all" ? "All programs" : COURSE_CATEGORY_LABELS[tab]}
              </button>
            );
          })}
        </div>
      ) : null}

      <ul
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        className={cn(
          "mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none]",
          "-mx-5 px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4",
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
  );
}

function ProgramCard({ course, priority }: { course: Course; priority: boolean }) {
  const href = `/courses/${course.slug}`;
  const meta = [
    course.mode.join(" · "),
    isShortDuration(course.duration) ? course.duration : null,
  ].filter(Boolean);

  return (
    <article className="group/card flex h-full flex-col border border-line-strong bg-white transition-colors duration-150 hover:border-indigo">
      {/* The poster repeats the title, so it is a duplicate link kept out of the tab order. */}
      <TrackedLink
        href={href}
        event={ANALYTICS_EVENTS.courseView}
        payload={{ course: course.id, location: "programs-poster" }}
        tabIndex={-1}
        aria-hidden
        className="relative block aspect-3/2 overflow-hidden border-b border-line bg-paper"
      >
        <Image
          src={course.image.src}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 72vw"
          placeholder={course.image.lqip ? "blur" : "empty"}
          blurDataURL={course.image.lqip}
          className="object-cover transition-transform duration-300 ease-[var(--ease-brand)] group-hover/card:scale-[1.02]"
        />
      </TrackedLink>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-eyebrow font-bold uppercase text-kesar-600">
          {COURSE_CATEGORY_LABELS[course.category]}
        </p>
        <h3 className="mt-1.5 text-[1.1875rem] font-bold leading-snug tracking-[-0.01em] text-indigo">
          <TrackedLink
            href={href}
            event={ANALYTICS_EVENTS.courseView}
            payload={{ course: course.id, location: "programs-card" }}
            className="hover:underline underline-offset-4"
          >
            {course.title}
          </TrackedLink>
        </h3>
        {meta.length > 0 ? (
          <p className="mt-1 text-small text-ink-secondary">{meta.join(" · ")}</p>
        ) : null}

        <div className="mt-auto flex flex-col gap-1.5 pt-4">
          <TrackedButtonLink
            href={href}
            event={ANALYTICS_EVENTS.courseCtaClick}
            payload={{ course: course.id, location: "programs-card" }}
            variant="secondary"
            size="sm"
            fullWidth
          >
            View course details
            <ArrowRight aria-hidden className="size-4" />
          </TrackedButtonLink>
          <BuyCourseButton course={course} location="home-programs" variant="link" size="sm" fullWidth>
            Enrol now
          </BuyCourseButton>
        </div>
      </div>
    </article>
  );
}
