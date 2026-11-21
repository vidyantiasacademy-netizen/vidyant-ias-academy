"use server";

import { z } from "zod";

import { revalidateLocalizedPath } from "@/i18n/revalidate";
import { action, roleGuard } from "@/lib/auth/guards";
import { AppError, ERROR_CODES } from "@/lib/errors";
import { LOCKED_TEST_FIELDS, paperLockReason, publishBlocker } from "@/lib/exam/authoring";
import { MAX_IMPORT_ROWS } from "@/lib/exam/question-csv";
import { toUtcIsoOrNull } from "@/lib/utils/instant";
import { questionSchema, testSchema } from "@/lib/validation/entities";
import { testService } from "@/services/tests/test.service";
import type { QuestionDoc, Test } from "@/types/db";

/**
 * The test authoring screen's server surface, faculty and above.
 *
 * `testService` already checks the role on every write; what this file adds is
 * the paper-level judgement the service leaves to its caller: a paper cannot be
 * published until its questions add up to what it promises, and once anyone has
 * sat it, the parts that decide a score are frozen.
 */

const id = z.string().min(1).max(128);

/** The runner sits MCQ papers only. Mains papers are evaluated, not authored here. */
const MCQ_TEST_KINDS = ["prelims-mcq", "csat", "sectional"] as const;
const MCQ_QUESTION_KINDS = ["mcq-single", "mcq-multiple"] as const;

const testFieldsSchema = testSchema
  .omit({ status: true })
  .extend({ kind: z.enum(MCQ_TEST_KINDS) })
  .refine(
    (data) => !data.opensAt || !data.closesAt || Date.parse(data.closesAt) > Date.parse(data.opensAt),
    {
      message: "The paper must close after it opens.",
      path: ["closesAt"],
    },
  );

/**
 * A previous-year tag only means something on a public paper: it decides which
 * website list the paper appears on. On an enrolled paper it is dropped.
 */
function withPyqNormalised<Fields extends z.output<typeof testFieldsSchema>>(fields: Fields) {
  return { ...fields, pyq: fields.audience === "public" ? (fields.pyq ?? null) : null };
}

async function lockReason(test: Test): Promise<string | null> {
  return paperLockReason(test, await testService.hasAttempts(test.id));
}

async function assertEditable(testId: string): Promise<void> {
  const reason = await lockReason(await testService.getTest(testId));
  if (reason) throw new AppError(ERROR_CODES.CONFLICT, { message: reason });
}

function revalidatePaper(testId?: string) {
  revalidateLocalizedPath("/admin/tests");
  if (testId) revalidateLocalizedPath(`/admin/tests/${testId}`, "layout");
}

// ─── Papers ──────────────────────────────────────────────────────────────────

export const createTestAction = action(
  roleGuard("FACULTY"),
  testFieldsSchema,
  async (input) => {
    // Always a draft. Publishing is its own step, behind the checks below.
    const test = await testService.createTest({ ...withPyqNormalised(input), status: "draft" });
    revalidatePaper();
    return { id: test.id };
  },
);

export const updateTestAction = action(
  roleGuard("FACULTY"),
  z.object({ testId: id, fields: testFieldsSchema }),
  async ({ testId, fields }) => {
    const current = await testService.getTest(testId);

    const reason = await lockReason(current);

    if (reason) {
      // A paper written before `audience` existed has no field, which means
      // "enrolled" — not a change when the form sends that value back. Likewise
      // a paper stored before times were normalised says `+05:30` where the
      // form now sends the same moment as `Z`.
      const before = {
        ...current,
        audience: current.audience ?? "enrolled",
        opensAt: toUtcIsoOrNull(current.opensAt),
      };
      const after = { ...fields, audience: fields.audience ?? "enrolled" };

      const changed = LOCKED_TEST_FIELDS.some(
        (field) => JSON.stringify(before[field] ?? null) !== JSON.stringify(after[field] ?? null),
      );

      if (changed) {
        throw new AppError(ERROR_CODES.CONFLICT, {
          message: `${reason} The title, subject, batch, closing time and result date can still change.`,
        });
      }
    }

    await testService.updateTest(testId, withPyqNormalised(fields));
    revalidatePaper(testId);
    return { id: testId };
  },
);

export const setTestStatusAction = action(
  roleGuard("FACULTY"),
  z.object({ testId: id, status: z.enum(["draft", "published", "archived"]) }),
  async ({ testId, status }) => {
    const test = await testService.getTest(testId);
    if (test.status === status) return { status };

    if (status === "published") {
      const blocker = publishBlocker(test, await testService.listQuestionsForStaff(testId));
      if (blocker) throw new AppError(ERROR_CODES.CONFLICT, { message: blocker });
    } else if (test.status === "published" && (await testService.hasAttempts(testId))) {
      // A draft or archived paper is invisible to students, and so would be
      // their scorecards for it.
      throw new AppError(ERROR_CODES.CONFLICT, {
        message:
          "Students have already sat this paper. It stays published so they can see their results.",
      });
    }

    await testService.updateTest(testId, { status });
    revalidatePaper(testId);
    return { status };
  },
);

// ─── Questions ───────────────────────────────────────────────────────────────

