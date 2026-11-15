"use server";

import { action, authGuard } from "@/lib/auth/guards";
import {
  addAnswerFileSchema,
  paperIdSchema,
  removeAnswerFileSchema,
  reorderAnswerFilesSchema,
} from "@/lib/validation/answer-writing";
import { answerWritingService } from "@/services/answer-writing/answer-writing.service";

/**
 * The student's answer-writing surface.
 *
 * Each is reachable by a direct POST, so none trusts its argument: the service
 * re-derives the copy from the caller's own uid, re-checks the paper's window
 * and the copy's state inside a transaction, and checks that an uploaded file's
 * reference sits in the caller's own folder for this paper.
 */

export const addAnswerFileAction = action(authGuard, addAnswerFileSchema, async (input) => ({
  files: await answerWritingService.addOwnFile(input),
}));

export const removeAnswerFileAction = action(authGuard, removeAnswerFileSchema, async (input) => ({
  files: await answerWritingService.removeOwnFile(input),
}));

export const reorderAnswerFilesAction = action(authGuard, reorderAnswerFilesSchema, async (input) => ({
  files: await answerWritingService.reorderOwnFiles(input),
}));

export const submitAnswerCopyAction = action(authGuard, paperIdSchema, async ({ testId }) => {
  await answerWritingService.submitOwn(testId);
  return { submitted: true } as const;
});

export const withdrawAnswerCopyAction = action(authGuard, paperIdSchema, async ({ testId }) => {
  await answerWritingService.withdrawOwn(testId);
  return { withdrawn: true } as const;
});
