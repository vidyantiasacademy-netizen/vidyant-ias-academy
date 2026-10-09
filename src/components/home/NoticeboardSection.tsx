import { ArrowRight, BellRing, ListChecks, Newspaper } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import Link from "@/i18n/Link";
import { Section } from "@/components/layout/Section";
import { QuizCard } from "@/components/quizzes/QuizCard";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { KesarLines } from "@/components/ui/KesarLines";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { railList } from "@/components/ui/rail";
import { ANNOUNCEMENT_KINDS } from "@/data/announcements";
import { QUIZ_PLAN, latestQuizzes } from "@/data/quizzes";
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

/**
 * One of the three boards: an indigo header block (title, count, a slow
 * sheen) over a white body, closed by a full-width, thumb-sized link.
 */
function Board({
  icon,
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
  title: string;
  description: string;
  /** Short state shown in the header pill — a count, or what is coming. */
  status: string;
  /** Pulses the header dot. Only the announcements board earns it. */
  live?: boolean;
  href: string;
  linkLabel: string;
  index: 1 | 2 | 3;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "reveal group/board flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white shadow-[var(--shadow-card)]",
        "transition-[box-shadow,transform] duration-300 ease-[var(--ease-brand)] hover:-translate-y-1 hover:shadow-[var(--shadow-panel)]",
        `reveal-delay-${index}`,
      )}
    >
      <header
        className="board-sheen grid-lines relative overflow-hidden bg-indigo-gradient px-6 pt-6 pb-7 text-white sm:px-7"
        style={{ "--sheen-delay": `${(index - 1) * 1.2}s` } as CSSProperties}
      >
        <KesarLines corners={["bottom-right"]} size="sm" />
        <div className="relative flex items-start justify-between gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-white/20 transition-transform duration-300 ease-[var(--ease-brand)] group-hover/board:-rotate-6 group-hover/board:scale-110">
            {icon}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-eyebrow font-semibold uppercase ring-1 ring-white/20">
            {live ? (
              <span aria-hidden className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-kesar opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-kesar" />
              </span>
            ) : null}
            {status}
          </span>
        </div>
        <h3 className="relative mt-5 text-h3 font-semibold text-white lg:text-h3-lg">{title}</h3>
        <p className="relative mt-2 text-body text-white/80">{description}</p>
      </header>

      <div className="flex-1 p-5 sm:p-6">{children}</div>

      <Link
        href={href}
        className="group/link flex h-14 items-center justify-between gap-3 border-t border-line px-6 text-body font-semibold text-indigo transition-colors duration-200 hover:bg-kesar-100 hover:text-indigo-900 sm:px-7"
      >
        {linkLabel}
        <span className="flex size-9 items-center justify-center rounded-full bg-paper transition-[background-color,transform] duration-200 ease-[var(--ease-brand)] group-hover/link:translate-x-1 group-hover/link:bg-kesar">
          <ArrowRight aria-hidden className="size-4.5" />
        </span>
      </Link>
    </section>
  );
}

