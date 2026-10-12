import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Compass,
  Library,
  ListChecks,
  MapPin,
  Newspaper,
  Users,
  type LucideIcon,
} from "lucide-react";

import Link from "@/i18n/Link";
import { Container } from "@/components/ui/Container";
import { ROUTES } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

/**
 * Directory of the site's pages, straight under the hero. The header nav only
 * moves within the homepage; these cards are how a visitor leaves it for a
 * page. Copy describes what each page has — no counts or superlatives (see
 * the no-unverified-claims rule).
 *
 * On phones (below `md`) this is the homepage's main menu: two-up tiles, title
 * only, plus FAQ and Contact — the sections those replace are md-up only.
 */
const CARDS: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: keyof typeof TONES;
  badge?: string;
  /** Phones only: stands in for a homepage section hidden below `md`. */
  phoneOnly?: boolean;
}[] = [
  {
    title: "Courses",
    description: "Foundation, Prelims, Mains and Optional programs, with fees up front.",
    href: ROUTES.courses,
    icon: BookOpen,
    tone: "indigo",
  },
  {
    title: "Admissions & Batches",
    description: "Upcoming batches, timings and how to enrol.",
    href: ROUTES.enrol,
    icon: CalendarDays,
    tone: "kesar",
  },
  {
    title: "Faculty",
    description: "Meet the teachers who will take your classes.",
    href: ROUTES.faculty,
    icon: Users,
    tone: "chilli",
  },
  {
    title: "Mock Test",
    description: "Sit a timed Prelims-style paper and see your score.",
    href: ROUTES.mockTest,
    icon: ClipboardCheck,
    tone: "indigo",
    badge: "Free",
  },
  {
    title: "Practice Quizzes",
    description: "Short question sets with an explanation for every option.",
    href: ROUTES.quizzes,
    icon: ListChecks,
    tone: "kesar",
  },
  {
    title: "Current Affairs",
    description: "The week's developments, linked back to the syllabus.",
    href: ROUTES.currentAffairs,
    icon: Newspaper,
    tone: "chilli",
  },
  {
    title: "Free Resources",
    description: "Syllabus, booklist, PYQ strategy and a study planner.",
    href: ROUTES.resources,
    icon: Library,
    tone: "indigo",
  },
  {
    title: "UPSC Exam Guide",
    description: "How the examination works, stage by stage.",
    href: ROUTES.upscGuide,
    icon: Compass,
    tone: "kesar",
  },
  {
    title: "FAQs",
    description: "Answers to what aspirants ask us most.",
    href: ROUTES.faq,
    icon: CircleHelp,
    tone: "chilli",
    phoneOnly: true,
  },
  {
    title: "Visit or Call",
    description: "Centre address, directions and opening hours.",
    href: ROUTES.contact,
    icon: MapPin,
    tone: "indigo",
    phoneOnly: true,
  },
];

/** Icon tile colours — the Bauhaus triad, each as a pale tint with a deep glyph. */
const TONES = {
  indigo: "bg-indigo-100 text-indigo",
  kesar: "bg-kesar-100 text-kesar-700",
  chilli: "bg-chilli-100 text-chilli-700",
} as const;

export function ExploreCards() {
  return (
    <section aria-labelledby="explore-heading" className="bg-white py-8 md:py-10 lg:py-12">
      <Container size="wide">
        <h2 id="explore-heading" className="sr-only">
          Explore vidyantIAS
        </h2>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {CARDS.map(({ title, description, href, icon: Icon, tone, badge, phoneOnly }) => (
            <li key={href} className={phoneOnly ? "md:hidden" : undefined}>
              <Link
                href={href}
                className="group flex h-full flex-col items-start gap-3 border border-line-strong bg-white p-4 transition-colors hover:border-indigo hover:bg-paper md:flex-row md:gap-4 md:p-5"
              >
                <span
                  aria-hidden
                  className={cn("flex size-11 shrink-0 items-center justify-center", TONES[tone])}
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-body font-bold leading-snug text-indigo">
                      {title}
                    </span>
                    {badge ? (
                      <span className="bg-kesar px-1.5 py-0.5 text-eyebrow font-bold uppercase leading-none text-indigo-900">
                        {badge}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1.5 hidden text-small text-ink-secondary md:block">
                    {description}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden
                  className="mt-1 hidden size-5 shrink-0 md:block text-ink-secondary transition-colors group-hover:text-indigo"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
