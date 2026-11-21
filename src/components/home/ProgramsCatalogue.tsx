"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calculator,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  FileCheck2,
  History,
  Layers,
  Lightbulb,
  Link2,
  ListChecks,
  MessageSquareText,
  MonitorPlay,
  Newspaper,
  PenLine,
  Scale,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  UserRoundCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
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

/**
 * The homepage programme shelf: category tabs over a grid of typographic
 * programme cards — name, how it is taught, three highlights, and the two
 * ways forward: read the details, or enrol. Phones get the same cards in a
 * single column.
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
            // Phones stack the cards inside the page gutter; a sideways row
            // left the first card flush with the screen edge.
            "mt-6 grid gap-4 sm:mt-7 sm:grid-cols-2 sm:gap-5 xl:gap-6",
            // Two across up to four cards (a 2×2 reads better than 3+1);
            // three across only once there are five or more, or exactly three.
            (shown.length === 3 || shown.length >= 5) && "xl:grid-cols-3",
          )}
        >
          {shown.map((course) => (
            <li key={course.id}>
              <ProgramCard course={course} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** One line in the card's own voice, per stage. Course copy can override it later. */
const TAGLINES: Record<CourseCategory, string> = {
  foundation: "Build a strong foundation.",
  prelims: "Revise smart. Attempt with confidence.",
  mains: "Write better. Get evaluated.",
  optional: "Depth in the subject you chose.",
  "test-series": "Practise with precision. Learn from every test.",
};

/** Short labels for the mode pill; the full ones live on the course page. */
const MODE_SHORT: Record<string, string> = {
  "Classroom (Pune)": "Classroom",
  "Live online": "Live online",
  "Recorded access": "Recorded",
  "Hybrid (classroom + online)": "Hybrid",
};

/** Most specific first: "CSAT tests" is about CSAT before it is about tests. */
const HIGHLIGHT_ICONS: [RegExp, LucideIcon][] = [
  [/coverage/, Layers],
  [/linkage/, Link2],
  [/monthly|revision/, CalendarCheck],
  [/study plan|personalised|personalized/, UserRoundCheck],
  [/progress|tracking/, TrendingUp],
  [/doubt/, MessageSquareText],
  [/pattern/, Target],
  [/current affairs/, Newspaper],
  [/csat/, Calculator],
  [/pyq|previous/, History],
  [/mentor|one-to-one/, Users],
  [/analysis|performance/, BarChart3],
  [/solution|explanation|discussion/, Lightbulb],
  [/evaluat|feedback/, FileCheck2],
  [/writing|essay/, PenLine],
  [/ethics/, Scale],
  [/full-length|mock/, Timer],
  [/sectional/, ListChecks],
  [/test/, ClipboardCheck],
  [/mains/, PenLine],
  [/prelims/, BarChart3],
  [/gs|syllabus|foundation|core/, BookOpen],
];

/** Spares, so three highlights never share an icon. */
const SPARE_ICONS: LucideIcon[] = [Target, Layers, Sparkles, BookOpen];

/** Icons for a card's highlights, by what each is about, with no repeats. */
function highlightIcons(labels: string[]): LucideIcon[] {
  const used = new Set<LucideIcon>();

  return labels.map((label) => {
    const text = label.toLowerCase();
    const match = HIGHLIGHT_ICONS.find(([pattern, icon]) => pattern.test(text) && !used.has(icon))?.[1];
    const icon = match ?? SPARE_ICONS.find((spare) => !used.has(spare)) ?? Sparkles;
    used.add(icon);
    return icon;
  });
}

/**
 * A programme as a typographic card: what it is, how it is taught, what it
 * centres on, and the two ways forward. Every figure on it comes from the
 * course record — modes, module count, highlights — never a made-up date or
 * test count.
 */
