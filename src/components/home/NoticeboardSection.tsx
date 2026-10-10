import { ArrowRight, BellRing, Clock, ListChecks, Newspaper } from "lucide-react";
import type { ReactNode } from "react";

import Link from "@/i18n/Link";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { railList } from "@/components/ui/rail";
import { ANNOUNCEMENT_KINDS } from "@/data/announcements";
import { QUIZ_PLAN, QUIZ_STAGE_LABELS, latestQuizzes } from "@/data/quizzes";
import { getLocale } from "@/i18n/server";
import { ROUTES } from "@/lib/constants/site";
import { getSiteAnnouncements, getSitePosts } from "@/lib/content/site";
import { cn } from "@/lib/utils/cn";
import type { Announcement } from "@/types";

/** Notice tones map onto the badge palette — never colour alone, always a word. */
const NOTICE_TONE: Record<Announcement["tone"], { label: string; tone: "neutral" | "success" | "kesar" }> = {
  info: { label: "Notice", tone: "neutral" },
  success: { label: "Good news", tone: "success" },
  warning: { label: "Deadline", tone: "kesar" },
};

/**
 * Boards share one look so the three read as a set; the accent only colours
 * the numbered index of an empty board's plan. Written out in full for Tailwind.
 */
const ACCENT = {
  chilli: { number: "text-chilli-600" },
  indigo: { number: "text-indigo" },
  kesar: { number: "text-kesar-700" },
} as const;
type Accent = keyof typeof ACCENT;

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

/** A notice counts as new for three days after it goes up. */
function isFresh(iso: string, now = Date.now()) {
  const age = now - new Date(iso).getTime();
  return age >= 0 && age < 3 * 24 * 60 * 60 * 1000;
}

