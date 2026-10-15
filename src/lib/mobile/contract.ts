/**
 * The mobile app's API contract — `/api/mobile/v1/*`.
 *
 * Self-contained on purpose: no imports, plain unions instead of `@/types/db`
 * aliases, so this file can be copied verbatim into the Expo app
 * (`VidyantIasMobile/src/types/api.ts`) and the two cannot drift silently. Change
 * a shape here, copy the file, bump the version segment of the path if an
 * already-shipped app would break.
 *
 * What is absent is as deliberate as what is present: no answer keys outside a
 * released review, no Mux asset ids or Cloudinary references, no proctoring
 * counters beyond what the student's own window may know.
 */

// ─── Envelope ───────────────────────────────────────────────────────────────

export type ApiErrorCode =
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "PAYMENT_FAILED"
  | "CONFIG_ERROR"
  | "INTERNAL_ERROR";

export type ApiResponse<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: ApiErrorCode;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

export interface PageView<T> {
  items: T[];
  nextCursor: string | null;
}

// ─── Shared unions ──────────────────────────────────────────────────────────

export type RoleName =
  | "STUDENT"
  | "MENTOR"
  | "FACULTY"
  | "COUNSELLOR"
  | "ADMIN"
  | "SUPER_ADMIN";
export type PreparationStageName =
  | "exploring"
  | "beginner"
  | "intermediate"
  | "advanced"
  | "revision";
export type CourseCategoryName = "foundation" | "prelims" | "mains" | "optional" | "test-series";
export type DeliveryModeName = "offline" | "online-live" | "recorded" | "hybrid";
export type EnrollmentStatusName = "pending" | "active" | "suspended" | "completed" | "cancelled";
export type LessonKindName = "video" | "live" | "document" | "quiz";
export type TestKindName = "prelims-mcq" | "mains-descriptive" | "csat" | "sectional";
export type QuestionKindName = "mcq-single" | "mcq-multiple" | "descriptive";
export type AttemptStatusName = "in-progress" | "submitted" | "evaluated" | "abandoned";
export type TerminationReasonName = "expired" | "violations" | "staff";
export type BookmarkKindName = "lesson" | "article" | "question";
export type NotificationKindName =
  | "announcement"
  | "test-scheduled"
  | "result-published"
  | "doubt-answered"
  | "payment"
  | "mentorship";

// ─── Account ────────────────────────────────────────────────────────────────

export interface StudentView {
  fullName: string;
  rollNumber: string | null;
  phone: string;
  email: string | null;
  city: string | null;
  state: string | null;
  optionalSubject: string | null;
  preparationStage: PreparationStageName | null;
  targetExamYear: string | null;
  attemptsGiven: number;
}

export interface MeView {
  uid: string;
  email: string | null;
  role: RoleName;
  displayName: string;
  student: StudentView | null;
  /** True once the study-preferences step has been answered (or skipped server-side). */
  onboardingComplete: boolean;
}

export interface ProfilePatch {
  fullName?: string;
  city?: string | null;
  state?: string | null;
  optionalSubject?: string | null;
  preparationStage?: PreparationStageName | null;
  targetExamYear?: string | null;
  attemptsGiven?: number;
}

// ─── Learn ──────────────────────────────────────────────────────────────────

export interface LessonProgressView {
  positionSeconds: number;
  durationSeconds: number | null;
  percent: number;
  completed: boolean;
  lastViewedAt: string;
}

export type LessonStateName = "available" | "in-progress" | "completed";

export interface LessonView {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  kind: LessonKindName;
  order: number;
  durationSeconds: number | null;
  isFreePreview: boolean;
  hasVideo: boolean;
  hasDocument: boolean;
  publishedAt: string | null;
  state: LessonStateName;
  progress: LessonProgressView | null;
}

export interface BatchView {
  id: string;
  name: string;
  timing: string | null;
  centre: string | null;
  mode: DeliveryModeName;
  startDate: string;
  endDate: string | null;
}

