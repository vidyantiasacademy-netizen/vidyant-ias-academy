import Image from "next/image";

import { HeroActions } from "@/components/hero/HeroActions";
import { WhatsNewPanel } from "@/components/hero/WhatsNewPanel";
import { Container } from "@/components/ui/Container";
import { GeoComposition } from "@/components/ui/Geometry";
import { BRAND } from "@/lib/constants/site";

/**
 * Homepage hero, Swiss: a white field on a 12-column grid. The headline is set
 * huge, bold and flush left across eight columns; the Bauhaus composition takes
 * its own four-column slot from `lg` and never sits behind type. Beneath, the
 * banner (8 columns) and the "What's new" panel (4) share one row, then the
 * three action tiles. A hard indigo rule closes the band.
 */
export function HomeHero() {
  return (
    <section className="border-b-2 border-indigo bg-white">
      <Container size="wide">
        <div className="grid gap-8 pt-6 sm:pt-8 lg:grid-cols-12 lg:gap-x-8 lg:pt-10">
          <h1 className="reveal max-w-5xl text-hero font-bold text-indigo lg:col-span-8 lg:text-hero-lg">
            UPSC coaching in {BRAND.city}, built around mentorship.
          </h1>
          <div className="hidden items-end justify-end lg:col-span-4 lg:flex">
            <GeoComposition className="size-28 xl:size-32" />
          </div>
        </div>

        {/* Banner and "What's new" share one row from lg and stretch to the
            same height. */}
        <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-12 lg:items-stretch lg:gap-8">
          <div className="reveal lg:col-span-8">
            {/* The banner is the LCP element on the homepage, so it loads
                eagerly at high priority. The file name is capitalised on disk;
                keep the casing — production file systems are case-sensitive. */}
            <div className="overflow-hidden border-2 border-indigo bg-white">
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

          <div className="reveal reveal-delay-2 h-full lg:col-span-4">
            <WhatsNewPanel />
          </div>
        </div>

        <div className="reveal reveal-delay-3 pb-12 pt-8 lg:pb-16 lg:pt-10">
          <HeroActions />
        </div>
      </Container>
    </section>
  );
}
