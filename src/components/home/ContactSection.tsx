import type { ReactNode } from "react";
import { Clock, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";

import { CallbackForm } from "@/components/forms/CallbackForm";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TrackedAnchor } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { BRAND, CONTACT, CTA, ROUTES, whatsappUrl } from "@/lib/constants/site";

/** Centre information plus the shortest conversion on the page: a callback. */
export function ContactSection() {
  return (
    <Section tone="paper" id="contact" containerSize="wide">
      <SectionHeader
        eyebrow="Visit or Call"
        title={`Our centre in ${BRAND.city}.`}
        description="Come and see the classroom, meet the academic team and ask whatever you need to before enrolling. Or leave a number and we will call you."
        action={
          <ButtonLink href={ROUTES.contact} variant="secondary">
            Contact & directions
          </ButtonLink>
        }
      />

      <div className="mt-7 grid gap-8 lg:mt-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div>
          <Card padding="none" className="divide-y divide-line">
            <ContactRow icon={MapPin} label="Centre address">
              <address className="not-italic text-ink-secondary">
                {CONTACT.addressLines.join(", ")}
              </address>
              <a
                href={CONTACT.mapsDirectionsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-small font-semibold text-indigo underline-offset-4 hover:underline"
              >
                Get directions
              </a>
            </ContactRow>

            <ContactRow icon={Phone} label="Call us">
              <TrackedAnchor
                href={`tel:${CONTACT.phoneHref}`}
                event={ANALYTICS_EVENTS.phoneClick}
                payload={{ location: "home-contact" }}
                className="font-semibold text-indigo underline-offset-4 hover:underline"
              >
                {CONTACT.phoneDisplay}
              </TrackedAnchor>
            </ContactRow>

            <ContactRow icon={MessageCircle} label="WhatsApp">
              <TrackedAnchor
                href={whatsappUrl()}
                target="_blank"
                rel="noreferrer"
                event={ANALYTICS_EVENTS.whatsappClick}
                payload={{ location: "home-contact" }}
                className="font-semibold text-indigo underline-offset-4 hover:underline"
              >
                Message us
              </TrackedAnchor>
            </ContactRow>

            <ContactRow icon={Mail} label="Email">
              <a
                href={`mailto:${CONTACT.email}`}
                className="break-all font-semibold text-indigo underline-offset-4 hover:underline"
              >
                {CONTACT.email}
              </a>
            </ContactRow>

            <ContactRow icon={Clock} label="Opening hours">
              <dl className="space-y-0.5">
                {CONTACT.openingHours.map((entry) => (
                  <div key={entry.days} className="flex flex-wrap gap-x-2">
                    <dt className="text-ink-secondary">{entry.days}</dt>
                    <dd className="font-medium text-indigo">{entry.hours}</dd>
                  </div>
                ))}
              </dl>
            </ContactRow>
          </Card>

          <ButtonLink href={CTA.enquiry.href} variant="link" className="mt-3 justify-start px-0">
            Prefer to write? Send an enquiry instead
          </ButtonLink>
        </div>

        <CallbackForm source="home-contact" as="h3" id="callback" className="self-start" />
      </div>
    </Section>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4 px-5 py-4">
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-indigo" strokeWidth={1.75} />
      <div className="min-w-0 text-small">
        <h3 className="text-eyebrow font-bold uppercase text-ink-secondary">{label}</h3>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}
