/**
 * Every Firestore collection name, in one place.
 *
 * Collections are flat and top-level: `enrollments` rather than
 * `students/{uid}/enrollments`. Subcollections would make the admin queries the
 * institute actually needs ("every enrollment for this batch", "every attempt
 * for this test") impossible without a collection-group index on each one, and
 * they do not map onto relational tables. Flat documents with id references do.
 */
export const COLLECTIONS = {
  users: "users",
  students: "students",
  faculty: "faculty",
  courses: "courses",
  batches: "batches",
  enrollments: "enrollments",
  lessons: "lessons",
  tests: "tests",
  questions: "questions",
  testAttempts: "testAttempts",
  answers: "answers",
  results: "results",
  proctorEvents: "proctorEvents",
  mockAttempts: "mockAttempts",
  doubts: "doubts",
  mentorship: "mentorship",
  notifications: "notifications",
  enquiries: "enquiries",
  payments: "payments",
  activity: "activity",
  /** WhatsApp lead bot conversations, keyed by WhatsApp number. Server-only. */
  whatsappSessions: "whatsappSessions",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/**
 * Deterministic ids, used where a natural key exists. They make writes
 * idempotent: a retried submit overwrites one document instead of creating a
 * second one, which matters for webhooks and flaky mobile connections.
 */
export const docId = {
  /** `users`, `students` and `faculty` are all keyed by the Firebase Auth uid. */
  user: (uid: string) => uid,
  /** One answer per question per attempt. */
  answer: (attemptId: string, questionId: string) => `${attemptId}_${questionId}`,
  /** One result per attempt. */
  result: (attemptId: string) => attemptId,
  /** One enrollment per student per course. Re-enrolling reactivates. */
  enrollment: (studentUid: string, courseId: string) => `${studentUid}_${courseId}`,
} as const;
