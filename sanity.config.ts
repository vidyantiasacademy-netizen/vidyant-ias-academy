import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";

/**
 * Sanity Studio, mounted inside this Next.js app at `/studio`.
 *
 * One deploy, one domain, and schemas that live next to the queries that read
 * them. The studio is a client-side app behind Sanity's own login — it is not
 * protected by our Firebase auth, and does not need to be: authorisation is
 * the Sanity project's member list.
 *
 * Config lives at the repo root (not under `src/`) because the Sanity CLI looks
 * for it there — `npx sanity schema extract`, `npx sanity typegen generate` and
 * `npx sanity deploy` all read this file.
 */
export default defineConfig({
  name: "vidyantias",
  title: "vidyantIAS",
  basePath: "/studio",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",

  plugins: [
    structureTool({ structure }),
    // GROQ playground. Dev only — it would otherwise let any studio member run
    // arbitrary queries against production from the browser.
    ...(process.env.NODE_ENV === "development" ? [visionTool()] : []),
  ],

  schema: { types: schemaTypes },
});
