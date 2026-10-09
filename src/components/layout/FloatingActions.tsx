"use client";

import { ArrowUp, MessageCircle, Phone } from "lucide-react";
import { useEffect, useState } from "react";

import { usePathnameWithoutLocale } from "@/i18n/usePathnameWithoutLocale";
import { TrackedAnchor } from "@/components/ui/TrackedLink";
import { format } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/I18nProvider";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CONTACT, ROUTES, whatsappUrl } from "@/lib/constants/site";

/**
 * Bottom-right floating stack: back-to-top on every page, plus desktop
 * WhatsApp and call buttons. Below `lg` those two actions live in
 * `StickyMobileCta`, so they are hidden there to avoid a double bar — and the
 * stack sits above that bar.
 */
const HIDDEN_ON: string[] = [ROUTES.counselling, ROUTES.demo, ROUTES.contact];

/** Scroll distance (px) after which the back-to-top button appears. */
const SCROLL_THRESHOLD = 600;

export function FloatingActions() {
  const pathname = usePathnameWithoutLocale();
  const { dict } = useI18n();
  const showContact = !HIDDEN_ON.includes(pathname);

  return (
    <div
      className={`fixed right-4 z-40 flex flex-col items-end gap-3 lg:bottom-6 lg:right-6 ${
        showContact ? "bottom-24" : "bottom-6"
      }`}
    >
      <ScrollToTop label={dict.common.backToTop} />
      {showContact && <ContactActions />}
    </div>
  );
}

function ScrollToTop({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={label}
      title={label}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`flex size-12 items-center justify-center border-2 border-indigo bg-white text-indigo ring-2 ring-white transition-[opacity,transform,background-color,color] duration-200 hover:bg-indigo hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-indigo)] lg:h-[52px] lg:w-14 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <ArrowUp aria-hidden className="size-5" />
    </button>
  );
}

function ContactActions() {
  const { dict } = useI18n();

  return (
    <div className="hidden flex-col items-end gap-3 lg:flex">
      <TrackedAnchor
        href={whatsappUrl()}
        target="_blank"
        rel="noreferrer"
        event={ANALYTICS_EVENTS.whatsappClick}
        payload={{ location: "floating" }}
        className="group flex items-center border-2 border-indigo bg-indigo px-4 ring-2 ring-white text-white transition-colors duration-150 hover:border-indigo-900 hover:bg-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-indigo)]"
      >
        <MessageCircle aria-hidden className="my-3.5 size-5 shrink-0" />
        <span className="max-w-0 whitespace-nowrap text-small font-bold opacity-0 transition-[max-width,opacity,margin] duration-200 group-hover:ml-2.5 group-hover:max-w-40 group-hover:opacity-100 group-focus-visible:ml-2.5 group-focus-visible:max-w-40 group-focus-visible:opacity-100">
          {dict.common.whatsappShort}
        </span>
        <span className="sr-only">{dict.common.whatsappChat}</span>
      </TrackedAnchor>

      <TrackedAnchor
        href={`tel:${CONTACT.phoneHref}`}
        event={ANALYTICS_EVENTS.phoneClick}
        payload={{ location: "floating" }}
        className="group flex items-center border-2 border-indigo bg-white px-4 ring-2 ring-white text-indigo transition-colors duration-150 hover:bg-indigo hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-indigo)]"
      >
        <Phone aria-hidden className="my-3.5 size-5 shrink-0" />
        <span className="max-w-0 whitespace-nowrap text-small font-bold opacity-0 transition-[max-width,opacity,margin] duration-200 group-hover:ml-2.5 group-hover:max-w-40 group-hover:opacity-100 group-focus-visible:ml-2.5 group-focus-visible:max-w-40 group-focus-visible:opacity-100">
          {CONTACT.phoneDisplay}
        </span>
        <span className="sr-only">
          {format(dict.common.call, { phone: CONTACT.phoneDisplay })}
        </span>
      </TrackedAnchor>
    </div>
  );
}
