"use client";

import {
  ArrowRight,
  BookOpen,
  Briefcase,
  ChevronRight,
  Download,
  ListChecks,
  PenLine,
  PhoneCall,
  Sprout,
  Target,
  type LucideIcon,
} from "lucide-react";
import { useId } from "react";

import { TrackedButtonLink, TrackedLink } from "@/components/ui/TrackedLink";
import { track } from "@/lib/analytics";
import { ANALYTICS_EVENTS, type AnalyticsEvent } from "@/lib/analytics/events";
import { CTA, ROUTES } from "@/lib/constants/site";
import { COURSE_CATEGORY_LABELS } from "@/lib/courses/labels";
import { recommendCourse, setPrepStage, usePrepStage, type StageId } from "@/lib/prep-stage";
import { cn } from "@/lib/utils/cn";
import type { Course } from "@/types";

interface Stage {
  id: StageId;
  label: string;
  icon: LucideIcon;
  /** One line in the student's voice: where to start. */
  note: string;
  /** The free first step for this stage. */
  secondary: { label: string; href: string; icon: LucideIcon; event: AnalyticsEvent };
}

const STAGES: Stage[] = [
  {
    id: "starting",
    label: "Just starting",
    icon: Sprout,
    note: "Start with Foundation: the whole syllabus in order, and a mentor from day one.",
    secondary: {
      label: "Read the UPSC guide",
      href: ROUTES.upscGuide,
      icon: BookOpen,
      event: ANALYTICS_EVENTS.guideClick,
    },
  },
  {
    id: "working",
    label: "Working professional",
    icon: Briefcase,
    note: "Prepare around your job. A counsellor helps you pick the batch and mode that fit.",
    secondary: {
      label: "Talk to a counsellor",
      href: CTA.counselling.href,
      icon: PhoneCall,
      event: ANALYTICS_EVENTS.counsellingClick,
    },
  },
  {
    id: "prelims",
    label: "Prelims next",
    icon: Target,
    note: "Take a timed mock to see where you stand, then close the gaps.",
    secondary: {
      label: "Take a free mock test",
      href: CTA.mockTest.href,
      icon: ListChecks,
      event: ANALYTICS_EVENTS.mockTestClick,
    },
  },
  {
    id: "mains",
    label: "Mains next",
    icon: PenLine,
    note: "Write answers, get them evaluated, and get guidance on your optional.",
    secondary: {
      label: "Talk to a counsellor",
      href: CTA.counselling.href,
      icon: PhoneCall,
      event: ANALYTICS_EVENTS.counsellingClick,
    },
  },
];

/**
 * "Where are you right now?" — one tap that turns the hero into a next step
 * for this student: a one-line plan, the programme that fits, and a free
 * thing to do first. The pick is shared (`lib/prep-stage`), so the Programs
 * shelf below opens on the same stage and the hero form pre-selects the
 * programme. Before a pick the actions are the general ones.
 */
export function PrepStagePicker({ courses }: { courses: Course[] }) {
  const stageId = usePrepStage();
  const labelId = useId();

  function choose(id: StageId) {
    setPrepStage(id);
    track(ANALYTICS_EVENTS.prepStageSelect, { location: "home-hero", stage: id });
  }

  const stage = STAGES.find((s) => s.id === stageId) ?? null;
  const pick = stage ? recommendCourse(stage.id, courses) : null;
  const payload = { location: "home-hero", stage: stage?.id ?? "none" };

  const primary = pick
    ? {
        href: `${ROUTES.courses}/${pick.course.slug}`,
        label: `See the ${COURSE_CATEGORY_LABELS[pick.category]} programme`,
        event: ANALYTICS_EVENTS.courseCtaClick,
        payload: { ...payload, action: "stage-course", course: pick.course.slug },
      }
    : {
        href: "#programs",
        label: "See courses & fees",
        event: ANALYTICS_EVENTS.enrolClick,
        payload: { ...payload, action: "enrol" },
      };

  const SecondaryIcon = stage?.secondary.icon ?? Download;
  const secondary = stage
    ? { ...stage.secondary, payload: { ...payload, action: "stage-secondary" } }
    : {
        label: CTA.brochure.label,
        href: CTA.brochure.href,
        event: ANALYTICS_EVENTS.brochureClick,
        payload: { ...payload, action: "brochure" },
      };

  return (
    <div className="mt-5 md:mt-6 short:mt-4">
      <p id={labelId} className="text-small font-bold text-indigo">
        Where are you right now?
      </p>
      <div
        role="group"
        aria-labelledby={labelId}
        className="mt-2.5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
      >
        {STAGES.map(({ id, label, icon: Icon }) => {
          const selected = id === stageId;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              onClick={() => choose(id)}
              className={cn(
                "flex min-h-11 items-center gap-2 border-2 px-3 text-left text-small font-bold transition-colors duration-150 sm:whitespace-nowrap",
                selected
                  ? "border-indigo bg-indigo text-white"
                  : "border-line-strong bg-white/90 text-indigo hover:border-indigo",
              )}
            >
              <Icon
                aria-hidden
                className={cn("size-4.5 shrink-0", selected ? "text-kesar" : "text-kesar-600")}
              />
              {label}
            </button>
          );
        })}
      </div>
      {/* Live, so a screen reader hears the plan change with the pick. */}
      <p
        aria-live="polite"
        className="mt-3 min-h-[2.75rem] max-w-xl text-small text-ink-secondary sm:min-h-0 md:text-body"
      >
        {stage ? (
          <>
            <span className="font-bold text-indigo">Your next step: </span>
            {stage.note}
          </>
        ) : (
          "Pick one. We'll show you where to start."
        )}
      </p>

      {/* Phones: one dominant action, the free step as the quiet second. */}
      <div className="mt-4 md:hidden">
        <TrackedButtonLink
          href={primary.href}
          variant="kesar"
          size="lg"
          fullWidth
          event={primary.event}
          payload={primary.payload}
        >
          {pick ? primary.label : "Explore courses"}
          <ArrowRight aria-hidden className="size-5" />
        </TrackedButtonLink>
        <TrackedLink
          href={stage ? secondary.href : CTA.counselling.href}
          event={stage ? secondary.event : ANALYTICS_EVENTS.counsellingClick}
          payload={stage ? secondary.payload : { ...payload, action: "counselling" }}
          className="mt-1 flex min-h-11 items-center justify-center gap-1 text-small font-bold text-indigo underline decoration-line-strong decoration-2 underline-offset-4"
        >
          {stage ? secondary.label : "Free counselling"}
          <ChevronRight aria-hidden className="size-4" />
        </TrackedLink>
      </div>

      <div className="mt-5 hidden flex-wrap gap-3 md:flex short:mt-3 [&>a]:whitespace-nowrap">
        <TrackedButtonLink
          href={primary.href}
          variant="kesar"
          size="lg"
          event={primary.event}
          payload={primary.payload}
        >
          {primary.label}
          <ArrowRight aria-hidden className="size-5" />
        </TrackedButtonLink>
        <TrackedButtonLink
          href={secondary.href}
          variant="secondary"
          size="lg"
          event={secondary.event}
          payload={secondary.payload}
        >
          <SecondaryIcon aria-hidden className="size-5" />
          {secondary.label}
        </TrackedButtonLink>
      </div>
    </div>
  );
}
