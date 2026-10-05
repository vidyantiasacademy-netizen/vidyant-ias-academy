import type { StructureResolver } from "sanity/structure";

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
      S.listItem()
        .title("Current affairs")
        .child(
          S.documentTypeList("currentAffair")
            .title("Current affairs")
            .defaultOrdering([{ field: "date", direction: "desc" }]),
        ),
      S.listItem()
        .title("Blog")
        .child(
          S.documentTypeList("blog")
            .title("Blog posts")
            .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
        ),
      S.listItem().title("Announcements").child(S.documentTypeList("announcement")),

      S.divider(),

      S.listItem().title("Faculty").child(S.documentTypeList("faculty")),
      S.listItem().title("Courses").child(S.documentTypeList("course")),
      S.listItem().title("Demo classes").child(S.documentTypeList("demoClass")),
      S.listItem().title("Free resources").child(S.documentTypeList("freeResource")),
      S.listItem().title("FAQs").child(S.documentTypeList("faq")),

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
