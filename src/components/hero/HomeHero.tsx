import { ChevronRight, Megaphone } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";

import { HeroToday, HeroTodayFallback } from "@/components/hero/HeroToday";
import { PrepStagePicker } from "@/components/hero/PrepStagePicker";
import { Container } from "@/components/ui/Container";
import { TrackedLink } from "@/components/ui/TrackedLink";
import type { Locale } from "@/i18n/config";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { BRAND, CTA, EXAM_CYCLE } from "@/lib/constants/site";
import type { Course } from "@/types";

/**
 * Homepage hero, built to give before it asks. One row on a 12-column grid
 * over a full-bleed photograph, sized on desktop to the screen under the
 * header so the whole offer is visible without scrolling:
 *
 * - Left: admissions pill, headline, one line of promise, then "Where are you
 *   in your preparation?" — a one-tap stage picker that swaps the actions for
 *   the programme and the free first step that fit that student
 *   (`PrepStagePicker`).
 * - Right: the photograph, clear. No lead form here: the hero gives first;
 *   the callback form waits under Programs (`ProgrammeAdviceSection`), once
 *   the student has seen what is on offer.
 * - Foot: the "Today" strip — the latest current affairs, an open mock test,
 *   the previous-year paper library (`HeroToday`). It streams in, so the
 *   photograph and headline are never held up by a CMS or Firestore call.
 *
 * A white wash runs from near-solid behind the copy to clear on the right, so
 * the type holds AA while the sunrise and Parliament House stay visible. On
 * tablets the wash covers the picture evenly; on phones the wash clears towards the bottom and the strip sits over the
 * foot of the photograph.
 */
export function HomeHero({ courses, locale }: { courses: Course[]; locale: Locale }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-white lg:flex lg:h-[calc(100svh-9.5rem)] lg:max-h-[52rem] lg:min-h-fit lg:flex-col">
      <Container className="lg:flex lg:flex-1 lg:items-center">
        <div className="grid w-full pt-6 pb-64 md:py-10 lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-5 xl:gap-16 short:py-3">
          <div className="reveal lg:col-span-7">
            <TrackedLink
              href={CTA.enrol.href}
              event={ANALYTICS_EVENTS.enrolClick}
              payload={{ location: "home-hero", action: "admissions-pill" }}
              className="inline-flex min-h-10 items-center gap-2 bg-kesar-100 px-3 text-small font-semibold text-indigo transition-colors hover:bg-kesar"
            >
              <Megaphone aria-hidden className="size-4 shrink-0 text-kesar-700" />
              {EXAM_CYCLE.label} · {EXAM_CYCLE.admissionNote}
              <ChevronRight aria-hidden className="size-4 shrink-0" />
            </TrackedLink>
            <h1 className="mt-3 max-w-[16ch] short:max-w-[22ch] text-hero font-bold text-indigo 2xl:text-hero-lg">
              {/* Spoken to the student, its last words underlined in kesar. */}
              Your UPSC journey,{" "}
              <span className="underline decoration-kesar decoration-[0.09em] underline-offset-[0.14em] [text-decoration-skip-ink:none]">
                with a plan.
              </span>
            </h1>
            <p className="mt-3 text-body text-ink-secondary md:mt-4 md:text-body-lg short:hidden">
              UPSC coaching in {BRAND.city} with a mentor from day one. Start free,
              right here.
            </p>

            <PrepStagePicker courses={courses} />
          </div>
        </div>
      </Container>

      {/* Phones: over the foot of the photograph. Tablet and up: under the row. */}
      <Container className="relative z-10 -mt-24 pb-6 md:mt-0 md:pb-8 lg:pb-5 short:pb-3">
        <Suspense fallback={<HeroTodayFallback />}>
          <HeroToday locale={locale} />
        </Suspense>
      </Container>

      {/* The photograph is the LCP element on the homepage, so it loads
          eagerly at high priority. Full-bleed behind the copy at every width. */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/images/hero-study-overlook.png"
          alt=""
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className="object-cover object-[78%_center] md:object-[70%_center]"
        />
      </div>
      {/* Phones: a white wash, solid behind the copy and clearing towards the
          bottom, so indigo type stays legible and the photo shows under the
          buttons. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-b from-white from-15% via-white/80 via-45% to-white/0 to-70% md:hidden"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden bg-white/75 md:block lg:bg-transparent lg:bg-linear-to-r lg:from-white/95 lg:from-20% lg:via-white/70 lg:via-42% lg:to-white/0 lg:to-62%"
      />
    </section>
  );
}
