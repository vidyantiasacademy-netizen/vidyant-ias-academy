import "server-only";

import { randomBytes } from "node:crypto";

import { isAtLeast } from "@/lib/auth/roles";
import { requireAuth, requireRole, requireSelfOrRole } from "@/lib/auth/server";
import { AppError, ERROR_CODES } from "@/lib/errors";
import {
  EXPIRY_GRACE_SECONDS,
  MAX_PROCTOR_EVENTS_PER_ATTEMPT,
  STALE_ATTEMPT_SECONDS,
  VIOLATION_WEIGHTS,
  resolveExamSecurity,
} from "@/lib/exam/policy";
import { scoreMcqPaper } from "@/lib/exam/scoring";
import { optionSeed, seededShuffle } from "@/lib/exam/shuffle";
import type { ScoredPaper } from "@/lib/exam/analytics";
import type { ExamPayload, ExamQuestion } from "@/lib/exam/types";
import { COLLECTIONS, docId } from "@/lib/firebase/collections";
import {
  FieldValue,
  Timestamp,
  auditOnCreate,
  auditOnUpdate,
  collection,
  requireEntity,
  toEntities,
  toEntity,
} from "@/lib/firebase/firestore";
import type {
  Answer,
  AnswerDoc,
  AttemptStateForStudent,
  ExamSecurityPolicy,
  ProctorEvent,
  ProctorEventDoc,
  ProctorEventType,
  Question,
  QuestionDoc,
  QuestionForAttempt,
  Result,
  ResultDoc,
  Student,
  TerminationReason,
  Test,
  TestAttempt,
  TestAttemptDoc,
  TestDoc,
} from "@/types/db";

import { activityService } from "../activity/activity.service";
import { enrollmentService } from "../enrollments/enrollment.service";
import { storageService } from "../storage/storage.service";

/**
 * Tests, attempts, invigilation and results.
 *
 * The rule that shapes this entire file: a student's own score must never be
 * computable or writable by the student. So the question bank's answer key never
 * leaves the server during an attempt, submission is what triggers scoring, and
 * the `results` document is written here — students have no write access to
 * `results`, `answers.marksAwarded` or `testAttempts` at all.
 *
 * The second rule, added with the MCQ exam runner: nothing the browser says
 * about *time* or *who is writing* is believed. The deadline is computed from
 * the server clock, the countdown a student sees is a copy of a number this file
 * returns, and every write during a sitting carries the attempt's session token
 * so a second window can be refused rather than silently accepted.
 *
 * What this layer can and cannot do is worth being honest about. It can make
 * cheating leave a record, make the cheap channels useless (a shuffled paper, a
 * redacted key, one live window) and end a sitting that misbehaves. It cannot
 * see the room. Browser-side invigilation is a deterrent and an evidence trail,
 * not proof of an honest sitting — a high-stakes paper still needs a centre.
 */

export async function getTest(testId: string): Promise<Test> {
  const user = await requireAuth();
  const test = requireEntity<Test>(
    await collection(COLLECTIONS.tests).doc(testId).get(),
    "test",
  );

  if (isAtLeast(user.role, "FACULTY")) return test;

  if (test.status !== "published") throw new AppError(ERROR_CODES.NOT_FOUND);

  if (!(await enrollmentService.hasAccess(user.uid, test.courseId))) {
    throw new AppError(ERROR_CODES.FORBIDDEN, {
      message: "This test belongs to a course you are not enrolled in.",
    });
  }

  return test;
}

export async function listForCourse(courseId: string): Promise<Test[]> {
  const user = await requireAuth();

  if (
    !isAtLeast(user.role, "FACULTY") &&
    !(await enrollmentService.hasAccess(user.uid, courseId))
  ) {
    throw new AppError(ERROR_CODES.FORBIDDEN);
  }

  let query = collection(COLLECTIONS.tests).where("courseId", "==", courseId);
  if (!isAtLeast(user.role, "FACULTY")) {
    query = query.where("status", "==", "published");
  }

  const snapshot = await query.orderBy("opensAt", "desc").get();
  return toEntities<TestDoc>(snapshot.docs) as Test[];
}

// ─── Authoring ───────────────────────────────────────────────────────────────

/**
 * Creates a paper. Faculty and above, mirroring `courseService.create`.
 *
 * A paper is created `draft` by whoever is authoring it; publishing is a
 * separate `updateTest` call, because `status: "published"` is what makes it
 * attemptable and that should be a deliberate second action rather than a field
 * someone fills in while still writing questions.
 */
export async function createTest(input: TestDoc): Promise<Test> {
  const actor = await requireRole("FACULTY");

  const ref = collection(COLLECTIONS.tests).doc();
  await ref.set({ ...input, ...auditOnCreate(actor.uid) });

  return requireEntity<Test>(await ref.get(), "test");
}

/**
 * Edits a paper.
 *
 * Nothing here stops a change to a *live* paper, and that is a real hazard:
 * editing `durationMinutes` while students are sitting does not move an existing
 * `expiresAt` (computed at start), and raising `totalMarks` after submissions
 * exist leaves already-written scorecards measured against the old figure. The
 * authoring UI should refuse those edits once an attempt exists; until it does,
 * this is the warning.
 */
export async function updateTest(
  testId: string,
  patch: Partial<TestDoc>,
): Promise<void> {
  const actor = await requireRole("FACULTY");

  await collection(COLLECTIONS.tests)
    .doc(testId)
    .update({ ...patch, ...auditOnUpdate(actor.uid) });
}

/** Adds a question to the bank, optionally attached to one or more papers. */
export async function createQuestion(input: QuestionDoc): Promise<Question> {
  const actor = await requireRole("FACULTY");

  const ref = collection(COLLECTIONS.questions).doc();
  await ref.set({ ...input, ...auditOnCreate(actor.uid) });

  return requireEntity<Question>(await ref.get(), "question");
}

/**
 * Adds many questions in one batch: all of them land, or none do.
 *
 * `createdAt` is stamped a millisecond apart in input order rather than with
 * one server timestamp, because `listQuestionsForStaff` orders a paper by it —
 * a shared timestamp would fall through to the random document id and shuffle
 * the file's question 1 into the middle of the paper.
 */
