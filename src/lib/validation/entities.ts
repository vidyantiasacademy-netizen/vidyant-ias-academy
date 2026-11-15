import { z } from "zod";

import { toUtcIso } from "@/lib/utils/instant";
import { ACTIVITY_TYPES, PROCTOR_EVENT_TYPES } from "@/types/db";

import { nameField, optionalText, phoneField } from "./schemas";

/**
 * Validation for writes into Firestore.
 *
 * Firestore is schemaless: a service that writes whatever it was handed will
 * happily store `score: "99999"` or a 40 kB string in a field meant for a city
 * name, and nothing complains until a query or an export breaks months later.
 * Every Server Action and Route Handler that writes parses its input through
 * one of these first.
 *
 * TypeScript types in `@/types/db` describe the same shapes, but they are gone
 * at runtime — these are the checks that survive into production.
 */

const id = z.string().min(1).max(128);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD.");
const isoDateTime = z.string().datetime({ offset: true });

/**
 * A stored moment, normalised to UTC. Forms send IST (`+05:30`); storing that
 * as-is is what made text comparisons with server `Z` times five and a half
 * hours wrong. See `lib/utils/instant.ts`.
 */
export const utcInstant = isoDateTime.transform(toUtcIso);

/** Money arrives as rupees from a form and is stored as paise. */
export const moneySchema = z.object({
  amountInPaise: z.number().int().nonnegative().max(100_000_000),
  currency: z.literal("INR"),
});

// ─── Student ─────────────────────────────────────────────────────────────────

export const studentProfileSchema = z.object({
  fullName: nameField,
  phone: phoneField,
  dateOfBirth: isoDate.nullish(),
  city: optionalText(80),
  state: optionalText(80),
  optionalSubject: optionalText(80),
  preparationStage: z
    .enum(["exploring", "beginner", "intermediate", "advanced", "revision"])
    .nullish(),
  attemptsGiven: z.number().int().min(0).max(10),
  targetExamYear: z
    .string()
    .regex(/^20\d{2}$/, "Enter a four-digit year.")
    .nullish(),
});

export type StudentProfileInput = z.infer<typeof studentProfileSchema>;

// ─── Course and lessons ──────────────────────────────────────────────────────

export const courseSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(96)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only."),
  title: z.string().min(2).max(140),
  category: z.enum(["foundation", "prelims", "mains", "optional", "test-series"]),
  modes: z.array(z.enum(["offline", "online-live", "recorded", "hybrid"])).min(1),
  price: moneySchema.nullable(),
  durationMonths: z.number().int().min(1).max(60).nullable(),
  status: z.enum(["draft", "published", "archived"]),
  sanitySlug: z.string().max(96).nullable(),
  facultyUids: z.array(id).max(50),
});

export const lessonSchema = z.object({
  courseId: id,
  batchId: id.nullable(),
  title: z.string().min(2).max(200),
  description: optionalText(500),
  kind: z.enum(["video", "live", "document", "quiz"]),
  order: z.number().int().min(0).max(100_000),
  durationSeconds: z.number().int().min(0).max(86_400).nullable(),
  muxAssetId: z.string().max(200).nullable(),
  storagePath: z.string().max(500).nullable(),
  isFreePreview: z.boolean(),
  status: z.enum(["draft", "published", "archived"]),
  publishedAt: isoDate.nullable(),
});

// ─── Tests and questions ─────────────────────────────────────────────────────

/**
 * Exam-integrity settings on a paper. Bounded rather than free: a
 * `maxFocusLosses` of 500 is indistinguishable from no proctoring, and a typo
 * that disables invigilation on a live paper should be rejected, not stored.
 */
export const examSecuritySchema = z.object({
  requireFullscreen: z.boolean(),
  shuffleQuestions: z.boolean(),
  shuffleOptions: z.boolean(),
  blockCopyPaste: z.boolean(),
  maxFocusLosses: z.number().int().min(0).max(20),
  maxViolationScore: z.number().int().min(1).max(100),
  autoSubmitOnViolation: z.boolean(),
  watermark: z.boolean(),
});

export const testSchema = z.object({
  courseId: id,
  batchId: id.nullable(),
  title: z.string().min(2).max(200),
  kind: z.enum(["prelims-mcq", "mains-descriptive", "csat", "sectional"]),
  subject: z.string().max(80).nullable(),
  questionCount: z.number().int().min(1).max(500),
  totalMarks: z.number().min(1).max(2000),
  durationMinutes: z.number().int().min(5).max(480),
  negativeMarksPerQuestion: z.number().min(0).max(5),
  opensAt: utcInstant.nullable(),
  closesAt: utcInstant.nullable(),
  resultsVisibleFrom: utcInstant.nullable(),
  security: examSecuritySchema.nullable(),
  audience: z.enum(["enrolled", "public"]).optional(),
  status: z.enum(["draft", "published", "archived"]),
});

