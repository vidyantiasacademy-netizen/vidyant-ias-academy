import { CalendarDays, Clock, IndianRupee, MapPin } from "lucide-react";

import { Section } from "@/components/layout/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TrackedButtonLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { nextOrientation } from "@/data/events";
import { BRAND, ROUTES } from "@/lib/constants/site";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/**
 * Lead-generation block for the free orientation.
 * When no orientation is scheduled yet, the block asks for interest instead of
 * displaying an invented date.
 */
export function OrientationSection() {
  const orientation = nextOrientation();

  const details = [
    { icon: IndianRupee, label: "Fee", value: orientation?.fee ?? "Free" },
    { icon: MapPin, label: "Venue", value: orientation?.location ?? `${BRAND.name}, ${BRAND.city}` },
    {
      icon: CalendarDays,
      label: "Date",
      value: orientation ? formatDate(orientation.date) : "Next date being finalised",
    },
    {
      icon: Clock,
      label: "Duration",
      value: orientation
        ? `${orientation.time} • ${orientation.durationMinutes} minutes`
        : "Approximately 2 hours",
    },
  ];

  return (
    <Section tone="indigo" id="orientation" containerSize="wide">
      <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-16">
        <div>
          <Eyebrow tone="light">Free UPSC Orientation</Eyebrow>
          <h2 className="mt-4 text-h2 font-semibold text-white lg:text-h2-lg">
            Start your UPSC preparation with clarity.
          </h2>
          <p className="mt-5 max-w-xl text-body text-white/75 sm:text-body-lg">
            Join our free UPSC orientation session and understand the examination,
            preparation strategy, syllabus, resources and common mistakes before you begin.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <TrackedButtonLink
              href={orientation ? `${ROUTES.events}#${orientation.slug}` : ROUTES.events}
              variant="kesar"
              size="lg"
              event={ANALYTICS_EVENTS.eventRegister}
              payload={{ location: "home-orientation", event: orientation?.id ?? "interest" }}
            >
              {orientation ? "Reserve My Seat" : "Register My Interest"}
            </TrackedButtonLink>
            <TrackedButtonLink
              href={ROUTES.events}
              variant="outlineLight"
              size="lg"
              event={ANALYTICS_EVENTS.eventRegister}
              payload={{ location: "home-orientation-secondary" }}
            >
              View Upcoming Events
            </TrackedButtonLink>
          </div>
        </div>

        <dl className="grid gap-px overflow-hidden rounded-xl border border-white/15 bg-white/15 sm:grid-cols-2">
          {details.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-indigo-900 p-6">
              <Icon aria-hidden className="size-5 text-kesar" />
              <dt className="mt-4 text-eyebrow font-semibold uppercase text-white/60">
                {label}
              </dt>
              <dd className="mt-1.5 text-body font-medium text-white">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