export async function createQuestions(inputs: QuestionDoc[]): Promise<string[]> {
  const actor = await requireRole("FACULTY");

  // A Firestore batch takes at most 500 writes.
  if (inputs.length > 500) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
      message: "Import at most 500 questions at a time.",
    });
  }

  const questions = collection(COLLECTIONS.questions);
  const batch = questions.firestore.batch();
  const start = Date.now();

  const ids = inputs.map((input, index) => {
    const ref = questions.doc();
    batch.set(ref, {
      ...input,
      ...auditOnCreate(actor.uid),
      createdAt: Timestamp.fromMillis(start + index),
    });
    return ref.id;
  });

  await batch.commit();
  return ids;
}

export async function updateQuestion(
  questionId: string,
  patch: Partial<QuestionDoc>,
): Promise<void> {
  const actor = await requireRole("FACULTY");

  await collection(COLLECTIONS.questions)
    .doc(questionId)
    .update({ ...patch, ...auditOnUpdate(actor.uid) });
}

/** Sets the status of several questions in one batch. */
export async function setQuestionsStatus(
  questionIds: string[],
  status: QuestionDoc["status"],
): Promise<void> {
  const actor = await requireRole("FACULTY");

  const questions = collection(COLLECTIONS.questions);

  // A Firestore batch takes at most 500 writes.
  for (let start = 0; start < questionIds.length; start += 500) {
    const batch = questions.firestore.batch();

    for (const questionId of questionIds.slice(start, start + 500)) {
      batch.update(questions.doc(questionId), { status, ...auditOnUpdate(actor.uid) });
    }

    await batch.commit();
  }
}

/**
 * Attaches or detaches a question from a paper.
 *
 * `testIds` is an array on the question rather than a list on the test, so one
 * bank serves many papers and a PYQ can sit in a sectional and a full-length
 * paper at once without being duplicated.
 */
export async function setQuestionPapers(
  questionId: string,
  testIds: string[],
): Promise<void> {
  const actor = await requireRole("FACULTY");

  await collection(COLLECTIONS.questions)
    .doc(questionId)
    .update({ testIds, ...auditOnUpdate(actor.uid) });
}

/** The paper with its key, for the faculty member authoring or reviewing it. */
export async function listQuestionsForStaff(testId: string): Promise<Question[]> {
  await requireRole("FACULTY");

  const snapshot = await collection(COLLECTIONS.questions)
    .where("testIds", "array-contains", testId)
    .get();

  // In the order they were written, so "Question 3" on the authoring screen is
  // the third one the faculty member added. Students never see this order —
  // `paperFor` sorts and shuffles on its own.
  return (toEntities<QuestionDoc>(snapshot.docs) as Question[]).sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
  );
}

/** One question with its key, for the faculty member editing it. */
export async function getQuestionForStaff(questionId: string): Promise<Question> {
  await requireRole("FACULTY");

  return requireEntity<Question>(
    await collection(COLLECTIONS.questions).doc(questionId).get(),
    "question",
  );
}

/**
 * Every paper across every course, newest first, for the authoring index.
 *
 * Ordered on `createdAt` alone so the automatic single-field index serves it —
 * `listForCourse` without a status filter would need a composite index that
 * does not exist.
 */
export async function listForStaff(limit = 200): Promise<Test[]> {
  await requireRole("FACULTY");

  const snapshot = await collection(COLLECTIONS.tests)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return toEntities<TestDoc>(snapshot.docs) as Test[];
}

/**
 * Whether anyone has started this paper.
 *
 * The authoring UI locks a paper's questions, marks and timing once this is
 * true: a scorecard already written was measured against the paper as it was,
 * and editing it underneath would make those scores mean something else.
 */
export async function hasAttempts(testId: string): Promise<boolean> {
  await requireRole("FACULTY");

  // A public mock is sat by website visitors too, in their own collection, and
  // their scorecards depend on the paper just as much as a student's.
  const [students, visitors] = await Promise.all(
    [COLLECTIONS.testAttempts, COLLECTIONS.mockAttempts].map((name) =>
      collection(name).where("testId", "==", testId).limit(1).get(),
    ),
  );

  return !students.empty || !visitors.empty;
}

/** 32 hex characters. Matches `sessionToken` in `lib/validation/entities.ts`. */
function newToken(): string {
  return randomBytes(16).toString("hex");
}

/**
 * Starts an attempt, or hands the one already in progress to this window.
 *
 * `expiresAt` is computed here from the server clock rather than accepted from
 * the client, which is what stops a student from granting themselves an extra
 * hour by posting a later deadline. It is set once, at the first start: resuming
 * never extends it, so closing the laptop costs the time it costs.
 *
 * Every call issues a fresh session token, which evicts whichever window held
 * the previous one. That is the single-window rule, and it is deliberate that
 * the *newest* window wins: a student whose browser crashed must be able to get
 * back in, and the window they abandoned must stop being able to write.
 */
