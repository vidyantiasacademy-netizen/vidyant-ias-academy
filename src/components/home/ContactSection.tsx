import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

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

      <div className="mt-12 grid gap-10 lg:mt-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="sm:col-span-2">
            <MapPin aria-hidden className="size-5 text-kesar-600" />
            <h3 className="mt-4 text-h4 font-semibold">Centre address</h3>
            <address className="mt-3 text-body not-italic text-ink-secondary">
              {CONTACT.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <a
              href={CONTACT.mapsDirectionsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-small font-semibold text-indigo hover:text-kesar-600"
            >
              Get directions
            </a>
          </Card>

          <Card>
            <Phone aria-hidden className="size-5 text-kesar-600" />
            <h3 className="mt-4 text-h4 font-semibold">Call us</h3>
            <TrackedAnchor
              href={`tel:${CONTACT.phoneHref}`}
              event={ANALYTICS_EVENTS.phoneClick}
              payload={{ location: "home-contact" }}
              className="mt-3 inline-block text-body font-semibold text-indigo hover:text-kesar-600"
            >
              {CONTACT.phoneDisplay}
            </TrackedAnchor>
          </Card>

          <Card>
            <MessageCircle aria-hidden className="size-5 text-kesar-600" />
            <h3 className="mt-4 text-h4 font-semibold">WhatsApp</h3>
            <TrackedAnchor
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
              event={ANALYTICS_EVENTS.whatsappClick}
              payload={{ location: "home-contact" }}
              className="mt-3 inline-block text-body font-semibold text-indigo hover:text-kesar-600"
            >
              Message us
            </TrackedAnchor>
          </Card>

          <Card>
            <Mail aria-hidden className="size-5 text-kesar-600" />
            <h3 className="mt-4 text-h4 font-semibold">Email</h3>
            <a
              href={`mailto:${CONTACT.email}`}
              className="mt-3 inline-block break-all text-body font-semibold text-indigo hover:text-kesar-600"
            >
              {CONTACT.email}
            </a>
          </Card>

          <Card>
            <Clock aria-hidden className="size-5 text-kesar-600" />
            <h3 className="mt-4 text-h4 font-semibold">Opening hours</h3>
            <dl className="mt-3 space-y-2 text-small">
              {CONTACT.openingHours.map((entry) => (
                <div key={entry.days}>
                  <dt className="text-ink-secondary">{entry.days}</dt>
                  <dd className="font-medium text-indigo">{entry.hours}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <ButtonLink
            href={CTA.enquiry.href}
            variant="link"
            className="justify-start px-0 sm:col-span-2"
          >
            Prefer to write? Send an enquiry instead
          </ButtonLink>
        </div>

        <CallbackForm source="home-contact" as="h3" id="callback" className="self-start" />
      </div>
    </Section>
  );
}