export const saveQuestionAction = action(
  roleGuard("FACULTY"),
  z.object({
    testId: id,
    questionId: id.nullable(),
    // Parsed below, once the paper ids are known: the client never chooses
    // which papers a question belongs to.
    question: z.record(z.string(), z.unknown()),
  }),
  async ({ testId, questionId, question }) => {
    await assertEditable(testId);

    const existing = questionId ? await testService.getQuestionForStaff(questionId) : null;

    if (existing && !existing.testIds.includes(testId)) {
      throw new AppError(ERROR_CODES.NOT_FOUND);
    }

    // A question shared with another paper is only as editable as that paper.
    if (existing) {
      for (const otherId of existing.testIds) {
        if (otherId !== testId) await assertEditable(otherId);
      }
    }

    const parsed = questionSchema.safeParse({
      ...question,
      testIds: existing ? existing.testIds : [testId],
    });

    if (!parsed.success) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
        fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
      });
    }

    if (!(MCQ_QUESTION_KINDS as readonly string[]).includes(parsed.data.kind)) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
        message: "Only multiple-choice questions can be added to a paper here.",
      });
    }

    let savedId: string;

    if (existing) {
      await testService.updateQuestion(existing.id, parsed.data);
      savedId = existing.id;
    } else {
      savedId = (await testService.createQuestion(parsed.data)).id;
    }

    revalidatePaper(testId);
    return { id: savedId };
  },
);

/**
 * Adds every question in a CSV file to the paper, or none of them.
 *
 * The browser has already parsed and checked the file, but that copy of the
 * check is a courtesy: each row is validated again here against the same
 * schema, and the first bad row refuses the whole import. A half-imported file
 * is worse than none — the faculty member would have to work out which rows
 * landed before trying again.
 */
export const importQuestionsAction = action(
  roleGuard("FACULTY"),
  z.object({
    testId: id,
    publish: z.boolean(),
    rows: z
      .array(z.object({ row: z.number().int().min(2), question: z.record(z.string(), z.unknown()) }))
      .min(1, "The file has no questions.")
      .max(MAX_IMPORT_ROWS, `Import at most ${MAX_IMPORT_ROWS} questions at a time.`),
  }),
  async ({ testId, publish, rows }) => {
    const test = await testService.getTest(testId);
    if (test.kind === "mains-descriptive") {
      throw new AppError(ERROR_CODES.CONFLICT, {
        message: "Mains papers are evaluated by faculty; questions cannot be imported into them.",
      });
    }
    await assertEditable(testId);

    const questions: QuestionDoc[] = [];

    for (const { row, question } of rows) {
      const parsed = questionSchema.safeParse({
        ...question,
        testIds: [testId],
        status: publish ? "published" : "draft",
      });

      if (!parsed.success) {
        throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
          message: `Row ${row}: ${parsed.error.issues[0]?.message ?? "invalid question"}. Nothing was imported.`,
        });
      }

      if (!(MCQ_QUESTION_KINDS as readonly string[]).includes(parsed.data.kind)) {
        throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
          message: `Row ${row}: only multiple-choice questions can be imported. Nothing was imported.`,
        });
      }

      // Images are attached through the edit form, against a path the server
      // issued — never one named in a spreadsheet.
      questions.push({ ...parsed.data, imagePath: null, modelAnswer: null });
    }

    const ids = await testService.createQuestions(questions);
    revalidatePaper(testId);
    return { count: ids.length };
  },
);

/**
 * Publishes every draft question on the paper — typically a CSV import that
 * was brought in as drafts and has since been checked. Archived questions are
 * left alone; they were taken out on purpose.
 */
export const publishDraftQuestionsAction = action(
  roleGuard("FACULTY"),
  z.object({ testId: id }),
  async ({ testId }) => {
    await assertEditable(testId);

    const drafts = (await testService.listQuestionsForStaff(testId)).filter(
      (question) => question.status === "draft",
    );

    // A question shared with another paper is only as editable as that paper.
    const otherPapers = new Set(
      drafts.flatMap((question) => question.testIds).filter((paperId) => paperId !== testId),
    );
    for (const otherId of otherPapers) await assertEditable(otherId);

    await testService.setQuestionsStatus(
      drafts.map((question) => question.id),
      "published",
    );

    revalidatePaper(testId);
    for (const otherId of otherPapers) revalidatePaper(otherId);
    return { count: drafts.length };
  },
);

/**
 * Takes a question off this paper. The question stays in the bank — it may sit
 * on other papers, or be reused later — so nothing is deleted.
 */
export const removeQuestionAction = action(
  roleGuard("FACULTY"),
  z.object({ testId: id, questionId: id }),
  async ({ testId, questionId }) => {
    await assertEditable(testId);

    const question = await testService.getQuestionForStaff(questionId);
    if (!question.testIds.includes(testId)) throw new AppError(ERROR_CODES.NOT_FOUND);

    await testService.setQuestionPapers(
      questionId,
      question.testIds.filter((paperId) => paperId !== testId),
    );

    revalidatePaper(testId);
    return { id: questionId };
  },
);

// ─── Results ─────────────────────────────────────────────────────────────────

export const releaseResultsAction = action(
  roleGuard("FACULTY"),
  z.object({ testId: id }),
  async ({ testId }) => {
    const outcome = await testService.releaseResults(testId);
    revalidatePaper(testId);
    return outcome;
  },
);
