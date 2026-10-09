import { CalendarDays } from "lucide-react";

import { EventCard } from "@/components/events/EventCard";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { upcomingEvents } from "@/data/events";
import { CTA, ROUTES } from "@/lib/constants/site";

/** Upcoming events and webinars — orientation, demo sessions and workshops. */
export function EventsSection() {
  const events = upcomingEvents().slice(0, 3);

  return (
    <Section id="events" containerSize="wide">
      <SectionHeader
        eyebrow="Events & Webinars"
        title="Sessions you can attend this month."
        description="Orientation sessions, subject webinars and strategy workshops — all free, in the centre or online, with no enrolment pitch attached."
        action={
          <ButtonLink href={ROUTES.events} variant="secondary">
            View all events
          </ButtonLink>
        }
      />

      {events.length > 0 ? (
        <ul className="mt-7 grid gap-4 md:grid-cols-2 lg:mt-9 lg:grid-cols-3 lg:gap-5">
          {events.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          className="mt-8"
          icon={<CalendarDays aria-hidden className="size-5" />}
          title="Nothing is scheduled right now"
          description="The next orientation and webinar dates are being finalised. Register your interest and we will tell you first — the sessions are free and attending commits you to nothing."
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={ROUTES.events} variant="primary">
                Register my interest
              </ButtonLink>
              <ButtonLink href={CTA.demo.href} variant="secondary">
                {CTA.demo.label}
              </ButtonLink>
            </div>
          }
        />
      )}
    </Section>
  );
}
