import "server-only";

import type { DocumentReference } from "firebase-admin/firestore";

import {
  ANSWER_SHEET_FORMATS,
  MAX_ANSWER_FILES,
  completionProblem,
  paperWindow,
  scoreOf,
  type PaperWindow,
} from "@/lib/answer-writing/policy";
import { isStaff } from "@/lib/auth/roles";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { MEDIA_PREFIXES, fromMediaRef, isMediaRefIn } from "@/lib/cloudinary/media-paths";
import { AppError, ERROR_CODES } from "@/lib/errors";
import { COLLECTIONS, docId } from "@/lib/firebase/collections";
import { hasPassed, isAhead, toUtcIsoOrNull } from "@/lib/utils/instant";
import {
  auditOnCreate,
  auditOnUpdate,
  collection,
  requireEntity,
  toEntities,
  toEntity,
} from "@/lib/firebase/firestore";
import type { EvaluationInput } from "@/lib/validation/answer-writing";
import type {
  AnswerSheetFile,
  AnswerSubmission,
  AnswerSubmissionDoc,
  AnswerSubmissionStatus,
  MainsEvaluation,
  QuestionEvaluation,
  Result,
  ResultDoc,
  Student,
  Test,
  TestDoc,
  Uid,
  User,
} from "@/types/db";

import { activityService } from "../activity/activity.service";
import { courseService } from "../courses/course.service";
import { notificationService } from "../notifications/notification.service";
import { storageService } from "../storage/storage.service";
import { testService } from "../tests/test.service";

/**
 * Mains answer writing: the student's copy of a paper, from the first download
 * of the question paper to the evaluated copy coming back.
 *
 * The paper is a `tests` document of kind `mains-descriptive`, authored through
 * `testService`. This file owns `answerSubmissions/{testId}_{uid}` — one copy
 * per student per paper — and the state machine on it:
 *
 *     draft ──submit──▶ submitted ──claim──▶ in-review ──complete──▶ evaluated
 *       ▲                   │
 *       └────withdraw───────┘   (until an evaluator starts, and before the deadline)
 *
 * Every transition is a transaction, because two actors race for the same
 * document: a student withdrawing a copy at the moment an evaluator opens it
 * must end with exactly one of them winning, not a copy that is both.
 *
 * Completing an evaluation also writes `results/{submissionId}`, so a Mains
 * score is an ordinary scorecard: it is held by the same `publishedAt` gate as
 * an MCQ result, released and ranked by the same `testService.releaseResults`,
 * and counted on the student's Performance board.
 *
 * What students may see is decided here and nowhere else. They cannot read
 * `answerSubmissions` from the browser — a draft evaluation lives on the same
 * document — so every student-facing function returns a projection.
 */

/** Long enough for an evaluator to read a long copy without the pages blanking. */
const STAFF_URL_TTL_MINUTES = 60;

const OPEN_STATUSES: AnswerSubmissionStatus[] = ["submitted", "in-review"];

function submissions() {
  return collection(COLLECTIONS.answerSubmissions);
}

function submissionRef(testId: string, studentUid: string): DocumentReference {
  return submissions().doc(docId.answerSubmission(testId, studentUid));
}

function resultRef(submissionId: string): DocumentReference {
  return collection(COLLECTIONS.results).doc(docId.result(submissionId));
}

/** A paper of any other kind is not this service's to serve. */
function asMainsPaper(test: Test): Test {
  if (test.kind !== "mains-descriptive") throw new AppError(ERROR_CODES.NOT_FOUND);
  return test;
}

function emptyCopy(test: Test, studentUid: Uid): AnswerSubmissionDoc {
  return {
    testId: test.id,
    courseId: test.courseId,
    studentUid,
    status: "draft",
    paperOpenedAt: null,
    files: [],
    submittedAt: null,
    evaluatorUid: null,
    reviewStartedAt: null,
    evaluation: null,
    evaluatedAt: null,
  };
}

function assertWritable(test: Test): void {
  const window = paperWindow(test);

  if (window === "upcoming") {
    throw new AppError(ERROR_CODES.FORBIDDEN, { message: "This paper has not opened yet." });
  }

  if (window === "closed") {
    throw new AppError(ERROR_CODES.FORBIDDEN, {
      message: "The deadline for this paper has passed, so the copy can no longer change.",
    });
  }
}

function assertDraft(copy: AnswerSubmission | null): void {
  if (copy && copy.status !== "draft") {
    throw new AppError(ERROR_CODES.CONFLICT, {
      message:
        copy.status === "submitted"
          ? "This copy has been submitted. Withdraw it first to change its pages."
          : "This copy is with the evaluator and can no longer change.",
    });
  }
}

