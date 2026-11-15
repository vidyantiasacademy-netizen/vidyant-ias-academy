import type { StructureBuilder, StructureResolver } from "sanity/structure";

import { DEFAULT_LOCALE } from "../src/i18n/config";

import { SUPPORTED_LANGUAGES } from "./schemas/i18n";

/**
 * A translated type, split by language: "All", then one list per language.
 *
 * Documents from before localisation have no `language`; they count as the
 * default locale on the site, so the English list includes them too.
 */
function byLanguage(
  S: StructureBuilder,
  type: string,
  title: string,
  ordering?: { field: string; direction: "asc" | "desc" },
) {
  const list = (filter: string, params: Record<string, string>, listTitle: string) => {
    const builder = S.documentList()
      .title(listTitle)
      .schemaType(type)
      .filter(`_type == $type && ${filter}`)
      .params({ type, ...params });

    return ordering ? builder.defaultOrdering([ordering]) : builder;
  };

  return S.listItem()
    .title(title)
    .schemaType(type)
    .child(
      S.list()
        .title(title)
        .items([
          S.listItem()
            .title("All languages")
            .child(list("true", {}, `${title} — all languages`)),
          S.divider(),
          ...SUPPORTED_LANGUAGES.map((language) =>
            S.listItem()
              .title(language.title)
              .child(
                list(
                  // The default language also owns documents with no language set.
                  language.id === DEFAULT_LOCALE
                    ? "(!defined(language) || language == $language)"
                    : "language == $language",
                  { language: language.id },
                  `${title} — ${language.title}`,
                ),
              ),
          ),
        ]),
    );
}

/**
 * Studio navigation.
 *
 * Grouped the way the institute's team thinks about the content — daily
 * publishing, then the things that change once a term, then taxonomy — rather
 * than as a flat alphabetical list of document types.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("vidyantIAS")
    .items([
      byLanguage(S, "currentAffair", "Current affairs", { field: "date", direction: "desc" }),
      byLanguage(S, "blog", "Blog", { field: "publishedAt", direction: "desc" }),
      byLanguage(S, "announcement", "Announcements"),

      S.divider(),

      byLanguage(S, "faculty", "Faculty"),
      byLanguage(S, "course", "Courses"),
      byLanguage(S, "demoClass", "Demo classes"),
      byLanguage(S, "freeResource", "Free resources"),
      byLanguage(S, "studyNote", "Notes", { field: "revisedAt", direction: "desc" }),
      S.listItem()
        .title("PYQ papers")
        .schemaType("pyqPaper")
        .child(
          S.documentTypeList("pyqPaper")
            .title("PYQ papers")
            .defaultOrdering([
              { field: "year", direction: "desc" },
              { field: "paper", direction: "asc" },
            ]),
        ),
      byLanguage(S, "faq", "FAQs"),

      S.divider(),

      S.listItem()
        .title("Taxonomy")
        .child(
          S.list()
            .title("Taxonomy")
            .items([
              S.listItem().title("Categories").child(S.documentTypeList("category")),
              S.listItem().title("Subjects").child(S.documentTypeList("subject")),
              S.listItem().title("Tags").child(S.documentTypeList("tag")),
              S.listItem().title("Authors").child(S.documentTypeList("author")),
            ]),
        ),
    ]);
