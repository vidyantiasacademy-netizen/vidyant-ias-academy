"use client";

import { ArrowUp, MessageCircle, Phone } from "lucide-react";
import { useEffect, useState } from "react";

import { usePathnameWithoutLocale } from "@/i18n/usePathnameWithoutLocale";
import { TrackedAnchor } from "@/components/ui/TrackedLink";
import { format } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/I18nProvider";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CONTACT, ROUTES, whatsappUrl } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

/**
 * Bottom-right floating stack: back-to-top on every page, plus WhatsApp and
 * call on wide desktops.
 *
 *  - Below `lg` WhatsApp and call live in `StickyMobileCta`, so the stack
 *    holds only back-to-top and sits above that bar (and the safe area).
 *  - The contact pair joins from 1360px, where the page margin is wide enough
 *    for it to sit in the gutter rather than over content. Narrower desktops
 *    reach the same numbers from the contact bar and the footer.
 *  - Both contact controls share one 2-cell block, so the pair reads as one
 *    element instead of three competing squares.
 */
const HIDDEN_ON: string[] = [ROUTES.counselling, ROUTES.demo, ROUTES.contact];

/** Scroll distance (px) after which the back-to-top button appears. */
const SCROLL_THRESHOLD = 600;

const cell =
  "flex size-11 items-center justify-center transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-indigo)]";

export function FloatingActions() {
  const pathname = usePathnameWithoutLocale();
  const { dict } = useI18n();
  const showContact = !HIDDEN_ON.includes(pathname);

  return (
    <div
      className={cn(
        "fixed right-4 z-40 flex flex-col items-end gap-2 lg:right-4 lg:bottom-6",
        showContact
          ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom))]"
          : "bottom-[calc(1rem+env(safe-area-inset-bottom))]",
      )}
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
      className={cn(
        cell,
        "border border-line-strong bg-white text-indigo hover:border-indigo hover:bg-indigo hover:text-white",
        "transition-[opacity,background-color,color,border-color]",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <ArrowUp aria-hidden className="size-5" />
    </button>
  );
}

function ContactActions() {
  const { dict } = useI18n();
  const callLabel = format(dict.common.call, { phone: CONTACT.phoneDisplay });

  return (
    <div className="hidden flex-col border border-indigo bg-white min-[1360px]:flex">
      <TrackedAnchor
        href={whatsappUrl()}
        target="_blank"
        rel="noreferrer"
        event={ANALYTICS_EVENTS.whatsappClick}
        payload={{ location: "floating" }}
        aria-label={dict.common.whatsappChat}
        title={dict.common.whatsappChat}
        className={cn(cell, "bg-indigo text-white hover:bg-indigo-900")}
      >
        <MessageCircle aria-hidden className="size-5" />
      </TrackedAnchor>

      <TrackedAnchor
        href={`tel:${CONTACT.phoneHref}`}
        event={ANALYTICS_EVENTS.phoneClick}
        payload={{ location: "floating" }}
        aria-label={callLabel}
        title={callLabel}
        className={cn(cell, "text-indigo hover:bg-indigo hover:text-white")}
      >
        <Phone aria-hidden className="size-5" />
      </TrackedAnchor>
    </div>
  );
}