function isReleased(result: Pick<Result, "publishedAt"> | null, now = Date.now()): boolean {
  return Boolean(result?.publishedAt && hasPassed(result.publishedAt, now));
}

// ─── Student ─────────────────────────────────────────────────────────────────

/** One Mains paper on the student's board. */
export interface StudentPaperRow {
  test: Test;
  courseTitle: string | null;
  window: PaperWindow;
  status: AnswerSubmissionStatus | null;
  fileCount: number;
  /** The released evaluation's headline numbers. `null` until it is released. */
  evaluation: Pick<MainsEvaluation, "rubric" | "score" | "totalMarks"> | null;
}

const WINDOW_ORDER: Record<PaperWindow, number> = { open: 0, upcoming: 1, closed: 2 };
const NEVER = Number.MAX_SAFE_INTEGER;

/** Open papers by deadline, then upcoming by opening, then closed, newest first. */
function byUrgency(a: StudentPaperRow, b: StudentPaperRow): number {
  const order = WINDOW_ORDER[a.window] - WINDOW_ORDER[b.window];
  if (order !== 0) return order;

  const at = (value: string | null, fallback: number) => (value ? Date.parse(value) : fallback);

  if (a.window === "open") return at(a.test.closesAt, NEVER) - at(b.test.closesAt, NEVER);
  if (a.window === "upcoming") return at(a.test.opensAt, NEVER) - at(b.test.opensAt, NEVER);
  return at(b.test.closesAt, 0) - at(a.test.closesAt, 0);
}

/**
 * Every Mains paper across the caller's active enrollments, with their copy's
 * state. Copies are fetched by their deterministic ids in one batched read, so
 * the board costs no query and no index however many papers there are.
 */
export async function listOwnPapers(): Promise<StudentPaperRow[]> {
  const user = await requireAuth();
  const enrolled = await courseService.getEnrolledCourses();

  const perCourse = await Promise.all(
    enrolled.map(({ course }) => testService.listForCourse(course.id)),
  );
  const courseTitle = new Map(enrolled.map(({ course }) => [course.id, course.title]));
  const papers = perCourse.flat().filter((test) => test.kind === "mains-descriptive");

  if (papers.length === 0) return [];

  const db = submissions().firestore;
  const copies = (
    await db.getAll(...papers.map((test) => submissionRef(test.id, user.uid)))
  ).map((snapshot) => toEntity<AnswerSubmissionDoc>(snapshot));

  const evaluatedIds = copies.flatMap((copy) => (copy?.status === "evaluated" ? [copy.id] : []));
  const results = evaluatedIds.length
    ? (await db.getAll(...evaluatedIds.map(resultRef))).map((snapshot) => toEntity<ResultDoc>(snapshot))
    : [];

  const now = Date.now();
  const released = new Set(
    results.flatMap((result) => (result && isReleased(result, now) ? [result.attemptId] : [])),
  );

  return papers
    .map((test, index): StudentPaperRow => {
      const copy = copies[index];
      const evaluation = copy?.evaluation && released.has(copy.id) ? copy.evaluation : null;

      return {
        test,
        courseTitle: courseTitle.get(test.courseId) ?? null,
        window: paperWindow(test, now),
        status: copy?.status ?? null,
        fileCount: copy?.files.length ?? 0,
        evaluation: evaluation
          ? { rubric: evaluation.rubric, score: evaluation.score, totalMarks: evaluation.totalMarks }
          : null,
      };
    })
    .sort(byUrgency);
}

/** A released evaluation as its student sees it — without storage references. */
export interface ReleasedEvaluation extends Omit<MainsEvaluation, "checkedCopyPath"> {
  hasCheckedCopy: boolean;
  evaluatedAt: string | null;
  rank: number | null;
  percentile: number | null;
}

/** Everything the student's page for one paper needs. */
export interface StudentWorkspace {
  test: Test;
  studentUid: Uid;
  submissionId: string;
  window: PaperWindow;
  copy: Pick<AnswerSubmission, "status" | "files" | "paperOpenedAt" | "submittedAt"> | null;
  /** Pages can be added, removed and reordered, and the copy submitted. */
  canEdit: boolean;
  /** A submitted copy can be taken back to draft. */
  canWithdraw: boolean;
  evaluation: ReleasedEvaluation | null;
  /** Evaluated, but held until the paper's results are released at this time. */
  heldUntil: string | null;
}

