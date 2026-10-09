import { CalendarCheck2, MessageCircle, MonitorPlay, type LucideIcon } from "lucide-react";

import { TrackedAnchor, TrackedLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS, type AnalyticsEvent } from "@/lib/analytics/events";
import { CTA, EXAM_CYCLE, whatsappUrl } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

type HeroAction = {
  id: string;
  /** One verb, set large. */
  verb: string;
  lines: [string, string];
  icon: LucideIcon;
  href: string;
  event: AnalyticsEvent;
  external?: boolean;
  /** The single kesar element of the row — the one that stands for the student. */
  kesar?: boolean;
};

const ACTIONS: HeroAction[] = [
  {
    id: "demo",
    verb: "Attend",
    lines: ["A free demo class", "Judge the teaching"],
    icon: MonitorPlay,
    href: CTA.demo.href,
    event: ANALYTICS_EVENTS.demoClick,
  },
  {
    id: "whatsapp",
    verb: "Talk",
    lines: ["To our academic team", "On WhatsApp"],
    icon: MessageCircle,
    href: whatsappUrl(),
    event: ANALYTICS_EVENTS.whatsappClick,
    external: true,
  },
  {
    id: "enrol",
    verb: "Enrol",
    lines: [EXAM_CYCLE.label, EXAM_CYCLE.admissionNote],
    icon: CalendarCheck2,
    href: CTA.enrol.href,
    event: ANALYTICS_EVENTS.enrolClick,
    kesar: true,
  },
];

/** Three big action tiles under the banner: one verb, two short lines, one icon. */
export function HeroActions() {
  return (
    <ul className="grid gap-4 sm:grid-cols-3 sm:gap-5 xl:gap-8">
      {ACTIONS.map(({ id, verb, lines, icon: Icon, href, event, external, kesar }) => {
        const className = cn(
          "group flex h-full items-start justify-between gap-4 rounded-xl px-5 py-4 transition-[transform,box-shadow] duration-200 ease-[var(--ease-brand)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] lg:px-6 lg:py-5",
          kesar ? "bg-kesar text-indigo-900" : "bg-indigo-100 text-indigo",
        );
        const body = (
          <>
            <span>
              <span className="block text-h2 font-black uppercase leading-none tracking-tight lg:text-h2-lg">
                {verb}
              </span>
              <span className="mt-2 block text-small font-bold uppercase leading-snug tracking-wide">
                {lines[0]}
                <br />
                {lines[1]}
              </span>
            </span>
            <Icon
              aria-hidden
              className="size-8 shrink-0 transition-transform duration-200 ease-[var(--ease-brand)] group-hover:-rotate-6 lg:size-9"
              strokeWidth={2.25}
            />
          </>
        );
        const payload = { location: "home-hero", action: id };

        return (
          <li key={id}>
            {external ? (
              <TrackedAnchor
                href={href}
                target="_blank"
                rel="noreferrer"
                event={event}
                payload={payload}
                className={className}
              >
                {body}
              </TrackedAnchor>
            ) : (
              <TrackedLink href={href} event={event} payload={payload} className={className}>
                {body}
              </TrackedLink>
            )}
          </li>
        );
      })}
    </ul>
  );
}
