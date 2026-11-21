import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Compass,
  ListChecks,
  MapPin,
  Newspaper,
  NotebookPen,
  Users,
  type LucideIcon,
} from "lucide-react";

import Link from "@/i18n/Link";
import { Container } from "@/components/ui/Container";
import { ROUTES } from "@/lib/constants/site";

/**
 * Directory of the site's pages, straight under the hero. The header nav only
 * moves within the homepage; these cards are how a visitor leaves it for a
 * page. Copy describes what each page has — no counts or superlatives (see
 * the no-unverified-claims rule).
 *
 * On phones (below `md`) it sits under the stage picker as a compact
 * three-up grid — icon and title only — plus FAQ and Contact, as the
 * sections those replace are md-up only.
 */
const CARDS: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  /** Phones only: stands in for a homepage section hidden below `md`. */
  phoneOnly?: boolean;
}[] = [
  {
    title: "Courses",
    description: "Foundation, Prelims, Mains and Optional programs.",
    href: ROUTES.courses,
    icon: BookOpen,
  },
  {
    title: "Mock Test",
    description: "Attempt timed Prelims-style tests and analyse your score.",
    href: ROUTES.mockTest,
    icon: ClipboardCheck,
    badge: "Free",
  },
  {
    title: "Current Affairs",
    description: "Weekly updates, analyses and syllabus linkages.",
    href: ROUTES.currentAffairs,
    icon: Newspaper,
  },
  {
    title: "Admissions & Batches",
    description: "Upcoming batches, timelines and enrolment details.",
    href: ROUTES.enrol,
    icon: CalendarDays,
  },
  {
    title: "Notes",
    description: "Subject-wise notes (PDFs) aligned with the syllabus.",
    href: ROUTES.notes,
    icon: NotebookPen,
  },
  {
    title: "PYQ Test",
    description: "Sit real previous-year papers, timed, and get your analysis.",
    href: ROUTES.pyqTest,
    icon: ListChecks,
    badge: "Free",
  },
  {
    title: "Faculty",
    description: "Meet the mentors and know their expertise.",
    href: ROUTES.faculty,
    icon: Users,
  },
  {
    title: "UPSC Exam Guide",
    description: "A complete guide to the exam – pattern, strategy and preparation plan.",
    href: ROUTES.upscGuide,
    icon: Compass,
  },
  {
    title: "FAQs",
    description: "Answers to what aspirants ask us most.",
    href: ROUTES.faq,
    icon: CircleHelp,
    phoneOnly: true,
  },
  {
    title: "Visit or Call",
    description: "Centre address, directions and opening hours.",
    href: ROUTES.contact,
    icon: MapPin,
    phoneOnly: true,
  },
];

/** `headingId` keeps ids unique when the page renders the block twice (phone and wide). */
export function ExploreCards({ headingId = "explore-heading" }: { headingId?: string }) {
  return (
    <section aria-labelledby={headingId} className="bg-white py-8 md:py-10 lg:py-12">
      <Container size="wide">
        <h2
          id={headingId}
          className="mb-4 text-h3 font-bold text-indigo md:sr-only"
        >
          Free learning &amp; more
        </h2>
        <ul className="grid grid-cols-3 gap-2 md:grid-cols-2 md:gap-3 lg:grid-cols-4 lg:gap-4">
          {CARDS.map(({ title, description, href, icon: Icon, badge, phoneOnly }) => (
            <li key={href} className={phoneOnly ? "md:hidden" : undefined}>
              {/* Phones: icon over title, centred. md-up: icon + title + chevron
                  in a row, description underneath at full card width. */}
              <Link
                href={href}
                className="group relative isolate flex h-full min-h-24 flex-col items-center gap-2 overflow-hidden rounded-2xl border border-line bg-white cursor-pointer px-1.5 py-3 text-center shadow-soft transition-[border-color,box-shadow] hover:border-kesar hover:shadow-soft-hover md:items-stretch md:gap-5 md:p-6 md:text-left"
              >
                {/* Decorative backdrop, md-up: a warm glow and dot grid in the
                    top-right corner, and the card's own icon as an oversized
                    ghost in the bottom-right. Pure ornament — aria-hidden,
                    behind the content (-z-10), motion only if allowed. */}
                <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden md:block">
                  <span className="absolute -top-16 -right-16 size-44 rounded-full bg-kesar-100 opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="absolute top-0 right-0 h-24 w-32 bg-[radial-gradient(circle,var(--color-kesar)_1px,transparent_1.5px)] [background-size:12px_12px] opacity-30 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
                  <Icon
                    className="absolute -right-5 -bottom-6 size-32 -rotate-12 text-kesar opacity-[0.09] transition-[transform,opacity] duration-300 ease-out motion-safe:group-hover:rotate-0 motion-safe:group-hover:scale-105 group-hover:opacity-[0.14]"
                    strokeWidth={1.25}
                  />
                </span>
                <span className="flex flex-col items-center gap-2 md:flex-row md:items-start md:gap-4">
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-kesar-100 text-indigo md:size-14 md:rounded-2xl"
                  >
                    <Icon className="size-5 md:size-7" strokeWidth={1.75} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col items-center gap-1.5 md:items-start md:pt-1">
                    <span className="text-small font-bold leading-snug text-indigo md:font-display md:text-h4 md:leading-tight">
                      {title}
                    </span>
                    {badge ? (
                      <span className="rounded-full bg-kesar px-2.5 py-1 text-eyebrow font-bold uppercase leading-none tracking-wider text-indigo-900">
                        {badge}
                      </span>
                    ) : null}
                  </span>
                  <ChevronRight
                    aria-hidden
                    className="mt-2 hidden size-6 shrink-0 text-indigo transition-transform group-hover:translate-x-0.5 md:block"
                    strokeWidth={2.25}
                  />
                </span>
                <span className="hidden text-small text-ink-secondary md:block">
                  {description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
