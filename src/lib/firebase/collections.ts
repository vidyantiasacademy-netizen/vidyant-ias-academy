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
  /** Mains answer copies — uploaded pages and their evaluation. Server-written. */
  answerSubmissions: "answerSubmissions",
  doubts: "doubts",
  mentorship: "mentorship",
  notifications: "notifications",
  enquiries: "enquiries",
  payments: "payments",
  activity: "activity",
  /** WhatsApp lead bot conversations, keyed by WhatsApp number. Server-only. */
  whatsappSessions: "whatsappSessions",
  /** Where a student is in each lesson — resume position and completion. Server-written. */
  lessonProgress: "lessonProgress",
  /** A student's saved lessons, articles and reviewed questions. Server-written. */
  bookmarks: "bookmarks",
  /** Push-notification device registrations from the mobile app. Server-only. */
  pushDevices: "pushDevices",
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
  /** One answer copy per student per Mains paper, so a retried upload lands on it. */
  answerSubmission: (testId: string, studentUid: string) => `${testId}_${studentUid}`,
  /** One enrollment per student per course. Re-enrolling reactivates. */
  enrollment: (studentUid: string, courseId: string) => `${studentUid}_${courseId}`,
  /** One progress record per student per lesson, so a resume beat overwrites. */
  lessonProgress: (studentUid: string, lessonId: string) => `${studentUid}_${lessonId}`,
  /** One bookmark per student per saved thing — saving twice is a no-op. */
  bookmark: (studentUid: string, kind: string, refId: string) =>
    `${studentUid}_${kind}_${refId}`,
  /** One registration per app installation, so a refreshed token replaces the old. */
  pushDevice: (userUid: string, installationId: string) => `${userUid}_${installationId}`,
} as const;
