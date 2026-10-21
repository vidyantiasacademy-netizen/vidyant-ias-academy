import "server-only";

import { getCurrentStudent, getCurrentUserProfile, requireAuth } from "@/lib/auth/server";
import { AppError, ERROR_CODES, isAppError } from "@/lib/errors";
import { summarisePerformance, type PerformanceSummary } from "@/lib/exam/analytics";
import { describeExamRules, resolveExamSecurity } from "@/lib/exam/policy";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { collection, toEntity } from "@/lib/firebase/firestore";
import { earliestFirst, hasPassed, isAhead, latestFirst } from "@/lib/utils/instant";
import { activityService } from "@/services/activity/activity.service";
import { courseService } from "@/services/courses/course.service";
import { notificationService } from "@/services/notifications/notification.service";
import { lessonProgressService } from "@/services/progress/lesson-progress.service";
import { storageService } from "@/services/storage/storage.service";
import { testService } from "@/services/tests/test.service";
import { videoService } from "@/services/video/video.service";
import type {
  Batch,
  Bookmark,
  Course,
  Enrollment,
  ExamSecurityPolicy,
  Lesson,
  LessonProgress,
  Notification,
  Student,
  Test,
  TestAttempt,
} from "@/types/db";

import type {
  AttemptStateView,
  BookmarkView,
  ContinueItemView,
  CourseDetailView,
  CourseView,
  DocumentLinkView,
  ExamSessionView,
  HomeView,
  LessonDetailView,
  LessonView,
  MeView,
  MistakeView,
  NotificationView,
  PaperDetailView,
  PaperView,
  PaperWindowName,
  PerformanceView,
  PlaybackView,
  ResultView,
  ReviewQuestionView,
  StudentView,
} from "./contract";
import { computeStreak } from "./streak";

/**
 * Composition for `/api/mobile/v1`: joins what the existing services return
 * into the shapes in `contract.ts`.
 *
 * Nothing in this file authorises on its own account except where it says so —
 * it calls the same services the website's pages call, and those services do
 * the enrollment, ownership and release-date checks. Where this file reads a
 * collection directly it is after an explicit ownership check, and only for
 * data the student's own scorecard page already shows them.
 */

const PRELIMS_STYLE = new Set(["prelims-mcq", "csat", "sectional"]);

// ─── Account ────────────────────────────────────────────────────────────────

function toStudentView(student: Student | null): StudentView | null {
  if (!student) return null;
  return {
    fullName: student.fullName,
    rollNumber: student.rollNumber,
    phone: student.phone,
    email: student.email,
    city: student.city,
    state: student.state,
    optionalSubject: student.optionalSubject,
    preparationStage: student.preparationStage,
    targetExamYear: student.targetExamYear,
    attemptsGiven: student.attemptsGiven ?? 0,
  };
}

export async function getMe(): Promise<MeView> {
  const user = await requireAuth();
  const [profile, student] = await Promise.all([
    getCurrentUserProfile(),
    getCurrentStudent(),
  ]);

  return {
    uid: user.uid,
    email: user.email,
    role: user.role,
    displayName: profile?.displayName ?? student?.fullName ?? user.email ?? "Student",
    student: toStudentView(student),
    onboardingComplete: Boolean(student?.preparationStage && student?.targetExamYear),
  };
}

// ─── Learn ──────────────────────────────────────────────────────────────────

function toLessonView(lesson: Lesson, progress: LessonProgress | undefined): LessonView {
  return {
    id: lesson.id,
    courseId: lesson.courseId,
    title: lesson.title,
    description: lesson.description,
    kind: lesson.kind,
    order: lesson.order,
    durationSeconds: lesson.durationSeconds,
    isFreePreview: lesson.isFreePreview,
    hasVideo: Boolean(lesson.muxAssetId),
    hasDocument: Boolean(lesson.storagePath),
    publishedAt: lesson.publishedAt,
    state: progress?.completed
      ? "completed"
      : progress && progress.positionSeconds > 0
        ? "in-progress"
        : "available",
    progress: progress
      ? {
          positionSeconds: progress.positionSeconds,
          durationSeconds: progress.durationSeconds,
          percent: progress.percent,
          completed: progress.completed,
          lastViewedAt: progress.lastViewedAt,
        }
      : null,
  };
}

