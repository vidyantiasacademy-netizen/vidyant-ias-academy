import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { requireRole } from "@/lib/auth/server";
import { AppError, ERROR_CODES } from "@/lib/errors";
import { EXPIRY_GRACE_SECONDS, resolveExamSecurity } from "@/lib/exam/policy";
import { scoreMcqPaper } from "@/lib/exam/scoring";
import { optionSeed, seededShuffle } from "@/lib/exam/shuffle";
import type { ExamQuestion } from "@/lib/exam/types";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import {
  auditOnCreate,
  auditOnUpdate,
  collection,
  requireEntity,
  toEntities,
  toEntity,
} from "@/lib/firebase/firestore";
import { submitLead } from "@/lib/leads/service";
import type {
  MockResultView,
  MockReviewQuestion,
  MockState,
  PublicPaper,
} from "@/lib/mock-test/types";
import { hasPassed, isAhead, latestFirst } from "@/lib/utils/instant";
import { LEAD_FORMS } from "@/lib/validation/schemas";
import type {
  ExamSecurityPolicy,
  MockAttempt,
  MockAttemptDoc,
  Question,
  Test,
  TestDoc,
} from "@/types/db";

import { enquiryService } from "../enquiries/enquiry.service";
import { storageService } from "../storage/storage.service";

/**
 * The free public mock test: website visitors sit a `public` paper without an
 * account, and every sitting starts as a lead.
 *
 * What it shares with the student engine (`testService`): the question bank
 * and its authoring screens, the redacted-question projection, the per-sitting
 * shuffle, the server-side clock and — through `lib/exam/scoring` — the exact
 * marking rule. What it deliberately leaves out: enrolment, the single-window
 * rule and invigilation. A free practice paper sat at home is not a high-stakes
 * sitting, and fullscreen locks on a first visit would cost more registrations
 * than they would prevent cheating.
 *
 * Identity is a bearer token. Registration mints 24 random bytes, hands them
 * to the browser in an httpOnly cookie and stores only their SHA-256 on the
 * attempt. Every call below is given the token by its caller and checks it
 * before reading anything else, so an attempt id alone — in a URL, a log, a
 * shared screenshot — opens nothing.
 */

// ─── Papers ──────────────────────────────────────────────────────────────────

function toPublicPaper(test: Test): PublicPaper {
  return {
    id: test.id,
    title: test.title,
    kind: test.kind,
    subject: test.subject,
    questionCount: test.questionCount,
    totalMarks: test.totalMarks,
    durationMinutes: test.durationMinutes,
    negativeMarksPerQuestion: test.negativeMarksPerQuestion,
    closesAt: test.closesAt,
  };
}

function isPublicMcq(test: Test): boolean {
  return (
    test.audience === "public" &&
    test.status === "published" &&
    test.kind !== "mains-descriptive"
  );
}

function isOpen(test: Test, now = Date.now()): boolean {
  return (!test.opensAt || hasPassed(test.opensAt, now)) && (!test.closesAt || isAhead(test.closesAt, now));
}

/** Every public paper a visitor can start right now, newest first. No session needed. */
export async function listOpenPapers(): Promise<PublicPaper[]> {
  if (!isAdminConfigured()) return [];

  try {
    const snapshot = await collection(COLLECTIONS.tests)
      .where("audience", "==", "public")
      .where("status", "==", "published")
      .get();

    const now = Date.now();

    return (toEntities<TestDoc>(snapshot.docs) as Test[])
      .filter((test) => isPublicMcq(test) && isOpen(test, now))
      .sort((a, b) => latestFirst(a.opensAt ?? a.createdAt, b.opensAt ?? b.createdAt))
      .map(toPublicPaper);
  } catch (error) {
    // Same contract as the course catalogue: an outage empties the list, it
    // does not take the page down.
    console.error("[mock-test] listing failed", error);
    return [];
  }
}

