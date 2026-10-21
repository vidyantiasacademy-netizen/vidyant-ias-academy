"use server";

import { z } from "zod";

import { revalidateLocalizedPath } from "@/i18n/revalidate";
import { action, roleGuard } from "@/lib/auth/guards";
import { MEDIA_PREFIXES, isMediaRefIn } from "@/lib/cloudinary/media-paths";
import { toUtcIsoOrNull } from "@/lib/utils/instant";
import { AppError, ERROR_CODES } from "@/lib/errors";
import {
  copyIdSchema,
  evaluationSchema,
  mainsPaperSchema,
  type MainsPaperInput,
} from "@/lib/validation/answer-writing";
import { answerWritingService } from "@/services/answer-writing/answer-writing.service";
import { testService } from "@/services/tests/test.service";
import type { Test, TestDoc } from "@/types/db";

import { mainsLockReason, mainsPublishBlocker, schemeTotals } from "./policy";

/**
 * The answer-writing screens' staff surface, faculty and above.
 *
 * `testService` and `answerWritingService` check the role on every call; what
 * this file adds is the paper-level judgement: a paper cannot go live without
 * its PDF and scheme, and once a student has opened it, the PDF, the scheme and
 * the timing are frozen — the deadline, title and result date stay editable.
 */

const id = z.string().min(1).max(128);

type PaperFields = Omit<TestDoc, "status" | "questionPaperPath" | "batchId">;

/** The form's input as the paper document it describes. */
function paperFields(input: MainsPaperInput): PaperFields {
  const totals = schemeTotals(input.markingScheme);

  return {
    courseId: input.courseId,
    title: input.title,
    kind: "mains-descriptive",
    subject: input.subject,
    questionCount: totals.questionCount,
    totalMarks: totals.totalMarks,
    durationMinutes: input.durationMinutes,
    negativeMarksPerQuestion: 0,
    opensAt: input.opensAt,
    closesAt: input.closesAt,
    resultsVisibleFrom: input.resultsVisibleFrom,
    security: null,
    audience: "enrolled",
    markingScheme: input.markingScheme,
  };
}

/**
 * Whether an edit touches what a student's copy depends on. Times are compared
 * as instants — the form sends `+05:30`, a seeded paper may say `Z`.
 */
function changesLockedFields(current: Test, next: PaperFields): boolean {
  const scheme = (slots: TestDoc["markingScheme"]) =>
    JSON.stringify((slots ?? []).map((slot) => [slot.label, slot.maxMarks, slot.wordLimit ?? null]));

  return (
    current.courseId !== next.courseId ||
    current.durationMinutes !== next.durationMinutes ||
    toUtcIsoOrNull(current.opensAt) !== toUtcIsoOrNull(next.opensAt) ||
    scheme(current.markingScheme) !== scheme(next.markingScheme)
  );
}

async function lockReasonFor(test: Test): Promise<string | null> {
  return mainsLockReason(test, await answerWritingService.hasSubmissions(test.id));
}

function revalidatePaper(testId?: string) {
  revalidateLocalizedPath("/admin/answer-writing");
  if (testId) revalidateLocalizedPath(`/admin/answer-writing/${testId}`, "layout");
}

// ─── Papers ──────────────────────────────────────────────────────────────────

export const createMainsPaperAction = action(
  roleGuard("FACULTY"),
  mainsPaperSchema,
  async (input) => {
    // Always a draft, and without its PDF: the upload path names the paper, so
    // the paper has to exist first. Publishing is its own step.
    const test = await testService.createTest({
      ...paperFields(input),
      batchId: null,
      questionPaperPath: null,
      status: "draft",
    });

    revalidatePaper();
    return { id: test.id };
  },
);

export const updateMainsPaperAction = action(
  roleGuard("FACULTY"),
  z.object({ testId: id, fields: mainsPaperSchema }),
  async ({ testId, fields }) => {
    const current = await answerWritingService.getPaperForStaff(testId);
    const next = paperFields(fields);
    const reason = await lockReasonFor(current);

    if (reason && changesLockedFields(current, next)) {
      throw new AppError(ERROR_CODES.CONFLICT, {
        message: `${reason} The title, subject, deadline and result date can still change.`,
      });
    }

    await testService.updateTest(testId, next);
    revalidatePaper(testId);
    return { id: testId };
  },
);

/**
 * Points the paper at a PDF the browser has just uploaded. The reference must
 * be a PDF in this paper's own `paper/` folder — the upload signature allowed
 * a write there, but the reference sent back is only a claim.
 */
export const attachQuestionPaperAction = action(
  roleGuard("FACULTY"),
  z.object({ testId: id, path: z.string().min(5).max(500) }),
  async ({ testId, path }) => {
    const test = await answerWritingService.getPaperForStaff(testId);

    const reason = await lockReasonFor(test);
    if (reason) throw new AppError(ERROR_CODES.CONFLICT, { message: reason });

    if (!isMediaRefIn(path, MEDIA_PREFIXES.testQuestionPaper(testId), ["pdf"])) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
        message: "Upload the question paper as a PDF.",
      });
    }

    await testService.updateTest(testId, { questionPaperPath: path });
    revalidatePaper(testId);
    return { path };
  },
);

export const setMainsPaperStatusAction = action(
  roleGuard("FACULTY"),
  z.object({ testId: id, status: z.enum(["draft", "published", "archived"]) }),
  async ({ testId, status }) => {
    const test = await answerWritingService.getPaperForStaff(testId);
    if (test.status === status) return { status };

    if (status === "published") {
      const blocker = mainsPublishBlocker(test);
      if (blocker) throw new AppError(ERROR_CODES.CONFLICT, { message: blocker });
    } else if (test.status === "published" && (await answerWritingService.hasSubmissions(testId))) {
      // A draft paper is invisible to students, and so would be their copies.
      throw new AppError(ERROR_CODES.CONFLICT, {
        message:
          "Students have already opened this paper. It stays published so they can submit and see their evaluations.",
      });
    }

    await testService.updateTest(testId, { status });
    revalidatePaper(testId);
    return { status };
  },
);

// ─── Evaluation ──────────────────────────────────────────────────────────────

export const startReviewAction = action(
  roleGuard("FACULTY"),
  copyIdSchema.extend({ takeOver: z.boolean().optional() }),
  async ({ testId, studentUid, takeOver }) => {
    await answerWritingService.startReview(testId, studentUid, { takeOver });
    revalidatePaper(testId);
    return { claimed: true } as const;
  },
);

export const saveEvaluationAction = action(
  roleGuard("FACULTY"),
  evaluationSchema,
  async (input) => {
    const outcome = await answerWritingService.saveEvaluation(input);
    revalidatePaper(input.testId);
    return outcome;
  },
);

export const releaseEvaluationsAction = action(
  roleGuard("FACULTY"),
  z.object({ testId: id }),
  async ({ testId }) => {
    const outcome = await answerWritingService.releaseEvaluations(testId);
    revalidatePaper(testId);
    return outcome;
  },
);
