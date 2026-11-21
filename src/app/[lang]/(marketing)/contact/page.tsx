import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { SocialIcon } from "@/components/ui/SocialIcon";
import { CallbackForm } from "@/components/forms/CallbackForm";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { CTASection } from "@/components/ui/CTASection";
import { TrackedAnchor } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { BRAND, CONTACT, ROUTES, whatsappUrl } from "@/lib/constants/site";
import { pageMetadata, SEO_KEYWORDS } from "@/lib/seo/metadata";
import { jsonLd, organizationSchema } from "@/lib/seo/structured-data";

export const generateMetadata = () => pageMetadata({
  title: `Contact & Centre Address in ${BRAND.city}`,
  description:
    "Visit, call, email or message vidyantIAS in Pune. Centre address, working hours, directions and an enquiry form — questions are answered without requiring a call.",
  path: ROUTES.contact,
  keywords: [...SEO_KEYWORDS.primary, "vidyantIAS contact", "UPSC coaching near me Pune"],
});

export default function ContactPage() {
  const mapSrc = CONTACT.mapsEmbedUrl;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={`Visit us in ${BRAND.city}.`}
        description="Come and see the centre, meet the academic team and ask whatever you need to before enrolling."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Contact" }]}
      />

      <Section containerSize="wide">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <MapPin aria-hidden className="size-5 text-kesar-600" />
              <h2 className="mt-4 text-h4 font-bold">Visit us</h2>
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
                className="mt-4 inline-block text-small font-semibold text-indigo hover:text-indigo-900 hover:underline underline-offset-4"
              >
                Get directions
              </a>
            </Card>

            <Card>
              <Phone aria-hidden className="size-5 text-kesar-600" />
              <h2 className="mt-4 text-h4 font-bold">Call us</h2>
              <TrackedAnchor
                href={`tel:${CONTACT.phoneHref}`}
                event={ANALYTICS_EVENTS.phoneClick}
                payload={{ location: "contact-page" }}
                className="mt-3 inline-block text-body font-semibold text-indigo hover:text-indigo-900 hover:underline underline-offset-4"
              >
                {CONTACT.phoneDisplay}
              </TrackedAnchor>
              <p className="mt-3 text-small text-ink-secondary">
                Admissions and academic queries during working hours.
              </p>
            </Card>

            <Card>
              <SocialIcon name="whatsapp" className="size-6" />
              <h2 className="mt-4 text-h4 font-bold">WhatsApp</h2>
              <TrackedAnchor
                href={whatsappUrl()}
                target="_blank"
                rel="noreferrer"
                event={ANALYTICS_EVENTS.whatsappClick}
                payload={{ location: "contact-page" }}
                className="mt-3 inline-block text-body font-semibold text-indigo hover:text-indigo-900 hover:underline underline-offset-4"
              >
                Message us on WhatsApp
              </TrackedAnchor>
              <p className="mt-3 text-small text-ink-secondary">
                Useful for quick questions about batches and schedules.
              </p>
            </Card>

            <Card>
              <Mail aria-hidden className="size-5 text-kesar-600" />
              <h2 className="mt-4 text-h4 font-bold">Email</h2>
              <a
                href={`mailto:${CONTACT.email}`}
                className="mt-3 inline-block text-body font-semibold text-indigo hover:text-indigo-900 hover:underline underline-offset-4"
              >
                {CONTACT.email}
              </a>
              <p className="mt-3 text-small text-ink-secondary">
                For detailed queries and documents.
              </p>
            </Card>

            <Card className="sm:col-span-2">
              <Clock aria-hidden className="size-5 text-kesar-600" />
              <h2 className="mt-4 text-h4 font-bold">Opening hours</h2>
              <dl className="mt-3 max-w-md space-y-2">
                {CONTACT.openingHours.map((entry) => (
                  <div key={entry.days} className="flex justify-between gap-6 text-body">
                    <dt className="text-ink-secondary">{entry.days}</dt>
                    <dd className="font-medium text-indigo">{entry.hours}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <CallbackForm source="contact-page" id="callback" />
            <EnquiryForm id="enquiry" />
          </div>
        </div>
      </Section>

      <Section tone="paper" containerSize="wide" spacing="tight">
        <div className="overflow-hidden border border-line">
          <iframe
            title={`Map showing ${BRAND.name} in ${BRAND.city}`}
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[360px] w-full border-0 sm:h-[420px]"
          />
        </div>
      </Section>

      <CTASection
        title="Prefer to talk it through?"
        description="Book a free counselling session and we will call you at a time that suits you."
        location="contact-final"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema()) }}
      />
    </>
  );
}
