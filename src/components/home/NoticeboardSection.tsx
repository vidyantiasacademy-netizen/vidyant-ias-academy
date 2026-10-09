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
 * One accent per board, the same trio the Programs tiles use, so the two
 * sections read as one system: a hard offset shadow, a header wash and an
 * icon chip. Written out in full for Tailwind.
 */
const ACCENT = {
  chilli: {
    shadow: "shadow-[5px_5px_0_0_var(--color-chilli)]",
    wash: "bg-chilli-100",
    chip: "bg-white text-chilli-600",
    number: "bg-chilli-100 text-chilli-700",
  },
  cameo: {
    shadow: "shadow-[5px_5px_0_0_var(--color-cameo)]",
    wash: "bg-cameo-100",
    chip: "bg-white text-indigo",
    number: "bg-cameo-100 text-indigo",
  },
  kesar: {
    shadow: "shadow-[5px_5px_0_0_var(--color-kesar)]",
    wash: "bg-kesar-100",
    chip: "bg-white text-kesar-700",
    number: "bg-kesar-100 text-kesar-700",
  },
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

/** A tear-off calendar leaf: day big, month small. Faster to scan than "9 Oct". */
function DateTile({ iso }: { iso: string }) {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat("en-IN", { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date);

  return (
    <time
      dateTime={iso}
      className="flex w-14 shrink-0 flex-col self-start items-center overflow-hidden rounded-lg border-2 border-indigo bg-white text-indigo"
    >
      <span className="w-full bg-indigo-gradient py-0.5 text-center text-eyebrow font-bold uppercase text-white">
        {month}
      </span>
      <span className="py-1 text-h4 font-black leading-none tracking-tight">{day}</span>
    </time>
  );
}

/**
 * One of the three boards: a bordered card with a hard accent shadow, a
 * tinted header that opens on a question, and a full-width, thumb-sized link
 * at the foot. The status sticker sits on the edge, outside the clipped card.
 */
function Board({
  icon,
  hook,
  title,
  description,
  status,
  live = false,
  accent,
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
  /** Short state shown in the sticker — a count, or what is coming. */
  status: string;
  /** Pulses the sticker dot. Only the announcements board earns it. */
  live?: boolean;
  accent: Accent;
  href: string;
  linkLabel: string;
  index: 1 | 2 | 3;
  children: ReactNode;
}) {
  const { shadow, wash, chip } = ACCENT[accent];

  return (
    <div className={cn("reveal relative h-full", `reveal-delay-${index}`)}>
      <span
        className={cn(
          "pointer-events-none absolute -top-3 right-4 z-10 inline-flex items-center gap-1.5 rounded-md border-2 border-indigo bg-white px-2 py-0.5 text-eyebrow font-bold uppercase text-indigo shadow-[2px_2px_0_0_var(--color-indigo)]",
          index % 2 === 0 ? "-rotate-3" : "rotate-3",
        )}
      >
        {live ? (
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-chilli opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-chilli" />
          </span>
        ) : null}
        {status}
      </span>

      <section
        className={cn(
          "group/board flex h-full flex-col overflow-hidden rounded-xl border-2 border-indigo bg-white",
          "transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0_var(--color-indigo)]",
          shadow,
        )}
      >
        <header className={cn("border-b-2 border-indigo px-5 pt-6 pb-5 sm:px-6", wash)}>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-lg border-2 border-indigo shadow-[2px_2px_0_0_var(--color-indigo)]",
                "transition-transform duration-200 ease-[var(--ease-brand)] group-hover/board:-rotate-6",
                chip,
              )}
            >
              {icon}
            </span>
            <div>
              <p className="text-small font-semibold text-ink-secondary">{hook}</p>
              <h3 className="text-h3 font-black leading-tight tracking-tight text-indigo">{title}</h3>
            </div>
          </div>
          <p className="mt-3 text-small text-ink-secondary">{description}</p>
        </header>

        <div className="flex-1 px-5 py-2 sm:px-6">{children}</div>

        <Link
          href={href}
          className="group/link flex h-14 items-center justify-between gap-3 border-t-2 border-indigo px-5 text-body font-bold text-indigo transition-colors duration-150 hover:bg-cameo-100 sm:px-6"
        >
          {linkLabel}
          <span className="flex size-9 items-center justify-center rounded-full border-2 border-indigo bg-white transition-[background-color,transform] duration-150 ease-out group-hover/link:translate-x-1 group-hover/link:bg-kesar">
            <ArrowRight aria-hidden className="size-4.5" />
          </span>
        </Link>
      </section>
    </div>
  );
}

