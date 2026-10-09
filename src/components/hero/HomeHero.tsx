import Image from "next/image";

import { HeroActions } from "@/components/hero/HeroActions";
import { WhatsNewPanel } from "@/components/hero/WhatsNewPanel";
import { Container } from "@/components/ui/Container";
import { BRAND } from "@/lib/constants/site";

/**
 * Homepage hero: the institute banner on the left, the "What's new" panel on
 * the right, three action tiles beneath them. Stage picking lives in the
 * Programs section, so it is not repeated here. No
 * visible headline above the fold — the banner carries the message.
 *
 * The surface is light on purpose — white card on a cameo wash, indigo type,
 * kesar for the call to action, chilli for hover and marks. No gradients, glows or grid overlays: on a
 * light hero, restraint is what reads as elegant, and the two white cards
 * carry the whole composition.
 */
export function HomeHero() {
  return (
    <section className="border-b border-line bg-[linear-gradient(to_bottom,#ffffff_0%,var(--color-cameo-100)_100%)]">
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

        <div className="reveal reveal-delay-3 pb-12 pt-6 lg:pb-14 lg:pt-8">
          <HeroActions />
        </div>
      </Container>
    </section>
  );
}
