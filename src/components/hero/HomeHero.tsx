import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  ClipboardPenLine,
  Play,
  Target,
  UserRoundCheck,
} from "lucide-react";
import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { TrackedButtonLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CTA, EXAM_CYCLE } from "@/lib/constants/site";

/**
 * What the institute does, in five words-and-an-icon. Every item is backed by
 * `BRAND.usp` (concept-led classes, fixed test calendar, Mains answer
 * evaluation, one mentor tracking progress) — no unverified claims here.
 */
const PILLARS = [
  { icon: BookOpen, label: ["Conceptual", "Clarity"] },
  { icon: ClipboardPenLine, label: ["Answer", "Evaluation"] },
  { icon: UserRoundCheck, label: ["Personal", "Mentorship"] },
  { icon: ChartNoAxesColumnIncreasing, label: ["Rigorous", "Practice"] },
  { icon: Target, label: ["Continuous", "Improvement"] },
] as const;

/**
 * Homepage hero. A full-bleed photograph (the hills, the academy and the
 * Constitution on the ledge) with a cream wash on the left that holds the
 * copy:
 *
 * - exam pill (kesar rule + calendar),
 * - serif headline whose last words, "Right Direction.", are italic kesar
 *   with a pen-stroke swoosh underneath,
 * - one line of promise,
 * - "Explore Courses" (kesar) + "Book a Free Demo Class" (outline),
 * - five pillars of the programme, divided by hairlines.
 *
 * A navy wave with a kesar edge closes the section.
 *
 * The wash runs solid → clear left to right from `lg`; below that it covers
 * the photo top → bottom so the copy stays legible on phones and the photo
 * shows under the pillars.
 */
export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-paper lg:flex lg:min-h-[calc(100svh-9.5rem)] lg:max-h-[52rem] lg:items-center">
      <Container className="w-full">
        <div className="pt-8 pb-56 md:pt-12 md:pb-28 lg:max-w-[46rem] lg:py-14 xl:max-w-[50rem] short:py-8">
          {/* Exam pill */}
          <div className="reveal flex items-center gap-3">
            <span aria-hidden className="h-10 w-0.5 shrink-0 bg-kesar" />
            <p className="inline-flex min-h-10 items-center gap-2 rounded-[0.375rem] bg-kesar-100 px-3 text-small font-semibold text-indigo md:text-body">
              <CalendarDays aria-hidden className="size-5 shrink-0" />
              UPSC Civil Services Examination {EXAM_CYCLE.year}
            </p>
          </div>

          <h1 className="reveal mt-6 font-display text-[2.375rem] font-bold leading-[1.08] tracking-[-0.015em] text-indigo md:text-[3.25rem] xl:text-[4rem] short:text-[3rem]">
            Your UPSC Preparation Deserves the{" "}
            <span className="relative inline-block whitespace-nowrap pb-[0.12em] italic text-kesar-500">
              Right Direction.
              {/* Pen-stroke swoosh: thin at the start, swelling to the right. */}
              <svg
                aria-hidden
                viewBox="0 0 300 18"
                preserveAspectRatio="none"
                className="absolute -bottom-[0.06em] right-0 h-[0.3em] w-[80%] text-kesar"
              >
                <path
                  d="M2 15 C 70 4, 180 0, 298 7 C 190 5, 90 9, 2 15 Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </h1>

          <p className="reveal mt-5 max-w-[50ch] text-body text-ink-secondary md:text-body-lg">
            Concept-driven learning. Focused practice. Personal mentorship.
            <br className="hidden sm:inline" /> A clearer path to {EXAM_CYCLE.label}.
          </p>

          <div className="reveal mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <TrackedButtonLink
              href={CTA.courses.href}
              event={ANALYTICS_EVENTS.courseCtaClick}
              payload={{ location: "home-hero", action: "explore-courses" }}
              variant="kesar"
              size="lg"
              className="rounded-[0.375rem] sm:min-w-56"
            >
              {CTA.courses.label}
              <ArrowRight aria-hidden className="size-5" />
            </TrackedButtonLink>
            <TrackedButtonLink
              href={CTA.demo.href}
              event={ANALYTICS_EVENTS.demoClick}
              payload={{ location: "home-hero" }}
              variant="secondary"
              size="lg"
              className="rounded-[0.375rem]"
            >
              <Play aria-hidden className="size-4 fill-current" />
              Book a Free Demo Class
            </TrackedButtonLink>
          </div>

          <ul className="reveal mt-9 grid grid-cols-3 gap-y-5 sm:grid-cols-5 sm:divide-x sm:divide-line-strong short:mt-6">
            {PILLARS.map(({ icon: Icon, label }) => (
              <li key={label.join(" ")} className="flex flex-col items-center gap-2 px-2 text-center">
                <Icon aria-hidden strokeWidth={1.75} className="size-8 text-kesar-600 md:size-9" />
                <span className="text-small font-semibold leading-tight text-indigo">
                  {label[0]}
                  <br />
                  {label[1]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      {/* The photograph is the LCP element on the homepage, so it loads
          eagerly at high priority. Full-bleed behind the copy at every width. */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/images/hero-hills-constitution.png"
          alt=""
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className="object-cover object-[80%_center] md:object-[72%_center]"
        />
      </div>
      {/* Phones and tablets: cream, solid behind the copy, clearing towards
          the bottom so the photo shows under the pillars. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-b from-paper from-55% via-paper/80 via-72% to-paper/0 to-92% md:from-60% md:via-paper/85 lg:hidden"
      />
      {/* Desktop: cream left → clear right, the way the photo was framed. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden bg-linear-to-r from-paper from-38% via-paper/85 via-55% to-paper/0 to-75% lg:block"
      />

      {/* Navy wave with a kesar edge closing the section. */}
      <svg
        aria-hidden
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-10 w-full md:h-16 lg:h-20"
      >
        <path
          d="M0 34 C 360 92, 900 96, 1440 22 L1440 40 C 900 104, 360 98, 0 52 Z"
          className="fill-kesar"
        />
        <path
          d="M0 52 C 360 98, 900 104, 1440 40 L1440 90 L0 90 Z"
          className="fill-indigo"
        />
      </svg>
    </section>
  );
}
