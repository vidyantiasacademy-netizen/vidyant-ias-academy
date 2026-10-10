"use client";

import { Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SocialIcon, type SocialIconName } from "@/components/ui/SocialIcon";
import { TrackedAnchor } from "@/components/ui/TrackedLink";
import { useI18n } from "@/i18n/I18nProvider";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { SOCIAL_LINKS } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

/**
 * Right-edge, vertically centred social rail.
 *
 *  - At rest only a narrow indigo "Follow us" tab shows, flush to the edge.
 *  - Hovering the rail shows the brand icons beside the tab — instantly, no
 *    motion.
 *  - Touch and keyboard have no hover: the tab is a button that toggles the
 *    same state; a tap outside or Escape closes it.
 */
export function SocialRail() {
  const { dict } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      data-open={open || undefined}
      className="group/rail fixed top-1/2 right-0 z-40 flex -translate-y-1/2 items-center"
    >
      <ul
        id="social-rail-links"
        aria-label={dict.common.followUs}
        className="hidden flex-col border border-r-0 border-line-strong bg-white group-hover/rail:flex group-data-open/rail:flex"
      >
        {SOCIAL_LINKS.map((social) => (
          <li key={social.label} className="border-b border-line last:border-b-0">
            <TrackedAnchor
              href={social.href}
              target="_blank"
              rel="noreferrer"
              event={ANALYTICS_EVENTS.socialClick}
              payload={{ network: social.label.toLowerCase(), location: "social-rail" }}
              aria-label={social.label}
              title={social.label}
              className="flex size-11 items-center justify-center hover:bg-paper focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-indigo)]"
            >
              <SocialIcon name={social.icon as SocialIconName} className="size-6" />
            </TrackedAnchor>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="social-rail-links"
        aria-label={dict.common.followUs}
        className={cn(
          "flex w-9 flex-col items-center gap-2 self-stretch justify-center bg-indigo py-3 text-white",
          "hover:bg-indigo-900 group-data-open/rail:bg-indigo-900",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-indigo)]",
        )}
      >
        <Share2 aria-hidden className="size-4" />
        <span
          aria-hidden
          className="text-eyebrow font-semibold uppercase [writing-mode:vertical-rl] rotate-180"
        >
          {dict.common.followUs}
        </span>
      </button>
    </div>
  );
}
