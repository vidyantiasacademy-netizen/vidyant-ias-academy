"use server";

import { headers } from "next/headers";
import { z } from "zod";

import type { ActionResult } from "@/lib/auth/guards";
import { AppError, ERROR_CODES, toAppError } from "@/lib/errors";
import { pruneRateLimitWindows, rateLimit } from "@/lib/leads/rate-limit";
import { mockTestRegistrationSchema } from "@/lib/validation/schemas";
import { mockTestService } from "@/services/mock-tests/mock-test.service";

import { readAttemptToken, writeAttemptToken } from "./access";
import { verifiedEmailFromToken } from "./account-verification";
import type { MockState } from "./types";

/**
 * The free mock test's server surface.
 *
 * These are public — a visitor has no session — so the guard that
 * `lib/auth/guards.action()` would supply is replaced by two others: the
 * registration is rate-limited per IP, honeypotted like every public form and
 * needs a Google sign-in (`account-verification.ts`) — one sitting per account,
 * and every later call is authorised by the attempt token in the visitor's
 * httpOnly cookie, read here and checked inside `mockTestService`. The
 * attempt id in the arguments is a claim; the cookie is the proof.
 */

/** `action()` without the session guard: validates, and never leaks a stack trace. */
function publicAction<Schema extends z.ZodType, Output>(
  schema: Schema,
  handler: (input: z.output<Schema>) => Promise<Output>,
) {
  return async (rawInput: unknown): Promise<ActionResult<Output>> => {
    try {
      const parsed = schema.safeParse(rawInput);

      if (!parsed.success) {
        throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
          fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        });
      }

      return { ok: true, data: await handler(parsed.data) };
    } catch (error) {
      const appError = toAppError(error);

      return {
        ok: false,
        error: appError.code,
        message: appError.message,
        ...(appError.fieldErrors ? { fieldErrors: appError.fieldErrors } : {}),
      };
    }
  };
}

/** Minted by Firestore, so always alphanumeric. */
const attemptId = z.string().regex(/^[A-Za-z0-9]{1,64}$/);

/**
 * Paper and question ids. Usually Firestore's own, but seeded and imported
 * documents carry readable ids such as `sample-pyq-test-01-q01`. Never a `/`,
 * so an id cannot reach outside its collection.
 */
const docId = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);

/** questionId → selected option ids. Sized for the largest paper the authoring form allows. */
const answerSheet = z
  .record(docId, z.array(z.string().min(1).max(8)).max(8))
  .refine((sheet) => Object.keys(sheet).length <= 500, "Too many answers.");

export const registerForMockAction = publicAction(
  mockTestRegistrationSchema.extend({
    testId: docId,
    /** Firebase ID token from the Google popup — the account the sitting belongs to. */
    googleToken: z.string().min(1).max(4096),
    page: z.string().max(200).optional(),
    source: z.string().max(80).optional(),
    campaign: z.string().max(120).optional(),
    referrer: z.string().max(500).optional(),
  }),
  async ({ honeypot, testId, googleToken, page, source, campaign, referrer, ...details }) => {
    // Filled honeypot: pretend success without creating anything, as `/api/leads` does.
    if (honeypot) return { attemptId: "ignored" };

    pruneRateLimitWindows();
    const requestHeaders = await headers();
    const ip =
      requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      requestHeaders.get("x-real-ip") ??
      "unknown";

    const limit = rateLimit(`mock:${ip}`);
    if (!limit.allowed) throw new AppError(ERROR_CODES.RATE_LIMITED);

    // The sitting belongs to the Google account that signed in, never to a
    // typed detail: otherwise any made-up number bought another attempt.
    const email = await verifiedEmailFromToken(googleToken);

    const { attemptId: id, token } = await mockTestService.register(
      {
        testId,
        name: details.name,
        phone: details.phone,
        email,
        targetAttempt: details.targetAttempt || null,
      },
      { page, source, campaign, referrer },
    );

    await writeAttemptToken(id, token);
    return { attemptId: id };
  },
);

export const beginMockAction = publicAction(
  z.object({ attemptId }),
  async (input): Promise<MockState> =>
    mockTestService.begin(input.attemptId, await readAttemptToken(input.attemptId)),
);

export const saveMockAnswersAction = publicAction(
  z.object({ attemptId, answers: answerSheet }),
  async (input) =>
    mockTestService.saveAnswers(
      input.attemptId,
      await readAttemptToken(input.attemptId),
      input.answers,
    ),
);

export const submitMockAction = publicAction(
  z.object({ attemptId, answers: answerSheet }),
  async (input) => {
    await mockTestService.submit(
      input.attemptId,
      await readAttemptToken(input.attemptId),
      input.answers,
    );
    return null;
  },
);
