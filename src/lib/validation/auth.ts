import { z } from "zod";

import { ROLES } from "@/types/db";

import { emailField, nameField, phoneField } from "./schemas";

/**
 * Authentication form schemas.
 *
 * Reuses the field primitives from `schemas.ts`, so a phone number entered on
 * the sign-up form is normalised exactly as one entered on the enquiry form —
 * otherwise the same person arrives in `enquiries` as `9876543210` and in
 * `students` as `+91 98765 43210`.
 */

/**
 * Minimum eight characters, with a letter and a digit.
 *
 * No maximum complexity theatre: Firebase Auth rate-limits attempts and
 * enforces its own breach checks, and long opaque rules push students towards
 * reusing a password they already have.
 */
export const passwordField = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "That password is too long.")
  .refine((value) => /[a-zA-Z]/.test(value) && /\d/.test(value), {
    message: "Include at least one letter and one number.",
  });

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Enter your password."),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    fullName: nameField,
    email: emailField,
    phone: phoneField,
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "The passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

export const passwordResetSchema = z.object({ email: emailField });

/** `POST /api/auth/session` body. */
export const sessionRequestSchema = z.object({
  idToken: z.string().min(16).max(4096),
});

/** Role assignment, for the admin staff screen. */
export const setRoleSchema = z.object({
  uid: z.string().min(1).max(128),
  role: z.enum(ROLES),
});

/**
 * `?next=` redirect target.
 *
 * Relative paths only. Accepting an absolute URL here would turn the login page
 * into an open redirect: `/login?next=https://evil.example` after a successful
 * sign-in sends the student, and their trust, elsewhere.
 */
export const redirectTargetSchema = z
  .string()
  .max(512)
  .refine((value) => value.startsWith("/") && !value.startsWith("//"), {
    message: "Invalid redirect target.",
  });

export function safeRedirect(value: string | null | undefined, fallback = "/dashboard") {
  const parsed = redirectTargetSchema.safeParse(value ?? "");
  return parsed.success ? parsed.data : fallback;
}
