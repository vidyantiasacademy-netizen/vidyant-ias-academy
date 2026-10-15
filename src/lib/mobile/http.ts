import "server-only";

import { NextResponse } from "next/server";
import type { z } from "zod";

import { requireAuth } from "@/lib/auth/server";
import { AppError, ERROR_CODES, toAppError } from "@/lib/errors";
import { isAdminConfigured } from "@/lib/firebase/admin";

/**
 * The plumbing every `/api/mobile/v1` route shares.
 *
 * Each route is a thin adapter: authenticate (the bearer token, via the same
 * `getSession()` the website uses), validate, call a service, wrap the result
 * in the `ApiResponse` envelope. Authorisation itself stays inside the services
 * — a route handler is reachable by anyone with an HTTP client, so the checks
 * must live where every caller passes through them.
 *
 * Responses are `no-store`: they are per-student, and a shared cache or a
 * proxy keeping one student's dashboard for the next is the leak to avoid.
 */

const NO_STORE = { "Cache-Control": "private, no-store" } as const;

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status, headers: NO_STORE });
}

export function fail(error: unknown) {
  const appError = toAppError(error);
  return NextResponse.json(appError.toJSON(), {
    status: appError.status,
    headers: NO_STORE,
  });
}

/**
 * Wraps a handler: requires a signed-in caller before any work, then converts
 * whatever is thrown into the error envelope. Vendor errors never reach the app.
 */
export function mobileRoute<Ctx>(
  handler: (request: Request, context: Ctx) => Promise<Response>,
) {
  return async (request: Request, context: Ctx): Promise<Response> => {
    try {
      if (!isAdminConfigured()) {
        throw new AppError(ERROR_CODES.CONFIG_ERROR, {
          message: "The service is not available yet.",
        });
      }

      await requireAuth();
      return await handler(request, context);
    } catch (error) {
      return fail(error);
    }
  };
}

/** Parses a JSON body against a schema, as a `VALIDATION_ERROR` on failure. */
export async function parseBody<Schema extends z.ZodType>(
  request: Request,
  schema: Schema,
  extra: Record<string, unknown> = {},
): Promise<z.output<Schema>> {
  const raw = await request.json().catch(() => null);
  const input = raw && typeof raw === "object" ? { ...raw, ...extra } : extra;

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    });
  }

  return parsed.data;
}

/** Validates a path segment the same way `entities.ts` validates an id. */
export function pathId(value: string | undefined): string {
  if (!value || value.length > 128 || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new AppError(ERROR_CODES.NOT_FOUND);
  }
  return value;
}
