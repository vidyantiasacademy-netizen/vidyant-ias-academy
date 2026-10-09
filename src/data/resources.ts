import type { Resource } from "@/types";

/**
 * Labels for free resources. The resources themselves are Sanity
 * `freeResource` documents, read through `src/lib/content/site.ts`.
 */
export const RESOURCE_TYPE_LABELS: Record<Resource["type"], string> = {
  pdf: "PDF",
  guide: "Guide",
  video: "Video",
  article: "Article",
  pyq: "PYQ",
  "current-affairs": "Current Affairs",
};