async function getPublicTest(testId: string): Promise<Test> {
  const test = toEntity<Test>(await collection(COLLECTIONS.tests).doc(testId).get());

  // A paper that is not public is reported as missing, not forbidden: whether
  // an internal paper with that id exists is not the visitor's business.
  if (!test || !isPublicMcq(test)) throw new AppError(ERROR_CODES.NOT_FOUND);

  return test;
}

// ─── Access ──────────────────────────────────────────────────────────────────

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function tokenMatches(token: string, storedHash: string): boolean {
  const presented = Buffer.from(hashToken(token), "hex");
  const stored = Buffer.from(storedHash, "hex");
  return presented.length === stored.length && timingSafeEqual(presented, stored);
}

/**
 * The attempt, if `token` is its owner's. Anything else is `NOT_FOUND` — a
 * wrong token and a missing attempt must be indistinguishable, or the error
 * becomes a way to discover which attempt ids exist.
 */
async function requireOwnAttempt(attemptId: string, token: string | null): Promise<MockAttempt> {
  const attempt = token
    ? toEntity<MockAttempt>(await collection(COLLECTIONS.mockAttempts).doc(attemptId).get())
    : null;

  if (!attempt || !token || !tokenMatches(token, attempt.accessTokenHash)) {
    throw new AppError(ERROR_CODES.NOT_FOUND, {
      message: "This mock test sitting could not be found in this browser.",
    });
  }

  return attempt;
}

// ─── Registration ────────────────────────────────────────────────────────────

export interface RegistrationInput {
  testId: string;
  name: string;
  phone: string;
  email: string | null;
  targetAttempt: string | null;
}

export interface RegistrationContext {
  page?: string;
  source?: string;
  campaign?: string;
  referrer?: string;
}

/**
 * Registers a visitor for a paper and returns the token their browser keeps.
 *
 * One sitting per mobile number per paper, so the rank list is a list of
 * people rather than of retries. A number with an unfinished sitting gets that
 * sitting back with a fresh token — the newest browser wins, as in the student
 * engine, so a visitor who switched from phone to laptop is not locked out. A
 * number that has already finished is refused: handing its scorecard to anyone
 * who types the number would publish strangers' results.
 */
export async function register(
  input: RegistrationInput,
  context: RegistrationContext,
): Promise<{ attemptId: string; token: string }> {
  const test = await getPublicTest(input.testId);

  if (!isOpen(test)) {
    throw new AppError(ERROR_CODES.FORBIDDEN, { message: "This mock test is not open right now." });
  }

  const token = randomBytes(24).toString("hex");
  const attempts = collection(COLLECTIONS.mockAttempts);

  const existing = toEntities<MockAttemptDoc>(
    (await attempts.where("testId", "==", test.id).where("phone", "==", input.phone).limit(5).get())
      .docs,
  ) as MockAttempt[];

  if (existing.some((attempt) => attempt.status === "evaluated")) {
    throw new AppError(ERROR_CODES.CONFLICT, {
      message:
        "This mobile number has already taken this mock test. Your result was sent to our counsellors — ask for it on a free counselling call.",
    });
  }

  const unfinished = existing[0];
  if (unfinished) {
    await attempts.doc(unfinished.id).update({
      accessTokenHash: hashToken(token),
      ...auditOnUpdate("system"),
    });
    return { attemptId: unfinished.id, token };
  }

  // The lead first: if the sitting then fails to save, the counsellor still
  // has a name and a number to call, which is the point of the page.
  const lead = await submitLead({
    form: LEAD_FORMS.mockTest,
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email ?? undefined,
      targetAttempt: input.targetAttempt ?? undefined,
      paper: test.title,
    },
    context: { ...context, source: context.source ?? "mock-test" },
  });

  const doc: MockAttemptDoc = {
    testId: test.id,
    enquiryId: lead.id,
    name: input.name,
    phone: input.phone,
    email: input.email,
    targetAttempt: input.targetAttempt,
    accessTokenHash: hashToken(token),
    shuffleSeed: randomBytes(8).toString("hex"),
    status: "registered",
    startedAt: null,
    expiresAt: null,
    submittedAt: null,
    autoSubmitted: false,
    questionIds: [],
    answers: {},
    answeredCount: 0,
    score: null,
    result: null,
  };

  const ref = attempts.doc();
  await ref.set({ ...doc, ...auditOnCreate("system") });

  return { attemptId: ref.id, token };
}

