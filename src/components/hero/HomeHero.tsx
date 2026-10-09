import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Compass,
  PenLine,
  Sprout,
  Target,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

import Link from "@/i18n/Link";
import { HeroActions } from "@/components/hero/HeroActions";
import { WhatsNewPanel } from "@/components/hero/WhatsNewPanel";
import { Container } from "@/components/ui/Container";
import { BRAND, EXAM_CYCLE, ROUTES } from "@/lib/constants/site";
import { firstPerCategory } from "@/lib/courses/catalogue";
import { COURSE_CATEGORY_LABELS } from "@/lib/courses/labels";
import type { Course, CourseCategory } from "@/types";

/** One icon and one plain line per stage, so a student can find theirs at a glance. */
const PATH_DETAILS: Record<CourseCategory | "mentorship", { icon: LucideIcon; hint: string }> = {
  foundation: { icon: Sprout, hint: "Starting from zero" },
  prelims: { icon: Target, hint: "MCQs, CSAT and PYQs" },
  mains: { icon: PenLine, hint: "Answer writing, evaluated" },
  optional: { icon: BookOpen, hint: "Subject-wise preparation" },
  "test-series": { icon: ClipboardCheck, hint: "Timed tests with analysis" },
  mentorship: { icon: Compass, hint: "A mentor for your plan" },
};

/**
 * Programme shortcuts under the banner — every one is a real route. One per
 * stage: two test series would otherwise put the same label on the row twice.
 */
function heroPaths(courses: Course[]) {
  return [
    ...firstPerCategory(courses).map((course) => ({
      label: COURSE_CATEGORY_LABELS[course.category],
      href: `${ROUTES.courses}/${course.slug}`,
      ...PATH_DETAILS[course.category],
    })),
    { label: "Mentorship", href: `${ROUTES.home}#mentorship`, ...PATH_DETAILS.mentorship },
  ];
}

/**
 * Homepage hero: the institute banner on the left, the "What's new" panel on
 * the right, three action tiles beneath them, then the programme picker. No
 * visible headline above the fold — the banner carries the message.
 *
 * The surface is light on purpose — white card on warm ivory, indigo type,
 * kesar used once per element. No gradients, glows or grid overlays: on a
 * light hero, restraint is what reads as elegant, and the two white cards
 * carry the whole composition.
 */
export function HomeHero({ courses }: { courses: Course[] }) {
  return (
    <section className="border-b border-line bg-[linear-gradient(to_bottom,#ffffff_0%,var(--color-paper)_100%)]">
      <Container size="wide">
        {/* Banner and "What's new" share one row from lg and stretch to the
            same height. */}
        <div className="grid gap-6 pt-6 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-stretch lg:gap-8 xl:grid-cols-[minmax(0,1fr)_26rem] 2xl:grid-cols-[minmax(0,1fr)_30rem]">
          <div className="reveal">
            {/* Visually the hero is image, form and programmes only; the
                heading stays for search engines and screen readers. */}
            <h1 className="sr-only">
              UPSC coaching in {BRAND.city}, built around mentorship.
            </h1>

            {/* The banner is the LCP element on the homepage, so it loads
                eagerly at high priority. The file name is capitalised on disk;
                keep the casing — production file systems are case-sensitive. */}
            <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
              <Image
                src="/images/Banner.png"
                alt={`${BRAND.name} UPSC coaching classes — expert faculty, personalised attention, doubt-clearing sessions and regular tests with progress tracking.`}
                width={3780}
                height={1890}
                sizes="(min-width: 1280px) 60vw, 100vw"
                loading="eager"
                fetchPriority="high"
                className="h-auto w-full"
              />
            </div>
          </div>

          <div className="reveal reveal-delay-2 h-full">
            <WhatsNewPanel />
          </div>
        </div>

        <div className="reveal reveal-delay-3 pb-10 pt-6 lg:pt-8">
          <HeroActions />
        </div>

        {/* Programme picker, neubrutalist in brand colours: indigo outlines
            with a hard offset shadow that turns kesar on hover and presses
            flat on tap — tactile, loud, and still four colours only. */}
        <nav
          aria-labelledby="hero-programmes"
          className="border-t border-line pb-14 pt-8 lg:pb-16 lg:pt-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h2
                id="hero-programmes"
                className="text-h2 font-bold tracking-tight text-indigo lg:text-h3-lg"
              >
                Pick{" "}
                <span className="-mx-1 rounded-sm bg-kesar/35 px-1">your stage.</span>
              </h2>
              <p className="-rotate-2 rounded-md border-2 border-indigo bg-white px-2.5 py-1 text-eyebrow font-bold uppercase text-indigo shadow-[2px_2px_0_0_var(--color-indigo)]">
                {EXAM_CYCLE.label} programmes
              </p>
            </div>
            <Link
              href={ROUTES.courses}
              className="group inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-indigo bg-white px-5 text-body font-semibold text-indigo shadow-[3px_3px_0_0_var(--color-indigo)] transition-[transform,box-shadow] duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_0_var(--color-indigo)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              Compare all
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-200 ease-[var(--ease-brand)] group-hover:translate-x-1"
              />
            </Link>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:mt-5 xl:grid-cols-6">
            {heroPaths(courses).map(({ label, href, icon: Icon, hint }, i) => (
              <li key={href} className="reveal" style={{ animationDelay: `${i * 60}ms` }}>
                <Link
                  href={href}
                  className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border-2 border-indigo bg-white p-4 shadow-[5px_5px_0_0_var(--color-indigo)] transition-[transform,box-shadow,background-color] duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-kesar-100 hover:shadow-[7px_7px_0_0_var(--color-kesar)] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none sm:p-5 lg:p-4"
                >
                  {/* Oversized stage number — texture, not information. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-3 -right-1 select-none text-[4.5rem] font-black leading-none tracking-tighter text-indigo-100 transition-colors duration-150 group-hover:text-kesar/40"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {i === 0 ? (
                    <span className="absolute right-3 top-3 -rotate-6 rounded-md border-2 border-indigo bg-kesar px-2 py-0.5 text-eyebrow font-bold uppercase text-indigo-900 shadow-[2px_2px_0_0_var(--color-indigo)]">
                      Start here
                    </span>
                  ) : null}

                  <span className="relative flex size-12 items-center justify-center rounded-lg border-2 border-indigo bg-indigo-gradient lg:size-10 text-white transition-transform duration-200 ease-[var(--ease-brand)] group-hover:-rotate-6">
                    <Icon aria-hidden className="size-6" />
                  </span>

                  <span className="relative mt-4 inline-flex items-center gap-1.5 lg:mt-3 text-h4 font-bold leading-tight text-indigo">
                    {label}
                    <ArrowRight
                      aria-hidden
                      className="size-5 shrink-0 transition-transform duration-200 ease-[var(--ease-brand)] group-hover:translate-x-1"
                    />
                  </span>
                  <span className="relative mt-1.5 text-small font-medium text-ink-secondary">
                    {hint}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </section>
  );
}
