import { NotificationStripBar } from "@/components/layout/NotificationStripBar";
import { stripNotices } from "@/data/strip-notices";
import { getLocale } from "@/i18n/server";
import { getSiteAnnouncements } from "@/lib/content/site";

/**
 * Site-wide notification strip, pinned at the top of the sticky header.
 *
 * Server half of the pair: it resolves which notices are live right now and
 * renders nothing at all when there are none — an empty band at the top of the
 * page is worse than no band.
 */
export async function NotificationStrip() {
  const notices = stripNotices(await getSiteAnnouncements(await getLocale()));
  if (notices.length === 0) return null;

  return <NotificationStripBar notices={notices} />;
}
