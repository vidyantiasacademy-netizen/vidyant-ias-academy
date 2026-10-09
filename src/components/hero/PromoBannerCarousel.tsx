"use client";

import { Check, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import Link from "@/i18n/Link";
import { PROMO_BANNERS } from "@/components/hero/promo-banners";
import { TrackedButtonLink } from "@/components/ui/TrackedLink";
import { cn } from "@/lib/utils/cn";

/** One banner holds attention for about this long before the next rotates in. */
const ROTATION_MS = 7000;

/**
 * The institute's advertisement panel: a rotating set of campaign banners that
 * sits beside the enrolment form in the hero.
 *
 * Accessibility notes (WAI-ARIA carousel pattern):
 *  - the region is labelled and described as a carousel, slides as slides;
 *  - rotation stops on hover, on keyboard focus and on an explicit pause
 *    control, and never starts when the visitor prefers reduced motion;
 *  - inactive slides are `inert` and `aria-hidden`, so neither the keyboard nor
 *    a screen reader walks into an invisible banner;
 *  - slides are stacked in one grid cell, so the panel is as tall as its
 *    tallest banner and rotation cannot shift the page.
 *
 * The banner list is imported here rather than passed in: each banner carries a
 * Lucide icon component, and React cannot send a function across the
 * server/client boundary as a prop.
 */
export function PromoBannerCarousel() {
  const banners = PROMO_BANNERS;
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [allowsMotion, setAllowsMotion] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  const count = banners.length;

  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  // Rotation is a motion effect: opt out entirely when the OS says to.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAllowsMotion(!query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const isRotating = allowsMotion && !isPaused && count > 1;

  useEffect(() => {
    if (!isRotating) return;
    const timer = window.setTimeout(() => goTo(index + 1), ROTATION_MS);
    return () => window.clearTimeout(timer);
  }, [goTo, index, isRotating]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (count < 2) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    }
  }

  return (
    <div
      ref={regionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="vidyantIAS announcements"
      className="relative"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
        {/* Rotation progress — a quiet, non-looping indicator, not decoration. */}
        <div aria-hidden className="h-0.5 bg-paper-200">
          <div
            key={`${index}-${isRotating}`}
            className={cn(
              "h-full bg-chilli",
              isRotating ? "promo-progress" : "w-full opacity-50",
            )}
            style={isRotating ? { animationDuration: `${ROTATION_MS}ms` } : undefined}
          />
        </div>

        <div className="grid min-h-[27rem] sm:min-h-[24rem]">
          {banners.map((banner, slide) => {
            const isActive = slide === index;
            const Icon = banner.icon;

            return (
              <article
                key={banner.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${slide + 1} of ${count}: ${banner.title}`}
                aria-hidden={!isActive}
                inert={!isActive || undefined}
                className={cn(
                  "relative col-start-1 row-start-1 flex flex-col p-6 transition-opacity duration-500 ease-[var(--ease-brand)] sm:p-7",
                  isActive ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  {banner.tag ? (
                    <span className="inline-flex items-center rounded-full bg-chilli-100 px-3 py-1 text-eyebrow font-semibold uppercase text-chilli-700">
                      {banner.tag}
                    </span>
                  ) : null}
                  <span className="text-eyebrow font-semibold uppercase text-ink-secondary">
                    {banner.eyebrow}
                  </span>
                </p>

                <h2 className="mt-5 text-h2 font-semibold text-indigo lg:text-[2.125rem] xl:text-h2-lg">
                  {banner.title}
                  {banner.titleAccent ? (
                    <>
                      <br />
                      <span className="text-chilli-600">{banner.titleAccent}</span>
                    </>
                  ) : null}
                </h2>

                <p className="mt-4 max-w-[46ch] text-body text-ink-secondary">
                  {banner.body}
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <TrackedButtonLink
                    href={banner.primary.href}
                    variant="kesar"
                    size="lg"
                    event={banner.primary.event}
                    payload={{ location: "home-hero-banner", banner: banner.id }}
                  >
                    {banner.primary.label}
                    <ChevronRight aria-hidden className="size-4.5" />
                  </TrackedButtonLink>
                  {banner.secondary ? (
                    <Link
                      href={banner.secondary.href}
                      className="inline-flex items-center gap-1.5 rounded-md px-1 py-2 text-small font-semibold text-indigo underline decoration-chilli decoration-2 underline-offset-4 transition-colors duration-200 hover:text-chilli-700"
                    >
                      {banner.secondary.label}
                    </Link>
                  ) : null}
                </div>

                <ul className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-5">
                  {banner.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-1.5 text-small text-ink-muted"
                    >
                      <Check aria-hidden className="size-4 text-kesar-600" />
                      {point}
                    </li>
                  ))}
                </ul>

                {/* Watermark icon — identifies the campaign, carries no meaning. */}
                <Icon
                  aria-hidden
                  className="pointer-events-none absolute -bottom-6 right-2 size-40 text-indigo/[0.05]"
                  strokeWidth={1}
                />
              </article>
            );
          })}
        </div>
      </div>

      {count > 1 ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous announcement"
              className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md border border-line-strong text-indigo transition-colors duration-200 hover:border-indigo hover:bg-paper"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next announcement"
              className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md border border-line-strong text-indigo transition-colors duration-200 hover:border-indigo hover:bg-paper"
            >
              <ChevronRight aria-hidden className="size-5" />
            </button>
          </div>

          {/* On a narrow phone the dots drop to their own line rather than
              squeezing the controls off the edge of the screen. */}
          <ul className="order-last flex w-full items-center gap-2 sm:order-none sm:w-auto sm:flex-1">
            {banners.map((banner, slide) => (
              <li key={banner.id} className="contents">
                <button
                  type="button"
                  onClick={() => goTo(slide)}
                  aria-label={banner.title}
                  aria-current={slide === index}
                  className={cn(
                    // 44px touch target kept, with a slim visible rule inside.
                    "group flex h-11 cursor-pointer items-center",
                    slide === index ? "w-10" : "w-6",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "h-1 w-full rounded-full transition-colors duration-200",
                      slide === index
                        ? "bg-indigo-gradient"
                        : "bg-line-strong group-hover:bg-ink-secondary",
                    )}
                  />
                </button>
              </li>
            ))}
          </ul>

          {/* Fixed slot: the pause control only exists once we know motion is
              allowed, and its arrival must not nudge the row. */}
          <div className="size-11 shrink-0">
            {allowsMotion ? (
              <button
                type="button"
                onClick={() => setIsPaused((paused) => !paused)}
                aria-label={
                  isPaused
                    ? "Resume announcement rotation"
                    : "Pause announcement rotation"
                }
                className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md border border-line-strong text-indigo transition-colors duration-200 hover:border-indigo hover:bg-paper"
              >
                {isPaused ? (
                  <Play aria-hidden className="size-4" />
                ) : (
                  <Pause aria-hidden className="size-4" />
                )}
              </button>
            ) : null}
          </div>

          <p aria-hidden className="ml-auto tabular-nums text-small text-ink-secondary sm:ml-0">
            {String(index + 1).padStart(2, "0")}
            <span className="text-ink-secondary/60"> / {String(count).padStart(2, "0")}</span>
          </p>
        </div>
      ) : null}

      {/* Rotation is visual; announce the change once, politely. */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {`Announcement ${index + 1} of ${count}: ${banners[index].title}`}
      </p>
    </div>
  );
}
