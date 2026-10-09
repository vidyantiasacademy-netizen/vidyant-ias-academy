import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: ReactNode;
}

/** Four-point sparkle; sized and coloured by its className. */
function Sparkle({ className }: { className: string }) {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 40 40" className={className}>
      <path
        d="M20 0C21.5 13 27 18.5 40 20C27 21.5 21.5 27 20 40C18.5 27 13 21.5 0 20C13 18.5 18.5 13 20 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Abstract line-art for the hero, in the noticeboard's vocabulary: a cameo
 * ribbon, a looping chilli pen line, a dashed indigo rule, a kesar ring and
 * sparkles. From `lg` it fills the empty right side of the band; below that
 * the copy runs full width, so the art shrinks to a corner ring and a ribbon
 * inside the bottom padding — it never sits behind text on a phone.
 */
function HeroLines() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* Phones and tablets: corner ring, sparkle, ribbon along the foot. */}
      <svg
        focusable="false"
        viewBox="0 0 100 100"
        fill="none"
        className="absolute -top-10 -right-10 size-32 lg:hidden"
      >
        <circle cx="50" cy="50" r="40" stroke="var(--color-kesar)" strokeWidth="6" />
        <circle cx="50" cy="50" r="26" stroke="var(--color-kesar)" strokeWidth="2" strokeDasharray="3 7" strokeLinecap="round" />
      </svg>
      <Sparkle className="absolute top-28 right-10 size-6 rotate-12 text-chilli lg:hidden" />
      <svg
        focusable="false"
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        fill="none"
        className="absolute inset-x-0 bottom-2 h-9 w-full lg:hidden"
      >
        <path
          className="kesar-draw"
          pathLength={1}
          d="M-20 30C150 30 220 8 360 12C500 16 540 34 690 30C840 26 900 6 1040 10C1120 12 1170 22 1220 20"
          stroke="var(--color-cameo)"
          strokeWidth="12"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          className="kesar-draw kesar-draw-delay"
          pathLength={1}
          d="M-20 16C140 16 230 34 370 28C510 22 560 4 700 8C840 12 890 30 1030 26C1110 24 1170 12 1220 12"
          stroke="var(--color-chilli)"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity="0.8"
        />
      </svg>

      {/* Desktop: the full composition on the right of the band. */}
      <div className="absolute inset-y-0 right-0 hidden w-[38%] lg:block xl:w-[44%]">
        <svg
          focusable="false"
          viewBox="0 0 600 400"
          preserveAspectRatio="none"
          fill="none"
          className="absolute inset-0 size-full"
        >
          <path
            className="kesar-draw"
            pathLength={1}
            d="M140 430C230 340 300 390 400 300S560 150 640 120"
            stroke="var(--color-cameo)"
            strokeWidth="30"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            className="kesar-draw kesar-draw-delay"
            pathLength={1}
            d="M80 110C190 50 270 180 370 140C450 108 440 40 380 55C320 70 350 170 470 175C550 178 595 120 640 100"
            stroke="var(--color-chilli)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            opacity="0.8"
          />
          <path
            d="M230 410C330 350 420 410 520 340S600 270 640 260"
            stroke="var(--color-indigo)"
            strokeWidth="2"
            strokeDasharray="2 10"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity="0.45"
          />
        </svg>

        <svg
          focusable="false"
          viewBox="0 0 100 100"
          fill="none"
          className="absolute top-[22%] right-[16%] size-28 xl:size-36"
        >
          <circle cx="50" cy="50" r="40" stroke="var(--color-kesar)" strokeWidth="6" />
          <circle cx="50" cy="50" r="26" stroke="var(--color-kesar)" strokeWidth="2" strokeDasharray="3 7" strokeLinecap="round" />
        </svg>

        {/* Dot grid, like squared paper torn from a notebook. */}
        <svg focusable="false" viewBox="0 0 60 60" className="absolute top-8 right-8 size-20 text-indigo opacity-30">
          <defs>
            <pattern id="page-hero-dots" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.6" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="60" height="60" fill="url(#page-hero-dots)" />
        </svg>

        <Sparkle className="absolute right-[6%] bottom-[14%] size-12 rotate-12 text-chilli" />
        <Sparkle className="absolute top-[18%] left-[34%] size-6 -rotate-12 text-kesar" />
      </div>
    </div>
  );
}

/** Shared inner-page hero: paper band with line-art, breadcrumb trail, headline and lede. */
export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b-2 border-indigo bg-paper">
      <HeroLines />
      <Container size="wide" className="relative py-12 sm:py-16 lg:py-20">
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} className="mb-7" /> : null}
        {eyebrow ? <Eyebrow tone="chilli">{eyebrow}</Eyebrow> : null}
        <h1 className="mt-4 max-w-3xl text-h1 font-semibold text-indigo lg:text-h1-lg">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-body text-ink-secondary sm:text-body-lg">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </Container>
    </section>
  );
}
