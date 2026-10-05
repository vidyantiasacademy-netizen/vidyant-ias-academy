import type { Entity, IsoDate, IsoDateTime, Uid } from "./common";

/**
 * Roles, ordered least → most privileged. The numeric rank in
 * `lib/auth/roles.ts` is derived from this order, so inserting a role in the
 * middle changes authorisation — append instead, or update the rules too.
 */
export const ROLES = [
  "STUDENT",
  "MENTOR",
  "FACULTY",
  "COUNSELLOR",
  "ADMIN",
  "SUPER_ADMIN",
] as const;

export type Role = (typeof ROLES)[number];

/**
 * `users/{uid}` — the account. One per Firebase Auth user, for every role.
 *
 * `role` is mirrored into a Firebase Auth custom claim so Firestore Security
 * Rules and the session cookie can authorise without a document read. The
 * document is the source of truth; the claim is a cache. Only
 * `userService.setRole()` writes either, and it writes both.
 */
export interface UserDoc {
  uid: Uid;
  role: Role;
  email: string | null;
  /** 10-digit Indian mobile, no country code. Matches the lead pipeline. */
  phone: string | null;
  displayName: string;
  /** Cloudinary media reference for the profile photograph, never a URL. */
  photoPath: string | null;
  /** Set false to revoke access without deleting history. */
  isActive: boolean;
  lastLoginAt: IsoDateTime | null;
}

export type User = Entity<UserDoc>;

export type PreparationStage =
  | "exploring"
  | "beginner"
  | "intermediate"
  | "advanced"
  | "revision";

/**
 * `students/{uid}` — the learner profile. Deliberately keyed by the same uid as
 * `users`, so a student is one read and never needs a `where` query.
 *
 * Attempts, answers, results and notifications are NOT embedded here: they are
 * unbounded and would blow past the 1 MiB document limit within a year.
 */
export interface StudentDoc {
  uid: Uid;
  /** Human-facing roll number, e.g. `VID-2026-0041`. Unique, admin-assigned. */
  rollNumber: string | null;
  fullName: string;
  phone: string;
  email: string | null;
  dateOfBirth: IsoDate | null;
  city: string | null;
  state: string | null;
  optionalSubject: string | null;
  preparationStage: PreparationStage | null;
  attemptsGiven: number;
  targetExamYear: string | null;
  /** Denormalised for the portal header; authoritative data is in enrollments. */
  activeEnrollmentIds: string[];
  /** Uid of the assigned mentor, if mentorship is part of the programme. */
  mentorUid: Uid | null;
  notes: string | null;
}

export type Student = Entity<StudentDoc>;

/** `faculty/{uid}` — teaching staff. Public bio/photo live in Sanity, not here. */
export interface FacultyDoc {
  uid: Uid;
  fullName: string;
  designation: string;
  subjects: string[];
  /** Slug of the matching `faculty` document in Sanity, for the public page. */
  sanitySlug: string | null;
  /** Course ids this member may author tests and lessons for. */
  courseIds: string[];
  isActive: boolean;
}

export type Faculty = Entity<FacultyDoc>;
