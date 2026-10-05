"use server";

import { headers } from "next/headers";

import { authGuard, action } from "@/lib/auth/guards";
import {
  attemptHeartbeatSchema,
  proctorEventSchema,
  saveAnswerSchema,
  startAttemptSchema,
  submitAttemptSchema,
} from "@/lib/validation/entities";
import { testService } from "@/services/tests/test.service";

/**
 * The exam runner's whole server surface.
 *
 * Every one of these is reachable by a direct POST without the page ever being
 * rendered, which is exactly how a student would try to cheat: submit an answer
 * after the deadline, beat the heartbeat from a script while sitting in another
 * window, suppress a violation report. So each goes through `action()` —
 * authorise, then parse — and then through `testService`, which re-checks
 * ownership, the session token and the clock on every call. Nothing here trusts
 * an argument; `attemptId` and `sessionToken` are claims to be verified, not
 * credentials.
 */

export const openExamAction = action(
  authGuard,
  startAttemptSchema,
  async ({ testId }) => testService.openExam(testId),
);

export const saveAnswerAction = action(authGuard, saveAnswerSchema, async (input) => {
  await testService.saveAnswer(input);
  return { saved: true } as const;
});

export const heartbeatAction = action(
  authGuard,
  attemptHeartbeatSchema,
  async (input) => testService.heartbeat(input),
);

export const reportProctorEventAction = action(
  authGuard,
  proctorEventSchema,
  async (input) => {
    // Taken from the request rather than the argument: a client that is
    // misreporting its own events has no reason to report its own user agent
    // honestly either, and this one at least matches the connection.
    const userAgent = (await headers()).get("user-agent");

    return testService.recordProctorEvent({ ...input, userAgent });
  },
);

export const submitExamAction = action(
  authGuard,
  submitAttemptSchema,
  async (input) => {
    const result = await testService.submitAttempt(input);

    // The scorecard is fetched by the result page, which re-checks
    // `publishedAt`. Returning only whether one exists keeps this action from
    // becoming a second, unguarded way to read a score early.
    return { scored: result !== null } as const;
  },
);
