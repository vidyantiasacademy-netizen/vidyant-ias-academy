import "server-only";

import { revalidatePath } from "next/cache";

import { LOCALES } from "./config";

/**
 * `revalidatePath` for a locale-free path, in every locale.
 *
 * Pages render under `app/[lang]`, so `/admin/courses` is cached as
 * `/en/admin/courses` and `/hi/admin/courses`. A bare `revalidatePath("/admin/courses")`
 * matches neither.
 */
export function revalidateLocalizedPath(path: string, type?: "layout" | "page") {
  for (const locale of LOCALES) {
    revalidatePath(`/${locale}${path === "/" ? "" : path}`, type);
  }
}
