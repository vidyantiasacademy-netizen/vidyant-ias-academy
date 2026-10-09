"use client";

import { usePathname } from "next/navigation";

import { splitLocale } from "./config";

/**
 * `usePathname()` with the locale prefix removed: `/hi/courses` → `/courses`.
 * Active-link checks compare against `ROUTES`, which are locale-free.
 */
export function usePathnameWithoutLocale(): string {
  return splitLocale(usePathname()).pathname;
}