export interface CourseView {
  id: string;
  title: string;
  category: CourseCategoryName;
  modes: DeliveryModeName[];
  durationMonths: number | null;
  enrollment: { status: EnrollmentStatusName; startsAt: string; endsAt: string | null };
  batch: BatchView | null;
  progress: { completed: number; total: number; percent: number };
}

export interface CourseDetailView {
  course: CourseView;
  lessons: LessonView[];
  papers: PaperView[];
}

export interface LessonDetailView {
  lesson: LessonView;
  course: { id: string; title: string };
  previous: LessonView | null;
  next: LessonView | null;
}

export interface PlaybackView {
  /** HLS URL with a short-lived signed token. Never persisted by the app. */
  streamUrl: string;
  posterUrl: string;
  expiresInSeconds: number;
}

export interface DocumentLinkView {
  /** Signed, expiring URL. Download immediately; never store the URL itself. */
  url: string;
  expiresInSeconds: number;
}

export interface SaveProgressBody {
  positionSeconds: number;
  durationSeconds?: number | null;
  completed?: boolean;
}

// ─── Practice ───────────────────────────────────────────────────────────────

export type PaperWindowName = "unscheduled" | "upcoming" | "open" | "closed";

export interface PaperAttemptView {
  id: string;
  status: AttemptStatusName;
  startedAt: string;
  submittedAt: string | null;
  expiresAt: string;
  answeredCount: number;
}

export interface PaperView {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  kind: TestKindName;
  subject: string | null;
  questionCount: number;
  totalMarks: number;
  durationMinutes: number;
  negativeMarksPerQuestion: number;
  opensAt: string | null;
  closesAt: string | null;
  resultsVisibleFrom: string | null;
  window: PaperWindowName;
  attempt: PaperAttemptView | null;
  /** The scorecard for `attempt` is out. */
  resultReleased: boolean;
}

export interface PaperDetailView extends PaperView {
  /** Invigilation rules, worded for the app. */
  rules: string[];
  maxFocusLosses: number;
  canStart: boolean;
  /** Why `canStart` is false, in words a student can act on. */
  blockedReason: string | null;
}

export interface ExamOptionView {
  id: string;
  text: string;
}

export interface ExamQuestionView {
  id: string;
  kind: QuestionKindName;
  subject: string;
  statement: string;
  imageUrl: string | null;
  options: ExamOptionView[];
  marks: number;
}

export interface ExamAnswerView {
  questionId: string;
  selectedOptionIds: string[];
}

export interface ExamSessionView {
  attemptId: string;
  /** Identifies this device to the server; the newest device wins. */
  sessionToken: string;
  status: AttemptStatusName;
  /** Server-authoritative at the moment of the response. */
  remainingSeconds: number;
  questions: ExamQuestionView[];
  answers: ExamAnswerView[];
  focusLossesLeft: number;
  maxFocusLosses: number;
  finished: boolean;
  terminationReason: TerminationReasonName | null;
  paper: {
    id: string;
    title: string;
    durationMinutes: number;
    totalMarks: number;
    questionCount: number;
    negativeMarksPerQuestion: number;
  };
}

export interface AttemptStateView {
  attemptId: string;
  status: AttemptStatusName;
  remainingSeconds: number;
  focusLossCount: number;
  focusLossesLeft: number;
  terminationReason: TerminationReasonName | null;
}

export interface SaveAnswerBody {
  sessionToken: string;
  questionId: string;
  selectedOptionIds: string[];
  timeSpentSeconds?: number;
}

export type MobileProctorEvent = "focusLoss" | "focusRestored" | "networkLoss";

// ─── Results & analytics ────────────────────────────────────────────────────

export interface SubjectScoreView {
  subject: string;
  score: number;
  totalMarks: number;
  correctCount: number;
  wrongCount: number;
}