// ─── The sitting ─────────────────────────────────────────────────────────────

function remainingSecondsOf(attempt: Pick<MockAttempt, "expiresAt">): number {
  if (!attempt.expiresAt) return 0;
  return Math.max(0, Math.floor((Date.parse(attempt.expiresAt) - Date.now()) / 1000));
}

function pastGrace(attempt: Pick<MockAttempt, "expiresAt">): boolean {
  return Boolean(
    attempt.expiresAt && Date.now() > Date.parse(attempt.expiresAt) + EXPIRY_GRACE_SECONDS * 1000,
  );
}

async function loadQuestions(ids: string[]): Promise<Question[]> {
  if (ids.length === 0) return [];

  const questions = collection(COLLECTIONS.questions);
  const snapshots = await questions.firestore.getAll(...ids.map((id) => questions.doc(id)));

  return snapshots
    .map((snapshot) => toEntity<Question>(snapshot))
    .filter((question): question is Question => question !== null);
}

/**
 * The visitor's own order of the paper — questions and options — reproduced
 * from the attempt's seed, so the sitting and the review match on every load.
 * `questionIds` is stored sorted, which is what makes the shuffle stable.
 */
function inVisitorOrder<T extends Pick<Question, "id" | "options">>(
  questions: T[],
  seed: string,
  policy: ExamSecurityPolicy,
): T[] {
  const sorted = [...questions].sort((a, b) => a.id.localeCompare(b.id));
  const ordered = policy.shuffleQuestions ? seededShuffle(sorted, seed) : sorted;

  return ordered.map((question) => ({
    ...question,
    options: policy.shuffleOptions
      ? seededShuffle(question.options, optionSeed(seed, question.id))
      : question.options,
  }));
}

async function sittingFor(attempt: MockAttempt, test: Test): Promise<MockState> {
  const questions = await loadQuestions(attempt.questionIds);
  // Signed to outlast the paper, with a margin for a slow start.
  const ttl = test.durationMinutes + 15;

  const paper: ExamQuestion[] = await Promise.all(
    inVisitorOrder(questions, attempt.shuffleSeed, resolveExamSecurity(test)).map(async (question) => ({
      id: question.id,
      kind: question.kind,
      subject: question.subject,
      statement: question.statement,
      imagePath: question.imagePath,
      imageUrl: question.imagePath ? await signQuietly(question.imagePath, ttl) : null,
      options: question.options,
      marks: question.marks,
    })),
  );

  return {
    stage: "sitting",
    attemptId: attempt.id,
    paper: toPublicPaper(test),
    remainingSeconds: remainingSecondsOf(attempt),
    questions: paper,
    answers: attempt.answers,
  };
}

/** A diagram that cannot be signed must not take the whole paper down with it. */
async function signQuietly(path: string, ttlMinutes: number): Promise<string | null> {
  try {
    return await storageService.getQuestionImageUrlForVisitor(path, ttlMinutes);
  } catch (error) {
    console.error("[mock-test] question image could not be signed", path, error);
    return null;
  }
}

/** Where the visitor's sitting stands: instructions, live paper, or done. */
export async function open(attemptId: string, token: string | null): Promise<MockState> {
  let attempt = await requireOwnAttempt(attemptId, token);
  const test = requireEntity<Test>(
    await collection(COLLECTIONS.tests).doc(attempt.testId).get(),
    "test",
  );

  if (attempt.status === "in-progress" && remainingSecondsOf(attempt) <= 0) {
    attempt = await finalise(attempt, test, { auto: true });
  }

  if (attempt.status === "evaluated") return { stage: "finished", attemptId: attempt.id };

  if (attempt.status === "registered") {
    return {
      stage: "instructions",
      attemptId: attempt.id,
      firstName: attempt.name.split(/\s+/)[0] ?? attempt.name,
      paper: toPublicPaper(test),
    };
  }

  return sittingFor(attempt, test);
}

