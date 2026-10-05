import { ArrowRight, BellRing, ListChecks, Newspaper } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Section } from "@/components/layout/Section";
import { QuizCard } from "@/components/quizzes/QuizCard";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ANNOUNCEMENT_KINDS, activeAnnouncements } from "@/data/announcements";
import { publishedBlogPosts } from "@/data/blog";
import { QUIZ_PLAN, latestQuizzes } from "@/data/quizzes";
import { ROUTES } from "@/lib/constants/site";
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

/** One of the three boards, with its own heading and "view all" link. */
function Board({
  icon,
  title,
  description,
  href,
  linkLabel,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="flex h-full flex-col">
      <h3 className="flex items-center gap-2.5 text-h4 font-semibold text-indigo">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-kesar-100 text-kesar-700">
          {icon}
        </span>
        {title}
      </h3>
      <p className="mt-3 text-small text-ink-secondary">{description}</p>

      <div className="mt-6 flex-1">{children}</div>

      <Link
        href={href}
        className="group mt-6 inline-flex items-center gap-2 text-small font-semibold text-indigo transition-colors duration-200 hover:text-kesar-700"
      >
        {linkLabel}
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-200 ease-[var(--ease-brand)] group-hover:translate-x-1"
        />
      </Link>
    </section>
  );
}

/**
 * The noticeboard: what changed this week, what we published, what you can
 * practise. Each board fills from its own data file and falls back to an honest
 * description of what will appear there — never to a sample notice, article or
 * quiz.
 */
export function NoticeboardSection() {
  const notices = activeAnnouncements().slice(0, 4);
  const articles = publishedBlogPosts.slice(0, 3);
  const quizzes = latestQuizzes(2);

  return (
    <Section id="noticeboard" containerSize="wide">
      <SectionHeader
        eyebrow="Noticeboard"
        title="Announcements, articles and quizzes."
        description="The three things worth checking back for: what changed in the schedule, what our faculty published, and what you can practise this week."
      />

      <div className="mt-12 grid gap-10 lg:mt-14 lg:grid-cols-3 lg:gap-8">
        <Board
          icon={<BellRing aria-hidden className="size-4.5" />}
          title="Announcements"
          description="Batch starts, deadlines and schedule changes, dated and short."
          href={ROUTES.events}
          linkLabel="See the full calendar"
        >
          {notices.length > 0 ? (
            <ul className="grid gap-3">
              {notices.map((notice) => {
                const tone = NOTICE_TONE[notice.tone];
                return (
                  <li key={notice.id}>
                    <Card padding="sm" className="h-full">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <Badge tone={tone.tone}>{tone.label}</Badge>
                        <time
                          dateTime={notice.startsAt}
                          className="text-small text-ink-muted"
                        >
                          {formatDate(notice.startsAt)}
                        </time>
                      </div>
                      <h4 className="mt-3 text-body font-semibold text-indigo">
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
                      <p className="mt-2 text-small text-ink-secondary">{notice.body}</p>
                    </Card>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Card tone="paper" padding="sm" className="h-full">
              <p className="text-small font-semibold text-indigo">
                No notices right now.
              </p>
              <p className="mt-2 text-small text-ink-secondary">
                When there are, they appear here the same day:
              </p>
              <ul className="mt-4 grid gap-2.5">
                {ANNOUNCEMENT_KINDS.map((kind) => (
                  <li key={kind} className="flex gap-2.5 text-small text-ink-secondary">
                    <span
                      aria-hidden
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-kesar"
                    />
                    {kind}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </Board>

        <Board
          icon={<Newspaper aria-hidden className="size-4.5" />}
          title="Articles"
          description="Strategy, subject notes and answer-writing pieces from the faculty."
          href={ROUTES.blog}
          linkLabel={articles.length > 0 ? "Read the blog" : "See what we will cover"}
        >
          {articles.length > 0 ? (
            <ul className="grid gap-3">
              {articles.map((post) => (
                <li key={post.id}>
                  <Card padding="sm" interactive className="h-full">
                    <Badge tone="neutral">{post.category}</Badge>
                    <h4 className="mt-3 text-body font-semibold text-indigo">
                      <Link
                        href={`${ROUTES.blog}/${post.slug}`}
                        className="transition-colors hover:text-kesar-700"
                      >
                        {post.title}
                      </Link>
                    </h4>
                    <p className="mt-2 text-small text-ink-secondary">{post.excerpt}</p>
                    <p className="mt-3 text-small text-ink-muted">
                      {formatDate(post.publishedAt)} • {post.readingTimeMinutes} min read
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <Card tone="paper" padding="sm" className="h-full">
              <p className="text-small font-semibold text-indigo">
                The first articles are being written.
              </p>
              <p className="mt-2 text-small text-ink-secondary">
                We would rather publish nothing than republish someone else&apos;s notes.
                The blog opens with strategy pieces for Prelims, Mains answer writing and
                optional-subject selection — written by the faculty who teach them.
              </p>
            </Card>
          )}
        </Board>

        <Board
          icon={<ListChecks aria-hidden className="size-4.5" />}
          title="Quizzes"
          description="Short practice sets, free and open to anyone preparing."
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
            <Card tone="paper" padding="sm" className="h-full">
              <p className="text-small font-semibold text-indigo">
                The quiz calendar starts with the first batch.
              </p>
              <ul className="mt-4 grid gap-3.5">
                {QUIZ_PLAN.map((item) => (
                  <li key={item.stage}>
                    <p className="text-small font-medium text-indigo">{item.title}</p>
                    <p className="mt-1 text-small text-ink-secondary">{item.note}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </Board>
      </div>
    </Section>
  );
}