/** Feed rows: dashed rules between entries, like a pinned-up sheet. */
const FEED = "divide-y-2 divide-dashed divide-line";

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
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg border-2 border-indigo text-small font-black",
          ACCENT[accent].number,
        )}
      >
        {String(n).padStart(2, "0")}
      </span>
      <div className="pt-1.5">
        <p className="text-body font-semibold leading-snug text-indigo">{title}</p>
        {note ? <p className="mt-1 text-small text-ink-secondary">{note}</p> : null}
      </div>
    </li>
  );
}

/**
 * Abstract line-art behind the three boards: a wide cameo ribbon, a looping
 * chilli pen line and a dashed indigo rule, with a kesar ring and a sparkle
 * pinned to the corners. The cards are opaque, so the lines only show in the
 * gaps and margins — texture, never behind text. The strokes stretch with the
 * row (`non-scaling-stroke` keeps their weight); the ring and sparkle sit in
 * their own SVGs so they stay round.
 */
function BoardLines() {
  return (
    <div aria-hidden className="pointer-events-none absolute -inset-x-4 inset-y-0 sm:-inset-x-6 lg:-inset-x-16">
      <svg
        focusable="false"
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
        fill="none"
        className="absolute inset-0 size-full"
      >
        <path
          className="kesar-draw"
          pathLength={1}
          d="M-20 400C200 270 360 540 600 390S1000 230 1220 350"
          stroke="var(--color-cameo)"
          strokeWidth="26"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          className="kesar-draw kesar-draw-delay"
          pathLength={1}
          d="M-20 190C150 110 270 290 420 215C520 165 505 85 435 105C365 125 400 240 560 250C760 262 880 110 1220 150"
          stroke="var(--color-chilli)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          opacity="0.8"
        />
        <path
          d="M-20 530C300 470 500 590 800 505S1100 445 1220 475"
          stroke="var(--color-indigo)"
          strokeWidth="2"
          strokeDasharray="2 10"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity="0.45"
        />
      </svg>

      {/* Kesar ring, half-hidden behind the first board. */}
      <svg
        focusable="false"
        viewBox="0 0 100 100"
        fill="none"
        className="absolute -top-2 left-0 size-24 lg:-top-6 lg:size-32"
      >
        <circle cx="50" cy="50" r="40" stroke="var(--color-kesar)" strokeWidth="6" />
        <circle cx="50" cy="50" r="26" stroke="var(--color-kesar)" strokeWidth="2" strokeDasharray="3 7" strokeLinecap="round" />
      </svg>

      {/* Four-point sparkle off the last board's lower corner. */}
      <svg
        focusable="false"
        viewBox="0 0 40 40"
        className="absolute right-2 bottom-4 size-10 rotate-12 text-chilli lg:right-4 lg:bottom-10 lg:size-14"
      >
        <path d="M20 0C21.5 13 27 18.5 40 20C27 21.5 21.5 27 20 40C18.5 27 13 21.5 0 20C13 18.5 18.5 13 20 0Z" fill="currentColor" />
      </svg>
    </div>
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
        accent="chilli"
        eyebrow="Noticeboard"
        title={
          <>
            What&apos;s new,{" "}
            <span className="-mx-1 box-decoration-clone rounded-sm bg-cameo px-1">
              this week.
            </span>
          </>
        }
        description="Schedule changes, faculty articles and free practice — the three things worth checking back for."
      />

      <div className="relative mt-4 lg:mt-6">
        <BoardLines />

        {/* pt-4 keeps the stickers clear of the rail's scroll clip on phones. */}
        <div className={cn(railList[3], "relative items-start pt-4 lg:items-stretch [&>*]:w-[88%] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-[60%] lg:[&>*]:w-auto")}>
          <Board
            index={1}
            live
            accent="chilli"
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
                            <span className="-rotate-3 rounded-md bg-chilli-100 px-1.5 py-0.5 text-eyebrow font-bold uppercase text-chilli-700 ring-2 ring-chilli">
                              New
                            </span>
                          ) : null}
                        </div>
                        <h4 className="mt-2 text-body font-bold leading-snug text-indigo">
                          {notice.href ? (
                            <Link
                              href={notice.href}
                              className="underline decoration-cameo decoration-2 underline-offset-4 transition-colors hover:text-chilli-600 hover:decoration-chilli"
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
            accent="cameo"
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
                        className="underline decoration-cameo decoration-2 underline-offset-4 transition-colors hover:text-chilli-600 hover:decoration-chilli"
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
            accent="kesar"
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
                          className="underline decoration-cameo decoration-2 underline-offset-4 transition-colors hover:text-chilli-600 hover:decoration-chilli"
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
                        <span className="font-semibold text-kesar-700"> • Opens {formatDate(quiz.publishedAt)}</span>
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
