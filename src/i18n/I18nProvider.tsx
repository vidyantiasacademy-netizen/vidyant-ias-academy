"use client";

import { createContext, useContext, type ReactNode } from "react";

import { DEFAULT_LOCALE, type Locale } from "./config";
import type { Dictionary } from "./dictionaries";
import { en } from "./dictionaries/en";

interface I18nValue {
  locale: Locale;
  dict: Dictionary;
}

/**
 * English by default, so a client component rendered outside `app/[lang]`
 * (the Sanity Studio, a test) still renders text instead of throwing.
 */
const I18nContext = createContext<I18nValue>({ locale: DEFAULT_LOCALE, dict: en });

/**
 * Hands the locale and its dictionary to Client Components. Mounted once in
 * `app/[lang]/layout.tsx`; the dictionary is UI chrome only, so shipping it to
 * the browser is a few kilobytes.
 */
export function I18nProvider({
  locale,
  dict,
  children,
}: I18nValue & { children: ReactNode }) {
  return <I18nContext.Provider value={{ locale, dict }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}

export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}