export async function createAttempt(testId: string): Promise<TestAttempt> {
  const user = await requireAuth();
  const test = await getTest(testId);

  const now = new Date();
  const nowIso = now.toISOString();

  if (test.status !== "published") {
    throw new AppError(ERROR_CODES.FORBIDDEN, {
      message: "This paper is not open for attempts.",
    });
  }

  if (test.opensAt && nowIso < test.opensAt) {
    throw new AppError(ERROR_CODES.FORBIDDEN, {
      message: "This test has not opened yet.",
    });
  }

  if (test.closesAt && nowIso > test.closesAt) {
    throw new AppError(ERROR_CODES.FORBIDDEN, {
      message: "This test has closed.",
    });
  }

  const existing = await collection(COLLECTIONS.testAttempts)
    .where("testId", "==", testId)
    .where("studentUid", "==", user.uid)
    .where("status", "==", "in-progress")
    .limit(1)
    .get();

  if (!existing.empty) {
    const attempt = toEntity<TestAttempt>(existing.docs[0])!;

    // A still-warm previous session means another window was live seconds ago.
    // It is recorded — it is also what an accidental refresh looks like, so the
    // weight is low and the paper is not ended for it.
    const previousWasLive =
      Date.now() - new Date(attempt.lastSeenAt ?? attempt.startedAt).getTime() <
      STALE_ATTEMPT_SECONDS * 1000;

    const sessionToken = newToken();

    await collection(COLLECTIONS.testAttempts).doc(attempt.id).update({
      sessionToken,
      lastSeenAt: nowIso,
      ...auditOnUpdate(user.uid),
    });

    if (previousWasLive) {
      await logProctorEvent(attempt, "sessionTakeover", { detail: "resume" });
    }

    return { ...attempt, sessionToken, lastSeenAt: nowIso };
  }

  const submitted = await collection(COLLECTIONS.testAttempts)
    .where("testId", "==", testId)
    .where("studentUid", "==", user.uid)
    .where("status", "in", ["submitted", "evaluated", "abandoned"])
    .limit(1)
    .get();

  if (!submitted.empty) {
    throw new AppError(ERROR_CODES.CONFLICT, {
      message: "You have already sat this test.",
    });
  }

  const doc: TestAttemptDoc = {
    testId,
    studentUid: user.uid,
    startedAt: nowIso,
    submittedAt: null,
    expiresAt: new Date(now.getTime() + test.durationMinutes * 60_000).toISOString(),
    status: "in-progress",
    answeredCount: 0,
    sessionToken: newToken(),
    shuffleSeed: randomBytes(8).toString("hex"),
    lastSeenAt: nowIso,
    focusLossCount: 0,
    fullscreenExitCount: 0,
    blockedActionCount: 0,
    violationScore: 0,
    proctorEventCount: 0,
    autoSubmitted: false,
    terminationReason: null,
  };

  const ref = collection(COLLECTIONS.testAttempts).doc();
  await ref.set({ ...doc, ...auditOnCreate(user.uid) });

  await activityService.record({
    studentUid: user.uid,
    type: "testStarted",
    testId,
    courseId: test.courseId,
  });

  return requireEntity<TestAttempt>(await ref.get(), "attempt");
}

/**
 * The questions for a live attempt — redacted and permuted.
 *
 * `correctOptionIds`, `modelAnswer` and `explanation` are dropped here rather
 * than hidden in the UI. A student who opens the network tab sees exactly this
 * projection and nothing more.
 *
 * The order comes from the attempt's own seed, so "Q7 is option C" shouted
 * across a room is worthless, and the order is identical on every reload of the
 * same sitting.
 */
export async function getQuestionsForAttempt(
  attemptId: string,
): Promise<QuestionForAttempt[]> {
  const attempt = await requireOwnAttempt(attemptId);
  const test = requireEntity<Test>(
    await collection(COLLECTIONS.tests).doc(attempt.testId).get(),
    "test",
  );

  return paperFor(attempt, resolveExamSecurity(test));
}

async function paperFor(
  attempt: TestAttempt,
  policy: ExamSecurityPolicy,
  /** TTL for question-image URLs. Omitted when the caller wants no signing. */
  signTtlMinutes?: number,
): Promise<ExamQuestion[]> {
  const snapshot = await collection(COLLECTIONS.questions)
    .where("testIds", "array-contains", attempt.testId)
    .where("status", "==", "published")
    .get();

  const questions = (toEntities<QuestionDoc>(snapshot.docs) as Question[])
    // Firestore does not promise a stable order across reads, and a
    // deterministic shuffle of an unstable list is still unstable. Sorting by id
    // first is what makes the permutation reproducible.
    .sort((a, b) => a.id.localeCompare(b.id));

  const ordered = policy.shuffleQuestions
    ? seededShuffle(questions, attempt.shuffleSeed)
    : questions;

  return Promise.all(
    ordered.map(async (question) => ({
      id: question.id,
      kind: question.kind,
      subject: question.subject,
      statement: question.statement,
      imagePath: question.imagePath,
      // Signed to outlast the paper: the default ten-minute TTL would blank a
      // passage image halfway through a two-hour sitting.
      imageUrl:
        question.imagePath && signTtlMinutes
          ? await signQuietly(question.imagePath, signTtlMinutes)
          : null,
      options: policy.shuffleOptions
        ? seededShuffle(question.options, optionSeed(attempt.shuffleSeed, question.id))
        : question.options,
      marks: question.marks,
    })),
  );
}

/** A diagram that cannot be signed must not take the whole paper down with it. */
async function signQuietly(path: string, ttlMinutes: number): Promise<string | null> {
  try {
    return await storageService.getSignedUrl(path, ttlMinutes);
  } catch (error) {
    console.error("[exam] question image could not be signed", path, error);
    return null;
  }
}

/**
 * Start or resume a sitting and return the whole paper in one call.
 *
 * One entry point for the exam route rather than four, so that the order of the
 * checks — enrolled, published, in window, not already sat, not expired — cannot
 * be rearranged by a caller. The return shape is `ExamPayload`, which is the
 * complete list of what a sitting's window is allowed to know.
 */
export async function openExam(testId: string): Promise<ExamPayload> {
  const test = await getTest(testId);
  const policy = resolveExamSecurity(test);

  if (test.kind === "mains-descriptive") {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
      message: "Descriptive papers are written offline and uploaded, not sat here.",
    });
  }

  let attempt = await createAttempt(testId);

  // Expired while nobody was watching — a closed laptop, a dead battery. Finalise
  // it now so the student sees a scorecard instead of a dead timer, and so the
  // sitting cannot be reopened for the questions.
  if (remainingSecondsOf(attempt) <= 0) {
    attempt = await autoSubmit(attempt, "expired");

    return {
      attemptId: attempt.id,
      sessionToken: attempt.sessionToken,
      status: attempt.status,
      remainingSeconds: 0,
      questions: [],
      answers: [],
      policy,
      focusLossesLeft: 0,
      finished: true,
      terminationReason: attempt.terminationReason ?? "expired",
    };
  }

  const [questions, answerSnapshot] = await Promise.all([
    paperFor(attempt, policy, test.durationMinutes + 15),
    collection(COLLECTIONS.answers).where("attemptId", "==", attempt.id).get(),
  ]);

  const answers = (toEntities<AnswerDoc>(answerSnapshot.docs) as Answer[]).map(
    (answer) => ({
      questionId: answer.questionId,
      selectedOptionIds: answer.selectedOptionIds,
    }),
  );

  return {
    attemptId: attempt.id,
    sessionToken: attempt.sessionToken,
    status: attempt.status,
    remainingSeconds: remainingSecondsOf(attempt),
    questions,
    answers,
    policy,
    focusLossesLeft: Math.max(
      0,
      policy.maxFocusLosses - (attempt.focusLossCount ?? 0),
    ),
    finished: false,
    terminationReason: null,
  };
}