export async function getOwnWorkspace(testId: string): Promise<StudentWorkspace> {
  const user = await requireAuth();

  // `getTest` is the authorisation: published, and in a course this student is
  // enrolled in.
  const test = asMainsPaper(await testService.getTest(testId));
  const copy = toEntity<AnswerSubmissionDoc>(await submissionRef(test.id, user.uid).get());
  const window = paperWindow(test);

  let evaluation: ReleasedEvaluation | null = null;
  let heldUntil: string | null = null;

  if (copy?.status === "evaluated" && copy.evaluation) {
    const result = toEntity<ResultDoc>(await resultRef(copy.id).get());

    if (isReleased(result)) {
      const { checkedCopyPath, ...rest } = copy.evaluation;
      evaluation = {
        ...rest,
        hasCheckedCopy: Boolean(checkedCopyPath),
        evaluatedAt: copy.evaluatedAt,
        rank: result?.rank ?? null,
        percentile: result?.percentile ?? null,
      };
    } else {
      heldUntil = result?.publishedAt ?? null;
    }
  }

  return {
    test,
    studentUid: user.uid,
    submissionId: docId.answerSubmission(test.id, user.uid),
    window,
    copy: copy
      ? {
          status: copy.status,
          files: copy.files,
          paperOpenedAt: copy.paperOpenedAt,
          submittedAt: copy.submittedAt,
        }
      : null,
    canEdit: window === "open" && (!copy || copy.status === "draft"),
    canWithdraw: window === "open" && copy?.status === "submitted",
    evaluation,
    heldUntil,
  };
}

/**
 * A short-lived URL for the question paper, and the moment the student first
 * opened it — which is what lets an evaluator see how long the copy took.
 *
 * Opening is allowed after the deadline too: the paper is course material, and
 * a student reading their evaluated copy wants the questions beside it. Only an
 * opening inside the window is recorded, so a late reader does not create an
 * empty copy on every faculty member's list.
 */
export async function openQuestionPaper(testId: string): Promise<string> {
  const user = await requireAuth();
  const test = asMainsPaper(await testService.getTest(testId));
  const window = paperWindow(test);

  if (window === "upcoming") {
    throw new AppError(ERROR_CODES.FORBIDDEN, {
      message: "The question paper is released when the paper opens.",
    });
  }

  if (!test.questionPaperPath) {
    throw new AppError(ERROR_CODES.NOT_FOUND, {
      message: "The question paper has not been uploaded yet.",
    });
  }

  // Staff previewing the link get the paper without a copy being opened in
  // their name — a stray staff copy would also lock the paper's PDF.
  if (window === "open" && !isStaff(user.role)) {
    const ref = submissionRef(test.id, user.uid);
    const nowIso = new Date().toISOString();

    const firstOpen = await ref.firestore.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);

      if (!snapshot.exists) {
        tx.create(ref, {
          ...emptyCopy(test, user.uid),
          paperOpenedAt: nowIso,
          ...auditOnCreate(user.uid),
        });
        return true;
      }

      if (!snapshot.get("paperOpenedAt")) {
        tx.update(ref, { paperOpenedAt: nowIso, ...auditOnUpdate(user.uid) });
        return true;
      }

      return false;
    });

    if (firstOpen) {
      await activityService.record({
        studentUid: user.uid,
        type: "testStarted",
        testId: test.id,
        courseId: test.courseId,
      });
    }
  }

  return storageService.getQuestionPaperUrlForStudent(test.questionPaperPath);
}

/**
 * A short-lived URL for one of the caller's own uploaded pages (by position),
 * or for their evaluated copy once it is released.
 */
export async function getOwnFileUrl(
  testId: string,
  file: "checked-copy" | number,
): Promise<string> {
  const user = await requireAuth();
  const test = asMainsPaper(await testService.getTest(testId));
  const copy = toEntity<AnswerSubmissionDoc>(await submissionRef(test.id, user.uid).get());

  if (!copy) throw new AppError(ERROR_CODES.NOT_FOUND);

  if (file === "checked-copy") {
    const path = copy.evaluation?.checkedCopyPath;
    if (copy.status !== "evaluated" || !path) throw new AppError(ERROR_CODES.NOT_FOUND);

    if (!isReleased(toEntity<ResultDoc>(await resultRef(copy.id).get()))) {
      throw new AppError(ERROR_CODES.FORBIDDEN, {
        message: "Your evaluated copy has not been released yet.",
      });
    }

    return storageService.getEvaluatedCopyUrlForStudent(path);
  }

  const page = copy.files[file];
  if (!page) throw new AppError(ERROR_CODES.NOT_FOUND);

  return storageService.getSignedUrl(page.path);
}

/**
 * Loads what every student write needs: the caller, the paper (authorised and
 * in its window), and a reference to their copy.
 *
 * Staff are refused outright: `getTest` lets faculty through without an
 * enrollment, and a copy in a staff member's name would sit in the evaluation
 * queue and lock the paper.
 */