async function readBatch(batchId: string | null): Promise<Batch | null> {
  if (!batchId) return null;
  return toEntity<Batch>(await collection(COLLECTIONS.batches).doc(batchId).get()) as Batch | null;
}

function toCourseView(
  course: Course,
  enrollment: Enrollment,
  batch: Batch | null,
  lessons: Lesson[],
  progress: LessonProgress[],
): CourseView {
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const completed = progress.filter(
    (item) => item.completed && lessonIds.has(item.lessonId),
  ).length;
  const total = lessons.length;

  return {
    id: course.id,
    title: course.title,
    category: course.category,
    modes: course.modes,
    durationMonths: course.durationMonths,
    enrollment: {
      status: enrollment.status,
      startsAt: enrollment.startsAt,
      endsAt: enrollment.endsAt,
    },
    batch: batch
      ? {
          id: batch.id,
          name: batch.name,
          timing: batch.timing,
          centre: batch.centre,
          mode: batch.mode,
          startDate: batch.startDate,
          endDate: batch.endDate,
        }
      : null,
    progress: {
      completed,
      total,
      percent: total ? Math.round((completed / total) * 100) : 0,
    },
  };
}

interface EnrolledCourse {
  course: Course;
  enrollment: Enrollment;
  batch: Batch | null;
  lessons: Lesson[];
  progress: LessonProgress[];
}

async function loadEnrolledCourses(): Promise<EnrolledCourse[]> {
  const enrolled = await courseService.getEnrolledCourses();

  return Promise.all(
    enrolled.map(async ({ course, enrollment }) => {
      const [batch, lessons, progress] = await Promise.all([
        readBatch(enrollment.batchId),
        courseService.getLessons(course.id),
        lessonProgressService.listOwnForCourse(course.id),
      ]);
      return { course, enrollment, batch, lessons, progress };
    }),
  );
}

export async function listCourses(): Promise<CourseView[]> {
  const enrolled = await loadEnrolledCourses();
  return enrolled.map((item) =>
    toCourseView(item.course, item.enrollment, item.batch, item.lessons, item.progress),
  );
}

export async function getCourseDetail(courseId: string): Promise<CourseDetailView> {
  const enrolled = await loadEnrolledCourses();
  const item = enrolled.find((entry) => entry.course.id === courseId);

  // Only active enrollments are listed; anything else is not this student's course.
  if (!item) throw new AppError(ERROR_CODES.NOT_FOUND);

  const progressByLesson = new Map(item.progress.map((entry) => [entry.lessonId, entry]));
  const papers = await buildPapers([{ course: item.course }]);

  return {
    course: toCourseView(item.course, item.enrollment, item.batch, item.lessons, item.progress),
    lessons: item.lessons.map((lesson) => toLessonView(lesson, progressByLesson.get(lesson.id))),
    papers,
  };
}

export async function getLessonDetail(lessonId: string): Promise<LessonDetailView> {
  // The gate: published, and free preview or an active enrollment.
  const lesson = await courseService.requireLessonAccess(lessonId);

  const [course, siblings, progress] = await Promise.all([
    courseService.getById(lesson.courseId),
    courseService.getLessons(lesson.courseId),
    lessonProgressService.listOwnForCourse(lesson.courseId),
  ]);

  const progressByLesson = new Map(progress.map((entry) => [entry.lessonId, entry]));
  const index = siblings.findIndex((entry) => entry.id === lesson.id);
  const view = (entry: Lesson | undefined) =>
    entry ? toLessonView(entry, progressByLesson.get(entry.id)) : null;

  return {
    lesson: toLessonView(lesson, progressByLesson.get(lesson.id)),
    course: { id: lesson.courseId, title: course?.title ?? "Course" },
    previous: index > 0 ? view(siblings[index - 1]) : null,
    next: index >= 0 ? view(siblings[index + 1]) : null,
  };
}