function remainingSecondsOf(attempt: Pick<TestAttempt, "expiresAt">): number {
  return Math.max(
    0,
    Math.floor((new Date(attempt.expiresAt).getTime() - Date.now()) / 1000),
  );
}

/** Saves one answer. Idempotent: the document id is attempt + question. */
export async function saveAnswer(input: {
  attemptId: string;
  sessionToken: string;
  questionId: string;
  selectedOptionIds?: string[];
  text?: string | null;
  answerSheetPath?: string | null;
  timeSpentSeconds?: number;
}): Promise<void> {
  const attempt = await requireOwnAttempt(input.attemptId, input.sessionToken);

  if (hasExpired(attempt)) {
    await autoSubmit(attempt, "expired");

    throw new AppError(ERROR_CODES.CONFLICT, {
      message: "Your time for this test is over.",
    });
  }

  // The question must belong to this paper, and the chosen options must exist on
  // it. Without this, a crafted call stores answers for questions from another
  // test — harmless to the score, but it corrupts the evidence of what was
  // actually attempted, which is the one thing a disputed paper is settled on.
  const question = toEntity<Question>(
    await collection(COLLECTIONS.questions).doc(input.questionId).get(),
  );

  if (
    !question ||
    question.status !== "published" ||
    !question.testIds.includes(attempt.testId)
  ) {
    throw new AppError(ERROR_CODES.NOT_FOUND, { message: "Unknown question." });
  }

  const selected = input.selectedOptionIds ?? [];
  const optionIds = new Set(question.options.map((option) => option.id));

  if (!selected.every((id) => optionIds.has(id))) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
      message: "That option is not on this question.",
    });
  }

  if (question.kind === "mcq-single" && selected.length > 1) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
      message: "This question takes one answer.",
    });
  }

  const ref = collection(COLLECTIONS.answers).doc(
    docId.answer(input.attemptId, input.questionId),
  );

  const existing = await ref.get();
  const wasAnswered =
    existing.exists &&
    ((existing.data()?.selectedOptionIds as string[] | undefined)?.length ?? 0) > 0;
  const isAnswered = selected.length > 0 || Boolean(input.text?.trim());

  const doc: AnswerDoc = {
    attemptId: input.attemptId,
    testId: attempt.testId,
    questionId: input.questionId,
    studentUid: attempt.studentUid,
    selectedOptionIds: selected,
    text: input.text ?? null,
    answerSheetPath: input.answerSheetPath ?? null,
    timeSpentSeconds: input.timeSpentSeconds ?? 0,
    isCorrect: null,
    marksAwarded: null,
    evaluatorNote: null,
    evaluatedBy: null,
  };

  await ref.set({ ...doc, ...auditOnCreate(attempt.studentUid) }, { merge: true });

  // Clearing an answer has to decrement, or the progress count only ever climbs
  // and a student who unticks everything is told they answered all 100.
  const delta = Number(isAnswered) - Number(wasAnswered);

  if (delta !== 0) {
    await collection(COLLECTIONS.testAttempts)
      .doc(input.attemptId)
      .update({
        answeredCount: FieldValue.increment(delta),
        lastSeenAt: new Date().toISOString(),
      });
  }
}

/**
 * Keeps a sitting alive and returns the authoritative clock.
 *
 * This is the only timer. The countdown in the browser is a copy, resynced from
 * here on every beat, so a student who freezes their own clock or edits the
 * number in the DOM changes nothing: the deadline is `expiresAt` and the writes
 * are refused past it.
 *
 * It is also how an abandoned window is noticed. Stop beating and the sweeper
 * finalises the paper; keep beating from two windows and the one without the
 * current token is refused.
 */
export async function heartbeat(input: {
  attemptId: string;
  sessionToken: string;
}): Promise<AttemptStateForStudent> {
  const user = await requireAuth();
  const attempt = requireEntity<TestAttempt>(
    await collection(COLLECTIONS.testAttempts).doc(input.attemptId).get(),
    "attempt",
  );

  if (attempt.studentUid !== user.uid) throw new AppError(ERROR_CODES.FORBIDDEN);

  const test = requireEntity<Test>(
    await collection(COLLECTIONS.tests).doc(attempt.testId).get(),
    "test",
  );
  const policy = resolveExamSecurity(test);

  if (attempt.status !== "in-progress") return stateOf(attempt, policy);

  if (attempt.sessionToken !== input.sessionToken) {
    throw new AppError(ERROR_CODES.CONFLICT, {
      message:
        "This paper was opened in another window. Continue there — this window is no longer part of the sitting.",
    });
  }

  if (hasExpired(attempt)) {
    const finished = await autoSubmit(attempt, "expired");
    return stateOf(finished, policy);
  }

  await collection(COLLECTIONS.testAttempts)
    .doc(attempt.id)
    .update({ lastSeenAt: new Date().toISOString() });

  return stateOf(attempt, policy);
}

function stateOf(
  attempt: TestAttempt,
  policy: ExamSecurityPolicy,
): AttemptStateForStudent {
  return {
    attemptId: attempt.id,
    status: attempt.status,
    remainingSeconds:
      attempt.status === "in-progress" ? remainingSecondsOf(attempt) : 0,
    focusLossCount: attempt.focusLossCount ?? 0,
    violationScore: attempt.violationScore ?? 0,
    focusLossesLeft: Math.max(
      0,
      policy.maxFocusLosses - (attempt.focusLossCount ?? 0),
    ),
    terminationReason: attempt.terminationReason ?? null,
  };
}

/**
 * Records one invigilation event and applies its cost.
 *
 * The counters live on the attempt and the rows live in `proctorEvents`: the
 * first is what the next write reads to decide whether the budget is spent, the
 * second is the evidence a disputed paper is settled on. Both are written here,
 * in a transaction, so a paper cannot end up submitted-for-violations with no
 * record of which ones.
 *
 * The response deliberately does not say *which* rule tripped. A student who
 * learns that their last trick was the one detected has learned which of the
 * others were not.
 */
