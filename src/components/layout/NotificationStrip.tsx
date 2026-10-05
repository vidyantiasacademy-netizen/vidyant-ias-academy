import { NotificationStripBar } from "@/components/layout/NotificationStripBar";
import { stripNotices } from "@/data/strip-notices";

/**
 * Site-wide notification strip, above the header.
 *
 * Server half of the pair: it resolves which notices are live right now and
 * renders nothing at all when there are none — an empty band at the top of the
 * page is worse than no band.
 */
export function NotificationStrip() {
  const notices = stripNotices();
  if (notices.length === 0) return null;

  return <NotificationStripBar notices={notices} />;
}