export async function getPlayback(lessonId: string): Promise<PlaybackView> {
  const playback = await videoService.getPlayback(lessonId);

  return {
    streamUrl: `https://stream.mux.com/${playback.playbackId}.m3u8?token=${playback.token}`,
    posterUrl: `https://image.mux.com/${playback.playbackId}/thumbnail.jpg?token=${playback.thumbnailToken}`,
    expiresInSeconds: playback.expiresInSeconds,
  };
}

const DOCUMENT_URL_TTL_SECONDS = 10 * 60;

export async function getDocumentLink(lessonId: string): Promise<DocumentLinkView> {
  return {
    url: await storageService.getLessonDocumentUrl(lessonId),
    expiresInSeconds: DOCUMENT_URL_TTL_SECONDS,
  };
}

export async function saveProgress(
  lessonId: string,
  input: { positionSeconds: number; durationSeconds?: number | null; completed?: boolean },
): Promise<LessonView> {
  const progress = await lessonProgressService.saveOwn(lessonId, input);
  const lesson = await courseService.requireLessonAccess(lessonId);
  return toLessonView(lesson, progress);
}

// ─── Practice ───────────────────────────────────────────────────────────────

function windowOf(test: Test, nowIso: string): PaperWindowName {
  if (!test.opensAt) return "unscheduled";
  const now = Date.parse(nowIso);
  if (isAhead(test.opensAt, now)) return "upcoming";
  if (test.closesAt && hasPassed(test.closesAt, now)) return "closed";
  return "open";
}

function toPaperView(
  test: Test,
  courseTitle: string,
  attempt: TestAttempt | undefined,
  releasedAttemptIds: Set<string>,
  nowIso: string,
): PaperView {
  return {
    id: test.id,
    courseId: test.courseId,
    courseTitle,
    title: test.title,
    kind: test.kind,
    subject: test.subject,
    questionCount: test.questionCount,
    totalMarks: test.totalMarks,
    durationMinutes: test.durationMinutes,
    negativeMarksPerQuestion: test.negativeMarksPerQuestion,
    opensAt: test.opensAt,
    closesAt: test.closesAt,
    resultsVisibleFrom: test.resultsVisibleFrom,
    window: windowOf(test, nowIso),
    attempt: attempt
      ? {
          id: attempt.id,
          status: attempt.status,
          startedAt: attempt.startedAt,
          submittedAt: attempt.submittedAt,
          expiresAt: attempt.expiresAt,
          answeredCount: attempt.answeredCount,
        }
      : null,
    resultReleased: attempt ? releasedAttemptIds.has(attempt.id) : false,
  };
}

/** Papers across the given courses, each joined to the student's own latest attempt. */
async function buildPapers(courses: { course: Course }[]): Promise<PaperView[]> {
  const user = await requireAuth();
  const nowIso = new Date().toISOString();

  const [attempts, scored, ...perCourse] = await Promise.all([
    testService.listAttempts(user.uid),
    testService.listOwnPublishedResults(),
    ...courses.map(({ course }) => testService.listForCourse(course.id)),
  ]);

  const titleByCourse = new Map(courses.map(({ course }) => [course.id, course.title]));
  const released = new Set(scored.map(({ result }) => result.attemptId));

  // `listAttempts` is newest first, so the first seen per paper is the latest.
  const attemptByTest = new Map<string, TestAttempt>();
  for (const attempt of attempts) {
    if (!attemptByTest.has(attempt.testId)) attemptByTest.set(attempt.testId, attempt);
  }

  return perCourse
    .flat()
    .map((test) =>
      toPaperView(
        test,
        titleByCourse.get(test.courseId) ?? "",
        attemptByTest.get(test.id),
        released,
        nowIso,
      ),
    )
    .sort((a, b) => latestFirst(a.opensAt, b.opensAt));
}

export async function listPapers(): Promise<PaperView[]> {
  const enrolled = await courseService.getEnrolledCourses();
  return buildPapers(enrolled);
}

