import type { ComponentType, ReactNode } from "react";
import { SectionArt } from "@/components/ui/SectionArt";
import { ArrowRight, ArrowUpRight, CalendarDays, Clock, Mail, MapPin, Phone } from "lucide-react";

import { SocialIcon } from "@/components/ui/SocialIcon";
import { CallbackForm } from "@/components/forms/CallbackForm";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TrackedAnchor } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { BRAND, CONTACT, CTA, ROUTES, whatsappUrl } from "@/lib/constants/site";

/** Centre information plus the shortest conversion on the page: a callback. */
export function ContactSection() {
  return (
    <Section tone="white" id="contact" containerSize="wide" art={<SectionArt variant="soft-right" />}>
      <SectionHeader
        layout="stack"
        eyebrow="Visit or Call"
        title={
          <>
            Our centre in <em>{BRAND.city}.</em>
          </>
        }
        description="Come and see the classroom, meet the academic team and ask whatever you need to before enrolling."
      />

      <div className="mt-6 flex flex-wrap gap-3 sm:gap-4">
        <ButtonLink href={ROUTES.contact} variant="kesar" size="lg" className="rounded-xl shadow-soft">
          <MapPin aria-hidden className="size-5" />
          Contact &amp; Directions
          <ArrowRight aria-hidden className="size-5" />
        </ButtonLink>
        <ButtonLink href={CTA.counselling.href} variant="secondary" size="lg" className="rounded-xl">
          <CalendarDays aria-hidden className="size-5" />
          Book a Counselling Visit
        </ButtonLink>
      </div>

      <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
        <div>
          <div className="divide-y divide-line rounded-[1.25rem] border border-line/70 bg-white px-5 shadow-soft sm:px-7">
            <ContactRow
              icon={MapPin}
              label="Centre Address"
              aside={
                <a
                  href={CONTACT.mapsDirectionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-small font-bold whitespace-nowrap text-kesar-600 underline-offset-4 hover:underline"
                >
                  Get Directions
                  <ArrowUpRight aria-hidden className="size-4" />
                </a>
              }
            >
              <address className="not-italic text-ink-secondary">
                {CONTACT.addressLines.join(", ")}
              </address>
            </ContactRow>

            <ContactRow icon={Phone} label="Call Us">
              <TrackedAnchor
                href={`tel:${CONTACT.phoneHref}`}
                event={ANALYTICS_EVENTS.phoneClick}
                payload={{ location: "home-contact" }}
                className="font-semibold text-indigo underline-offset-4 hover:underline"
              >
                {CONTACT.phoneDisplay}
              </TrackedAnchor>
            </ContactRow>

            <ContactRow icon={WhatsAppGlyph} label="WhatsApp">
              <TrackedAnchor
                href={whatsappUrl()}
                target="_blank"
                rel="noreferrer"
                event={ANALYTICS_EVENTS.whatsappClick}
                payload={{ location: "home-contact" }}
                className="font-semibold text-kesar-600 underline-offset-4 hover:underline"
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

            <ContactRow icon={Clock} label="Opening Hours">
              <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-0.5">
                {CONTACT.openingHours.map((entry) => (
                  <div key={entry.days} className="contents">
                    <dt className="text-ink-secondary">{entry.days}</dt>
                    <dd className="font-medium text-indigo">{entry.hours}</dd>
                  </div>
                ))}
              </dl>
            </ContactRow>
          </div>

          <ButtonLink href={CTA.enquiry.href} variant="link" className="mt-3 justify-start px-0">
            Prefer to write? Send an enquiry instead
          </ButtonLink>
        </div>

        <CallbackForm source="home-contact" as="h3" id="callback" variant="panel" className="self-start" />
      </div>
    </Section>
  );
}

/** WhatsApp's brand mark, shaped like a lucide icon so `ContactRow` can take it. */
function WhatsAppGlyph({ className }: { className?: string }) {
  return <SocialIcon name="whatsapp" className={className} />;
}

function ContactRow({
  icon: Icon,
  label,
  aside,
  children,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
  label: string;
  /** Right-aligned action on the row, e.g. "Get Directions". */
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 py-4 sm:gap-5">
      <span
        aria-hidden
        className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-kesar-100 text-kesar-500 sm:size-14"
      >
        <Icon className="size-6" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1 text-body">
        <h3 className="text-body-lg font-bold text-indigo">{label}</h3>
        <div className="mt-0.5">{children}</div>
      </div>
      {aside ? <div className="shrink-0 pt-1">{aside}</div> : null}
    </div>
  );
}
