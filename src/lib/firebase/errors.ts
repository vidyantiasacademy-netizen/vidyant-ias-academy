import { AppError, ERROR_CODES, type ErrorCode } from "@/lib/errors";

/**
 * Firebase error codes → application error codes.
 *
 * Raw Firebase messages are never shown to a user: `auth/user-not-found` versus
 * `auth/wrong-password` tells an attacker which half of a credential pair was
 * right, so both collapse into one neutral message here.
 */

const AUTH_MESSAGES: Record<string, { code: ErrorCode; message: string }> = {
  "auth/invalid-credential": {
    code: ERROR_CODES.VALIDATION_ERROR,
    message: "That email and password combination is incorrect.",
  },
  "auth/invalid-email": {
    code: ERROR_CODES.VALIDATION_ERROR,
    message: "Enter a valid email address.",
  },
  "auth/user-not-found": {
    code: ERROR_CODES.VALIDATION_ERROR,
    message: "That email and password combination is incorrect.",
  },
  "auth/wrong-password": {
    code: ERROR_CODES.VALIDATION_ERROR,
    message: "That email and password combination is incorrect.",
  },
  "auth/email-already-in-use": {
    code: ERROR_CODES.CONFLICT,
    message: "An account already exists for this email. Please sign in instead.",
  },
  "auth/weak-password": {
    code: ERROR_CODES.VALIDATION_ERROR,
    message: "Use a password of at least 8 characters.",
  },
  "auth/too-many-requests": {
    code: ERROR_CODES.RATE_LIMITED,
    message: "Too many attempts. Please try again in a few minutes.",
  },
  "auth/user-disabled": {
    code: ERROR_CODES.FORBIDDEN,
    message: "This account has been deactivated. Please contact the centre.",
  },
  "auth/popup-closed-by-user": {
    code: ERROR_CODES.VALIDATION_ERROR,
    message: "Sign-in was cancelled.",
  },
  "auth/account-exists-with-different-credential": {
    code: ERROR_CODES.CONFLICT,
    message: "This email is already registered with a different sign-in method.",
  },
  "auth/operation-not-allowed": {
    code: ERROR_CODES.CONFIG_ERROR,
    message: "This sign-in method is not enabled yet.",
  },
  // Google verification popup (the free mock and PYQ tests).
  "auth/popup-blocked": {
    code: ERROR_CODES.VALIDATION_ERROR,
    message: "Your browser blocked the Google window. Allow pop-ups for this site and try again.",
  },
  "auth/cancelled-popup-request": {
    code: ERROR_CODES.VALIDATION_ERROR,
    message: "Sign-in was cancelled.",
  },
  "auth/network-request-failed": {
    code: ERROR_CODES.INTERNAL_ERROR,
    message: "Network problem. Check your connection and try again.",
  },
};

const FIRESTORE_CODES: Record<string, ErrorCode> = {
  "permission-denied": ERROR_CODES.FORBIDDEN,
  unauthenticated: ERROR_CODES.AUTH_REQUIRED,
  "not-found": ERROR_CODES.NOT_FOUND,
  "already-exists": ERROR_CODES.CONFLICT,
  "invalid-argument": ERROR_CODES.VALIDATION_ERROR,
  "failed-precondition": ERROR_CODES.CONFLICT,
  "resource-exhausted": ERROR_CODES.RATE_LIMITED,
  "deadline-exceeded": ERROR_CODES.INTERNAL_ERROR,
  unavailable: ERROR_CODES.INTERNAL_ERROR,
};

function errorCodeOf(error: unknown): string | null {
  if (error && typeof error === "object" && "code" in error) {
    const { code } = error as { code: unknown };
    if (typeof code === "string") return code;
  }

  return null;
}

/** Wraps anything the Firebase SDKs throw in an `AppError`. */
export function toFirebaseAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const code = errorCodeOf(error);

  if (code) {
    const auth = AUTH_MESSAGES[code];
    if (auth) {
      return new AppError(auth.code, { message: auth.message, cause: error });
    }

    const firestore = FIRESTORE_CODES[code.replace(/^firestore\//, "")];
    if (firestore) return new AppError(firestore, { cause: error });
  }

  console.error("[firebase]", error);
  return new AppError(ERROR_CODES.INTERNAL_ERROR, { cause: error });
}