/** Exam rules as they apply on a phone: there is no fullscreen or clipboard to police. */
function mobileRules(policy: ExamSecurityPolicy): string[] {
  const rules = describeExamRules({
    ...policy,
    requireFullscreen: false,
    blockCopyPaste: false,
  }).map((rule) => rule.replace("another tab, window or app", "another app"));

  rules.push(
    "Leaving the app — the home screen, another app, a call you pick up — counts as a switch. Notifications that you do not open do not.",
    "Opening this paper on another device or in a browser ends this device's part in the sitting.",
  );

  return rules;
}

export async function getPaperDetail(testId: string): Promise<PaperDetailView> {
  // `getTest` is the authorisation: a draft paper, or one from a course this
  // student is not enrolled in, is refused here.
  const test = await testService.getTest(testId);
  const [course, attempt, scored] = await Promise.all([
    courseService.getById(test.courseId),
    testService.findOwnAttempt(testId),
    testService.listOwnPublishedResults(),
  ]);

  const policy = resolveExamSecurity(test);
  const released = new Set(scored.map(({ result }) => result.attemptId));
  const paper = toPaperView(
    test,
    course?.title ?? "",
    attempt ?? undefined,
    released,
    new Date().toISOString(),
  );

  let blockedReason: string | null = null;
  if (test.kind === "mains-descriptive") {
    blockedReason =
      "This is a descriptive paper. Open Mains Answer Writing in the student portal on the web to download the question paper and upload your answer sheet — it is evaluated by faculty.";
  } else if (attempt && attempt.status !== "in-progress") {
    blockedReason = "You have already sat this paper.";
  } else if (paper.window === "upcoming") {
    blockedReason = "This paper has not opened yet.";
  } else if (paper.window === "closed") {
    blockedReason = "This paper has closed.";
  } else if (paper.window === "unscheduled") {
    blockedReason = "The date for this paper has not been announced.";
  }

  return {
    ...paper,
    rules: mobileRules(policy),
    maxFocusLosses: policy.maxFocusLosses,
    canStart: blockedReason === null,
    blockedReason,
  };
}

export async function openExam(testId: string): Promise<ExamSessionView> {
  const test = await testService.getTest(testId);
  const payload = await testService.openExam(testId);
  const policy = resolveExamSecurity(test);

  return {
    attemptId: payload.attemptId,
    sessionToken: payload.sessionToken,
    status: payload.status,
    remainingSeconds: payload.remainingSeconds,
    questions: payload.questions.map((question) => ({
      id: question.id,
      kind: question.kind,
      subject: question.subject,
      statement: question.statement,
      imageUrl: question.imageUrl,
      options: question.options,
      marks: question.marks,
    })),
    answers: payload.answers,
    focusLossesLeft: payload.focusLossesLeft,
    maxFocusLosses: policy.maxFocusLosses,
    finished: payload.finished,
    terminationReason: payload.terminationReason,
    paper: {
      id: test.id,
      title: test.title,
      durationMinutes: test.durationMinutes,
      totalMarks: test.totalMarks,
      questionCount: test.questionCount,
      negativeMarksPerQuestion: test.negativeMarksPerQuestion,
    },
  };
}

export function toAttemptState(state: {
  attemptId: string;
  status: AttemptStateView["status"];
  remainingSeconds: number;
  focusLossCount: number;
  focusLossesLeft: number;
  terminationReason: AttemptStateView["terminationReason"];
}): AttemptStateView {
  return {
    attemptId: state.attemptId,
    status: state.status,
    remainingSeconds: state.remainingSeconds,
    focusLossCount: state.focusLossCount,
    focusLossesLeft: state.focusLossesLeft,
    terminationReason: state.terminationReason,
  };
}

// ─── Results ────────────────────────────────────────────────────────────────

/** The caller's own attempt, or NOT_FOUND — never FORBIDDEN, which would confirm it exists. */
async function requireOwnAttempt(attemptId: string): Promise<TestAttempt> {
  const user = await requireAuth();
  const attempt = toEntity<TestAttempt>(
    await collection(COLLECTIONS.testAttempts).doc(attemptId).get(),
  ) as TestAttempt | null;

  if (!attempt || attempt.studentUid !== user.uid) throw new AppError(ERROR_CODES.NOT_FOUND);
  return attempt;
}

