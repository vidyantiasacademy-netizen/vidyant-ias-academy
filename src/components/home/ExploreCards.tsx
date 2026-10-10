import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Compass,
  Library,
  ListChecks,
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
 */
const CARDS: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: keyof typeof TONES;
  badge?: string;
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
];

/** Icon tile colours — the Bauhaus triad, each as a pale tint with a deep glyph. */
const TONES = {
  indigo: "bg-indigo-100 text-indigo",
  kesar: "bg-kesar-100 text-kesar-700",
  chilli: "bg-chilli-100 text-chilli-700",
} as const;

export function ExploreCards() {
  return (
    <section aria-labelledby="explore-heading" className="bg-white py-10 lg:py-12">
      <Container size="wide">
        <h2 id="explore-heading" className="sr-only">
          Explore vidyantIAS
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {CARDS.map(({ title, description, href, icon: Icon, tone, badge }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex h-full items-start gap-4 border border-line-strong bg-white p-5 transition-colors hover:border-indigo hover:bg-paper"
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
                  <span className="mt-1.5 block text-small text-ink-secondary">{description}</span>
                </span>
                <ChevronRight
                  aria-hidden
                  className="mt-1 size-5 shrink-0 text-ink-secondary transition-colors group-hover:text-indigo"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
