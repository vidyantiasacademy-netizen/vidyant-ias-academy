import type { CourseCategory } from "@/types";
import type { DeliveryMode } from "@/types/db";

/**
 * Display labels for course enums. Client-safe: the course cards and filters
 * render in the browser, so nothing here may reach Firestore or Sanity.
 */

export const COURSE_CATEGORY_LABELS: Record<CourseCategory, string> = {
  foundation: "Foundation",
  prelims: "Prelims",
  mains: "Mains",
  optional: "Optional",
  "test-series": "Test Series",
};

/** `courses/{courseId}.modes` → the public "Mode" line. */
export const DELIVERY_MODE_LABELS: Record<DeliveryMode, string> = {
  offline: "Classroom (Pune)",
  "online-live": "Live online",
  recorded: "Recorded access",
  hybrid: "Hybrid (classroom + online)",
};

/**
 * FAQs shown on a course page, by category.
 *
 * FAQs are still `src/data/faqs.ts` content, so the link lives beside them in
 * code rather than as a Sanity reference to a document that does not exist yet.
 * Move it onto the Sanity course document when FAQs move to the CMS.
 */
export const COURSE_FAQ_IDS: Record<CourseCategory, string[]> = {
  foundation: ["faq-beginners", "faq-online", "faq-mentorship", "faq-fees", "faq-material"],
  prelims: ["faq-online", "faq-recordings", "faq-mentorship", "faq-fees"],
  mains: ["faq-evaluation", "faq-mentorship", "faq-online", "faq-fees"],
  optional: ["faq-optional", "faq-evaluation", "faq-fees"],
  "test-series": ["faq-evaluation", "faq-fees", "faq-online"],
};