function toPerformanceView(summary: PerformanceSummary): PerformanceView {
  return summary;
}

export async function getResultView(attemptId: string): Promise<ResultView> {
  const attempt = await requireOwnAttempt(attemptId);
  // The paper's own record, read after the ownership check above: a student
  // whose enrollment has since ended still gets to see what they sat.
  const test = toEntity<Test>(
    await collection(COLLECTIONS.tests).doc(attempt.testId).get(),
  ) as Test | null;

  let status: ResultView["status"];
  let scorecard: ResultView["scorecard"] = null;

  if (attempt.status === "in-progress") {
    status = "in-progress";
  } else {
    try {
      const result = await testService.getResult(attemptId);
      if (result) {
        status = "released";
        scorecard = {
          score: result.score,
          totalMarks: result.totalMarks,
          correctCount: result.correctCount,
          wrongCount: result.wrongCount,
          unattemptedCount: result.unattemptedCount,
          negativeMarks: result.negativeMarks,
          rank: result.rank,
          percentile: result.percentile,
          subjectBreakdown: result.subjectBreakdown,
          publishedAt: result.publishedAt,
        };
      } else {
        status = "awaiting-evaluation";
      }
    } catch (error) {
      if (isAppError(error) && error.code === ERROR_CODES.FORBIDDEN) status = "sealed";
      else throw error;
    }
  }

  const previousPapers =
    status === "released"
      ? summarisePerformance(await testService.listOwnPublishedResults())
          .trend.filter((point) => point.attemptId !== attemptId)
          .slice(-5)
      : [];

  const timeSpentSeconds = attempt.submittedAt
    ? Math.max(
        0,
        Math.round(
          (new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) /
            1000,
        ),
      )
    : null;

  return {
    attemptId,
    paper: test
      ? {
          id: test.id,
          title: test.title,
          kind: test.kind,
          subject: test.subject,
          totalMarks: test.totalMarks,
          questionCount: test.questionCount,
          durationMinutes: test.durationMinutes,
          negativeMarksPerQuestion: test.negativeMarksPerQuestion,
        }
      : null,
    status,
    releasesAt: status === "sealed" ? (test?.resultsVisibleFrom ?? null) : null,
    scorecard,
    timeSpentSeconds,
    autoSubmitted: attempt.autoSubmitted ?? false,
    terminationReason: attempt.terminationReason ?? null,
    previousPapers,
    reviewAvailable: status === "released" && test !== null && PRELIMS_STYLE.has(test.kind),
  };
}

export async function getReview(attemptId: string): Promise<ReviewQuestionView[]> {
  // `getReview` re-checks ownership and the release date itself.
  const questions = await testService.getReview(attemptId);

  return questions.map((question) => ({
    id: question.id,
    kind: question.kind,
    subject: question.subject,
    statement: question.statement,
    imageUrl: question.imageUrl,
    options: question.options,
    marks: question.marks,
    correctOptionIds: question.correctOptionIds,
    explanation: question.explanation,
    selectedOptionIds: question.selectedOptionIds,
    marksAwarded: question.marksAwarded,
    isCorrect: question.isCorrect,
  }));
}

export async function getPerformance(): Promise<PerformanceView> {
  return toPerformanceView(summarisePerformance(await testService.listOwnPublishedResults()));
}

/** Papers the mistakes list reads from — each one is a full review read. */
const MISTAKE_PAPERS = 6;

export async function listMistakes(subject?: string | null): Promise<MistakeView[]> {
  const scored = await testService.listOwnPublishedResults();

  const recent = scored
    .filter(({ test }) => test !== null && PRELIMS_STYLE.has(test.kind))
    .sort((a, b) => b.result.createdAt.localeCompare(a.result.createdAt))
    .slice(0, MISTAKE_PAPERS);

  const reviews = await Promise.all(
    recent.map(async ({ result, test }) => ({
      result,
      test,
      questions: await getReview(result.attemptId),
    })),
  );

  return reviews.flatMap(({ result, test, questions }) =>
    questions
      .filter((question) => question.isCorrect === false)
      .filter((question) => !subject || question.subject === subject)
      .map((question) => ({
        attemptId: result.attemptId,
        paperTitle: test?.title ?? "Paper",
        sittingDate: result.createdAt,
        question,
      })),
  );
}

