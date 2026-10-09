/**
 * Content model for vidyantIAS.
 * Every entity has a stable `id` so local data files can later be swapped
 * for a CMS/API without touching UI components.
 */

export type ContentStatus = "published" | "draft" | "archived";

export type CourseCategory =
  | "foundation"
  | "prelims"
  | "mains"
  | "optional"
  | "test-series";

export interface CurriculumModule {
  title: string;
  topics: string[];
}

export interface Course {
  id: string;
  slug: string;
  category: CourseCategory;
  title: string;
  shortDescription: string;
  description: string;
  /** Who the program is designed for. */
  audience: string[];
  duration: string;
  mode: string[];
  features: string[];
  outcomes: string[];
  curriculum: CurriculumModule[];
  tests: string;
  mentorship: string;
  studyMaterial: string[];
  schedule: string;
  /** Kept as a string so "Shared on counselling call" is a valid, honest value. */
  fee: string;
  /** Who teaches it. `subject` is enough for a card; the course page resolves full profiles by slug. */
  faculty: { slug: string; subject: string }[];
  faqIds: string[];
  /** Card photo: the Sanity hero image, or a stock stand-in for the stage until one is uploaded. */
  image: { src: string; alt: string; lqip?: string };
  status: ContentStatus;
}

export type FacultyArea = "gs" | "optional" | "essay" | "ethics" | "csat";

export interface Faculty {
  id: string;
  slug: string;
  name: string;
  subject: string;
  areas: FacultyArea[];
  /** Free text, e.g. "12+ years teaching experience". Only real data. */
  experience: string;
  specialisations: string[];
  bio: string;
  qualifications: string[];
  teachingPhilosophy: string;
  image: string;
  /** True until the institute supplies verified profile details. */
  isPlaceholder: boolean;
  status: ContentStatus;
}

export interface Testimonial {
  id: string;
  name: string;
  course: string;
  year: string;
  quote: string;
  image?: string;
  videoUrl?: string;
  isPlaceholder: boolean;
  status: ContentStatus;
}

export type ExamStage = "prelims" | "mains" | "interview" | "final";

export interface Result {
  id: string;
  year: string;
  stage: ExamStage;
  studentName: string;
  rank?: string;
  optional?: string;
  note?: string;
  /** Only results the institute can verify are ever published. */
  verified: boolean;
  status: ContentStatus;
}

export type ResourceType =
  | "pdf"
  | "guide"
  | "video"
  | "article"
  | "pyq"
  | "current-affairs";

export type ResourceTrack =
  | "beginner"
  | "prelims"
  | "mains"
  | "optional"
  | "current-affairs";

export interface Resource {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: ResourceType;
  tracks: ResourceTrack[];
  /** Download/read target. Empty string means "gated behind lead capture". */
  href: string;
  requiresLead: boolean;
  status: ContentStatus;
}

export interface BlogPost {
  id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readingTimeMinutes: number;
  author: string;
  publishedAt: string;
  image?: string;
  status: ContentStatus;
}

export interface CurrentAffair {
  id: string;
  slug: string;
  subject: string;
  title: string;
  whyItMatters: string;
  relevance: Array<"Prelims" | "Mains" | "Essay" | "Interview">;
  publishedAt: string;
  status: ContentStatus;
}

export type EventType = "orientation" | "demo" | "workshop" | "seminar";

export interface Event {
  id: string;
  slug: string;
  type: EventType;
  title: string;
  description: string;
  /** ISO date string. */
  date: string;
  time: string;
  durationMinutes: number;
  mode: "In-centre" | "Online" | "Hybrid";
  location: string;
  fee: string;
  seatsNote?: string;
  status: ContentStatus;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  topics: string[];
  /** Surfaced on the homepage FAQ block. */
  featured: boolean;
  status: ContentStatus;
}

export type BatchMode = "Classroom (Pune)" | "Live online" | "Hybrid";

export interface Batch {
  id: string;
  slug: string;
  /** Program this batch belongs to — a `courses/{courseId}` id. */
  courseId: string;
  title: string;
  /** ISO date string for the first session. */
  startDate: string;
  /** Class days and timings, e.g. "Mon–Sat, 9:00 am – 12:00 pm". */
  schedule: string;
  mode: BatchMode;
  location: string;
  /** Free text so "confirmed by the academic team" stays a valid answer. */
  duration: string;
  seatsNote?: string;
  fee: string;
  /** Shown as a pill when the batch is close to filling or closing. */
  highlight?: string;
  status: ContentStatus;
}

/**
 * A dated notice: batch starts, deadlines, result and schedule changes.
 *
 * Field names mirror the Sanity `announcement` document, so moving this content
 * into the CMS later is a swap of the data source, not of the component.
 */
export interface Announcement {
  id: string;
  title: string;
  /** One or two sentences. Longer than that belongs in an article. */
  body: string;
  tone: "info" | "success" | "warning";
  /** An in-app route, or null when the notice is informational only. */
  href?: string | null;
  /** ISO datetime the notice starts showing. */
  startsAt: string;
  /** ISO datetime it stops showing. Null keeps it up until it is removed. */
  endsAt?: string | null;
}

export type QuizStage = "prelims" | "mains" | "csat" | "current-affairs";

export interface Quiz {
  id: string;
  slug: string;
  title: string;
  stage: QuizStage;
  /** Syllabus area, e.g. "Polity" or "Modern History". */
  subject: string;
  description: string;
  questionCount: number;
  durationMinutes: number;
  /** ISO date the quiz opens. */
  publishedAt: string;
  /**
   * Where the attempt happens — an in-app path, or the institute's own form.
   * Null while a quiz is announced but not yet open, so the card can say so
   * instead of linking nowhere.
   */
  href?: string | null;
  status: ContentStatus;
}
