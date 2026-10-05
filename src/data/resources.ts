import type { Resource } from "@/types";

/**
 * Free resources vidyantIAS publishes for aspirants.
 * `href: ""` means the file is not uploaded yet — the UI then routes the
 * visitor to a request form instead of a broken download.
 * TODO(institute): upload the PDFs and set `href`.
 */
export const resources: Resource[] = [
  {
    id: "upsc-starter-kit",
    slug: "upsc-starter-kit",
    title: "UPSC Starter Kit",
    description:
      "A complete beginner roadmap: how the examination is structured, what to read first, and the sequence that avoids wasted months.",
    type: "guide",
    tracks: ["beginner"],
    href: "",
    requiresLead: true,
    status: "published",
  },
  {
    id: "upsc-booklist",
    slug: "upsc-booklist",
    title: "UPSC Booklist",
    description:
      "Recommended sources for each subject, with a reading order — and an explicit note on what you can safely skip.",
    type: "pdf",
    tracks: ["beginner", "prelims", "mains"],
    href: "",
    requiresLead: true,
    status: "published",
  },
  {
    id: "upsc-syllabus",
    slug: "upsc-syllabus",
    title: "UPSC Syllabus — Prelims & Mains",
    description:
      "The official syllabus for both stages, organised topic-wise so you can track coverage instead of re-reading the PDF.",
    type: "pdf",
    tracks: ["beginner", "prelims", "mains"],
    href: "",
    requiresLead: false,
    status: "published",
  },
  {
    id: "pyq-strategy",
    slug: "pyq-strategy",
    title: "PYQ Strategy",
    description:
      "How to use previous-year questions to decide what to study, how deep to go and when a topic is genuinely finished.",
    type: "pyq",
    tracks: ["prelims", "mains"],
    href: "",
    requiresLead: true,
    status: "published",
  },
  {
    id: "study-planner",
    slug: "study-planner",
    title: "Study Planner",
    description:
      "A weekly planning template for building a preparation routine you can sustain for a full cycle, including revision slots.",
    type: "guide",
    tracks: ["beginner", "prelims", "mains"],
    href: "",
    requiresLead: true,
    status: "published",
  },
];

export const publishedResources = resources.filter((item) => item.status === "published");

export const RESOURCE_TYPE_LABELS: Record<Resource["type"], string> = {
  pdf: "PDF",
  guide: "Guide",
  video: "Video",
  article: "Article",
  pyq: "PYQ",
  "current-affairs": "Current Affairs",
};

export const RESOURCE_TRACK_LABELS: Record<Resource["tracks"][number], string> = {
  beginner: "Beginner",
  prelims: "Prelims",
  mains: "Mains",
  optional: "Optional",
  "current-affairs": "Current Affairs",
};

export function resourceBySlug(slug: string) {
  return resources.find((item) => item.slug === slug);
}