// ─── Home ───────────────────────────────────────────────────────────────────

const ACTIVITY_WINDOW = 200;

export async function getHome(): Promise<HomeView> {
  const user = await requireAuth();

  const [me, enrolled, recent, scored, activity, unread] = await Promise.all([
    getMe(),
    loadEnrolledCourses(),
    lessonProgressService.listOwnRecent(12),
    testService.listOwnPublishedResults(),
    activityService.listForStudent(user.uid, { limit: ACTIVITY_WINDOW }),
    notificationService.countUnread(),
  ]);

  const papers = await buildPapers(enrolled);

  const lessonById = new Map<string, { lesson: Lesson; courseTitle: string }>();
  for (const item of enrolled) {
    for (const lesson of item.lessons) {
      lessonById.set(lesson.id, { lesson, courseTitle: item.course.title });
    }
  }

  const progressByLesson = new Map(
    enrolled.flatMap((item) => item.progress.map((entry) => [entry.lessonId, entry] as const)),
  );

  // Continue learning: recently opened, not finished, still accessible.
  const continueLearning: ContinueItemView[] = recent
    .filter((entry) => !entry.completed)
    .map((entry) => {
      const known = lessonById.get(entry.lessonId);
      return known
        ? { lesson: toLessonView(known.lesson, entry), courseTitle: known.courseTitle }
        : null;
    })
    .filter((item): item is ContinueItemView => item !== null)
    .slice(0, 5);

  const liveClasses: ContinueItemView[] = [...lessonById.values()]
    .filter(({ lesson }) => lesson.kind === "live")
    .sort((a, b) => (b.lesson.publishedAt ?? "").localeCompare(a.lesson.publishedAt ?? ""))
    .slice(0, 3)
    .map(({ lesson, courseTitle }) => ({
      lesson: toLessonView(lesson, progressByLesson.get(lesson.id)),
      courseTitle,
    }));

  const sittable = papers.filter((paper) => paper.kind !== "mains-descriptive");

  return {
    me,
    courses: enrolled.map((item) =>
      toCourseView(item.course, item.enrollment, item.batch, item.lessons, item.progress),
    ),
    continueLearning,
    papers: {
      inProgress: sittable.filter((paper) => paper.attempt?.status === "in-progress"),
      open: sittable
        .filter((paper) => paper.window === "open" && !paper.attempt)
        .sort((a, b) => earliestFirst(a.closesAt, b.closesAt))
        .slice(0, 3),
      upcoming: papers
        .filter((paper) => paper.window === "upcoming")
        .sort((a, b) => earliestFirst(a.opensAt, b.opensAt))
        .slice(0, 3),
      recentlyReleased: papers
        .filter((paper) => paper.resultReleased)
        .sort((a, b) =>
          (b.attempt?.submittedAt ?? "").localeCompare(a.attempt?.submittedAt ?? ""),
        )
        .slice(0, 3),
    },
    liveClasses,
    performance: toPerformanceView(summarisePerformance(scored)),
    streak: computeStreak(activity.items.map((item) => item.createdAt)),
    unreadNotifications: unread,
  };
}

// ─── Engagement ─────────────────────────────────────────────────────────────

export function toNotificationView(notification: Notification): NotificationView {
  return {
    id: notification.id,
    kind: notification.kind,
    title: notification.title,
    body: notification.body,
    href: notification.href,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
  };
}

export function toBookmarkView(bookmark: Bookmark): BookmarkView {
  return {
    id: bookmark.id,
    kind: bookmark.kind,
    refId: bookmark.refId,
    title: bookmark.title,
    subtitle: bookmark.subtitle,
    courseId: bookmark.courseId,
    attemptId: bookmark.attemptId,
    questionId: bookmark.questionId,
    createdAt: bookmark.createdAt,
  };
}

