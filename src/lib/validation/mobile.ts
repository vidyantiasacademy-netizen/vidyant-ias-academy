import { z } from "zod";

import { BOOKMARK_KINDS } from "@/types/db";

/**
 * Request bodies of `/api/mobile/v1`. The exam writes reuse the website's
 * schemas in `entities.ts` unchanged — one paper, one set of rules, whichever
 * device it is sat on.
 */

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => (value ? value : null));

export const profilePatchSchema = z
  .object({
    fullName: z.string().trim().min(2).max(80),
    city: nullableText(80),
    state: nullableText(80),
    optionalSubject: nullableText(80),
    preparationStage: z
      .enum(["exploring", "beginner", "intermediate", "advanced", "revision"])
      .nullable(),
    targetExamYear: z
      .string()
      .regex(/^20\d{2}$/, "Use a four-digit year.")
      .nullable(),
    attemptsGiven: z.number().int().min(0).max(10),
  })
  .partial()
  .strict();

export const lessonProgressSchema = z.object({
  positionSeconds: z.number().min(0).max(86_400),
  durationSeconds: z.number().min(0).max(86_400).nullish(),
  completed: z.boolean().optional(),
});

export const addBookmarkSchema = z.object({
  kind: z.enum(BOOKMARK_KINDS),
  refId: z.string().regex(/^[A-Za-z0-9_-]{1,200}$/),
  title: z.string().trim().min(1).max(200),
  subtitle: nullableText(200),
});

export const removeBookmarkSchema = addBookmarkSchema.pick({ kind: true, refId: true });

export const registerDeviceSchema = z.object({
  installationId: z.string().regex(/^[A-Za-z0-9-]{8,64}$/),
  platform: z.enum(["ios", "android"]),
  token: z
    .string()
    .max(200)
    .regex(/^(?:Exponent|Expo)PushToken\[[A-Za-z0-9_-]+\]$/, "Unexpected push token."),
  appVersion: z.string().max(20).nullish(),
});

export const supportRequestSchema = z.object({
  topic: z.enum(["courses", "tests", "app", "payments", "other"]),
  message: z
    .string()
    .trim()
    .min(10, "Please tell us a little more.")
    .max(800, "Please use 800 characters or fewer."),
});

export const deletionRequestSchema = z.object({
  reason: nullableText(500),
});

/** The app reports only the events a phone can actually observe. */
export const MOBILE_PROCTOR_EVENTS = ["focusLoss", "focusRestored", "networkLoss"] as const;