/**
 * Starts the clock. The deadline is the server's, fixed once: pressing Begin
 * again, or from another browser, resumes rather than restarts.
 */
export async function begin(attemptId: string, token: string | null): Promise<MockState> {
  const attempt = await requireOwnAttempt(attemptId, token);
  if (attempt.status !== "registered") return open(attemptId, token);

  const test = await getPublicTest(attempt.testId);
  if (!isOpen(test)) {
    throw new AppError(ERROR_CODES.FORBIDDEN, { message: "This mock test has closed." });
  }

  const snapshot = await collection(COLLECTIONS.questions)
    .where("testIds", "array-contains", test.id)
    .where("status", "==", "published")
    .get();
  const questionIds = snapshot.docs.map((doc) => doc.id).sort();

  if (questionIds.length === 0) {
    throw new AppError(ERROR_CODES.CONFLICT, { message: "This paper has no questions yet." });
  }

  const ref = collection(COLLECTIONS.mockAttempts).doc(attempt.id);
  const now = new Date();

  await ref.firestore.runTransaction(async (transaction) => {
    const fresh = requireEntity<MockAttempt>(await transaction.get(ref), "mock attempt");
    // Two Begin clicks racing: the first one sets the clock, the second resumes.
    if (fresh.status !== "registered") return;

    transaction.update(ref, {
      status: "in-progress",
      startedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + test.durationMinutes * 60_000).toISOString(),
      questionIds,
      ...auditOnUpdate("system"),
    });
  });

  return open(attemptId, token);
}

/** Answers keyed by question id, trimmed to this paper's questions. */
function cleanAnswers(
  questionIds: string[],
  answers: Record<string, string[]>,
): Record<string, string[]> {
  const onPaper = new Set(questionIds);

  return Object.fromEntries(
    Object.entries(answers)
      .filter(([questionId]) => onPaper.has(questionId))
      .map(([questionId, selected]) => [questionId, [...new Set(selected)]]),
  );
}

/**
 * Saves the visitor's whole answer sheet. One write per save rather than one
 * per click: the runner batches changes, and a bounded map on one document is
 * cheaper than a document per answer for a paper nobody invigilates.
 */
export async function saveAnswers(
  attemptId: string,
  token: string | null,
  answers: Record<string, string[]>,
): Promise<{ remainingSeconds: number }> {
  const attempt = await requireOwnAttempt(attemptId, token);

  if (attempt.status !== "in-progress" || pastGrace(attempt)) {
    throw new AppError(ERROR_CODES.CONFLICT, { message: "This paper is already closed." });
  }

  const cleaned = cleanAnswers(attempt.questionIds, answers);

  await collection(COLLECTIONS.mockAttempts)
    .doc(attempt.id)
    .update({
      answers: cleaned,
      answeredCount: Object.values(cleaned).filter((selected) => selected.length > 0).length,
      ...auditOnUpdate("system"),
    });

  return { remainingSeconds: remainingSecondsOf(attempt) };
}

/** Saves the final sheet (if still in time) and scores the paper. */
export async function submit(
  attemptId: string,
  token: string | null,
  answers: Record<string, string[]>,
): Promise<void> {
  const attempt = await requireOwnAttempt(attemptId, token);
  if (attempt.status === "evaluated") return;

  if (attempt.status !== "in-progress") {
    throw new AppError(ERROR_CODES.CONFLICT, { message: "This paper has not been started." });
  }

  const test = requireEntity<Test>(
    await collection(COLLECTIONS.tests).doc(attempt.testId).get(),
    "test",
  );

  // Late answers are dropped, not refused: the paper is still scored on what
  // was saved before the deadline.
  const sheet = pastGrace(attempt) ? attempt.answers : cleanAnswers(attempt.questionIds, answers);

  await finalise({ ...attempt, answers: sheet }, test, { auto: false });
}

