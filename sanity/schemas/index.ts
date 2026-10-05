import type { SchemaTypeDefinition } from "sanity";

import { announcement } from "./announcement";
import { blog } from "./blog";
import { course } from "./course";
import { currentAffair } from "./currentAffair";
import { demoClass } from "./demoClass";
import { faculty } from "./faculty";
import { faq } from "./faq";
import { freeResource } from "./freeResource";
import { blockContent, curriculumModule, seo, source } from "./objects";
import { author, category, subject, tag } from "./taxonomy";

/**
 * The Sanity schema.
 *
 * Content types only. Nothing about a student, an enrollment, a payment, a test
 * attempt or a result belongs here — see `docs/sanity.md` for why that line
 * matters and what breaks if it is crossed.
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  // Editorial
  blog,
  currentAffair,
  announcement,

  // Institute
  faculty,
  course,
  demoClass,
  freeResource,
  faq,

  // Taxonomy
  category,
  subject,
  tag,
  author,

  // Objects
  blockContent,
  seo,
  source,
  curriculumModule,
];