async function ownCopyForWriting(testId: string) {
  const user = await requireAuth();

  if (isStaff(user.role)) {
    throw new AppError(ERROR_CODES.FORBIDDEN, {
      message: "Staff accounts cannot submit answer copies. Use a student account to try the flow.",
    });
  }

  const test = asMainsPaper(await testService.getTest(testId));
  assertWritable(test);

  return { user, test, ref: submissionRef(test.id, user.uid) };
}

/**
 * Registers a page the browser has just uploaded straight to Cloudinary.
 *
 * The upload signature authorised a write into the caller's own folder, but
 * the reference coming back is only a claim — so it must sit in *this* copy's
 * folder, in an accepted format, before a pointer to it is stored. Idempotent:
 * a retried call after a dropped response does not add the page twice.
 */
export async function addOwnFile(input: {
  testId: string;
  path: string;
  name: string;
  bytes: number;
}): Promise<AnswerSheetFile[]> {
  const { user, test, ref } = await ownCopyForWriting(input.testId);

  if (!isMediaRefIn(input.path, MEDIA_PREFIXES.studentAnswerSheets(user.uid, ref.id), ANSWER_SHEET_FORMATS)) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
      message: "That file was not uploaded for this paper. Please upload it again.",
    });
  }

  return ref.firestore.runTransaction(async (tx) => {
    const copy = toEntity<AnswerSubmissionDoc>(await tx.get(ref));
    assertDraft(copy);

    const files = copy?.files ?? [];
    if (files.some((file) => file.path === input.path)) return files;

    if (files.length >= MAX_ANSWER_FILES) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
        message: `A copy can have at most ${MAX_ANSWER_FILES} files. Combine pages into a PDF, or remove some.`,
      });
    }

    const next: AnswerSheetFile[] = [
      ...files,
      {
        path: input.path,
        format: fromMediaRef(input.path).format.toLowerCase(),
        name: input.name,
        bytes: input.bytes,
        uploadedAt: new Date().toISOString(),
      },
    ];

    if (copy) {
      tx.update(ref, { files: next, ...auditOnUpdate(user.uid) });
    } else {
      tx.create(ref, { ...emptyCopy(test, user.uid), files: next, ...auditOnCreate(user.uid) });
    }

    return next;
  });
}

/** Takes a page back out of a draft copy and deletes the upload. */
export async function removeOwnFile(input: { testId: string; path: string }): Promise<AnswerSheetFile[]> {
  const { user, ref } = await ownCopyForWriting(input.testId);

  const next = await ref.firestore.runTransaction(async (tx) => {
    const copy = toEntity<AnswerSubmissionDoc>(await tx.get(ref));
    if (!copy) throw new AppError(ERROR_CODES.NOT_FOUND);
    assertDraft(copy);

    const files = copy.files.filter((file) => file.path !== input.path);
    if (files.length === copy.files.length) return files;

    tx.update(ref, { files, ...auditOnUpdate(user.uid) });
    return files;
  });

  // Housekeeping after the pointer is gone: a leftover upload is harmless, a
  // pointer to a deleted one is not.
  await storageService
    .removeOwnAnswerSheetPage(input.path)
    .catch((error) => console.error("[answer-writing] page not deleted", input.path, error));

  return next;
}

/** Puts a draft copy's pages in the order given — which must be the same set. */
export async function reorderOwnFiles(input: { testId: string; paths: string[] }): Promise<AnswerSheetFile[]> {
  const { user, ref } = await ownCopyForWriting(input.testId);

  return ref.firestore.runTransaction(async (tx) => {
    const copy = toEntity<AnswerSubmissionDoc>(await tx.get(ref));
    if (!copy) throw new AppError(ERROR_CODES.NOT_FOUND);
    assertDraft(copy);

    const byPath = new Map(copy.files.map((file) => [file.path, file]));
    const files = input.paths.map((path) => byPath.get(path));

    if (
      files.length !== copy.files.length ||
      new Set(input.paths).size !== input.paths.length ||
      files.some((file) => !file)
    ) {
      throw new AppError(ERROR_CODES.CONFLICT, {
        message: "Your pages changed in another window. Reload the page and try again.",
      });
    }

    tx.update(ref, { files, ...auditOnUpdate(user.uid) });
    return files as AnswerSheetFile[];
  });
}

/** Hands a draft copy to the evaluators. */
export async function submitOwn(testId: string): Promise<void> {
  const { user, test, ref } = await ownCopyForWriting(testId);

  await ref.firestore.runTransaction(async (tx) => {
    const copy = toEntity<AnswerSubmissionDoc>(await tx.get(ref));
    assertDraft(copy);

    if (!copy || copy.files.length === 0) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
        message: "Upload your answer sheet before submitting.",
      });
    }

    tx.update(ref, {
      status: "submitted",
      submittedAt: new Date().toISOString(),
      ...auditOnUpdate(user.uid),
    });
  });

  await activityService.record({
    studentUid: user.uid,
    type: "testCompleted",
    testId: test.id,
    courseId: test.courseId,
  });
}

