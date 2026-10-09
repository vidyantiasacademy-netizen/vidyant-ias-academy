import { notFound } from "next/navigation";
import { lang } from "next/root-params";

import { isLocale, type Locale } from "./config";
import { loadDictionary, type Dictionary } from "./dictionaries";

/**
 * The locale of the current request, read from the `[lang]` root segment.
 *
 * Works in any Server Component, layout, page or `generateMetadata` without
 * prop drilling. Not available in Client Components (use `useLocale()`), Server
 * Actions or Route Handlers — the `next/root-params` import fails the build if
 * this file is pulled into a client bundle.
 */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!isLocale(value)) notFound();
  return value;
}

export async function getDictionary(): Promise<Dictionary> {
  return loadDictionary(await getLocale());
}