export async function recordProctorEvent(input: {
  attemptId: string;
  sessionToken: string;
  type: ProctorEventType;
  detail?: string | null;
  clientTime?: string | null;
  userAgent?: string | null;
}): Promise<AttemptStateForStudent> {
  const user = await requireAuth();
  const attemptRef = collection(COLLECTIONS.testAttempts).doc(input.attemptId);
  const attempt = requireEntity<TestAttempt>(await attemptRef.get(), "attempt");

  if (attempt.studentUid !== user.uid) throw new AppError(ERROR_CODES.FORBIDDEN);

  const test = requireEntity<Test>(
    await collection(COLLECTIONS.tests).doc(attempt.testId).get(),
    "test",
  );
  const policy = resolveExamSecurity(test);

  if (attempt.status !== "in-progress") return stateOf(attempt, policy);

  // A stale window's events are not the live sitting's events. They are still
  // worth a row — two windows reporting at once is itself the finding.
  const fromCurrentWindow = attempt.sessionToken === input.sessionToken;

  const weight = fromCurrentWindow ? VIOLATION_WEIGHTS[input.type] : 0;

  const counterField =
    input.type === "focusLoss"
      ? "focusLossCount"
      : input.type === "fullscreenExit"
        ? "fullscreenExitCount"
        : input.type.startsWith("blocked")
          ? "blockedActionCount"
          : null;

  const db = attemptRef.firestore;
  const eventRef = collection(COLLECTIONS.proctorEvents).doc();

  const event: ProctorEventDoc = {
    attemptId: attempt.id,
    testId: attempt.testId,
    studentUid: attempt.studentUid,
    type: input.type,
    weight,
    detail: input.detail ?? null,
    clientTime: input.clientTime ?? null,
    userAgent: input.userAgent?.slice(0, 300) ?? null,
  };

  const updated = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(attemptRef);
    const current = requireEntity<TestAttempt>(snapshot, "attempt");

    if (current.status !== "in-progress") return current;

    // The log is capped so a scripted flood cannot run up a Firestore bill. The
    // counters are not: the budget must keep shrinking even once we stop writing
    // rows, or the cap becomes the way to cheat for free.
    const loggedSoFar = current.proctorEventCount ?? 0;
    const log = loggedSoFar < MAX_PROCTOR_EVENTS_PER_ATTEMPT;

    if (log) transaction.set(eventRef, { ...event, ...auditOnCreate("system") });

    const patch: Record<string, unknown> = {
      lastSeenAt: new Date().toISOString(),
      violationScore: FieldValue.increment(weight),
      ...(log ? { proctorEventCount: FieldValue.increment(1) } : {}),
    };

    if (counterField && fromCurrentWindow) {
      patch[counterField] = FieldValue.increment(1);
    }

    transaction.update(attemptRef, patch);

    const nextScore = (current.violationScore ?? 0) + weight;
    const nextFocusLosses =
      (current.focusLossCount ?? 0) +
      (counterField === "focusLossCount" && fromCurrentWindow ? 1 : 0);

    return {
      ...current,
      violationScore: nextScore,
      proctorEventCount: loggedSoFar + Number(log),
      focusLossCount: nextFocusLosses,
      ...(counterField === "fullscreenExitCount" && fromCurrentWindow
        ? { fullscreenExitCount: (current.fullscreenExitCount ?? 0) + 1 }
        : {}),
      ...(counterField === "blockedActionCount" && fromCurrentWindow
        ? { blockedActionCount: (current.blockedActionCount ?? 0) + 1 }
        : {}),
    } satisfies TestAttempt;
  });

  if (updated.status !== "in-progress") return stateOf(updated, policy);

  const budgetSpent =
    (policy.maxFocusLosses >= 0 && updated.focusLossCount > policy.maxFocusLosses) ||
    updated.violationScore >= policy.maxViolationScore;

  if (policy.autoSubmitOnViolation && budgetSpent) {
    const finished = await autoSubmit(updated, "violations");
    return stateOf(finished, policy);
  }

  return stateOf(updated, policy);
}

/** Appends one row without touching the budget. For server-observed events. */
async function logProctorEvent(
  attempt: TestAttempt,
  type: ProctorEventType,
  options: { detail?: string | null } = {},
): Promise<void> {
  const event: ProctorEventDoc = {
    attemptId: attempt.id,
    testId: attempt.testId,
    studentUid: attempt.studentUid,
    type,
    weight: 0,
    detail: options.detail ?? null,
    clientTime: null,
    userAgent: null,
  };

  await collection(COLLECTIONS.proctorEvents)
    .doc()
    .set({ ...event, ...auditOnCreate("system") });
}

function hasExpired(attempt: Pick<TestAttempt, "expiresAt">): boolean {
  return (
    Date.now() > new Date(attempt.expiresAt).getTime() + EXPIRY_GRACE_SECONDS * 1000
  );
}

/**
 * Submits and scores an attempt on the student's instruction.
 *
 * MCQ papers are scored immediately and the result is written here (its
 * visibility still gated by `test.resultsVisibleFrom`). Descriptive papers stay
 * `submitted` until faculty evaluate them — there is nothing to compute.
 */
export async function submitAttempt(input: {
  attemptId: string;
  sessionToken: string;
}): Promise<Result | null> {
  const attempt = await requireOwnAttempt(input.attemptId, input.sessionToken);
  const test = requireEntity<Test>(
    await collection(COLLECTIONS.tests).doc(attempt.testId).get(),
    "test",
  );

  return finalise(attempt, test, { reason: null });
}

/** The server ending a sitting the student did not end. */
async function autoSubmit(
  attempt: TestAttempt,
  reason: TerminationReason,
): Promise<TestAttempt> {
  const test = requireEntity<Test>(
    await collection(COLLECTIONS.tests).doc(attempt.testId).get(),
    "test",
  );

  await logProctorEvent(attempt, "autoSubmit", { detail: reason });
  await finalise(attempt, test, { reason });

  return requireEntity<TestAttempt>(
    await collection(COLLECTIONS.testAttempts).doc(attempt.id).get(),
    "attempt",
  );
}

/**
 * Scores an attempt and closes it.
 *
 * Runs as one batch so a student cannot end up with a submitted attempt and no
 * result, or a result with half the answers marked. Re-entrant by the status
 * check in its callers: a heartbeat and a submit racing at the deadline must not
 * write two results, and `results/{attemptId}` being a deterministic id means
 * the second write would overwrite rather than duplicate even if they did.
 */
