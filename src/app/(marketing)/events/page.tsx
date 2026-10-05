import { CalendarDays } from "lucide-react";

import { EventCard } from "@/components/events/EventCard";
import { EventRegistrationForm } from "@/components/forms/EventRegistrationForm";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CTASection } from "@/components/ui/CTASection";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { upcomingEvents } from "@/data/events";
import { CTA, ROUTES } from "@/lib/constants/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Free UPSC Orientation & Events in Pune",
  description:
    "Free UPSC orientation sessions, demo classes and workshops at vidyantIAS Pune. Understand the examination, the syllabus and a realistic preparation strategy before you begin.",
  path: ROUTES.events,
  keywords: ["free UPSC orientation Pune", "UPSC seminar Pune", "IAS workshop Pune"],
});

const AGENDA = [
  "How the examination is structured, stage by stage",
  "What the syllabus actually asks for — and what it does not",
  "A realistic timeline for a first attempt",
  "The mistakes that cost aspirants their first year",
  "Resources worth using, and the ones to skip",
];

export default function EventsPage() {
  const events = upcomingEvents();
  const hasEvents = events.length > 0;

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Start your UPSC preparation with clarity."
        description="Our free orientation explains the examination, preparation strategy, syllabus, resources and common mistakes — with no enrolment pitch attached."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Events" }]}
      />

      <Section containerSize="wide">
        {hasEvents ? (
          <>
            <SectionHeader eyebrow="Upcoming" title="Sessions you can attend" />
            <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {events.map((event) => (
                <li key={event.id} id={event.slug} className="scroll-mt-28">
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EmptyState
            icon={<CalendarDays aria-hidden className="size-5" />}
            title="No events are scheduled right now"
            description="The next orientation date is being finalised. Register your interest below and we will contact you as soon as it is confirmed — or book a free counselling session if you would rather not wait."
            action={
              <ButtonLink href={CTA.counselling.href} variant="primary">
                {CTA.counselling.label}
              </ButtonLink>
            }
          />
        )}
      </Section>

      <Section tone="paper" containerSize="wide">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <EventRegistrationForm events={events} mode={hasEvents ? "register" : "interest"} />

          <Card>
            <h2 className="text-h4 font-semibold">What the orientation covers</h2>
            <ul className="mt-5 space-y-3">
              {AGENDA.map((item) => (
                <li key={item} className="flex gap-3 text-body text-ink-secondary">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-kesar" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-small text-ink-muted">
              The session is free. Attending does not commit you to enrolling.
            </p>
          </Card>
        </div>
      </Section>

      <CTASection
        title="Would a conversation be more useful?"
        description="Counselling is one-to-one and specific to your attempt, background and available hours."
        location="events-final"
      />
    </>
  );
}
