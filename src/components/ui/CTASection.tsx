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

/** Full-width closing call to action used at the end of every major page. */
export function CTASection({ title, description, location, className }: CTASectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-indigo py-16 focus-invert sm:py-20 lg:py-24",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(90%_130%_at_85%_0%,var(--color-indigo-700)_0%,transparent_62%)]"
      />
      <Container className="relative">
        <div className="max-w-3xl">
          <span aria-hidden className="block h-1 w-16 rounded-full bg-kesar" />
          <h2 className="mt-7 text-h2 font-semibold text-white lg:text-h2-lg">{title}</h2>
          <p className="mt-5 text-body text-white/75 sm:text-body-lg">{description}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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
