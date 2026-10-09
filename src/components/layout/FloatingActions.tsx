"use client";

import { MessageCircle, Phone } from "lucide-react";

import { usePathnameWithoutLocale } from "@/i18n/usePathnameWithoutLocale";
import { TrackedAnchor } from "@/components/ui/TrackedLink";
import { format } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/I18nProvider";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CONTACT, ROUTES, whatsappUrl } from "@/lib/constants/site";

/**
 * Desktop WhatsApp and call buttons. Below `lg` the same two actions live in
 * `StickyMobileCta`, so this is hidden there to avoid a double bar.
 */
const HIDDEN_ON: string[] = [ROUTES.counselling, ROUTES.demo, ROUTES.contact];

export function FloatingActions() {
  const pathname = usePathnameWithoutLocale();
  const { dict } = useI18n();
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden flex-col items-end gap-3 lg:flex">
      <TrackedAnchor
        href={whatsappUrl()}
        target="_blank"
        rel="noreferrer"
        event={ANALYTICS_EVENTS.whatsappClick}
        payload={{ location: "floating" }}
        className="group flex items-center rounded-full bg-indigo-gradient px-4 text-white shadow-[var(--shadow-card-hover)] transition-[filter] duration-200 hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-indigo)]"
      >
        <MessageCircle aria-hidden className="my-3.5 size-5 shrink-0" />
        <span className="max-w-0 whitespace-nowrap text-small font-semibold opacity-0 transition-[max-width,opacity,margin] duration-200 group-hover:ml-2.5 group-hover:max-w-40 group-hover:opacity-100 group-focus-visible:ml-2.5 group-focus-visible:max-w-40 group-focus-visible:opacity-100">
          {dict.common.whatsappShort}
        </span>
        <span className="sr-only">{dict.common.whatsappChat}</span>
      </TrackedAnchor>

      <TrackedAnchor
        href={`tel:${CONTACT.phoneHref}`}
        event={ANALYTICS_EVENTS.phoneClick}
        payload={{ location: "floating" }}
        className="group flex items-center rounded-full border border-line-strong bg-white px-4 text-indigo shadow-[var(--shadow-card)] transition-colors duration-200 hover:border-indigo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-indigo)]"
      >
        <Phone aria-hidden className="my-3.5 size-5 shrink-0" />
        <span className="max-w-0 whitespace-nowrap text-small font-semibold opacity-0 transition-[max-width,opacity,margin] duration-200 group-hover:ml-2.5 group-hover:max-w-40 group-hover:opacity-100 group-focus-visible:ml-2.5 group-focus-visible:max-w-40 group-focus-visible:opacity-100">
          {CONTACT.phoneDisplay}
        </span>
        <span className="sr-only">
          {format(dict.common.call, { phone: CONTACT.phoneDisplay })}
        </span>
      </TrackedAnchor>
    </div>
  );
}
