import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

import { HeroCallbackForm } from "@/components/forms/HeroCallbackForm";
import { PromoBannerCarousel } from "@/components/hero/PromoBannerCarousel";
import { HERO_NOTICES } from "@/components/hero/promo-banners";
import { Container } from "@/components/ui/Container";
import { TrackedAnchor } from "@/components/ui/TrackedLink";
import { COURSE_CATEGORY_LABELS, publishedCourses } from "@/data/courses";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import {
  BRAND,
  CONTACT,
  EXAM_CYCLE,
  ROUTES,
  whatsappUrl,
} from "@/lib/constants/site";

/** Programme shortcuts under the banner — every one is a real route. */
const HERO_PATHS = [
  ...publishedCourses.map((course) => ({
    label: COURSE_CATEGORY_LABELS[course.category],
    href: `${ROUTES.courses}/${course.slug}`,
  })),
  { label: "Mentorship", href: `${ROUTES.home}#mentorship` },
];

/**
 * Homepage hero: a rotating institute advertisement panel on the left, the
 * callback/enrolment form on the right.
 *
 * The surface is light on purpose — white card on warm ivory, indigo type,
 * kesar used once per element. No gradients, glows or grid overlays: on a
 * light hero, restraint is what reads as elegant, and the two white cards
 * carry the whole composition.
 */
export function HomeHero() {
  return (
    <section className="border-b border-line bg-[linear-gradient(to_bottom,#ffffff_0%,var(--color-paper)_100%)]">
      <Container size="wide">
        {/* Standing notices, then the two things a hesitant visitor reaches
            for first. Many aspirants would rather call than fill a form, and
            on a patchy connection WhatsApp is the reliable channel — so both
            sit above the fold, not only in the sticky bar. */}
        <div className="flex flex-col gap-3 border-b border-line py-3.5 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {HERO_NOTICES.map(({ id, icon: Icon, text }) => (
              <li
                key={id}
                className="flex items-center gap-2 whitespace-nowrap text-small text-ink-secondary"
              >
                <Icon aria-hidden className="size-4 shrink-0 text-kesar-600" />
                {text}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:shrink-0">
            <TrackedAnchor
              href={`tel:${CONTACT.phoneHref}`}
              event={ANALYTICS_EVENTS.phoneClick}
              payload={{ location: "home-hero-notice" }}
              className="flex items-center gap-2 text-small font-semibold text-indigo underline decoration-kesar decoration-2 underline-offset-4 transition-colors duration-200 hover:text-kesar-700"
            >
              <Phone aria-hidden className="size-4 shrink-0" />
              {CONTACT.phoneDisplay}
            </TrackedAnchor>
            <TrackedAnchor
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
              event={ANALYTICS_EVENTS.whatsappClick}
              payload={{ location: "home-hero-notice" }}
              className="flex items-center gap-2 text-small font-semibold text-indigo underline decoration-kesar decoration-2 underline-offset-4 transition-colors duration-200 hover:text-kesar-700"
            >
              <MessageCircle aria-hidden className="size-4 shrink-0" />
              WhatsApp us
            </TrackedAnchor>
          </div>
        </div>

        <div className="grid items-start gap-10 pb-10 pt-10 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-14 lg:pt-16 xl:gap-20">
          <div className="reveal">
            <h1 className="text-h2 font-semibold text-indigo sm:text-h1 lg:text-[2.5rem] xl:text-h1-lg">
              UPSC coaching in {BRAND.city},
              <br />
              {/* Kesar is only 2:1 on white, so the accent is a marker wash
                  behind indigo text rather than kesar type. */}
              <span className="-mx-1 box-decoration-clone rounded-sm bg-kesar/35 px-1">
                built around mentorship.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-body text-ink-secondary sm:text-body-lg">
              {BRAND.tagline}
            </p>

            <div className="mt-8">
              <PromoBannerCarousel />
            </div>
          </div>

          <div className="reveal reveal-delay-2 lg:pl-4">
            <HeroCallbackForm courses={publishedCourses} />
          </div>
        </div>

        <ul className="flex flex-wrap items-center gap-2 border-t border-line pb-12 pt-7 lg:pb-14">
          <li className="mr-1 text-eyebrow font-semibold uppercase text-ink-secondary">
            {EXAM_CYCLE.label} programmes
          </li>
          {HERO_PATHS.map((path) => (
            <li key={path.href}>
              <Link
                href={path.href}
                className="inline-flex items-center rounded-full border border-line-strong bg-white px-3.5 py-1.5 text-small text-indigo transition-colors duration-200 hover:border-kesar hover:text-kesar-700"
              >
                {path.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
