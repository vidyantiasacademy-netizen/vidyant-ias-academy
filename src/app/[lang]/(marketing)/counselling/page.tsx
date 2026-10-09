import { CalendarClock, MessageCircle, Phone, ShieldCheck } from "lucide-react";

import { CounsellingForm } from "@/components/forms/CounsellingForm";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { TrackedAnchor } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CONTACT, ROUTES, whatsappUrl } from "@/lib/constants/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = () => pageMetadata({
  title: "Free UPSC Counselling in Pune",
  description:
    "Book a free counselling session with the vidyantIAS academic team. Get a preparation roadmap for your target attempt — programs, timelines, optional subject and mentorship, with no obligation to enrol.",
  path: ROUTES.counselling,
  keywords: ["UPSC counselling Pune", "IAS counselling Pune", "UPSC mentorship Pune"],
});

const WHAT_TO_EXPECT = [
  {
    icon: CalendarClock,
    title: "A 20–30 minute conversation",
    description:
      "We ask about your background, hours available and target attempt before suggesting anything.",
  },
  {
    icon: ShieldCheck,
    title: "An honest assessment",
    description:
      "If a program is not right for you — or if you should not enrol yet — we will say so.",
  },
  {
    icon: MessageCircle,
    title: "A written roadmap",
    description:
      "A preparation sequence for your attempt: what to start with, what to test, and when.",
  },
];

export default function CounsellingPage() {
  return (
    <>
      <PageHero
        eyebrow="Free Counselling"
        title="Not sure where to start? Let's build your preparation roadmap."
        description="Tell us where you are in your preparation. An academic counsellor will call you at your preferred time to discuss the path that fits your attempt, your subject strengths and the hours you actually have."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Counselling" }]}
      />

      <Section containerSize="wide">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-14">
          <CounsellingForm />

          <aside className="flex flex-col gap-4">
            <Card tone="paper">
              <h2 className="text-h4 font-bold">What to expect</h2>
              <ul className="mt-5 space-y-5">
                {WHAT_TO_EXPECT.map(({ icon: Icon, title, description }) => (
                  <li key={title} className="flex gap-3">
                    <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-kesar-600" />
                    <span>
                      <span className="block text-body font-semibold text-indigo">{title}</span>
                      <span className="text-small text-ink-secondary">{description}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <h2 className="text-h4 font-bold">Prefer to talk now?</h2>
              <p className="mt-3 text-small text-ink-secondary">
                Call or message the centre during working hours.
              </p>
              <div className="mt-5 flex flex-col gap-2.5">
                <TrackedAnchor
                  href={`tel:${CONTACT.phoneHref}`}
                  event={ANALYTICS_EVENTS.phoneClick}
                  payload={{ location: "counselling-page" }}
                  className="inline-flex items-center gap-2.5 text-body font-semibold text-indigo hover:text-indigo-900 hover:underline underline-offset-4"
                >
                  <Phone aria-hidden className="size-4.5 text-kesar-600" />
                  {CONTACT.phoneDisplay}
                </TrackedAnchor>
                <TrackedAnchor
                  href={whatsappUrl("Hi vidyantIAS, I would like to book a counselling session.")}
                  target="_blank"
                  rel="noreferrer"
                  event={ANALYTICS_EVENTS.whatsappClick}
                  payload={{ location: "counselling-page" }}
                  className="inline-flex items-center gap-2.5 text-body font-semibold text-indigo hover:text-indigo-900 hover:underline underline-offset-4"
                >
                  <MessageCircle aria-hidden className="size-4.5 text-kesar-600" />
                  WhatsApp us
                </TrackedAnchor>
              </div>
              <ul className="mt-6 space-y-1.5 text-small text-ink-secondary">
                {CONTACT.openingHours.map((entry) => (
                  <li key={entry.days}>
                    {entry.days}: {entry.hours}
                  </li>
                ))}
              </ul>
            </Card>
          </aside>
        </div>
      </Section>
    </>
  );
}
