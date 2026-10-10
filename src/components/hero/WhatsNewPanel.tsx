import {
  ArrowRight,
  BookOpenCheck,
  CalendarCheck2,
  ChevronDown,
  MonitorPlay,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";

import Link from "@/i18n/Link";
import { getLocale } from "@/i18n/server";
import { CTA, EXAM_CYCLE, ROUTES } from "@/lib/constants/site";
import { getSiteAnnouncements } from "@/lib/content/site";

/**
 * Standing items shown while the announcements board is empty. Each is true
 * today and links to a real route — no dates, because none are on record yet.
 */
const STANDING_ITEMS: { id: string; icon: LucideIcon; label: string; title: string; href: string }[] = [
  {
    id: "admissions",
    icon: CalendarCheck2,
    label: EXAM_CYCLE.admissionNote,
    title: `${EXAM_CYCLE.label} batches`,
    href: CTA.enrol.href,
  },
  {
    id: "demo",
    icon: MonitorPlay,
    label: "Free",
    title: "Sit in on a live demo class",
    href: CTA.demo.href,
  },
  {
    id: "counselling",
    icon: UserRoundCheck,
    label: "Free",
    title: "One-to-one preparation counselling",
    href: CTA.counselling.href,
  },
  {
    id: "starter-kit",
    icon: BookOpenCheck,
    label: "Free download",
    title: "UPSC starter kit and PYQ guide",
    href: ROUTES.resources,
  },
];

function dayOf(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit" }).format(new Date(iso));
}

function dateLine(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/** Solid indigo square holding the day or an icon — a flat Swiss block. */
function Tile({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center bg-indigo text-body font-bold tabular-nums text-white">
      {children}
    </span>
  );
}

const rowClass =
  "group flex gap-4 border-b border-line py-3 first:pt-0 last:border-b-0";

/**
 * Homepage "What's new" panel beside the banner. Dated announcements lead when
 * there are any; until then it lists the standing offers, never a sample notice.
 */
export async function WhatsNewPanel() {
  const notices = (await getSiteAnnouncements(await getLocale())).slice(0, 4);

  return (
    <section
      aria-labelledby="whats-new"
      className="flex h-full flex-col overflow-hidden border-2 border-indigo bg-white"
    >
      <header className="flex items-center justify-between gap-3 border-b-2 border-indigo bg-white px-5 py-3">
        <h2 id="whats-new" className="text-h4 font-bold text-indigo">
          What&apos;s new
        </h2>
        <ChevronDown aria-hidden className="size-6 text-chilli-600" strokeWidth={3} />
      </header>

      <ul className="flex-1 px-5 py-4">
        {notices.length > 0
          ? notices.map((notice) => (
              <li key={notice.id} className={rowClass}>
                <Tile>{dayOf(notice.startsAt)}</Tile>
                <div className="min-w-0">
                  <time dateTime={notice.startsAt} className="text-small font-medium text-ink-muted">
                    {dateLine(notice.startsAt)}
                  </time>
                  <p className="mt-0.5 text-body font-bold text-indigo">
                    {notice.href ? (
                      <Link href={notice.href} className="hover:text-chilli-600">
                        {notice.title}
                      </Link>
                    ) : (
                      notice.title
                    )}
                  </p>
                </div>
              </li>
            ))
          : STANDING_ITEMS.map(({ id, icon: Icon, label, title, href }) => (
              <li key={id} className={rowClass}>
                <Tile>
                  <Icon aria-hidden className="size-5" />
                </Tile>
                <div className="min-w-0">
                  <p className="text-eyebrow font-bold uppercase tracking-wide text-kesar-600">
                    {label}
                  </p>
                  <Link
                    href={href}
                    className="mt-0.5 block text-body font-bold text-indigo hover:text-chilli-600"
                  >
                    {title}
                  </Link>
                </div>
              </li>
            ))}
      </ul>

      <Link
        href={ROUTES.events}
        className="flex min-h-12 items-center justify-between gap-3 border-t-2 border-indigo bg-white px-5 text-body font-bold text-indigo transition-colors duration-150 hover:bg-indigo hover:text-white"
      >
        All announcements
        <ArrowRight
          aria-hidden
          className="size-4"
        />
      </Link>
    </section>
  );
}
