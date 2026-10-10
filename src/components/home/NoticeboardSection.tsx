import { ArrowRight, BellRing, ListChecks, Newspaper } from "lucide-react";
import type { ReactNode } from "react";

import Link from "@/i18n/Link";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { railList } from "@/components/ui/rail";
import { QUIZ_PLAN, QUIZ_STAGE_LABELS, latestQuizzes } from "@/data/quizzes";
import { getLocale } from "@/i18n/server";
import { ROUTES } from "@/lib/constants/site";
import { getSiteAnnouncements, getSitePosts } from "@/lib/content/site";
import { cn } from "@/lib/utils/cn";

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
 * One of the three boards: a bare header (icon + name), a short feed, and a
 * full-width, thumb-sized link at the foot. All three share one row grammar
 * so the set reads as a single list split in three.
 */
function Board({
  icon,
  title,
  href,
  linkLabel,
  index,
  children,
}: {
  icon: ReactNode;
  title: string;
  href: string;
  linkLabel: string;
  index: 1 | 2 | 3;
  children: ReactNode;
}) {
  return (
    <div className={cn("reveal relative h-full", `reveal-delay-${index}`)}>
      <section className="flex h-full flex-col border border-line-strong bg-white">
        <header className="flex items-center gap-2.5 border-b border-line px-5 py-4 sm:px-6">
          <span className="text-indigo">{icon}</span>
          <h3 className="text-h4 font-bold leading-tight text-indigo">{title}</h3>
        </header>

        <div className="flex-1 px-5 sm:px-6">{children}</div>

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

/**
 * The one row shape every board uses: a small meta line, the title, and at
 * most one line of detail. When `href` is set the whole row is the tap target.
 */
function FeedItem({
  meta,
  title,
  href,
  detail,
}: {
  meta: ReactNode;
  title: string;
  href?: string | null;
  detail?: ReactNode;
}) {
  return (
    <li className="group relative py-4">
      <p className="flex flex-wrap items-center gap-x-2 text-eyebrow font-bold uppercase text-ink-secondary">
        {meta}
      </p>
      <h4 className="mt-1.5 line-clamp-2 text-body font-bold leading-snug text-indigo">
        {href ? (
          <Link
            href={href}
            className="decoration-2 underline-offset-4 after:absolute after:inset-0 group-hover:underline"
          >
            {title}
          </Link>
        ) : (
          title
        )}
      </h4>
      {detail ? <p className="mt-1 line-clamp-2 text-small text-ink-secondary">{detail}</p> : null}
    </li>
  );
}

const Dot = () => <span aria-hidden>·</span>;

/** Empty board: one honest sentence about what will land here. */
function EmptyNote({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="py-4">
      <p className="text-body font-bold text-indigo">{title}</p>
      <p className="mt-1 text-small text-ink-secondary">{children}</p>
    </div>
  );
}

/** Feed rows: hairline rules between entries. */
const FEED = "divide-y divide-line";

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
  const notices = announcements.slice(0, 3);
  const articles = posts.slice(0, 3);
  const quizzes = latestQuizzes(3);

  return (
    <Section id="noticeboard" containerSize="wide" className="overflow-hidden">
      <SectionHeader
        eyebrow="Noticeboard"
        title="What's new, this week."
        description="Notices, faculty articles and free practice — in one place."
      />

      <div className={cn(railList[3], "mt-4 items-start lg:mt-6 lg:items-stretch [&>*]:w-[88%] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-[60%] lg:[&>*]:w-auto")}>
        <Board
          index={1}
          icon={<BellRing aria-hidden className="size-5" />}
          title="Announcements"
          href={ROUTES.events}
          linkLabel="Full calendar"
        >
          {notices.length > 0 ? (
            <ul className={FEED}>
              {notices.map((notice) => (
                <FeedItem
                  key={notice.id}
                  href={notice.href}
                  title={notice.title}
                  detail={notice.body}
                  meta={
                    <>
                      <time dateTime={notice.startsAt}>{formatDate(notice.startsAt)}</time>
                      {notice.tone === "warning" ? (
                        <>
                          <Dot />
                          <span className="text-kesar-700">Deadline</span>
                        </>
                      ) : null}
                      {isFresh(notice.startsAt) ? (
                        <>
                          <Dot />
                          <span className="inline-flex items-center gap-1.5 text-chilli-600">
                            <span aria-hidden className="size-1.5 bg-chilli" />
                            New
                          </span>
                        </>
                      ) : null}
                    </>
                  }
                />
              ))}
            </ul>
          ) : (
            <EmptyNote title="All quiet right now.">
              Batch dates, test calendar changes and timing updates land here the same day.
            </EmptyNote>
          )}
        </Board>

        <Board
          index={2}
          icon={<Newspaper aria-hidden className="size-5" />}
          title="Articles"
          href={ROUTES.blog}
          linkLabel={articles.length > 0 ? "Read the blog" : "See what we'll cover"}
        >
          {articles.length > 0 ? (
            <ul className={FEED}>
              {articles.map((post) => (
                <FeedItem
                  key={post.id}
                  href={`${ROUTES.blog}/${post.slug}`}
                  title={post.title}
                  meta={
                    <>
                      <span>{post.category}</span>
                      <Dot />
                      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                      <Dot />
                      <span>{post.readingTimeMinutes} min</span>
                    </>
                  }
                />
              ))}
            </ul>
          ) : (
            <EmptyNote title="The first pieces are being written.">
              Prelims strategy, Mains answer writing and choosing an optional — by the faculty
              who teach them.
            </EmptyNote>
          )}
        </Board>

        <Board
          index={3}
          icon={<ListChecks aria-hidden className="size-5" />}
          title="Quizzes"
          href={ROUTES.quizzes}
          linkLabel={quizzes.length > 0 ? "All quizzes" : "How quizzes work"}
        >
          {quizzes.length > 0 ? (
            <ul className={FEED}>
              {quizzes.map((quiz) => (
                <FeedItem
                  key={quiz.id}
                  href={quiz.href}
                  title={quiz.title}
                  meta={
                    <>
                      <span>{QUIZ_STAGE_LABELS[quiz.stage]}</span>
                      <Dot />
                      <span>{quiz.subject}</span>
                    </>
                  }
                  detail={
                    <>
                      {quiz.questionCount} questions · {quiz.durationMinutes} min
                      {quiz.href ? null : (
                        <span className="font-bold text-kesar-700"> · Opens {formatDate(quiz.publishedAt)}</span>
                      )}
                    </>
                  }
                />
              ))}
            </ul>
          ) : (
            <ul className={FEED}>
              {QUIZ_PLAN.map((item) => (
                <FeedItem
                  key={item.stage}
                  title={item.title}
                  meta={
                    <>
                      <span>{QUIZ_STAGE_LABELS[item.stage]}</span>
                      <Dot />
                      <span>Free</span>
                    </>
                  }
                />
              ))}
            </ul>
          )}
        </Board>
      </div>
    </Section>
  );
}
