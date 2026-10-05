import type { Entity, IsoDate, IsoDateTime, Uid } from "./common";

export type DoubtStatus = "open" | "answered" | "closed";

/** `doubts/{doubtId}` — a student question routed to faculty or a mentor. */
export interface DoubtDoc {
  studentUid: Uid;
  courseId: string | null;
  lessonId: string | null;
  testId: string | null;
  subject: string | null;
  question: string;
  attachmentPaths: string[];
  status: DoubtStatus;
  /** Faculty/mentor uid the doubt is routed to. */
  assignedTo: Uid | null;
  answer: string | null;
  answeredBy: Uid | null;
  answeredAt: IsoDateTime | null;
}

export type Doubt = Entity<DoubtDoc>;

export type SessionMode = "in-person" | "video-call" | "phone";

/** `mentorship/{sessionId}` — one scheduled mentor session and its notes. */
export interface MentorshipSessionDoc {
  studentUid: Uid;
  mentorUid: Uid;
  scheduledFor: IsoDateTime;
  mode: SessionMode;
  durationMinutes: number;
  status: "scheduled" | "completed" | "missed" | "cancelled";
  agenda: string | null;
  /** Visible to the student. */
  sharedNotes: string | null;
  /** Mentor-only. Rules keep this out of student reads via a field projection. */
  privateNotes: string | null;
  /** Agreed targets before the next session. */
  actionItems: { text: string; dueDate: IsoDate | null; done: boolean }[];
}

export type MentorshipSession = Entity<MentorshipSessionDoc>;

export type NotificationKind =
  | "announcement"
  | "test-scheduled"
  | "result-published"
  | "doubt-answered"
  | "payment"
  | "mentorship";

/**
 * `notifications/{notificationId}` — one row per recipient.
 *
 * Fan-out on write (a document per user) rather than fan-out on read (one
 * document with a recipient array), because the student portal query is
 * `where userUid == me order by createdAt desc` and must stay a single index.
 */
export interface NotificationDoc {
  userUid: Uid;
  kind: NotificationKind;
  title: string;
  body: string;
  /** In-app route to open, e.g. `/dashboard/tests/abc`. Never an external URL. */
  href: string | null;
  readAt: IsoDateTime | null;
}

export type Notification = Entity<NotificationDoc>;

export type EnquiryStatus =
  | "new"
  | "contacted"
  | "counselling-scheduled"
  | "enrolled"
  | "lost";

/**
 * `enquiries/{enquiryId}` — the CRM record behind the public forms.
 *
 * `lib/leads` already normalises every website form into a `Lead`. The Firestore
 * sink (to be registered in `resolveSinks()`) writes that `Lead` here, so the
 * shape stays close to it on purpose.
 */
export interface EnquiryDoc {
  /** Which form produced it: `"enrolment"`, `"callback"`, `"demo"`, … */
  form: string;
  name: string;
  phone: string;
  email: string | null;
  source: string;
  campaign: string | null;
  courseId: string | null;
  page: string | null;
  status: EnquiryStatus;
  /** Counsellor uid who owns the follow-up. */
  assignedTo: Uid | null;
  followUpAt: IsoDateTime | null;
  /** Remaining form-specific answers, as submitted. */
  answers: Record<string, unknown>;
  /** Append-only call log. */
  activity: {
    at: IsoDateTime;
    by: Uid;
    note: string;
  }[];
  /** Set once this enquiry converts, so attribution survives. */
  convertedStudentUid: Uid | null;
}

export type Enquiry = Entity<EnquiryDoc>;