/** A flat calendar block: day big, month small. Faster to scan than "9 Oct". */
function DateTile({ iso }: { iso: string }) {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat("en-IN", { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date);

  return (
    <time
      dateTime={iso}
      className="flex w-14 shrink-0 flex-col self-start items-center overflow-hidden border border-indigo bg-white text-indigo"
    >
      <span className="w-full bg-indigo py-0.5 text-center text-eyebrow font-bold uppercase text-white">
        {month}
      </span>
      <span className="py-1 text-h4 font-bold leading-none tabular-nums tracking-tight">{day}</span>
    </time>
  );
}

/**
 * One of the three boards: a quiet frame, a header that opens on a question
 * with its status as a small tag, and a full-width, thumb-sized link at the
 * foot.
 */
function Board({
  icon,
  hook,
  title,
  description,
  status,
  live = false,
  href,
  linkLabel,
  index,
  children,
}: {
  icon: ReactNode;
  /** The student's own question, read before the board's name. */
  hook: string;
  title: string;
  description: string;
  /** Short state shown in the corner tag — a count, or what is coming. */
  status: string;
  /** Marks the tag with a chilli square. Only the announcements board earns it. */
  live?: boolean;
  href: string;
  linkLabel: string;
  index: 1 | 2 | 3;
  children: ReactNode;
}) {
  return (
    <div className={cn("reveal relative h-full", `reveal-delay-${index}`)}>
      <section className="flex h-full flex-col overflow-hidden border border-line-strong bg-white">
        <header className="border-b border-line px-5 pt-5 pb-5 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center bg-indigo-100 text-indigo">
              {icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-small font-semibold text-ink-secondary">{hook}</p>
              <h3 className="text-h4 font-bold leading-tight text-indigo">{title}</h3>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 bg-paper px-2 py-1 text-eyebrow font-bold uppercase text-ink-secondary">
              {live ? <span aria-hidden className="size-2 shrink-0 bg-chilli" /> : null}
              {status}
            </span>
          </div>
          <p className="mt-3 text-small text-ink-secondary">{description}</p>
        </header>

        <div className="flex-1 px-5 py-2 sm:px-6">{children}</div>

        <Link
          href={href}
          className="group flex h-14 items-center justify-between gap-3 border-t border-line px-5 text-small font-bold text-indigo transition-colors duration-150 hover:bg-indigo hover:text-white sm:px-6"
        >
          {linkLabel}
          <ArrowRight aria-hidden className="size-4.5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </Link>
      </section>
    </div>
  );
}

/** Feed rows: hard hairline rules between entries. */
const FEED = "divide-y divide-line";

/** Numbered row used by the empty-state lists — bigger than a bullet, easier to scan. */
function PlanItem({
  n,
  title,
  note,
  accent,
}: {
  n: number;
  title: string;
  note?: string;
  accent: Accent;
}) {
  return (
    <li className="flex gap-4 py-4">
      <span
        aria-hidden
        className={cn("w-8 shrink-0 pt-0.5 text-small font-bold tabular-nums", ACCENT[accent].number)}
      >
        {String(n).padStart(2, "0")}
      </span>
      <div>
        <p className="text-body font-bold leading-snug text-indigo">{title}</p>
        {note ? <p className="mt-1 text-small text-ink-secondary">{note}</p> : null}
      </div>
    </li>
  );
}

/**
 * The noticeboard: what changed this week, what we published, what you can
 * practise. Each board fills from its own source and falls back to an honest
 * description of what will appear there — never to a sample notice, article or
 * quiz.
 */
export async function NoticeboardSection() {
  const locale = await getLocale();
  const [announcements, posts] = await Promise.all([
    getSiteAnnouncements(locale),
    getSitePosts(locale),
  ]);
  const notices = announcements.slice(0, 4);
  const articles = posts.slice(0, 2);
  const quizzes = latestQuizzes(2);

  return (
    <Section id="noticeboard" tone="paper" containerSize="wide" className="overflow-hidden">
      <SectionHeader
        eyebrow="Noticeboard"
        title="What's new, this week."
        description="Schedule changes, faculty articles and free practice — the three things worth checking back for."
      />

      <div className="relative mt-4 lg:mt-6">
        <div className={cn(railList[3], "relative items-start lg:items-stretch [&>*]:w-[88%] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-[60%] lg:[&>*]:w-auto")}>
          <Board
            index={1}
            live
            icon={<BellRing aria-hidden className="size-5.5" />}
            hook="What changed?"
            title="Announcements"
            description="Batch starts, deadlines and schedule changes — dated and short."
            status={notices.length > 0 ? `${notices.length} active` : "Live"}
            href={ROUTES.events}
            linkLabel="Full calendar"
          >
            {notices.length > 0 ? (
              <ul className={FEED}>
                {notices.map((notice) => {
                  const tone = NOTICE_TONE[notice.tone];
                  return (
                    <li key={notice.id} className="flex gap-4 py-4">
                      <DateTile iso={notice.startsAt} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={tone.tone}>{tone.label}</Badge>
                          {isFresh(notice.startsAt) ? (
                            <span className="bg-chilli-100 px-2 py-1 text-eyebrow font-bold uppercase text-chilli-700">
                              New
                            </span>
                          ) : null}
                        </div>
                        <h4 className="mt-2 text-body font-bold leading-snug text-indigo">
                          {notice.href ? (
                            <Link
                              href={notice.href}
                              className="underline decoration-line-strong decoration-2 underline-offset-4 transition-colors hover:decoration-indigo"
                            >
                              {notice.title}
                            </Link>
                          ) : (
                            notice.title
                          )}
                        </h4>
                        <p className="mt-1 line-clamp-2 text-small text-ink-secondary">{notice.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="pt-4">
                <p className="text-body font-bold text-indigo">All quiet right now.</p>
                <p className="mt-1 text-small text-ink-secondary">
                  When something changes, it lands here the same day:
                </p>
                <ul className={cn(FEED, "mt-2")}>
                  {ANNOUNCEMENT_KINDS.map((kind, i) => (
                    <PlanItem key={kind} n={i + 1} title={kind} accent="chilli" />
                  ))}
                </ul>
              </div>
            )}
          </Board>

          <Board
            index={2}
            icon={<Newspaper aria-hidden className="size-5.5" />}
            hook="Worth a read"
            title="Articles"
            description="Strategy, subject notes and answer writing, from the faculty."
            status={articles.length > 0 ? `${articles.length} latest` : "Coming soon"}
            href={ROUTES.blog}
            linkLabel={articles.length > 0 ? "Read the blog" : "See what we'll cover"}
          >
            {articles.length > 0 ? (
              <ul className={FEED}>
                {articles.map((post) => (
                  <li key={post.id} className="py-4">
                    <Badge tone="neutral">{post.category}</Badge>
                    <h4 className="mt-2 text-body font-bold leading-snug text-indigo">
                      <Link
                        href={`${ROUTES.blog}/${post.slug}`}
                        className="underline decoration-line-strong decoration-2 underline-offset-4 transition-colors hover:decoration-indigo"
                      >
                        {post.title}
                      </Link>
                    </h4>
                    <p className="mt-1 line-clamp-2 text-small text-ink-secondary">{post.excerpt}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-small font-medium text-ink-muted">
                      <Clock aria-hidden className="size-4" />
                      {formatDate(post.publishedAt)} • {post.readingTimeMinutes} min read
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-4">
                <p className="text-body font-bold text-indigo">The first pieces are being written.</p>
                <p className="mt-2 text-small text-ink-secondary">
                  No recycled notes — we&apos;d rather publish nothing. The blog opens with
                  strategy for Prelims, Mains answer writing and picking an optional, by the
                  faculty who teach them.
                </p>
              </div>
            )}
          </Board>

          <Board
            index={3}
            icon={<ListChecks aria-hidden className="size-5.5" />}
            hook="Quick check?"
            title="Quizzes"
            description="Short practice sets. Free, and open to anyone preparing."
            status={quizzes.length > 0 ? `${quizzes.length} to try` : "Free"}
            href={ROUTES.quizzes}
            linkLabel={quizzes.length > 0 ? "All quizzes" : "How quizzes work"}
          >
            {quizzes.length > 0 ? (
              <ul className={FEED}>
                {quizzes.map((quiz) => (
                  <li key={quiz.id} className="py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{QUIZ_STAGE_LABELS[quiz.stage]}</Badge>
                      <Badge tone="neutral">{quiz.subject}</Badge>
                    </div>
                    <h4 className="mt-2 text-body font-bold leading-snug text-indigo">
                      {quiz.href ? (
                        <Link
                          href={quiz.href}
                          className="underline decoration-line-strong decoration-2 underline-offset-4 transition-colors hover:decoration-indigo"
                        >
                          {quiz.title}
                        </Link>
                      ) : (
                        quiz.title
                      )}
                    </h4>
                    <p className="mt-2 text-small font-medium text-ink-muted">
                      {quiz.questionCount} questions • {quiz.durationMinutes} min
                      {quiz.href ? null : (
                        <span className="font-bold text-kesar-700"> • Opens {formatDate(quiz.publishedAt)}</span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="pt-4">
                <p className="text-body font-bold text-indigo">Starts with the first batch.</p>
                <ul className={cn(FEED, "mt-2")}>
                  {QUIZ_PLAN.map((item, i) => (
                    <PlanItem key={item.stage} n={i + 1} title={item.title} note={item.note} accent="kesar" />
                  ))}
                </ul>
              </div>
            )}
          </Board>
        </div>
      </div>
    </Section>
  );
}
