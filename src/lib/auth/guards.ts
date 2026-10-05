import "server-only";

import type { z } from "zod";

import { AppError, ERROR_CODES, toAppError } from "@/lib/errors";

import { requireAuth, requireRole } from "./server";
import type { Role, SessionUser } from "./types";

/**
 * Wrappers that make the authorisation check part of a Server Action's
 * signature instead of its first line.
 *
 * Server Actions are reachable by a direct POST, so "the page already checked"
 * is not a check. Declaring the action as `action(roleGuard("ADMIN"), handler)`
 * means a handler cannot physically be registered without one.
 */

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; message: string; fieldErrors?: Record<string, string[]> };

export interface Guard {
  (): Promise<SessionUser>;
}

export const authGuard: Guard = () => requireAuth();

export const roleGuard =
  (minimum: Role): Guard =>
  () =>
    requireRole(minimum);

/**
 * Builds a Server Action that authorises, validates and never leaks a stack
 * trace to the client.
 *
 * ```ts
 * "use server";
 * export const publishCourse = action(
 *   roleGuard("ADMIN"),
 *   z.object({ courseId: z.string().min(1) }),
 *   async (input, user) => courseService.publish(input.courseId, user.uid),
 * );
 * ```
 */
export function action<Schema extends z.ZodType, Output>(
  guard: Guard,
  schema: Schema,
  handler: (input: z.output<Schema>, user: SessionUser) => Promise<Output>,
) {
  return async (rawInput: unknown): Promise<ActionResult<Output>> => {
    try {
      const user = await guard();
      const parsed = schema.safeParse(rawInput);

      if (!parsed.success) {
        throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
          fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        });
      }

      return { ok: true, data: await handler(parsed.data, user) };
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