function ProgramCard({ course }: { course: Course }) {
  const href = `/courses/${course.slug}`;
  // Sanity's card lines win; the course data fills anything left blank.
  const modes = course.card.format
    ? course.card.format.split("|").map((part) => part.trim()).filter(Boolean)
    : course.mode.map((mode) => MODE_SHORT[mode] ?? mode);
  const modules = course.curriculum.length;
  const keyFact =
    course.card.keyFact ?? (modules > 0 ? `${modules} ${modules === 1 ? "module" : "modules"}` : null);
  // A date span or "every step" reads as time; a count reads as a stack.
  const KeyFactIcon = keyFact && /\b(19|20)\d{2}\b|step|month|week/i.test(keyFact) ? CalendarDays : Layers;
  const highlights = course.features.slice(0, 3);
  const icons = highlightIcons(highlights);
  const tagline = course.card.tagline ?? TAGLINES[course.category];

  return (
    <article className="group/card relative flex h-full flex-col rounded-[1.25rem] bg-paper p-5 text-ink shadow-soft ring-1 ring-white/10 transition-shadow duration-200 hover:shadow-soft-hover sm:p-6">
      {/* Category on the left, the exam it prepares for on the right. */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-eyebrow font-bold uppercase text-kesar-600">
          {COURSE_CATEGORY_LABELS[course.category]}
        </p>
        <p className="flex shrink-0 items-center gap-2 text-eyebrow font-bold tracking-[0.1em] text-indigo uppercase sm:tracking-[0.14em]">
          <span aria-hidden className="h-3.5 w-1 rounded-full bg-kesar" />
          UPSC CSE
        </p>
      </div>

      <h3 className="mt-3 font-display text-h4 leading-[1.15] font-bold text-indigo text-balance sm:mt-4 sm:text-h3 sm:leading-[1.1]">
        <TrackedLink
          href={href}
          event={ANALYTICS_EVENTS.courseView}
          payload={{ course: course.id, location: "programs-card" }}
          className="underline-offset-4 outline-none after:absolute after:inset-0 after:rounded-[1.25rem] hover:underline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--focus-ring)]"
        >
          {course.title}
        </TrackedLink>
        {course.card.badge ? (
          <span className="ml-2 inline-block translate-y-[-0.12em] rounded-md bg-kesar px-2 py-0.5 align-middle font-sans text-[0.8125rem] leading-snug font-bold text-white tabular-nums sm:text-small">
            {course.card.badge}
          </span>
        ) : null}
      </h3>
      <p className="mt-2 font-display text-body text-ink-secondary italic">{tagline}</p>

      {/* How it is taught, and how much of it there is. */}
      <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5">
        {modes.length > 0 ? (
          <p className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-indigo px-3 py-1.5 text-[0.8125rem] font-semibold whitespace-nowrap text-white min-[400px]:gap-2 min-[400px]:px-3.5">
            {/* Dropped on the narrowest phones, so three modes still fit on one line. */}
            <MonitorPlay aria-hidden className="size-4 shrink-0 text-kesar max-[399px]:hidden" strokeWidth={1.75} />
            <span className="sr-only">Taught: </span>
            {modes.map((mode, index) => (
              <span key={mode} className="flex items-center gap-1.5 min-[400px]:gap-2">
                {index > 0 ? <span aria-hidden className="h-3 w-px bg-white/35" /> : null}
                {mode}
              </span>
            ))}
          </p>
        ) : null}
        {keyFact ? (
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[0.8125rem] font-semibold whitespace-nowrap text-indigo ring-1 ring-kesar/60">
            <KeyFactIcon aria-hidden className="size-4 shrink-0 text-kesar-500" strokeWidth={1.75} />
            {keyFact}
          </p>
        ) : null}
      </div>

      {highlights.length > 0 ? (
        <ul
          aria-label="Highlights"
          className="mt-5 grid grid-cols-3 divide-x divide-line border-y border-line py-4 sm:mt-6"
        >
          {highlights.map((highlight, index) => {
            const Icon = icons[index] ?? Sparkles;
            return (
              <li key={highlight} className="flex flex-col items-center gap-2 px-1.5 text-center sm:px-2">
                <Icon aria-hidden className="size-6 text-kesar-500" strokeWidth={1.6} />
                <span className="text-[0.8125rem] leading-snug font-semibold text-indigo">
                  {highlight}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div aria-hidden className="min-h-5 flex-1" />

      {/* Above the card-wide link, so both stay clickable. */}
      <div className="relative z-10 grid grid-cols-2 gap-2.5">
        <TrackedButtonLink
          href={href}
          event={ANALYTICS_EVENTS.courseCtaClick}
          payload={{ course: course.id, location: "programs-card" }}
          size="sm"
          className="rounded-full px-4"
        >
          View details
          <ArrowRight aria-hidden className="size-4 transition-transform duration-150 group-hover/card:translate-x-0.5" />
        </TrackedButtonLink>
        <BuyCourseButton
          course={course}
          location="home-programs"
          variant="kesar"
          size="sm"
          className="rounded-full px-4"
        >
          Enrol now
        </BuyCourseButton>
      </div>
    </article>
  );
}