/**
 * Takes a submitted copy back to draft — the "I missed page 7" button. Only
 * before the deadline, and only until an evaluator has started: after that the
 * evaluator is marking the pages as they were.
 */
export async function withdrawOwn(testId: string): Promise<void> {
  const { user, ref } = await ownCopyForWriting(testId);

  await ref.firestore.runTransaction(async (tx) => {
    const copy = toEntity<AnswerSubmissionDoc>(await tx.get(ref));

    if (copy?.status !== "submitted") {
      throw new AppError(ERROR_CODES.CONFLICT, {
        message:
          copy?.status === "draft"
            ? "This copy is not submitted."
            : "An evaluator has started on this copy, so it can no longer be withdrawn.",
      });
    }

    tx.update(ref, { status: "draft", submittedAt: null, ...auditOnUpdate(user.uid) });
  });
}

// ─── Staff: papers and queues ────────────────────────────────────────────────

/** Mains papers, newest first. Served by the `(kind, createdAt)` index. */
export async function listPapersForStaff(limit = 200): Promise<Test[]> {
  await requireRole("FACULTY");

  const snapshot = await collection(COLLECTIONS.tests)
    .where("kind", "==", "mains-descriptive")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return toEntities<TestDoc>(snapshot.docs);
}

export async function getPaperForStaff(testId: string): Promise<Test> {
  await requireRole("FACULTY");
  return asMainsPaper(await testService.getTest(testId));
}

/**
 * Whether any student has a copy of this paper — including one who has only
 * opened the question paper. That is what locks the PDF and the scheme.
 */
export async function hasSubmissions(testId: string): Promise<boolean> {
  await requireRole("FACULTY");

  const snapshot = await submissions().where("testId", "==", testId).limit(1).get();
  return !snapshot.empty;
}

/** One copy as the staff screens list it. */
export interface StaffCopyRow {
  copy: AnswerSubmission;
  studentName: string;
  rollNumber: string | null;
  evaluatorName: string | null;
}

/** Names for a set of copies: students from `students`, evaluators from `users`. */
async function rowsFor(copies: AnswerSubmission[]): Promise<StaffCopyRow[]> {
  const studentUids = [...new Set(copies.map((copy) => copy.studentUid))];
  const staffUids = [
    ...new Set(copies.flatMap((copy) => (copy.evaluatorUid ? [copy.evaluatorUid] : []))),
  ];

  const db = submissions().firestore;
  const [studentSnapshots, staffSnapshots] = await Promise.all([
    studentUids.length
      ? db.getAll(...studentUids.map((uid) => collection(COLLECTIONS.students).doc(docId.user(uid))))
      : [],
    staffUids.length
      ? db.getAll(...staffUids.map((uid) => collection(COLLECTIONS.users).doc(docId.user(uid))))
      : [],
  ]);

  const students = new Map(
    studentSnapshots
      .map((snapshot) => toEntity<Student>(snapshot))
      .filter((student): student is Student => student !== null)
      .map((student) => [student.uid, student]),
  );
  const staff = new Map(
    staffSnapshots
      .map((snapshot) => toEntity<User>(snapshot))
      .filter((user): user is User => user !== null)
      .map((user) => [user.id, user.displayName || user.email || "Staff"]),
  );

  return copies.map((copy) => {
    const student = students.get(copy.studentUid);

    return {
      copy,
      studentName: student?.fullName ?? "Unknown student",
      rollNumber: student?.rollNumber ?? null,
      evaluatorName: copy.evaluatorUid ? (staff.get(copy.evaluatorUid) ?? "Staff") : null,
    };
  });
}

const STATUS_ORDER: Record<AnswerSubmissionStatus, number> = {
  submitted: 0,
  "in-review": 1,
  evaluated: 2,
  draft: 3,
};

/** A copy on its paper's page, with its scorecard once evaluated. */
export interface PaperCopyRow extends StaffCopyRow {
  result: Result | null;
  /** The student can see the evaluation now. */
  released: boolean;
}

/**
 * Every copy of one paper: waiting first, oldest submission first, then
 * evaluated, then drafts. Both queries filter on `testId` alone so the
 * single-field indexes serve them; a paper's copies are few enough to sort here.
 */