/** Numbered row used by the empty-state lists — bigger than a bullet, easier to scan. */
function PlanItem({ n, title, note }: { n: number; title: string; note?: string }) {
  return (
    <li className="flex gap-4">
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-small font-bold text-indigo"
      >
        {String(n).padStart(2, "0")}
      </span>
      <div className="pt-1">
        <p className="text-body font-semibold text-indigo">{title}</p>
        {note ? <p className="mt-1 text-body text-ink-secondary">{note}</p> : null}
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
    <Section id="noticeboard" tone="paper" containerSize="wide">
      <SectionHeader
        eyebrow="Noticeboard"
        title={
          <>
            Announcements, articles and quizzes.{" "}
            <span className="text-indigo-700">Check back often.</span>
          </>
        }
        description="The three things worth checking back for: what changed in the schedule, what our faculty published, and what you can practise this week."
      />

      <div className={cn(railList[3], "mt-7 items-start lg:mt-9 lg:items-stretch [&>*]:w-[88%] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-[60%] lg:[&>*]:w-auto")}>
        <Board
          index={1}
          live
          icon={<BellRing aria-hidden className="size-6" />}
          title="Announcements"
          description="Batch starts, deadlines and schedule changes, dated and short."
          status={notices.length > 0 ? `${notices.length} active` : "Live board"}
          href={ROUTES.events}
          linkLabel="See the full calendar"
        >
          {notices.length > 0 ? (
            <ul className="grid gap-3">
              {notices.map((notice) => {
                const tone = NOTICE_TONE[notice.tone];
                return (
                  <li key={notice.id}>
                    <Card
                      padding="sm"
                      interactive={Boolean(notice.href)}
                      className={cn(
                        "h-full border-l-4",
                        notice.tone === "warning" ? "border-l-kesar" : "border-l-indigo",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <Badge tone={tone.tone}>{tone.label}</Badge>
                        {isFresh(notice.startsAt) ? <Badge tone="indigo">New</Badge> : null}
                        <time
                          dateTime={notice.startsAt}
                          className="text-small font-medium text-ink-muted"
                        >
                          {formatDate(notice.startsAt)}
                        </time>
                      </div>
                      <h4 className="mt-3 text-h4 font-semibold text-indigo">
                        {notice.href ? (
                          <Link
                            href={notice.href}
                            className="transition-colors hover:text-kesar-700"
                          >
                            {notice.title}
                          </Link>
                        ) : (
                          notice.title
                        )}
                      </h4>
                      <p className="mt-2 line-clamp-3 text-body text-ink-secondary">{notice.body}</p>
                    </Card>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div>
              <p className="text-h4 font-semibold text-indigo">No notices right now.</p>
              <p className="mt-2 text-body text-ink-secondary">
                When there are, they appear here the same day:
              </p>
              <ul className="mt-6 grid gap-5">
                {ANNOUNCEMENT_KINDS.map((kind, i) => (
                  <PlanItem key={kind} n={i + 1} title={kind} />
                ))}
              </ul>
            </div>
          )}
        </Board>

        <Board
          index={2}
          icon={<Newspaper aria-hidden className="size-6" />}
          title="Articles"
          description="Strategy, subject notes and answer-writing pieces from the faculty."
          status={articles.length > 0 ? `${articles.length} latest` : "Coming soon"}
          href={ROUTES.blog}
          linkLabel={articles.length > 0 ? "Read the blog" : "See what we will cover"}
        >
          {articles.length > 0 ? (
            <ul className="grid gap-3">
              {articles.map((post) => (
                <li key={post.id}>
                  <Card padding="sm" interactive className="h-full">
                    <Badge tone="neutral">{post.category}</Badge>
                    <h4 className="mt-3 text-h4 font-semibold text-indigo">
                      <Link
                        href={`${ROUTES.blog}/${post.slug}`}
                        className="transition-colors hover:text-kesar-700"
                      >
                        {post.title}
                      </Link>
                    </h4>
                    <p className="mt-2 line-clamp-2 text-body text-ink-secondary">{post.excerpt}</p>
                    <p className="mt-3 text-small font-medium text-ink-muted">
                      {formatDate(post.publishedAt)} • {post.readingTimeMinutes} min read
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <p className="text-h4 font-semibold text-indigo">
                The first articles are being written.
              </p>
              <p className="mt-3 text-body text-ink-secondary">
                We would rather publish nothing than republish someone else&apos;s notes.
                The blog opens with strategy pieces for Prelims, Mains answer writing and
                optional-subject selection — written by the faculty who teach them.
              </p>
            </div>
          )}
        </Board>

        <Board
          index={3}
          icon={<ListChecks aria-hidden className="size-6" />}
          title="Quizzes"
          description="Short practice sets, free and open to anyone preparing."
          status={quizzes.length > 0 ? `${quizzes.length} to try` : "Free practice"}
          href={ROUTES.quizzes}
          linkLabel={quizzes.length > 0 ? "All quizzes" : "How the quizzes work"}
        >
          {quizzes.length > 0 ? (
            <ul className="grid gap-3">
              {quizzes.map((quiz) => (
                <li key={quiz.id}>
                  <QuizCard quiz={quiz} />
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <p className="text-h4 font-semibold text-indigo">
                The quiz calendar starts with the first batch.
              </p>
              <ul className="mt-6 grid gap-5">
                {QUIZ_PLAN.map((item, i) => (
                  <PlanItem key={item.stage} n={i + 1} title={item.title} note={item.note} />
                ))}
              </ul>
            </div>
          )}
        </Board>
      </div>
    </Section>
  );
}
