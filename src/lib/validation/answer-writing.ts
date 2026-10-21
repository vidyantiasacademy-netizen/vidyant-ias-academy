import { z } from "zod";

import { MAX_ANSWER_FILES } from "@/lib/answer-writing/policy";
import { RUBRIC_MAX } from "@/lib/answer-writing/rubric";
import { UPLOAD_LIMITS } from "@/lib/cloudinary/media-paths";

import { utcInstant } from "./entities";

/**
 * Validation for Mains answer writing — the paper settings faculty author, the
 * pages a student registers, and the evaluation an evaluator saves.
 *
 * Shape only. Whether a reference really sits in this student's folder, whether
 * the window is open and whether marks fit the scheme are judged by
 * `answerWritingService`, which has the paper in hand.
 */

const id = z.string().min(1).max(128);
const mediaRef = z.string().min(5).max(500);

/** Empty strings from a form become `null`, so "no remark" is stored one way. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Please use ${max} characters or fewer.`)
    .nullable()
    .transform((value) => value || null);

/** Quarter marks are the finest an evaluator awards; the sum stays exact in binary. */
const marks = z.number().min(0).max(100).multipleOf(0.25, "Use steps of 0.25 marks.");

export const MAX_SCHEME_QUESTIONS = 50;

export const markingSchemeSchema = z
  .array(
    z.object({
      label: z.string().trim().min(1, "Label every question, e.g. Q1.").max(16),
      maxMarks: marks.refine((value) => value > 0, "Every question needs marks above zero."),
      wordLimit: z.number().int().min(10).max(5000).nullable(),
    }),
  )
  .min(1, "Add at least one question.")
  .max(MAX_SCHEME_QUESTIONS, `A paper can have at most ${MAX_SCHEME_QUESTIONS} questions.`)
  .refine(
    (scheme) => new Set(scheme.map((slot) => slot.label.toLowerCase())).size === scheme.length,
    "Each question needs its own label.",
  );

/** The settings a faculty member authors. Kind, counts and totals are derived. */
export const mainsPaperSchema = z
  .object({
    courseId: id,
    title: z.string().trim().min(2, "Give the paper a title.").max(200),
    subject: z.string().trim().max(80).nullable().transform((value) => value || null),
    durationMinutes: z.number().int().min(5).max(480),
    opensAt: utcInstant.nullable(),
    closesAt: utcInstant.nullable(),
    resultsVisibleFrom: utcInstant.nullable(),
    markingScheme: markingSchemeSchema,
  })
  .refine(
    (data) => !data.opensAt || !data.closesAt || Date.parse(data.closesAt) > Date.parse(data.opensAt),
    { message: "The deadline must be after the paper opens.", path: ["closesAt"] },
  );

export type MainsPaperInput = z.output<typeof mainsPaperSchema>;

// ─── Student ─────────────────────────────────────────────────────────────────

export const paperIdSchema = z.object({ testId: id });

export const addAnswerFileSchema = z.object({
  testId: id,
  path: mediaRef,
  // The device's name for the file, shown back to the student. Never a path.
  name: z.string().trim().min(1).max(120),
  bytes: z.number().int().min(1).max(UPLOAD_LIMITS.answerSheet.maxBytes),
});

export const removeAnswerFileSchema = z.object({ testId: id, path: mediaRef });

export const reorderAnswerFilesSchema = z.object({
  testId: id,
  paths: z.array(mediaRef).min(1).max(MAX_ANSWER_FILES),
});

// ─── Evaluation ──────────────────────────────────────────────────────────────

export const copyIdSchema = z.object({ testId: id, studentUid: id });

const rubricScore = z.number().int().min(1).max(RUBRIC_MAX).nullable();

export const evaluationSchema = z.object({
  testId: id,
  studentUid: id,
  // Aligned by index with the paper's marking scheme. Labels and maximums are
  // taken from the scheme on the server, never from this array.
  questions: z
    .array(
      z.object({
        attempted: z.boolean(),
        marksAwarded: marks.nullable(),
        remark: optionalText(1000),
      }),
    )
    .max(MAX_SCHEME_QUESTIONS),
  rubric: z.object({
    demand: rubricScore,
    content: rubricScore,
    structure: rubricScore,
    presentation: rubricScore,
    language: rubricScore,
  }),
  strengths: optionalText(2000),
  improvements: optionalText(2000),
  remarks: optionalText(4000),
  checkedCopyPath: mediaRef.nullable(),
  /** False saves a draft the student cannot see; true completes the evaluation. */
  complete: z.boolean(),
});

export type EvaluationInput = z.output<typeof evaluationSchema>;
