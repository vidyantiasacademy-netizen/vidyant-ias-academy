import { defineField, type SlugIsUniqueValidator } from "sanity";

import { DEFAULT_LOCALE, LOCALES, LOCALE_META } from "../../src/i18n/config";

/**
 * Localisation building blocks for the schema.
 *
 * Two strategies, chosen per type:
 *
 * - **Document-level** for editorial content (blog, current affairs, courses,
 *   faculty, FAQs…). Each language is its own document carrying a `language`
 *   field; `@sanity/document-internationalization` links the versions through a
 *   `translation.metadata` document and adds the language switcher to the
 *   editor. Translations share the slug, so `/blog/x` and `/hi/blog/x` are the
 *   same article.
 * - **Field-level** for taxonomy (categories, subjects, tags). A label is a
 *   few words, and one document per language would make every reference pick a
 *   language too. The English `title` stays the source; `titleI18n.hi` sits
 *   beside it and falls back to it when empty.
 */

/** Document types translated one document per language. */
export const TRANSLATED_DOCUMENT_TYPES = [
  "blog",
  "currentAffair",
  "announcement",
  "faculty",
  "course",
  "demoClass",
  "freeResource",
  "studyNote",
  "faq",
] as const;

export const SUPPORTED_LANGUAGES = LOCALES.map((id) => ({
  id,
  title: LOCALE_META[id].label,
}));

/**
 * The field the plugin reads and writes. Hidden and read-only: the plugin sets
 * it when a translation is created, and an editor changing it by hand would
 * orphan the document from its translations.
 *
 * Documents created before localisation have no value; queries treat a missing
 * `language` as the default locale, so they keep working as English.
 */
export const languageField = defineField({
  name: "language",
  type: "string",
  readOnly: true,
  hidden: true,
  initialValue: DEFAULT_LOCALE,
});

/**
 * Slug uniqueness within one language. The default validator is per type,
 * which would reject the Hindi translation of a post for reusing the English
 * slug — the thing translations are meant to do.
 */
export const isUniquePerLanguage: SlugIsUniqueValidator = async (slug, context) => {
  const { document, getClient } = context;
  if (!document) return true;

  const id = document._id.replace(/^drafts\./, "");
  const language = (document.language as string | undefined) ?? DEFAULT_LOCALE;

  return getClient({ apiVersion: "2025-02-19" }).fetch<boolean>(
    `!defined(*[
      !(_id in [$draft, $published])
      && _type == $type
      && slug.current == $slug
      && coalesce(language, $defaultLocale) == $language
    ][0]._id)`,
    {
      draft: `drafts.${id}`,
      published: id,
      type: document._type,
      slug,
      language,
      defaultLocale: DEFAULT_LOCALE,
    },
  );
};

/**
 * Field-level translations of a short string: `{ hi: "…" }` beside the English
 * field it translates. Optional — an empty translation falls back to English.
 */
export function translationsOf(field: string, title: string) {
  return defineField({
    name: `${field}I18n`,
    title: `${title} — translations`,
    type: "object",
    options: { collapsible: true, collapsed: true },
    fields: LOCALES.filter((locale) => locale !== DEFAULT_LOCALE).map((locale) =>
      defineField({ name: locale, title: LOCALE_META[locale].label, type: "string" }),
    ),
  });
}
