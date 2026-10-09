"use client";

import { MessageCircle, Phone } from "lucide-react";

import { usePathnameWithoutLocale } from "@/i18n/usePathnameWithoutLocale";
import { TrackedAnchor, TrackedButtonLink } from "@/components/ui/TrackedLink";
import { format } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/I18nProvider";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CONTACT, CTA, ROUTES, whatsappUrl } from "@/lib/constants/site";

/** Persistent mobile conversion bar. Hidden on the pages that host the forms. */
const HIDDEN_ON: string[] = [ROUTES.counselling, ROUTES.demo, ROUTES.contact];

export function StickyMobileCta() {
  const pathname = usePathnameWithoutLocale();
  const { dict } = useI18n();
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-indigo bg-white px-4 py-3 lg:hidden">
      <div className="flex items-center gap-2.5">
        <TrackedButtonLink
          href={CTA.counselling.href}
          variant="primary"
          size="md"
          fullWidth
          event={ANALYTICS_EVENTS.counsellingClick}
          payload={{ location: "sticky-mobile" }}
        >
          {dict.cta.counselling}
        </TrackedButtonLink>
        <TrackedAnchor
          href={whatsappUrl()}
          target="_blank"
          rel="noreferrer"
          event={ANALYTICS_EVENTS.whatsappClick}
          payload={{ location: "sticky-mobile" }}
          aria-label={dict.common.whatsappChat}
          className="flex size-12 shrink-0 items-center justify-center border-2 border-indigo text-indigo transition-colors hover:bg-indigo hover:text-white"
        >
          <MessageCircle aria-hidden className="size-5" />
        </TrackedAnchor>
        <TrackedAnchor
          href={`tel:${CONTACT.phoneHref}`}
          event={ANALYTICS_EVENTS.phoneClick}
          payload={{ location: "sticky-mobile" }}
          aria-label={format(dict.common.call, { phone: CONTACT.phoneDisplay })}
          className="flex size-12 shrink-0 items-center justify-center border-2 border-indigo text-indigo transition-colors hover:bg-indigo hover:text-white"
        >
          <Phone aria-hidden className="size-5" />
        </TrackedAnchor>
      </div>
    </div>
  );
}
