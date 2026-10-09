"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";

import { localizeHref } from "./config";
import { useLocale } from "./I18nProvider";

/**
 * `next/link` that keeps the reader in their language: `href="/courses"`
 * renders `/hi/courses` on the Hindi site and `/courses` on the English one.
 *
 * Without it the link would still land in Hindi — the proxy redirects a bare
 * path to the remembered locale — but only after an extra redirect, and the
 * prefetch would fetch the wrong page.
 *
 * Pass `locale` to link to a specific language (the language switcher does).
 */
export default function Link({
  href,
  locale,
  ...props
}: ComponentProps<typeof NextLink> & { locale?: Parameters<typeof localizeHref>[1] }) {
  const current = useLocale();
  const target = locale ?? current;
  const localized = typeof href === "string" ? localizeHref(href, target) : href;

  return <NextLink href={localized} {...props} />;
}
