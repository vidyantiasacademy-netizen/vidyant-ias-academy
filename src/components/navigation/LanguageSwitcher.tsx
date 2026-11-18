"use client";

import { Languages } from "lucide-react";

import { LOCALES, LOCALE_META, type Locale } from "@/i18n/config";
import { format } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/I18nProvider";
import { usePathnameWithoutLocale } from "@/i18n/usePathnameWithoutLocale";
import { cn } from "@/lib/utils/cn";

/**
 * Switches the current page to the other language.
 *
 * A plain `<a>`, not `next/link`: changing language swaps the root layout
 * (`<html lang>`, the dictionary), which wants a full document load. English
 * links to `/en/...` on purpose — the proxy collapses it to the bare path and
 * resets the remembered-locale cookie on the way, which a bare link could not
 * do while that cookie still says Hindi.
 */
export function LanguageSwitcher({
  className,
  labelClassName,
  onNavigate,
  onDark = false,
}: {
  className?: string;
  /** On the navy header bar: white text, a translucent hover. */
  onDark?: boolean;
  /** e.g. `sr-only xl:not-sr-only` to collapse to the icon on a tight bar. */
  labelClassName?: string;
  onNavigate?: () => void;
}) {
  const { locale, dict } = useI18n();
  const pathname = usePathnameWithoutLocale();
  const targets = LOCALES.filter((l) => l !== locale);

  return (
    <ul aria-label={dict.language.label} className={cn("flex items-center gap-1", className)}>
      {targets.map((target) => (
        <li key={target}>
          <a
            href={switchHref(pathname, target)}
            hrefLang={LOCALE_META[target].htmlLang}
            lang={LOCALE_META[target].htmlLang}
            onClick={onNavigate}
            title={format(dict.language.switchTo, { language: LOCALE_META[target].nativeLabel })}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 px-2.5 text-small font-bold transition-colors",
              onDark ? "text-white hover:text-kesar" : "text-ink hover:bg-indigo hover:text-white",
            )}
          >
            <Languages aria-hidden className="size-4" />
            <span className={labelClassName}>{LOCALE_META[target].nativeLabel}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Always prefixed, including English — see the note above. */
function switchHref(pathname: string, target: Locale) {
  return `/${target}${pathname === "/" ? "" : pathname}`;
}