/**
 * Scores and closes a sitting, once. The status check runs inside a
 * transaction, so a submit racing the sweep cannot score the paper twice or
 * write two notes on the lead.
 */
async function finalise(
  attempt: MockAttempt,
  test: Test,
  { auto }: { auto: boolean },
): Promise<MockAttempt> {
  const questions = await loadQuestions(attempt.questionIds);
  const ref = collection(COLLECTIONS.mockAttempts).doc(attempt.id);

  const scored = scoreMcqPaper(
    questions,
    Object.entries(attempt.answers).map(([questionId, selectedOptionIds]) => ({
      questionId,
      selectedOptionIds,
    })),
    test.negativeMarksPerQuestion,
  );

  const wrote = await ref.firestore.runTransaction(async (transaction) => {
    const fresh = requireEntity<MockAttempt>(await transaction.get(ref), "mock attempt");
    if (fresh.status === "evaluated") return false;

    transaction.update(ref, {
      status: "evaluated",
      answers: attempt.answers,
      answeredCount: Object.values(attempt.answers).filter((selected) => selected.length > 0).length,
      submittedAt: new Date().toISOString(),
      autoSubmitted: auto,
      score: scored.score,
      result: {
        totalMarks: test.totalMarks,
        correctCount: scored.correctCount,
        wrongCount: scored.wrongCount,
        unattemptedCount: scored.unattemptedCount,
        negativeMarks: scored.negativeMarks,
        subjectBreakdown: scored.subjectBreakdown,
      },
      ...auditOnUpdate("system"),
    });
    return true;
  });

  if (wrote) {
    try {
      await enquiryService.recordMockResult(attempt.enquiryId, {
        testTitle: test.title,
        score: scored.score,
        totalMarks: test.totalMarks,
        weakSubjects: weakestSubjects(scored.subjectBreakdown),
      });
    } catch (error) {
      // The visitor's scorecard matters more than the CRM note; log and move on.
      console.error("[mock-test] could not note the result on the enquiry", attempt.enquiryId, error);
    }
  }

  return requireEntity<MockAttempt>(await ref.get(), "mock attempt");
}

/**
 * The subjects where the visitor kept the smallest share of the marks on
 * offer — what the counselling call should open with. Never every subject: a
 * list of all of them says nothing.
 */
function weakestSubjects(
  breakdown: { subject: string; score: number; totalMarks: number }[],
): string[] {
  const scorable = breakdown.filter((row) => row.totalMarks > 0);
  if (scorable.length < 2) return [];

  return [...scorable]
    .sort((a, b) => a.score / a.totalMarks - b.score / b.totalMarks)
    .slice(0, Math.min(2, scorable.length - 1))
    .map((row) => row.subject);
}

// ─── Result ──────────────────────────────────────────────────────────────────

/** Fewer scored candidates than this and a percentile is noise. */
const MIN_FIELD_FOR_PERCENTILE = 10;

/**
 * The visitor's scorecard, rank and — once the paper's key is released — the
 * paper replayed with answers and explanations. `null` while the paper is
 * still being sat.
 */
export async function getResult(
  attemptId: string,
  token: string | null,
): Promise<MockResultView | null> {
  let attempt = await requireOwnAttempt(attemptId, token);
  const test = requireEntity<Test>(
    await collection(COLLECTIONS.tests).doc(attempt.testId).get(),
    "test",
  );

  if (attempt.status === "in-progress" && remainingSecondsOf(attempt) <= 0) {
    attempt = await finalise(attempt, test, { auto: true });
  }

  if (attempt.status !== "evaluated" || attempt.score === null || !attempt.result) return null;

  const scored = collection(COLLECTIONS.mockAttempts)
    .where("testId", "==", attempt.testId)
    .where("status", "==", "evaluated");

  const [above, below, total] = await Promise.all([
    scored.where("score", ">", attempt.score).count().get(),
    scored.where("score", "<", attempt.score).count().get(),
    scored.count().get(),
  ]);

  const totalCandidates = total.data().count;
  const rank = above.data().count + 1;
  const percentile =
    totalCandidates >= MIN_FIELD_FOR_PERCENTILE
      ? Math.round((below.data().count / (totalCandidates - 1)) * 100)
      : null;

  const keyVisible = !test.resultsVisibleFrom || hasPassed(test.resultsVisibleFrom);

  return {
    attemptId: attempt.id,
    paper: toPublicPaper(test),
    name: attempt.name,
    score: attempt.score,
    result: attempt.result,
    autoSubmitted: attempt.autoSubmitted,
    rank,
    totalCandidates,
    percentile,
    weakSubjects: weakestSubjects(attempt.result.subjectBreakdown),
    review: keyVisible ? await reviewFor(attempt, test) : null,
    keyVisibleFrom: test.resultsVisibleFrom,
  };
}

