import type { Locale } from "../config";

import type { Dictionary } from "./en";

export type { Dictionary } from "./en";

/** Lazy, so a page only loads the dictionary of the locale it renders. */
const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./en").then((module) => module.en),
  hi: () => import("./hi").then((module) => module.hi),
};

export function loadDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}

/** `format("Call {phone}", { phone })` — the only interpolation the UI needs. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
