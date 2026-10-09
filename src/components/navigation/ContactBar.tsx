"use client";

import { Clock, Mail, MessageCircle, Phone } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { TrackedAnchor } from "@/components/ui/TrackedLink";
import { format } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/I18nProvider";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CONTACT, whatsappUrl } from "@/lib/constants/site";

const linkClass =
  "flex min-h-10 items-center gap-2 whitespace-nowrap font-semibold text-indigo underline-offset-4 transition-colors hover:underline hover:decoration-kesar hover:decoration-2";

/**
 * Contact strip at the top of the header. Phone and WhatsApp show at every
 * width — the audience calls before it fills a form — email joins from `sm`
 * and opening hours from `lg`, as the row gains room.
 */
export function ContactBar() {
  const { dict } = useI18n();
  const hours = dict.footer.openingHours[0];

  return (
    <div className="border-b border-line bg-paper text-small">
      <Container size="wide">
        <div className="flex items-center justify-between gap-4">
          <ul
            aria-label={dict.nav.contactDetails}
            className="flex min-w-0 items-center gap-x-4 sm:gap-x-6"
          >
            <li>
              <TrackedAnchor
                href={`tel:${CONTACT.phoneHref}`}
                event={ANALYTICS_EVENTS.phoneClick}
                payload={{ location: "contact-bar" }}
                aria-label={format(dict.common.call, { phone: CONTACT.phoneDisplay })}
                className={linkClass}
              >
                <Phone aria-hidden className="size-4 shrink-0 text-indigo/70" />
                {CONTACT.phoneDisplay}
              </TrackedAnchor>
            </li>
            <li>
              <TrackedAnchor
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                event={ANALYTICS_EVENTS.whatsappClick}
                payload={{ location: "contact-bar" }}
                aria-label={dict.common.whatsappChat}
                className={linkClass}
              >
                <MessageCircle aria-hidden className="size-4 shrink-0 text-indigo/70" />
                {dict.common.whatsappShort}
              </TrackedAnchor>
            </li>
            <li className="hidden sm:block">
              <a href={`mailto:${CONTACT.email}`} className={linkClass}>
                <Mail aria-hidden className="size-4 shrink-0 text-indigo/70" />
                {CONTACT.email}
              </a>
            </li>
          </ul>

          <p className="hidden items-center gap-2 whitespace-nowrap text-ink-secondary lg:flex">
            <Clock aria-hidden className="size-4 shrink-0 text-indigo/70" />
            {hours.days}, {hours.hours}
          </p>
        </div>
      </Container>
    </div>
  );
}
