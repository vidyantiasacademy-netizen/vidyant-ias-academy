/**
 * Shapes returned by the queries in `queries.ts`.
 *
 * Hand-written to match each projection, not generated from the schema: the
 * queries deliberately return narrow projections rather than whole documents,
 * and a generated document type would claim fields that were never fetched.
 *
 * Once the schemas settle, `sanity typegen` can replace this file — run
 * `npx sanity@latest schema extract && npx sanity@latest typegen generate` from
 * the repo root and import the generated `sanity.types.ts` instead.
 */

export interface SanityImage {
  url: string;
  /** Asset reference, so `lib/sanity/image.ts` can build a transformed URL. */
  ref: string | null;
  alt: string | null;
  lqip: string | null;
  width: number | null;
  height: number | null;
}

/** Portable Text. Rendered with `@portabletext/react` when a renderer is added. */
export type PortableTextBlocks = unknown[];

export interface Seo {
  title: string | null;
  description: string | null;
  image: SanityImage | null;
  noIndex: boolean;
}

export interface BlogListItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: SanityImage | null;
  categories: string[];
  publishedAt: string;
  readingMinutes: number | null;
  authorName: string | null;
}

export interface BlogPost extends BlogListItem {
  content: PortableTextBlocks;
  tags: string[];
  seo: Seo | null;
  authorRole: string | null;
  authorImage: SanityImage | null;
}

export type CurrentAffairImportance = "must-read" | "important" | "background";

export interface CurrentAffairListItem {
  _id: string;
  title: string;
  slug: string;
  date: string;
  category: string;
  importance: CurrentAffairImportance;
  relatedSubjects: string[];
  summary: string | null;
}

export interface CurrentAffair extends CurrentAffairListItem {
  content: PortableTextBlocks;
  sources: { label: string; url: string }[];
  tags: string[];
  seo: Seo | null;
}

export interface FacultyMember {
  _id: string;
  name: string;
  slug: string;
  designation: string;
  photo: SanityImage | null;
  bio: PortableTextBlocks;
  subjects: string[];
  /** `paper` of each referenced subject — maps onto the site's faculty filters. */
  papers: (string | null)[];
  experience: string | null;
  achievements: string[];
  order: number;
}

export interface CourseContent {
  _id: string;
  title: string;
  slug: string;
  /** Joins to `courses/{courseId}.sanitySlug` in Firestore. */
  category: string;
  summary: string | null;
  heroImage: SanityImage | null;
  highlights: string[];
  curriculum: { title: string; topics: string[] }[];
  body: PortableTextBlocks;
  seo: Seo | null;
}

export interface DemoClass {
  _id: string;
  title: string;
  slug: string;
  subject: string | null;
  facultyName: string | null;
  scheduledFor: string | null;
  durationMinutes: number | null;
  /** Mux playback id for a recorded demo, or null for a live session. */
  muxPlaybackId: string | null;
  description: string | null;
}

export interface FreeResource {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  /** Sanity-hosted file, or null when the resource is gated behind a form. */
  fileUrl: string | null;
  pages: number | null;
}

export interface Faq {
  _id: string;
  question: string;
  answer: PortableTextBlocks;
  category: string;
  order: number;
}

export interface Announcement {
  _id: string;
  title: string;
  body: string;
  tone: "info" | "success" | "warning";
  href: string | null;
  startsAt: string;
  endsAt: string | null;
}