async function finalise(
  attempt: TestAttempt,
  test: Test,
  { reason }: { reason: TerminationReason | null },
): Promise<Result | null> {
  const [answerSnapshot, questionSnapshot] = await Promise.all([
    collection(COLLECTIONS.answers).where("attemptId", "==", attempt.id).get(),
    collection(COLLECTIONS.questions)
      .where("testIds", "array-contains", attempt.testId)
      .get(),
  ]);

  const answers = toEntities<AnswerDoc>(answerSnapshot.docs) as Answer[];
  const questions = toEntities<QuestionDoc>(questionSnapshot.docs) as Question[];

  const batch = collection(COLLECTIONS.answers).firestore.batch();
  const nowIso = new Date().toISOString();
  const actor = reason ? "system" : attempt.studentUid;

  const closing = {
    submittedAt: nowIso,
    autoSubmitted: reason !== null,
    terminationReason: reason,
    ...auditOnUpdate(actor),
  };

  if (test.kind === "mains-descriptive") {
    batch.update(collection(COLLECTIONS.testAttempts).doc(attempt.id), {
      status: "submitted",
      ...closing,
    });

    await batch.commit();
    await recordCompletion(attempt, test.courseId);
    return null;
  }

  const scored = scoreMcqPaper(questions, answers, test.negativeMarksPerQuestion);

  for (const answer of answers) {
    const mark = scored.marks.get(answer.questionId);
    if (!mark) continue;

    batch.update(collection(COLLECTIONS.answers).doc(answer.id), {
      isCorrect: mark.attempted ? mark.isCorrect : null,
      marksAwarded: mark.marksAwarded,
      evaluatedBy: "system",
      ...auditOnUpdate("system"),
    });
  }

  const result: ResultDoc = {
    attemptId: attempt.id,
    testId: attempt.testId,
    studentUid: attempt.studentUid,
    score: scored.score,
    totalMarks: test.totalMarks,
    correctCount: scored.correctCount,
    wrongCount: scored.wrongCount,
    unattemptedCount: scored.unattemptedCount,
    negativeMarks: scored.negativeMarks,
    rank: null,
    percentile: null,
    subjectBreakdown: scored.subjectBreakdown,
    publishedAt: test.resultsVisibleFrom ?? nowIso,
  };

  const resultRef = collection(COLLECTIONS.results).doc(docId.result(attempt.id));
  batch.set(resultRef, { ...result, ...auditOnCreate("system") });

  batch.update(collection(COLLECTIONS.testAttempts).doc(attempt.id), {
    status: "evaluated",
    ...closing,
  });

  await batch.commit();
  await recordCompletion(attempt, test.courseId);

  return requireEntity<Result>(await resultRef.get(), "result");
}

async function recordCompletion(attempt: TestAttempt, courseId: string) {
  await activityService.record({
    studentUid: attempt.studentUid,
    type: "testCompleted",
    testId: attempt.testId,
    courseId,
  });
}

/**
 * Finalises sittings nobody is attending any more. Called by the sweep route,
 * which authenticates by shared secret — there is no session behind it.
 *
 * This is what makes "closing the laptop does not pause the timer" true rather
 * than aspirational: without it, an abandoned attempt stays `in-progress`
 * forever, holds its question bank open and blocks the student's own retry.
 */
export async function sweepExpiredAttempts(limit = 50): Promise<{
  finalised: number;
}> {
  const cutoff = new Date(
    Date.now() - EXPIRY_GRACE_SECONDS * 1000,
  ).toISOString();

  const snapshot = await collection(COLLECTIONS.testAttempts)
    .where("status", "==", "in-progress")
    .where("expiresAt", "<=", cutoff)
    .orderBy("expiresAt", "asc")
    .limit(Math.min(Math.max(limit, 1), 200))
    .get();

  const attempts = toEntities<TestAttemptDoc>(snapshot.docs) as TestAttempt[];

  for (const attempt of attempts) {
    try {
      await autoSubmit(attempt, "expired");
    } catch (error) {
      // One broken attempt must not stop the sweep: the rest of the batch is
      // other students' papers.
      console.error("[exam-sweep]", attempt.id, error);
    }
  }

  return { finalised: attempts.length };
}

/** A result, if the student is allowed to see it yet. */
export async function getResult(attemptId: string): Promise<Result | null> {
  const user = await requireAuth();

  const result = toEntity<Result>(
    await collection(COLLECTIONS.results).doc(docId.result(attemptId)).get(),
  );

  if (!result) return null;

  if (!isAtLeast(user.role, "FACULTY")) {
    if (result.studentUid !== user.uid) throw new AppError(ERROR_CODES.FORBIDDEN);

    if (result.publishedAt && result.publishedAt > new Date().toISOString()) {
      throw new AppError(ERROR_CODES.FORBIDDEN, {
        message: "Results for this test are not out yet.",
      });
    }
  }

  return result;
}

/**
 * The student's own attempt at one paper, if they have started it.
 *
 * Pages need this to decide what to show — start, resume or scorecard — and
 * doing it here keeps the "which attempt is mine" query out of three components.
 */
export async function findOwnAttempt(testId: string): Promise<TestAttempt | null> {
  const user = await requireAuth();

  const snapshot = await collection(COLLECTIONS.testAttempts)
    .where("testId", "==", testId)
    .where("studentUid", "==", user.uid)
    .orderBy("startedAt", "desc")
    .limit(1)
    .get();

  return snapshot.empty ? null : toEntity<TestAttempt>(snapshot.docs[0]);
}

/** One question as it appears on a scorecard, after the result window opens. */
export interface ReviewQuestion extends QuestionForAttempt {
  imageUrl: string | null;
  correctOptionIds: string[];
  explanation: string | null;
  selectedOptionIds: string[];
  marksAwarded: number | null;
  isCorrect: boolean | null;
}

/**
 * The paper with its answer key, for a sitting that is over.
 *
 * This is the only path on which `correctOptionIds` and `explanation` ever reach
 * a student, and it is gated on the same `publishedAt` the scorecard is: until
 * the whole batch has sat the paper, releasing the key to the first student to
 * finish would hand it to everyone who has not started.
 *
 * Options are returned in the student's own permuted order so the review matches
 * the paper they actually sat — a key in a different order is unreadable.
 */
