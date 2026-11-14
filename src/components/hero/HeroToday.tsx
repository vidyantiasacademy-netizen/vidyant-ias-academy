import {
  BookOpen,
  ChevronRight,
  FileText,
  ListChecks,
  MonitorPlay,
  Newspaper,
  NotebookPen,
  type LucideIcon,
} from "lucide-react";

import { TrackedLink } from "@/components/ui/TrackedLink";
import type { Locale } from "@/i18n/config";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { getHeroToday, type TodayKind } from "@/lib/content/hero-today";

const ICONS: Record<TodayKind, LucideIcon> = {
  "current-affairs": Newspaper,
  "mock-test": ListChecks,
  pyq: FileText,
  notes: NotebookPen,
  demo: MonitorPlay,
  guide: BookOpen,
};

/** Same outer box as the strip, so the streamed content does not shift the hero. */
const FRAME = "grid gap-2 md:grid-cols-3 md:gap-3";

/** Each item is its own card, with a gap between them. */
const CARD = "min-w-0 border border-line-strong bg-white/95";

/**
 * "Today" strip at the foot of the hero: three free things to do right now.
 * It changes as current affairs and mock papers are published, which gives a
 * returning student something new on the first screen.
 */
export async function HeroToday({ locale }: { locale: Locale }) {
  const items = await getHeroToday(locale);

  return (
    <div>
      <p className="mb-2 text-eyebrow font-bold uppercase text-indigo max-md:sr-only short:sr-only">
        Start practising, free
      </p>
      <ul className={FRAME}>
        {items.map((item) => {
          const Icon = ICONS[item.kind];
          return (
            <li key={item.kind} className={CARD}>
              <TrackedLink
                href={item.href}
                event={ANALYTICS_EVENTS.todayStripClick}
                payload={{ location: "home-hero", item: item.kind }}
                className="group flex h-full min-h-16 items-center gap-3 px-4 py-2.5 short:min-h-14 short:py-2 transition-colors hover:bg-kesar-100"
              >
                <Icon aria-hidden className="size-5 shrink-0 text-kesar-600" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.75rem] font-bold uppercase tracking-wide text-kesar-700">
                    {item.kicker}
                  </span>
                  <span className="block truncate text-small font-bold text-indigo">
                    {item.title}
                    {item.meta ? (
                      <span className="font-normal text-ink-secondary"> · {item.meta}</span>
                    ) : null}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden
                  className="size-4 shrink-0 text-indigo transition-transform group-hover:translate-x-0.5"
                />
              </TrackedLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Reserved space while the strip streams in. */
export function HeroTodayFallback() {
  return (
    <div aria-hidden>
      <p className="mb-2 text-eyebrow font-bold uppercase text-indigo max-md:sr-only short:hidden">
        Start practising, free
      </p>
      <div className={FRAME}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${CARD} min-h-16 animate-pulse short:min-h-14`} />
        ))}
      </div>
    </div>
  );
}
