import Image from "next/image";

import { HeroActions } from "@/components/hero/HeroActions";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GeoComposition } from "@/components/ui/Geometry";
import { BRAND, EXAM_CYCLE } from "@/lib/constants/site";

/**
 * Homepage hero, Swiss: one row on a 12-column grid. Copy on the left — an
 * eyebrow, the headline, one sentence of promise held to a reading measure,
 * then one primary action, one secondary and two quiet text links. The banner
 * takes the right-hand columns from `xl` and drops beneath the copy below it,
 * so the headline and the next step always come first.
 *
 * The Bauhaus composition is the single decorative element: it peeks from
 * behind the banner's top-right corner from `xl`, never behind type, hidden
 * below it. Announcements live in the notice strip and the Noticeboard section,
 * so the hero does not repeat them.
 */
export function HomeHero() {
  return (
    <section className="border-b border-line bg-white">
      <Container>
        <div className="grid gap-10 py-10 sm:py-14 lg:py-16 xl:grid-cols-12 xl:items-center xl:gap-x-8 2xl:py-20">
          <div className="reveal xl:col-span-6 2xl:col-span-5">
            <Eyebrow>
              {EXAM_CYCLE.label} · {EXAM_CYCLE.admissionNote}
            </Eyebrow>
            <h1 className="mt-5 max-w-[16ch] text-hero font-bold text-indigo lg:text-hero-lg">
              UPSC coaching in {BRAND.city}, built around mentorship.
            </h1>
            <p className="mt-5 max-w-[46ch] text-body text-ink-secondary sm:text-body-lg">
              {BRAND.usp}
            </p>
            <div className="mt-8">
              <HeroActions />
            </div>
          </div>

          <div className="reveal reveal-delay-2 relative xl:col-span-6 xl:pt-8 xl:pr-8 2xl:col-span-7">
            {/* Peeks out from behind the banner's top-right corner, inside the grid. */}
            <GeoComposition className="absolute top-0 right-0 hidden size-24 xl:block" />
            {/* The banner is the LCP element on the homepage, so it loads
                eagerly at high priority. The file name is capitalised on disk;
                keep the casing — production file systems are case-sensitive. */}
            <div className="relative border border-line bg-paper">
              <Image
                src="/images/Banner.png"
                alt={`${BRAND.name} UPSC coaching classes — expert faculty, personalised attention, doubt-clearing sessions and regular tests with progress tracking.`}
                width={3780}
                height={1890}
                sizes="(min-width: 1536px) 820px, (min-width: 1280px) 50vw, 100vw"
                loading="eager"
                fetchPriority="high"
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