export async function getReview(attemptId: string): Promise<ReviewQuestion[]> {
  const user = await requireAuth();
  const attempt = requireEntity<TestAttempt>(
    await collection(COLLECTIONS.testAttempts).doc(attemptId).get(),
    "attempt",
  );

  const isStaff = isAtLeast(user.role, "FACULTY");

  if (!isStaff && attempt.studentUid !== user.uid) {
    throw new AppError(ERROR_CODES.FORBIDDEN);
  }

  if (!isStaff) {
    if (attempt.status === "in-progress") {
      throw new AppError(ERROR_CODES.FORBIDDEN, {
        message: "The key is available once your paper is submitted.",
      });
    }

    const result = toEntity<Result>(
      await collection(COLLECTIONS.results).doc(docId.result(attemptId)).get(),
    );

    if (
      !result ||
      !result.publishedAt ||
      result.publishedAt > new Date().toISOString()
    ) {
      throw new AppError(ERROR_CODES.FORBIDDEN, {
        message: "Answers and explanations for this paper are not out yet.",
      });
    }
  }

  const test = requireEntity<Test>(
    await collection(COLLECTIONS.tests).doc(attempt.testId).get(),
    "test",
  );
  const policy = resolveExamSecurity(test);

  const [questionSnapshot, answerSnapshot] = await Promise.all([
    collection(COLLECTIONS.questions)
      .where("testIds", "array-contains", attempt.testId)
      .get(),
    collection(COLLECTIONS.answers).where("attemptId", "==", attemptId).get(),
  ]);

  const answerByQuestion = new Map(
    (toEntities<AnswerDoc>(answerSnapshot.docs) as Answer[]).map((answer) => [
      answer.questionId,
      answer,
    ]),
  );

  const questions = (toEntities<QuestionDoc>(questionSnapshot.docs) as Question[]).sort(
    (a, b) => a.id.localeCompare(b.id),
  );

  const ordered = policy.shuffleQuestions
    ? seededShuffle(questions, attempt.shuffleSeed)
    : questions;

  return Promise.all(
    ordered.map(async (question) => {
      const answer = answerByQuestion.get(question.id);

      return {
        id: question.id,
        kind: question.kind,
        subject: question.subject,
        statement: question.statement,
        imagePath: question.imagePath,
        imageUrl: question.imagePath
          ? await signQuietly(question.imagePath, 30)
          : null,
        options: policy.shuffleOptions
          ? seededShuffle(question.options, optionSeed(attempt.shuffleSeed, question.id))
          : question.options,
        marks: question.marks,
        correctOptionIds: question.correctOptionIds,
        explanation: question.explanation,
        selectedOptionIds: answer?.selectedOptionIds ?? [],
        marksAwarded: answer?.marksAwarded ?? null,
        isCorrect: answer?.isCorrect ?? null,
      };
    }),
  );
}

/**
 * Every scorecard of the signed-in student's that has been released, each with
 * the paper it was for. The input to the performance board.
 *
 * Filters on `studentUid` alone so the single-field index serves it, and drops
 * unreleased results here — the same `publishedAt` gate `getResult` applies —
 * so an analytics page can never leak a score the scorecard page would refuse.
 */
export async function listOwnPublishedResults(): Promise<ScoredPaper[]> {
  const user = await requireAuth();

  const snapshot = await collection(COLLECTIONS.results)
    .where("studentUid", "==", user.uid)
    .get();

  const nowIso = new Date().toISOString();
  const results = (toEntities<ResultDoc>(snapshot.docs) as Result[]).filter(
    (result) => result.publishedAt !== null && result.publishedAt <= nowIso,
  );

  const testIds = [...new Set(results.map((result) => result.testId))];
  const tests = testIds.length
    ? await collection(COLLECTIONS.tests).firestore.getAll(
        ...testIds.map((id) => collection(COLLECTIONS.tests).doc(id)),
      )
    : [];
  const testById = new Map(
    tests
      .map((snapshot) => toEntity<Test>(snapshot))
      .filter((test): test is Test => test !== null)
      .map((test) => [test.id, test]),
  );

  return results.map((result) => ({
    result,
    test: testById.get(result.testId) ?? null,
  }));
}

export async function listAttempts(studentUid: string): Promise<TestAttempt[]> {
  await requireSelfOrRole(studentUid, "MENTOR");

  const snapshot = await collection(COLLECTIONS.testAttempts)
    .where("studentUid", "==", studentUid)
    .orderBy("startedAt", "desc")
    .get();

  return toEntities<TestAttemptDoc>(snapshot.docs) as TestAttempt[];
}

/**
 * The invigilation log for one sitting. Faculty and above only — a student
 * reading their own log learns which evasions went unrecorded.
 */
export async function listProctorEvents(attemptId: string): Promise<ProctorEvent[]> {
  await requireRole("FACULTY");

  const snapshot = await collection(COLLECTIONS.proctorEvents)
    .where("attemptId", "==", attemptId)
    .orderBy("createdAt", "asc")
    .get();

  return toEntities<ProctorEventDoc>(snapshot.docs) as ProctorEvent[];
}

/** One sitting of a paper as the staff results table shows it. */
export interface StaffResultRow {
  attempt: TestAttempt;
  /** Absent for a sitting still in progress, and for Mains until it is marked. */
  result: Result | null;
  studentName: string;
  rollNumber: string | null;
}

/**
 * Everyone who has started a paper, with their scorecard where there is one.
 * Best score first, then sittings without a result, newest first.
 *
 * Both queries filter on `testId` alone so the single-field indexes serve them;
 * the paper's sittings are few enough to sort here.
 */