export async function listCopiesForStaff(testId: string): Promise<PaperCopyRow[]> {
  await requireRole("FACULTY");

  const [copySnapshot, resultSnapshot] = await Promise.all([
    submissions().where("testId", "==", testId).get(),
    collection(COLLECTIONS.results).where("testId", "==", testId).get(),
  ]);

  const copies = toEntities<AnswerSubmissionDoc>(copySnapshot.docs);
  const resultByCopy = new Map(
    toEntities<ResultDoc>(resultSnapshot.docs).map((result) => [result.attemptId, result]),
  );

  copies.sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      (a.submittedAt ?? "").localeCompare(b.submittedAt ?? ""),
  );

  const now = Date.now();

  return (await rowsFor(copies)).map((row) => {
    const result = resultByCopy.get(row.copy.id) ?? null;
    return { ...row, result, released: isReleased(result, now) };
  });
}

export interface QueueRow extends StaffCopyRow {
  paperTitle: string;
}

/**
 * Copies waiting for an evaluator across every paper, oldest submission first —
 * the faculty work queue. Served by the `(status, submittedAt)` index.
 */
export async function listQueue(limit = 200): Promise<QueueRow[]> {
  await requireRole("FACULTY");

  const snapshot = await submissions()
    .where("status", "in", OPEN_STATUSES)
    .orderBy("submittedAt", "asc")
    .limit(limit)
    .get();

  const copies = toEntities<AnswerSubmissionDoc>(snapshot.docs);
  const testIds = [...new Set(copies.map((copy) => copy.testId))];

  const [rows, testSnapshots] = await Promise.all([
    rowsFor(copies),
    testIds.length
      ? collection(COLLECTIONS.tests).firestore.getAll(
          ...testIds.map((testId) => collection(COLLECTIONS.tests).doc(testId)),
        )
      : Promise.resolve([]),
  ]);

  const titles = new Map(
    testSnapshots.map((snapshot) => [snapshot.id, (snapshot.get("title") as string | undefined) ?? "Paper"]),
  );

  return rows.map((row) => ({ ...row, paperTitle: titles.get(row.copy.testId) ?? "Paper" }));
}

// ─── Staff: evaluation ───────────────────────────────────────────────────────

/** One copy, with every file signed for the evaluator's screen. */
export interface StaffCopy extends StaffCopyRow {
  test: Test;
  files: (AnswerSheetFile & { url: string | null })[];
  checkedCopyUrl: string | null;
  questionPaperUrl: string | null;
  result: Result | null;
  /**
   * When the student will see this copy once completed — its scorecard's date
   * if it has one, else the paper's — or `null` if that is straight away.
   */
  releasesAt: string | null;
}

/** A file that cannot be signed must not take the rest of the copy down with it. */
async function signForStaff(path: string): Promise<string | null> {
  try {
    return await storageService.getSignedUrl(path, STAFF_URL_TTL_MINUTES);
  } catch (error) {
    console.error("[answer-writing] could not sign", path, error);
    return null;
  }
}

/**
 * Signs every page here, once, rather than linking each through a Route
 * Handler: signing is a local HMAC, while each handler call would re-verify the
 * session with Firebase — twenty pages, twenty round trips.
 */
export async function getCopyForStaff(testId: string, studentUid: string): Promise<StaffCopy> {
  await requireRole("FACULTY");

  const test = asMainsPaper(await testService.getTest(testId));
  const ref = submissionRef(test.id, studentUid);
  const [copySnapshot, resultSnapshot] = await Promise.all([ref.get(), resultRef(ref.id).get()]);
  const copy = requireEntity<AnswerSubmissionDoc>(copySnapshot, "answer copy");

  // A draft is the student's work in progress, not something to mark.
  if (copy.status === "draft") {
    throw new AppError(ERROR_CODES.NOT_FOUND, { message: "This copy has not been submitted yet." });
  }

  const [[row], files, checkedCopyUrl, questionPaperUrl] = await Promise.all([
    rowsFor([copy]),
    Promise.all(copy.files.map(async (file) => ({ ...file, url: await signForStaff(file.path) }))),
    copy.evaluation?.checkedCopyPath ? signForStaff(copy.evaluation.checkedCopyPath) : null,
    test.questionPaperPath ? signForStaff(test.questionPaperPath) : null,
  ]);

  const result = toEntity<ResultDoc>(resultSnapshot);
  const visibleAt = result?.publishedAt ?? test.resultsVisibleFrom;

  return {
    ...row,
    test,
    files,
    checkedCopyUrl,
    questionPaperUrl,
    result,
    releasesAt: visibleAt && isAhead(visibleAt) ? visibleAt : null,
  };
}

/**
 * Claims a copy for the caller. A copy already being marked by someone else is
 * refused unless `takeOver` is set — the screen asks first, because two
 * evaluators saving over each other is how a student gets half of each.
 */
