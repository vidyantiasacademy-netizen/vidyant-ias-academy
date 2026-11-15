"use client";

import { useSyncExternalStore } from "react";

import type { Course, CourseCategory } from "@/types";

/**
 * The student's preparation stage, picked once in the homepage hero and kept
 * in the browser. The hero, the Programs shelf and the hero form all read it,
 * so one tap tailors the whole first screen and the programme list under it.
 */
export type StageId = "starting" | "working" | "prelims" | "mains";

/** Categories that fit each stage, best fit first. */
export const STAGE_CATEGORIES: Record<StageId, CourseCategory[]> = {
  starting: ["foundation"],
  working: ["foundation"],
  prelims: ["prelims", "test-series"],
  mains: ["mains", "optional"],
};

const STORAGE_KEY = "vi:prep-stage";
/** Same-tab change signal; `storage` only fires in other tabs. */
const CHANGE_EVENT = "vi:prep-stage-change";

export function isStageId(value: unknown): value is StageId {
  return typeof value === "string" && value in STAGE_CATEGORIES;
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

// Storage can throw (private mode, blocked site data); the stage then lives
// only for this page view, in `memoryStage`.
let memoryStage: StageId | null = null;

function readStage(): StageId | null {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isStageId(saved)) return saved;
  } catch {
    // fall through to the in-memory value
  }
  return memoryStage;
}

export function setPrepStage(stage: StageId) {
  memoryStage = stage;
  try {
    window.localStorage.setItem(STORAGE_KEY, stage);
  } catch {
    // Not remembered across visits; this page view still updates.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** The stored stage: null on the server and during hydration, then the saved value. */
export function usePrepStage(): StageId | null {
  return useSyncExternalStore(subscribe, readStage, () => null);
}

/** The first course in the stage's best-fit category, if the catalogue has one. */
export function recommendCourse(stage: StageId, courses: Course[]) {
  for (const category of STAGE_CATEGORIES[stage]) {
    const course = courses.find((c) => c.category === category);
    if (course) return { course, category };
  }
  return null;
}