export async function listResultsForStaff(testId: string): Promise<StaffResultRow[]> {
  await requireRole("FACULTY");

  const [attemptSnapshot, resultSnapshot] = await Promise.all([
    collection(COLLECTIONS.testAttempts).where("testId", "==", testId).get(),
    collection(COLLECTIONS.results).where("testId", "==", testId).get(),
  ]);

  const attempts = toEntities<TestAttemptDoc>(attemptSnapshot.docs) as TestAttempt[];
  const resultByAttempt = new Map(
    (toEntities<ResultDoc>(resultSnapshot.docs) as Result[]).map((result) => [
      result.attemptId,
      result,
    ]),
  );

  const uids = [...new Set(attempts.map((attempt) => attempt.studentUid))];
  const students = uids.length
    ? await collection(COLLECTIONS.students).firestore.getAll(
        ...uids.map((uid) => collection(COLLECTIONS.students).doc(docId.user(uid))),
      )
    : [];
  const studentByUid = new Map(
    students
      .map((snapshot) => toEntity<Student>(snapshot))
      .filter((student): student is Student => student !== null)
      .map((student) => [student.uid, student]),
  );

  return attempts
    .map((attempt) => {
      const student = studentByUid.get(attempt.studentUid);

      return {
        attempt,
        result: resultByAttempt.get(attempt.id) ?? null,
        studentName: student?.fullName ?? "Unknown student",
        rollNumber: student?.rollNumber ?? null,
      };
    })
    .sort((a, b) => {
      if (a.result && b.result) return b.result.score - a.result.score;
      if (a.result) return -1;
      if (b.result) return 1;
      return b.attempt.startedAt.localeCompare(a.attempt.startedAt);
    });
}

/** Firestore caps a batch at 500 writes. */
const RELEASE_BATCH_SIZE = 400;

/**
 * Releases a paper's results now, and ranks them.
 *
 * Each result carries its own `publishedAt`, copied from the paper when it was
 * scored, so moving the paper's result date afterwards does not move scorecards
 * already written. This stamps every unreleased one with the present moment and
 * sets the paper's date to match, so anyone who submits later sees theirs at once.
 *
 * Rank is competition ranking (equal scores share a rank, the next is skipped);
 * percentile is the share of the other candidates who scored lower. Safe to run
 * again — late submitters are ranked in and everyone else's rank is refreshed.
 */
export async function releaseResults(testId: string): Promise<{ released: number; ranked: number }> {
  const actor = await requireRole("FACULTY");

  const [inProgress, resultSnapshot] = await Promise.all([
    collection(COLLECTIONS.testAttempts)
      .where("testId", "==", testId)
      .where("status", "==", "in-progress")
      .limit(1)
      .get(),
    collection(COLLECTIONS.results).where("testId", "==", testId).get(),
  ]);

  if (!inProgress.empty) {
    // Their rank would be wrong the moment they submit, and they could read the
    // key mid-sitting from a second device.
    throw new AppError(ERROR_CODES.CONFLICT, {
      message: "A student is still sitting this paper. Release results once every sitting has ended.",
    });
  }

  const results = (toEntities<ResultDoc>(resultSnapshot.docs) as Result[]).sort(
    (a, b) => b.score - a.score,
  );
  const nowIso = new Date().toISOString();
  const total = results.length;

  let released = 0;
  let rank = 0;
  const writes = results.map((result, index) => {
    if (index === 0 || results[index - 1].score !== result.score) rank = index + 1;

    // Sorted best first, so everyone after the last equal score is below.
    const below = total - (index + results.slice(index).filter((other) => other.score === result.score).length);
    const percentile = total > 1 ? Number(((below / (total - 1)) * 100).toFixed(2)) : 100;

    const unreleased = !result.publishedAt || result.publishedAt > nowIso;
    if (unreleased) released += 1;

    return {
      id: result.id,
      fields: {
        rank,
        percentile,
        ...(unreleased ? { publishedAt: nowIso } : {}),
        ...auditOnUpdate(actor.uid),
      },
    };
  });

  for (let start = 0; start < writes.length; start += RELEASE_BATCH_SIZE) {
    const batch = collection(COLLECTIONS.results).firestore.batch();
    for (const write of writes.slice(start, start + RELEASE_BATCH_SIZE)) {
      batch.update(collection(COLLECTIONS.results).doc(write.id), write.fields);
    }
    await batch.commit();
  }

  const test = requireEntity<Test>(await collection(COLLECTIONS.tests).doc(testId).get(), "test");
  if (!test.resultsVisibleFrom || test.resultsVisibleFrom > nowIso) {
    await collection(COLLECTIONS.tests)
      .doc(testId)
      .update({ resultsVisibleFrom: nowIso, ...auditOnUpdate(actor.uid) });
  }

  return { released, ranked: total };
}

/** Faculty evaluation of one descriptive answer. */
export async function evaluateAnswer(input: {
  answerId: string;
  marksAwarded: number;
  evaluatorNote?: string | null;
}): Promise<void> {
  const actor = await requireRole("FACULTY");

  await collection(COLLECTIONS.answers)
    .doc(input.answerId)
    .update({
      marksAwarded: input.marksAwarded,
      evaluatorNote: input.evaluatorNote ?? null,
      evaluatedBy: actor.uid,
      ...auditOnUpdate(actor.uid),
    });
}

/**
 * Loads an attempt and proves the caller owns it, that it is still open, and —
 * when a token is given — that this is the window the sitting belongs to.
 */
async function requireOwnAttempt(
  attemptId: string,
  sessionToken?: string,
): Promise<TestAttempt> {
  const user = await requireAuth();
  const attempt = requireEntity<TestAttempt>(
    await collection(COLLECTIONS.testAttempts).doc(attemptId).get(),
    "attempt",
  );

  if (attempt.studentUid !== user.uid) {
    throw new AppError(ERROR_CODES.FORBIDDEN);
  }

  if (attempt.status !== "in-progress") {
    throw new AppError(ERROR_CODES.CONFLICT, {
      message: "This attempt has already been submitted.",
    });
  }

  if (sessionToken !== undefined && attempt.sessionToken !== sessionToken) {
    await logProctorEvent(attempt, "secondWindow", { detail: "stale token" });

    throw new AppError(ERROR_CODES.CONFLICT, {
      message:
        "This paper was opened in another window. Continue there — this window is no longer part of the sitting.",
    });
  }

  return attempt;
}

export const testService = {
  getTest,
  listForCourse,
  createTest,
  updateTest,
  createQuestion,
  createQuestions,
  updateQuestion,
  setQuestionsStatus,
  setQuestionPapers,
  listQuestionsForStaff,
  getQuestionForStaff,
  listForStaff,
  hasAttempts,
  createAttempt,
  openExam,
  getQuestionsForAttempt,
  saveAnswer,
  heartbeat,
  recordProctorEvent,
  submitAttempt,
  sweepExpiredAttempts,
  getResult,
  findOwnAttempt,
  getReview,
  listOwnPublishedResults,
  listAttempts,
  listProctorEvents,
  listResultsForStaff,
  releaseResults,
  evaluateAnswer,
};
