import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Play,
  Target,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CTA, EXAM_CYCLE } from "@/lib/constants/site";

const PILLARS: { icon: LucideIcon; label: [string, string] }[] = [
  { icon: BookOpen, label: ["Conceptual", "Clarity"] },
  { icon: Users, label: ["Small", "Batches"] },
  { icon: UserCheck, label: ["Personal", "Mentorship"] },
  { icon: ChartNoAxesColumnIncreasing, label: ["Rigorous", "Practice"] },
  { icon: Target, label: ["Continuous", "Improvement"] },
];

/**
 * Homepage hero. Copy on the left over warm cream, the photograph on the
 * right fading into it, and a saffron-and-navy wave closing the band.
 *
 * - Exam badge, a serif headline whose last words are set in saffron italic
 *   with a hand-drawn swoosh, one line of promise.
 * - Two actions: explore courses (primary) and book a free demo class.
 * - Five pillars of the programme, one icon each.
 *
 * Phones stack the photograph under the copy; from `lg` it sits behind the
 * right half, full height.
 */
export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-cream">
      {/* Desktop: photograph on the right half, fading into the cream. */}
      <div aria-hidden className="absolute inset-y-0 right-0 -z-10 hidden w-[58%] lg:block">
        <Image
          src="/images/hero-lbsnaa.jpg"
          alt=""
          fill
          sizes="58vw"
          loading="eager"
          fetchPriority="high"
          className="object-cover object-[70%_center]"
        />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-cream via-cream/70 to-cream/0" />
      </div>

      <Container>
        <div className="pt-8 pb-10 md:pt-12 lg:max-w-[46rem] lg:pt-16 lg:pb-28 xl:max-w-[50rem] short:pt-8 short:pb-20">
          <div className="reveal">
            {/* Exam badge: a saffron rule, then the pill. */}
            <div className="flex items-center gap-4">
              <span aria-hidden className="h-12 w-0.5 bg-logo-saffron" />
              <p className="inline-flex items-center gap-2.5 rounded-md bg-kesar-100 px-4 py-2 text-small font-semibold text-logo-navy md:text-body">
                <CalendarDays aria-hidden className="size-5 shrink-0" />
                UPSC Civil Services Examination {EXAM_CYCLE.year}
              </p>
            </div>

            <h1 className="mt-6 font-display text-[2.5rem] leading-[1.05] tracking-[-0.01em] text-logo-navy sm:text-[3.25rem] xl:text-[4rem] short:text-[3.25rem]">
              Your UPSC Preparation Deserves the{" "}
              <span className="relative inline-block italic text-logo-saffron-600">
                Right Direction.
                {/* Swoosh under the accent words. */}
                <svg
                  aria-hidden
                  viewBox="0 0 300 16"
                  preserveAspectRatio="none"
                  className="absolute -bottom-2 left-[22%] h-3 w-[70%] text-logo-saffron-600"
                >
                  <path
                    d="M2 13 C 80 2, 200 0, 298 9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-7 max-w-[48ch] text-body text-ink md:text-body-lg">
              Concept-driven learning. Focused practice. Personal mentorship.
              A clearer path to {EXAM_CYCLE.label}.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-6">
              <TrackedLink
                href={CTA.courses.href}
                event={ANALYTICS_EVENTS.courseCtaClick}
                payload={{ location: "home-hero", action: "explore-courses" }}
                className="inline-flex h-14 items-center justify-center gap-3 rounded-md bg-logo-saffron-600 px-8 text-body font-semibold text-white transition-colors hover:bg-logo-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
              >
                {CTA.courses.label}
                <ArrowRight aria-hidden className="size-5" />
              </TrackedLink>
              <TrackedLink
                href={CTA.demo.href}
                event={ANALYTICS_EVENTS.demoClick}
                payload={{ location: "home-hero", action: "book-demo" }}
                className="inline-flex h-14 items-center justify-center gap-3 rounded-md border-2 border-logo-navy bg-white/60 px-8 text-body font-semibold text-logo-navy transition-colors hover:bg-logo-navy hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
              >
                <Play aria-hidden className="size-5 fill-current" />
                Book a Free Demo Class
              </TrackedLink>
            </div>

            <ul className="mt-10 grid grid-cols-3 gap-y-6 sm:grid-cols-5 lg:mt-12">
              {PILLARS.map(({ icon: Icon, label }, i) => (
                <li
                  key={label.join(" ")}
                  className={
                    "flex flex-col items-center gap-2 px-2 text-center" +
                    (i > 0 ? " sm:border-l sm:border-line-strong" : "")
                  }
                >
                  <Icon aria-hidden strokeWidth={1.75} className="size-9 text-logo-saffron-600" />
                  <span className="text-small font-semibold leading-tight text-logo-navy">
                    {label[0]}
                    <br />
                    {label[1]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* Phones and tablets: the photograph under the copy. */}
      <div className="relative aspect-[16/10] lg:hidden">
        <Image
          src="/images/hero-lbsnaa.jpg"
          alt=""
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className="object-cover object-[75%_center]"
        />
        <div aria-hidden className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-cream to-cream/0" />
      </div>

      {/* Saffron sweep over a navy wave, closing the band. */}
      <svg
        aria-hidden
        viewBox="0 0 1600 120"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-12 w-full md:h-20 lg:h-24"
      >
        <path d="M0 40 C 400 120, 1000 120, 1600 30 L1600 120 L0 120 Z" className="fill-logo-saffron" />
        <path d="M0 62 C 420 132, 1000 130, 1600 52 L1600 120 L0 120 Z" className="fill-logo-navy" />
      </svg>
    </section>
  );
}