export async function startReview(
  testId: string,
  studentUid: string,
  { takeOver = false }: { takeOver?: boolean } = {},
): Promise<void> {
  const actor = await requireRole("FACULTY");
  asMainsPaper(await testService.getTest(testId));

  const ref = submissionRef(testId, studentUid);

  await ref.firestore.runTransaction(async (tx) => {
    const copy = requireEntity<AnswerSubmissionDoc>(await tx.get(ref), "answer copy");
    const nowIso = new Date().toISOString();

    switch (copy.status) {
      case "draft":
        throw new AppError(ERROR_CODES.CONFLICT, { message: "This copy has not been submitted yet." });

      case "submitted":
        tx.update(ref, {
          status: "in-review",
          evaluatorUid: actor.uid,
          reviewStartedAt: nowIso,
          ...auditOnUpdate(actor.uid),
        });
        return;

      case "in-review":
        if (copy.evaluatorUid === actor.uid) return;

        if (!takeOver) {
          throw new AppError(ERROR_CODES.CONFLICT, {
            message: "Another evaluator is marking this copy. Take it over to continue.",
          });
        }

        tx.update(ref, { evaluatorUid: actor.uid, ...auditOnUpdate(actor.uid) });
        return;

      case "evaluated":
        // Corrections to a finished copy are saved directly; nothing to claim.
        return;
    }
  });
}

/**
 * Saves an evaluation, as a draft or as the finished copy.
 *
 * Labels and maximum marks come from the paper's marking scheme, not from the
 * input, so a crafted request cannot award 15 on a 10-mark question or rename
 * one. Completing writes the scorecard in the same transaction as the copy —
 * there is never an evaluated copy without a result, or the reverse.
 *
 * A correction to an already-evaluated copy keeps the result's `publishedAt`
 * and rank: the student does not lose sight of their copy while it is fixed,
 * and "Release and rank" on the paper refreshes the ranks afterwards.
 */