export interface ScorecardView {
  score: number;
  totalMarks: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  negativeMarks: number;
  /** Null until the institute computes ranks for the paper. Never estimated. */
  rank: number | null;
  percentile: number | null;
  subjectBreakdown: SubjectScoreView[];
  publishedAt: string | null;
}

export type ResultStatusName = "released" | "sealed" | "awaiting-evaluation" | "in-progress";

export interface TrendPointView {
  attemptId: string;
  testId: string;
  title: string;
  kind: TestKindName | null;
  date: string;
  score: number;
  totalMarks: number;
  percent: number;
  accuracy: number | null;
  rank: number | null;
  percentile: number | null;
}

export interface ResultView {
  attemptId: string;
  paper: {
    id: string;
    title: string;
    kind: TestKindName;
    subject: string | null;
    totalMarks: number;
    questionCount: number;
    durationMinutes: number;
    negativeMarksPerQuestion: number;
  } | null;
  status: ResultStatusName;
  /** When a sealed result opens. */
  releasesAt: string | null;
  scorecard: ScorecardView | null;
  timeSpentSeconds: number | null;
  autoSubmitted: boolean;
  terminationReason: TerminationReasonName | null;
  /** The student's other released papers, newest last. Empty when there are none. */
  previousPapers: TrendPointView[];
  reviewAvailable: boolean;
}

export interface ReviewQuestionView extends ExamQuestionView {
  correctOptionIds: string[];
  explanation: string | null;
  selectedOptionIds: string[];
  marksAwarded: number | null;
  isCorrect: boolean | null;
}

export interface SubjectStatView {
  subject: string;
  score: number;
  totalMarks: number;
  percent: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number | null;
  papers: number;
}

export interface PerformanceView {
  papers: number;
  averagePercent: number | null;
  bestPercent: number | null;
  recentChange: number | null;
  accuracy: number | null;
  averagePercentile: number | null;
  bestRank: number | null;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  negativeMarks: number;
  trend: TrendPointView[];
  /** Weakest first. */
  subjects: SubjectStatView[];
}

export interface MistakeView {
  attemptId: string;
  paperTitle: string;
  sittingDate: string;
  question: ReviewQuestionView;
}

// ─── Home ───────────────────────────────────────────────────────────────────

export interface ContinueItemView {
  lesson: LessonView;
  courseTitle: string;
}

export interface StreakView {
  /** Consecutive IST days with any recorded learning activity, ending today or yesterday. */
  current: number;
  longest: number;
  last7Days: { date: string; active: boolean }[];
}

export interface HomeView {
  me: MeView;
  courses: CourseView[];
  continueLearning: ContinueItemView[];
  papers: {
    inProgress: PaperView[];
    open: PaperView[];
    upcoming: PaperView[];
    recentlyReleased: PaperView[];
  };
  liveClasses: ContinueItemView[];
  performance: PerformanceView;
  streak: StreakView;
  unreadNotifications: number;
}

// ─── Engagement ─────────────────────────────────────────────────────────────

export interface NotificationView {
  id: string;
  kind: NotificationKindName;
  title: string;
  body: string;
  /** A website path such as `/dashboard/tests/abc`; the app maps it to a screen. */
  href: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface BookmarkView {
  id: string;
  kind: BookmarkKindName;
  refId: string;
  title: string;
  subtitle: string | null;
  courseId: string | null;
  attemptId: string | null;
  questionId: string | null;
  createdAt: string;
}

export interface AddBookmarkBody {
  kind: BookmarkKindName;
  refId: string;
  title: string;
  subtitle?: string | null;
}

export interface RegisterDeviceBody {
  installationId: string;
  platform: "ios" | "android";
  token: string;
  appVersion?: string | null;
}

export type SupportTopicName = "courses" | "tests" | "app" | "payments" | "other";

export interface SupportRequestBody {
  topic: SupportTopicName;
  message: string;
}

export interface DeletionRequestBody {
  reason?: string | null;
}

export interface FiledRequestView {
  id: string;
  slaDays?: number;
}
