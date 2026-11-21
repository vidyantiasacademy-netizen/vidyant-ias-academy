import { Container } from "@/components/ui/Container";
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
}

/** Full-width closing call to action used at the end of every major page.
    Plain homepage indigo band (same as the Programs section), no decoration. */
export function CTASection({ title, description, location, className }: CTASectionProps) {
  return (
    <section className={cn("relative bg-indigo py-14 text-white focus-invert sm:py-16 lg:py-20", className)}>
      <Container>
        <div className="max-w-3xl">
          <h2 className="text-h2 font-bold text-white lg:text-h2-lg">{title}</h2>
          <p className="mt-5 max-w-[52ch] text-body text-white/80 sm:text-body-lg">{description}</p>
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
      </Container>
    </section>
  );
}
