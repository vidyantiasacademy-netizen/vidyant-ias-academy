import Image from "next/image";

import { HeroActions } from "@/components/hero/HeroActions";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BRAND, EXAM_CYCLE } from "@/lib/constants/site";

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
 */
export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-indigo-900">
      {/* The photograph is the LCP element on the homepage, so it loads
          eagerly at high priority. */}
      <Image
        src="/images/hero-study-overlook.png"
        alt=""
        fill
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        className="-z-20 object-cover object-[70%_center]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-indigo-900/80 lg:bg-transparent lg:bg-linear-to-r lg:from-indigo-900/95 lg:via-indigo-900/75 lg:to-indigo-900/0"
      />

      <Container>
        <div className="grid py-14 sm:py-20 lg:min-h-[36rem] lg:grid-cols-12 lg:items-center lg:py-24 2xl:min-h-[40rem]">
          <div className="reveal lg:col-span-7 xl:col-span-6">
            <Eyebrow tone="light">
              {EXAM_CYCLE.label} · {EXAM_CYCLE.admissionNote}
            </Eyebrow>
            <h1 className="mt-5 max-w-[16ch] text-hero font-bold text-white lg:text-hero-lg">
              UPSC coaching in {BRAND.city}, built around mentorship.
            </h1>
            <p className="mt-5 max-w-[46ch] text-body text-white/90 sm:text-body-lg">
              {BRAND.usp}
            </p>
            <div className="mt-8">
              <HeroActions />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
