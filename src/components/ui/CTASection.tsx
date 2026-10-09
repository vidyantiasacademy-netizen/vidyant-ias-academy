import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";
import { GeoCorners, GeoTriad } from "@/components/ui/Geometry";
import { TrackedButtonLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CTA } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

interface CTASectionProps {
  title: string;
  description: string;
  /** Where the CTA appears — recorded with the analytics event. */
  location: string;
  className?: string;
  /** Decorative scene beside the copy from lg, beneath it on smaller screens. */
  illustration?: ReactNode;
}

/** Full-width closing call to action used at the end of every major page. */
export function CTASection({
  title,
  description,
  location,
  className,
  illustration,
}: CTASectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-indigo py-14 focus-invert sm:py-16 lg:py-24",
        className,
      )}
    >
      {/* One corner only: the copy runs down the left side. An illustration
          brings its own geometry, so the corner mark steps aside for it. */}
      {illustration ? null : <GeoCorners corners={["top-right"]} />}
      <Container className={cn("relative", illustration && "grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-12")}>
        <div className="max-w-3xl">
          <GeoTriad surface="dark" />
          <h2 className="mt-6 text-h2 font-bold text-white lg:text-h2-lg">{title}</h2>
          <p className="mt-5 text-body text-white/80 sm:text-body-lg">{description}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <TrackedButtonLink
              href={CTA.counselling.href}
              variant="kesar"
              size="lg"
              event={ANALYTICS_EVENTS.counsellingClick}
              payload={{ location }}
            >
              {CTA.counselling.label}
            </TrackedButtonLink>
            <TrackedButtonLink
              href={CTA.demo.href}
              variant="outlineLight"
              size="lg"
              event={ANALYTICS_EVENTS.demoClick}
              payload={{ location }}
            >
              {CTA.demo.label}
            </TrackedButtonLink>
          </div>
        </div>
        {illustration ? <div className="mx-auto w-full max-w-sm lg:max-w-none">{illustration}</div> : null}
      </Container>
    </section>
  );
}
