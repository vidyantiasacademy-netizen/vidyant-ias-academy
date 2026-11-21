import { ArrowRight, Bell, Newspaper, PenLine } from "lucide-react";
import type { ReactNode } from "react";

import Link from "@/i18n/Link";
import { Section } from "@/components/layout/Section";
import { SectionArt } from "@/components/ui/SectionArt";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getLocale } from "@/i18n/server";
import { ROUTES } from "@/lib/constants/site";
import { getSiteAnnouncements, getSiteCurrentAffairs, getSitePosts } from "@/lib/content/site";
import { cn } from "@/lib/utils/cn";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(iso));
}

/**
 * One noticeboard card: a tinted header (icon · rule · serif name), the latest
 * entry (date, title, one or two lines of detail) and a full-width link at the
 * foot behind a hairline.
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
    <section
      className={cn(
        "reveal flex h-full flex-col overflow-hidden rounded-2xl bg-[#fdf9f5] shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)]",
        `reveal-delay-${index}`,
      )}
    >
      <header className="flex items-center gap-4 bg-kesar-100/60 px-6 py-5 sm:px-8 sm:py-6">
        <span className="text-indigo">{icon}</span>
        <span aria-hidden className="h-9 w-px bg-indigo/15" />
        <h3 className="font-display text-h3 font-bold lg:text-h3-lg leading-tight text-indigo">{title}</h3>
      </header>

      <div className="flex-1 px-6 pt-6 pb-5 sm:px-8">{children}</div>

      <div className="px-6 sm:px-8">
        <Link
          href={href}
          className="group flex min-h-16 items-center justify-between gap-3 border-t border-line text-body font-bold text-indigo hover:text-kesar-600"
        >
          {linkLabel}
          <ArrowRight aria-hidden className="size-5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}

/** The entry shown on a board: date, title (linked when `href` is set), detail. */
function Entry({
  date,
  title,
  href,
  detail,
}: {
  date?: string;
  title: string;
  href?: string;
  detail?: string;
}) {
  return (
    <>
      {date ? (
        <p className="text-eyebrow font-bold uppercase tracking-[0.12em] text-ink-secondary">
          <time dateTime={date}>{formatDate(date)}</time>
        </p>
      ) : null}
      <h4 className={cn("text-h4 font-bold leading-snug text-indigo", date && "mt-2")}>
        {href ? (
          <Link href={href} className="underline-offset-4 hover:text-kesar-600 hover:underline">
            {title}
          </Link>
        ) : (
          title
        )}
      </h4>
      {detail ? <p className="mt-3 line-clamp-3 text-body text-ink">{detail}</p> : null}
    </>
  );
}

/**
 * The noticeboard: the latest announcement, today's current-affairs update
 * and the newest blog article. Each card falls back to an honest description of what will appear
 * there — never to a sample notice.
 */
export async function NoticeboardSection() {
  const locale = await getLocale();
  const [announcements, affairs, posts] = await Promise.all([
    getSiteAnnouncements(locale),
    getSiteCurrentAffairs(locale, 1),
    getSitePosts(locale, 3),
  ]);
  const notice = announcements[0];
  const affair = affairs[0];
  const [post, ...morePosts] = posts;

  return (
    <Section id="noticeboard" tone="indigo" containerSize="wide" className="overflow-hidden" art={<SectionArt variant="noticeboard" />}>
      <SectionHeader
        tone="light"
        eyebrow="Noticeboard"
        title={
          <>
            What&apos;s new, <em>this week.</em>
          </>
        }
        description="Key updates, current affairs and new articles — in one place."
      />

      <div className="mt-4 grid gap-5 md:grid-cols-2 lg:mt-6 lg:gap-6 xl:grid-cols-3">
        <Board
          index={1}
          icon={<Bell aria-hidden strokeWidth={1.75} className="size-8" />}
          title="Announcements"
          href={ROUTES.events}
          linkLabel="View all announcements"
        >
          {notice ? (
            <Entry date={notice.startsAt} title={notice.title} detail={notice.body} />
          ) : (
            <Entry
              title="All quiet right now."
              detail="Batch dates, test calendar changes and timing updates land here the same day."
            />
          )}
        </Board>

        <Board
          index={2}
          icon={<Newspaper aria-hidden strokeWidth={1.75} className="size-8" />}
          title="Daily Current Affairs"
          href={affair ? `${ROUTES.currentAffairs}/${affair.slug}` : ROUTES.currentAffairs}
          linkLabel={affair ? "Read today’s update" : "Go to current affairs"}
        >
          {affair ? (
            <Entry date={affair.publishedAt} title={affair.title} detail={affair.whyItMatters} />
          ) : (
            <Entry
              title="Daily Current Affairs"
              detail="Key national, international, economy, environment and other important updates."
            />
          )}
        </Board>

        <Board
          index={3}
          icon={<PenLine aria-hidden strokeWidth={1.75} className="size-8" />}
          title="From the Blog"
          href={ROUTES.blog}
          linkLabel={post ? "View all articles" : "Go to the blog"}
        >
          {post ? (
            <>
              <Entry
                date={post.publishedAt}
                title={post.title}
                href={`${ROUTES.blog}/${post.slug}`}
                detail={post.excerpt}
              />
              {morePosts.length > 0 ? (
                <ul className="mt-5 space-y-3 border-t border-line pt-5">
                  {morePosts.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`${ROUTES.blog}/${item.slug}`}
                        className="text-body font-semibold leading-snug text-indigo underline-offset-4 hover:text-kesar-600 hover:underline"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            <Entry
              title="From the Blog"
              detail="Practical writing on strategy, revision, answer writing and test analysis from our academic team."
            />
          )}
        </Board>
      </div>
    </Section>
  );
}