export const questionSchema = z
  .object({
    testIds: z.array(id).max(50),
    kind: z.enum(["mcq-single", "mcq-multiple", "descriptive"]),
    subject: z.string().min(1, "Add a subject, e.g. Polity.").max(80),
    topic: z.string().max(120).nullable(),
    difficulty: z.enum(["easy", "moderate", "hard"]),
    pyq: z
      .object({
        exam: z.string().min(2).max(120),
        year: z.number().int().min(1950).max(2100),
      })
      .nullable(),
    statement: z.string().min(5, "Write the question.").max(5000),
    imagePath: z.string().max(500).nullable(),
    options: z
      .array(
        z.object({
          id: z.string().min(1).max(8),
          text: z.string().min(1, "Fill in every option, or remove the empty ones.").max(1000),
        }),
      )
      .max(8),
    correctOptionIds: z.array(z.string().min(1).max(8)).max(8),
    modelAnswer: z.string().max(20_000).nullable(),
    explanation: z.string().max(10_000).nullable(),
    marks: z.number().min(0).max(100),
    status: z.enum(["draft", "published", "archived"]),
  })
  .refine(
    (data) =>
      data.kind === "descriptive" ||
      (data.options.length >= 2 && data.correctOptionIds.length >= 1),
    { message: "An MCQ needs at least two options and a marked answer.", path: ["options"] },
  )
  .refine(
    (data) =>
      data.correctOptionIds.every((optionId) =>
        data.options.some((option) => option.id === optionId),
      ),
    { message: "The answer key references an option that does not exist.", path: ["correctOptionIds"] },
  )
  .refine(
    (data) => data.kind !== "mcq-single" || data.correctOptionIds.length === 1,
    { message: "A single-answer MCQ must have exactly one correct option.", path: ["correctOptionIds"] },
  );

// ─── Attempts and answers ────────────────────────────────────────────────────

export const startAttemptSchema = z.object({ testId: id });

/**
 * The window's claim on the attempt, carried by every write during a sitting.
 *
 * Not a secret the student must not see — it is in their own page. It identifies
 * *which* window is writing, so a second one opened on the same paper can be
 * refused instead of both being accepted.
 */
const sessionToken = z.string().length(32).regex(/^[0-9a-f]+$/);

export const saveAnswerSchema = z.object({
  attemptId: id,
  sessionToken,
  questionId: id,
  selectedOptionIds: z.array(z.string().min(1).max(8)).max(8).optional(),
  text: z.string().max(20_000).nullish(),
  answerSheetPath: z.string().max(500).nullish(),
  // Clamped rather than trusted: the client reports it, and an hour on one
  // question would poison the analytics it feeds.
  timeSpentSeconds: z.number().int().min(0).max(3600).optional(),
});

export const submitAttemptSchema = z.object({ attemptId: id, sessionToken });

export const attemptHeartbeatSchema = z.object({ attemptId: id, sessionToken });

export const proctorEventSchema = z.object({
  attemptId: id,
  sessionToken,
  type: z.enum(PROCTOR_EVENT_TYPES),
  // A fixed vocabulary, not a message: this string is written to an evidence log
  // that staff read, and free text from the browser does not belong in one.
  detail: z
    .string()
    .max(60)
    .regex(/^[A-Za-z0-9 +._-]*$/, "Unexpected characters.")
    .nullish(),
  clientTime: isoDateTime.nullish(),
});

export const evaluateAnswerSchema = z.object({
  answerId: id,
  marksAwarded: z.number().min(0).max(100),
  evaluatorNote: z.string().max(5000).nullish(),
});

// ─── Enrollment and payment ──────────────────────────────────────────────────

export const enrollOfflineSchema = z.object({
  studentUid: id,
  courseId: id,
  batchId: id.nullish(),
  startsAt: isoDate,
  endsAt: isoDate.nullish(),
});

export const createOrderSchema = z.object({
  courseId: id,
  batchId: id.nullish(),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(4).max(64),
  razorpayPaymentId: z.string().min(4).max(64),
  razorpaySignature: z.string().length(64, "Expected a 64-character HMAC."),
});

// ─── Doubts, notifications, activity ─────────────────────────────────────────

export const createDoubtSchema = z.object({
  courseId: id.nullish(),
  lessonId: id.nullish(),
  testId: id.nullish(),
  subject: z.string().max(80).nullish(),
  question: z.string().min(10, "Describe your doubt in a sentence or two.").max(2000),
  attachmentPaths: z.array(z.string().max(500)).max(5).optional(),
});

export const answerDoubtSchema = z.object({
  doubtId: id,
  answer: z.string().min(2).max(10_000),
});

export const notifySchema = z.object({
  userUid: id,
  kind: z.enum([
    "announcement",
    "test-scheduled",
    "result-published",
    "doubt-answered",
    "payment",
    "mentorship",
  ]),
  title: z.string().min(2).max(120),
  body: z.string().min(2).max(500),
  // In-app paths only — an absolute URL in a notification is a phishing vector.
  href: z
    .string()
    .max(300)
    .refine((value) => value.startsWith("/") && !value.startsWith("//"), {
      message: "Links must be in-app paths.",
    })
    .nullish(),
});

export const recordActivitySchema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  courseId: id.nullish(),
  lessonId: id.nullish(),
  testId: id.nullish(),
  questionId: id.nullish(),
  durationSeconds: z.number().int().min(0).max(86_400).nullish(),
  meta: z
    .record(z.string().max(60), z.union([z.string().max(300), z.number(), z.boolean(), z.null()]))
    .optional(),
});
