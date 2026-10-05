/**
 * Application-level errors.
 *
 * Nothing outside `lib/firebase` and `lib/sanity` should ever throw or surface a
 * vendor error: the SDK message leaks implementation detail (and sometimes the
 * project id) to the browser. Wrap it in an `AppError` with a stable code, and
 * let the UI decide what to show for that code.
 */

export const ERROR_CODES = {
  AUTH_REQUIRED: "AUTH_REQUIRED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  CONFIG_ERROR: "CONFIG_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

const HTTP_STATUS: Record<ErrorCode, number> = {
  AUTH_REQUIRED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  PAYMENT_FAILED: 402,
  CONFIG_ERROR: 500,
  INTERNAL_ERROR: 500,
};

/** Safe to render to any user. Never include ids, emails or vendor text here. */
const DEFAULT_MESSAGE: Record<ErrorCode, string> = {
  AUTH_REQUIRED: "Please sign in to continue.",
  FORBIDDEN: "You do not have access to this.",
  NOT_FOUND: "We could not find what you were looking for.",
  VALIDATION_ERROR: "Please check the details you entered.",
  CONFLICT: "This has already been done.",
  RATE_LIMITED: "Too many attempts. Please try again in a few minutes.",
  PAYMENT_FAILED: "The payment could not be completed.",
  CONFIG_ERROR: "This feature is not configured yet.",
  INTERNAL_ERROR: "Something went wrong. Please try again.",
};

export interface AppErrorOptions {
  /** Message shown to the user. Defaults to a generic line for the code. */
  message?: string;
  /** Field-level detail for `VALIDATION_ERROR`, keyed by field path. */
  fieldErrors?: Record<string, string[]>;
  /** Original error. Logged server-side, never serialised to the client. */
  cause?: unknown;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(code: ErrorCode, options: AppErrorOptions = {}) {
    super(options.message ?? DEFAULT_MESSAGE[code], { cause: options.cause });
    this.name = "AppError";
    this.code = code;
    this.status = HTTP_STATUS[code];
    this.fieldErrors = options.fieldErrors;
  }

  /** The only shape that may cross the network. */
  toJSON() {
    return {
      ok: false as const,
      error: this.code,
      message: this.message,
      ...(this.fieldErrors ? { fieldErrors: this.fieldErrors } : {}),
    };
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Last line of defence. Converts anything thrown into an `AppError` and logs the
 * original server-side so the cause is not lost.
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error;

  console.error("[unhandled]", error);
  return new AppError(ERROR_CODES.INTERNAL_ERROR, { cause: error });
}
