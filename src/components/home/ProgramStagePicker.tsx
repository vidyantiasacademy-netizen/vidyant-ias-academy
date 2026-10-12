"use client";

import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Laptop,
  PenLine,
  Sprout,
  Target,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState } from "react";

import { BuyCourseButton } from "@/components/checkout/BuyCourseButton";
import { TrackedButtonLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CTA } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";
import type { Course } from "@/types";

type Stage = "foundation" | "prelims" | "mains" | "optional";

/**
 * The four answers to "where are you?", in the student's words. Each row has
 * its own pale wash so the four read apart at a glance; all four are palette
 * tints, never a fifth colour.
 */
const STAGES: Record<
  Stage,
  { icon: LucideIcon; title: string; note: string; wash: string; panel: string }
> = {
  foundation: {
    icon: Sprout,
    title: "Starting out",
    note: "New to UPSC? Build strong fundamentals.",
    wash: "bg-kesar-100",
    panel: "bg-kesar text-indigo-900",
  },
  prelims: {
    icon: Target,
    title: "Prelims prep",
    note: "Strengthen concepts, practice tests and current affairs.",
    wash: "bg-indigo-100",
    panel: "bg-indigo text-white",
  },
  mains: {
    icon: PenLine,
    title: "Mains focus",
    note: "Structured answer writing and evaluation.",
    wash: "bg-chilli-100",
    panel: "bg-chilli text-white",
  },
  optional: {
    icon: BookOpen,
    title: "Optional subject",
    note: "In-depth coverage with expert guidance.",
    wash: "bg-paper",
    panel: "bg-indigo-900 text-kesar",
  },
};

const RUPEES = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/**
 * Phone programmes block (below `md`): ask one question — where are you in
 * your preparation? — then show only the programme for that answer, with its
 * fee and an enrol button. Nothing is recommended until the student picks, so
 * the first screen is four short rows rather than four long cards.
 */
export function ProgramStagePicker({ courses }: { courses: (Course & { category: Stage })[] }) {
  const [picked, setPicked] = useState<Stage | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const course = courses.find((item) => item.category === picked) ?? null;

  function pick(stage: Stage) {
    setPicked(stage);
    // Bring the recommendation into view once it has rendered.
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    );
  }

  return (
    <div className="md:hidden">
      <h2 className="text-h2 leading-tight font-bold text-indigo">
        Where are you in your UPSC journey?
      </h2>
      <p className="mt-2 text-body text-ink-secondary">
        We&rsquo;ll help you find the right path with relevant courses, resources and mentorship.
      </p>

      <div role="radiogroup" aria-label="Your preparation stage" className="mt-5 space-y-2.5">
        {courses.map((item) => {
          const stage = STAGES[item.category];
          const selected = picked === item.category;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => pick(item.category)}
              className={cn(
                "flex min-h-24 w-full cursor-pointer items-stretch border-2 text-left transition-colors duration-150",
                stage.wash,
                selected ? "border-indigo" : "border-transparent",
              )}
            >
              <span
                aria-hidden
                className={cn("flex w-22 shrink-0 items-center justify-center", stage.panel)}
              >
                <stage.icon className="size-9" strokeWidth={1.5} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
                <span className="block text-body-lg font-bold leading-snug text-indigo">{stage.title}</span>
                <span className="mt-0.5 block text-small leading-snug text-ink-secondary">{stage.note}</span>
              </span>
              <span className="flex items-center pr-3">
                {selected ? (
                  <span aria-hidden className="flex size-6 items-center justify-center bg-indigo text-white">
                    <Check className="size-4" strokeWidth={2.5} />
                  </span>
                ) : (
                  <ChevronRight aria-hidden className="size-5 text-indigo" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div ref={resultRef} aria-live="polite" className="scroll-mt-24">
        {course ? (
          <article className="mt-5 border-2 border-indigo border-t-4 border-t-kesar bg-white p-4">
            <p className="text-eyebrow font-bold uppercase text-ink-secondary">Recommended for you</p>
            <h3 className="mt-2 text-h4 font-bold leading-snug text-indigo">{course.title}</h3>
            {course.shortDescription ? (
              <p className="mt-1.5 line-clamp-2 text-small text-ink-secondary">{course.shortDescription}</p>
            ) : null}

            <p className="mt-3 flex flex-wrap gap-1.5 text-small text-ink-secondary">
              {course.duration.length <= 12 ? (
                <span className="inline-flex items-center gap-1.5 bg-paper px-2 py-1">
                  <Clock aria-hidden className="size-3.5" />
                  {course.duration}
                </span>
              ) : null}
              {course.mode.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 bg-paper px-2 py-1">
                  <Laptop aria-hidden className="size-3.5" />
                  {course.mode[0]}
                  {course.mode.length > 1 ? ` +${course.mode.length - 1} more` : ""}
                </span>
              ) : null}
            </p>

            {course.features.length > 0 ? (
              <ul className="mt-3 space-y-1.5">
                {course.features.slice(0, 3).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-small text-ink">
                    <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-kesar-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
              {course.priceInPaise ? (
                <p className="text-h4 font-bold leading-none tabular-nums text-indigo">
                  {RUPEES.format(course.priceInPaise / 100)}
                </p>
              ) : (
                <p className="text-small font-bold leading-snug text-indigo">
                  Fee on a free
                  <br />
                  counselling call
                </p>
              )}
              <BuyCourseButton course={course} location="home-programs-picker" variant="primary">
                Enrol now
              </BuyCourseButton>
            </div>
          </article>
        ) : null}
      </div>

      <TrackedButtonLink
        href={course ? `/courses/${course.slug}` : CTA.courses.href}
        variant="kesar"
        size="lg"
        fullWidth
        className="mt-5"
        event={ANALYTICS_EVENTS.courseCtaClick}
        payload={{ location: "programs-picker", action: course ? course.id : "all-courses" }}
      >
        Show my courses
        <ArrowRight aria-hidden className="size-5" />
      </TrackedButtonLink>
    </div>
  );
}
