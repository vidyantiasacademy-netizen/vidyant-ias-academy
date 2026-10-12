import {
  ArrowRight,
  ChartColumn,
  ChevronRight,
  FileText,
  Megaphone,
  Users,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

import { HeroActions } from "@/components/hero/HeroActions";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TrackedButtonLink, TrackedLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { BRAND, CTA, EXAM_CYCLE } from "@/lib/constants/site";

/** Phones only: the three things a student gets, under the photograph. */
const BENEFITS: { icon: LucideIcon; title: string; note: string }[] = [
  { icon: Users, title: "Mentorship", note: "Learn with guidance" },
  { icon: FileText, title: "Mock Tests", note: "Practice. Track. Improve." },
  { icon: ChartColumn, title: "Mains Evaluation", note: "Detailed feedback" },
];

/**
 * Homepage hero, Swiss: one row on a 12-column grid over a full-bleed
 * photograph. Copy on the left — an eyebrow, the headline, one sentence of
 * promise held to a reading measure, then one primary action, one secondary
 * and two quiet text links — all in white.
 *
 * An indigo scrim runs from solid behind the copy to clear on the right, so
 * the type holds AA on any part of the picture while Parliament House and the
 * sunrise stay visible beside it. Below `lg` the copy spans the full width, so
 * the scrim covers the whole picture evenly instead.
 *
 * Phones (below `md`) get a light, stacked hero instead: an admissions pill,
 * the headline in indigo, one short promise, one kesar action with free
 * counselling as a text link under it, over the photograph behind a white
 * wash that clears towards the bottom, and a three-benefit card at its foot.
 */
export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-white md:bg-indigo-900">
      <Container>
        <div className="grid pt-6 pb-64 md:py-20 lg:min-h-[36rem] lg:grid-cols-12 lg:items-center lg:py-24 2xl:min-h-[40rem]">
          <div className="reveal lg:col-span-7 xl:col-span-6">
            <TrackedLink
              href={CTA.enrol.href}
              event={ANALYTICS_EVENTS.enrolClick}
              payload={{ location: "home-hero", action: "admissions-pill" }}
              className="inline-flex min-h-10 items-center gap-2 bg-kesar-100 px-3 text-small font-semibold text-indigo md:hidden"
            >
              <Megaphone aria-hidden className="size-4 shrink-0 text-kesar-700" />
              {EXAM_CYCLE.label} · {EXAM_CYCLE.admissionNote}
              <ChevronRight aria-hidden className="size-4 shrink-0" />
            </TrackedLink>
            <div className="hidden md:block">
              <Eyebrow tone="light">
                {EXAM_CYCLE.label} · {EXAM_CYCLE.admissionNote}
              </Eyebrow>
            </div>
            <h1 className="mt-4 max-w-[16ch] text-hero font-bold text-indigo md:text-white lg:text-hero-lg">
              {/* Phones: the shorter promise, its last words underlined in kesar. */}
              <span className="md:hidden">
                Your UPSC journey,{" "}
                <span className="underline decoration-kesar decoration-4 underline-offset-[0.18em] [text-decoration-skip-ink:none]">
                  with a plan.
                </span>
              </span>
              <span className="hidden md:inline">
                UPSC coaching in {BRAND.city}, built around mentorship.
              </span>
            </h1>
            <p className="mt-3 text-body text-ink-secondary md:hidden">
              Concept-led classes. Personal mentorship. Measurable progress.
            </p>
            <p className="mt-5 hidden max-w-[46ch] text-body text-white/90 sm:text-body-lg md:block">
              {BRAND.usp}
            </p>

            {/* Phones: one dominant action, counselling as the quiet second. */}
            <div className="mt-6 md:hidden">
              <TrackedButtonLink
                href="#programs"
                variant="kesar"
                size="lg"
                fullWidth
                event={ANALYTICS_EVENTS.enrolClick}
                payload={{ location: "home-hero", action: "enrol" }}
              >
                Explore courses
                <ArrowRight aria-hidden className="size-5" />
              </TrackedButtonLink>
              <TrackedLink
                href={CTA.counselling.href}
                event={ANALYTICS_EVENTS.counsellingClick}
                payload={{ location: "home-hero", action: "counselling" }}
                className="mt-1 flex min-h-11 items-center justify-center gap-1 text-small font-bold text-indigo underline decoration-line-strong decoration-2 underline-offset-4"
              >
                Free counselling
                <ChevronRight aria-hidden className="size-4" />
              </TrackedLink>
            </div>
            <div className="mt-8 hidden md:block">
              <HeroActions />
            </div>
          </div>
        </div>
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
        className="absolute inset-0 -z-10 hidden bg-indigo-900/80 md:block lg:bg-transparent lg:bg-linear-to-r lg:from-indigo-900/95 lg:via-indigo-900/75 lg:to-indigo-900/0"
      />

      {/* Phones: one benefit card over the foot of the photo. */}
      <Container className="relative z-10 -mt-20 pb-6 md:hidden">
        <ul className="grid grid-cols-3 divide-x divide-line border border-line-strong bg-white">
          {BENEFITS.map(({ icon: Icon, title, note }) => (
            <li key={title} className="flex flex-col items-center px-1.5 py-3.5 text-center">
              <Icon aria-hidden className="size-6 text-kesar-600" strokeWidth={2} />
              <span className="mt-2 text-small font-bold leading-tight text-indigo">{title}</span>
              <span className="mt-1 text-[0.8125rem] leading-snug text-ink-secondary">{note}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