export async function saveEvaluation(
  input: EvaluationInput,
): Promise<{ status: AnswerSubmissionStatus; score: number; released: boolean }> {
  const actor = await requireRole("FACULTY");
  const test = asMainsPaper(await testService.getTest(input.testId));
  const scheme = test.markingScheme ?? [];

  if (input.questions.length !== scheme.length) {
    throw new AppError(ERROR_CODES.CONFLICT, {
      message: "The paper's marking scheme has changed. Reload the page and try again.",
    });
  }

  const questions: QuestionEvaluation[] = scheme.map((slot, index) => {
    const entry = input.questions[index];

    if (entry.attempted && entry.marksAwarded !== null && entry.marksAwarded > slot.maxMarks) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
        message: `${slot.label} carries at most ${slot.maxMarks} marks.`,
      });
    }

    return {
      label: slot.label,
      maxMarks: slot.maxMarks,
      attempted: entry.attempted,
      marksAwarded: entry.attempted ? entry.marksAwarded : null,
      remark: entry.remark,
    };
  });

  if (
    input.checkedCopyPath &&
    !isMediaRefIn(
      input.checkedCopyPath,
      MEDIA_PREFIXES.evaluatedCopy(test.id, input.studentUid),
      ANSWER_SHEET_FORMATS,
    )
  ) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
      message: "That checked copy was not uploaded for this student. Please upload it again.",
    });
  }

  const evaluation: MainsEvaluation = {
    questions,
    rubric: input.rubric,
    strengths: input.strengths,
    improvements: input.improvements,
    remarks: input.remarks,
    checkedCopyPath: input.checkedCopyPath,
    score: scoreOf(questions),
    totalMarks: test.totalMarks,
  };

  if (input.complete) {
    const problem = completionProblem(evaluation);
    if (problem) throw new AppError(ERROR_CODES.VALIDATION_ERROR, { message: problem });
  }

  const copyRef = submissionRef(test.id, input.studentUid);
  const scoreRef = resultRef(copyRef.id);

  const outcome = await copyRef.firestore.runTransaction(async (tx) => {
    const [copySnapshot, resultSnapshot] = await tx.getAll(copyRef, scoreRef);
    const copy = requireEntity<AnswerSubmissionDoc>(copySnapshot, "answer copy");
    const nowIso = new Date().toISOString();

    if (copy.status === "draft") {
      throw new AppError(ERROR_CODES.CONFLICT, { message: "This copy has not been submitted yet." });
    }

    if (copy.status === "in-review" && copy.evaluatorUid && copy.evaluatorUid !== actor.uid) {
      throw new AppError(ERROR_CODES.CONFLICT, {
        message: "Another evaluator is marking this copy. Take it over before saving.",
      });
    }

    const wasEvaluated = copy.status === "evaluated";

    if (wasEvaluated && !input.complete) {
      // A draft save would pull a returned copy back out of the student's sight.
      throw new AppError(ERROR_CODES.CONFLICT, {
        message: "This copy is already evaluated. Save your changes as final instead.",
      });
    }

    const status: AnswerSubmissionStatus = input.complete ? "evaluated" : "in-review";

    tx.update(copyRef, {
      status,
      evaluation,
      evaluatorUid: actor.uid,
      reviewStartedAt: copy.reviewStartedAt ?? nowIso,
      evaluatedAt: input.complete ? (copy.evaluatedAt ?? nowIso) : null,
      ...auditOnUpdate(actor.uid),
    });

    if (!input.complete) return { wasEvaluated, publishedAt: null };

    const existing = toEntity<ResultDoc>(resultSnapshot);
    const publishedAt = existing?.publishedAt ?? toUtcIsoOrNull(test.resultsVisibleFrom) ?? nowIso;
    const unattempted = questions.filter((question) => !question.attempted).length;

    const result: ResultDoc = {
      attemptId: copy.id,
      testId: test.id,
      studentUid: copy.studentUid,
      score: evaluation.score,
      totalMarks: test.totalMarks,
      // Right and wrong are MCQ ideas. Leaving them zero keeps accuracy `null`
      // on the Performance board rather than inventing a number.
      correctCount: 0,
      wrongCount: 0,
      unattemptedCount: unattempted,
      negativeMarks: 0,
      rank: existing?.rank ?? null,
      percentile: existing?.percentile ?? null,
      subjectBreakdown: [
        {
          subject: test.subject ?? "Mains",
          score: evaluation.score,
          totalMarks: test.totalMarks,
          correctCount: 0,
          wrongCount: 0,
        },
      ],
      publishedAt,
    };

    if (existing) {
      tx.set(scoreRef, { ...result, ...auditOnUpdate(actor.uid) }, { merge: true });
    } else {
      tx.set(scoreRef, { ...result, ...auditOnCreate(actor.uid) });
    }

    return { wasEvaluated, publishedAt };
  });

  const released = outcome.publishedAt !== null && hasPassed(outcome.publishedAt);

  // First completion of a copy the student can already see. A held copy is
  // announced by `releaseEvaluations` instead; a correction is not announced.
  if (input.complete && released && !outcome.wasEvaluated) {
    await notificationService
      .notify(
        {
          userUid: input.studentUid,
          kind: "result-published",
          title: "Your answer copy is evaluated",
          body: `${test.title}: ${evaluation.score} / ${test.totalMarks}. Open it for the checked copy and feedback.`,
          href: `/dashboard/mains/${test.id}`,
        },
        actor.uid,
      )
      .catch((error) => console.error("[answer-writing] notification dropped", error));
  }

  return { status: input.complete ? "evaluated" : "in-review", score: evaluation.score, released };
}

/**
 * Releases every evaluated copy of a paper now, ranks them, and tells each
 * student whose copy this release makes visible.
 *
 * Ranking and the release itself are `testService.releaseResults` — the same
 * code that releases an MCQ paper, since a Mains result is an ordinary
 * `results` document. Safe to run again: later copies are ranked in.
 */
export async function releaseEvaluations(
  testId: string,
): Promise<{ released: number; ranked: number }> {
  const actor = await requireRole("FACULTY");
  const test = asMainsPaper(await testService.getTest(testId));

  const snapshot = await collection(COLLECTIONS.results).where("testId", "==", test.id).get();
  const now = Date.now();
  const newlyVisible = toEntities<ResultDoc>(snapshot.docs)
    .filter((result) => !isReleased(result, now))
    .map((result) => result.studentUid);

  const outcome = await testService.releaseResults(test.id);

  if (newlyVisible.length > 0) {
    await notificationService
      .notifyUsers(
        newlyVisible,
        {
          kind: "result-published",
          title: "Your answer copy is evaluated",
          body: `${test.title}: your marks, checked copy and feedback are out.`,
          href: `/dashboard/mains/${test.id}`,
        },
        actor.uid,
      )
      .catch((error) => console.error("[answer-writing] notifications dropped", error));
  }

  return outcome;
}

export const answerWritingService = {
  listOwnPapers,
  getOwnWorkspace,
  openQuestionPaper,
  getOwnFileUrl,
  addOwnFile,
  removeOwnFile,
  reorderOwnFiles,
  submitOwn,
  withdrawOwn,
  listPapersForStaff,
  getPaperForStaff,
  hasSubmissions,
  listCopiesForStaff,
  listQueue,
  getCopyForStaff,
  startReview,
  saveEvaluation,
  releaseEvaluations,
};