async function reviewFor(attempt: MockAttempt, test: Test): Promise<MockReviewQuestion[]> {
  const questions = await loadQuestions(attempt.questionIds);

  return inVisitorOrder(questions, attempt.shuffleSeed, resolveExamSecurity(test)).map((question) => ({
    id: question.id,
    subject: question.subject,
    statement: question.statement,
    options: question.options,
    correctOptionIds: question.correctOptionIds,
    selectedOptionIds: attempt.answers[question.id] ?? [],
    explanation: question.explanation,
    keyApproach: question.keyApproach ?? null,
    currentAffairsLinkage: question.currentAffairsLinkage ?? null,
    marks: question.marks,
  }));
}

// ─── Housekeeping ────────────────────────────────────────────────────────────

/**
 * Scores sittings whose visitor walked away mid-paper, so they join the rank
 * list and their lead carries a score. Called by the exam sweep route.
 */
export async function sweepExpired(limit = 50): Promise<{ finalised: number }> {
  const cutoff = new Date(Date.now() - EXPIRY_GRACE_SECONDS * 1000).toISOString();

  const snapshot = await collection(COLLECTIONS.mockAttempts)
    .where("status", "==", "in-progress")
    .where("expiresAt", "<=", cutoff)
    .orderBy("expiresAt", "asc")
    .limit(Math.min(Math.max(limit, 1), 200))
    .get();

  const attempts = toEntities<MockAttemptDoc>(snapshot.docs) as MockAttempt[];
  const tests = new Map<string, Test>();

  for (const attempt of attempts) {
    try {
      let test = tests.get(attempt.testId);
      if (!test) {
        test = requireEntity<Test>(
          await collection(COLLECTIONS.tests).doc(attempt.testId).get(),
          "test",
        );
        tests.set(test.id, test);
      }
      await finalise(attempt, test, { auto: true });
    } catch (error) {
      console.error("[mock-sweep]", attempt.id, error);
    }
  }

  return { finalised: attempts.length };
}

export interface MockAttemptRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  enquiryId: string;
  status: MockAttempt["status"];
  score: number | null;
  startedAt: string | null;
  submittedAt: string | null;
  autoSubmitted: boolean;
}

/** A public paper's visitor sittings for the admin results screen. Faculty and above. */
export async function listForStaff(testId: string): Promise<MockAttemptRow[]> {
  await requireRole("FACULTY");

  const snapshot = await collection(COLLECTIONS.mockAttempts)
    .where("testId", "==", testId)
    .orderBy("createdAt", "desc")
    .limit(500)
    .get();

  return (toEntities<MockAttemptDoc>(snapshot.docs) as MockAttempt[]).map((attempt) => ({
    id: attempt.id,
    name: attempt.name,
    phone: attempt.phone,
    email: attempt.email,
    enquiryId: attempt.enquiryId,
    status: attempt.status,
    score: attempt.score,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    autoSubmitted: attempt.autoSubmitted,
  }));
}

export const mockTestService = {
  listOpenPapers,
  register,
  open,
  begin,
  saveAnswers,
  submit,
  getResult,
  sweepExpired,
  listForStaff,
};
