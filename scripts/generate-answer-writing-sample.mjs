/**
 * Writes the sample Mains answer-writing paper to docs/samples/, for previewing
 * and printing. No credentials needed.
 *
 *   npm run answer-writing:sample-pdf
 *
 * `npm run seed:answer-writing` builds the same PDF in memory and publishes it;
 * this script only exists so the paper can be looked at without doing that.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { SAMPLE_PAPER, buildSamplePaperPdf, totalMarksOf } from "./answer-writing/sample-paper.mjs";

const out = resolve("docs/samples/answer-writing-sample-paper-01.pdf");
const pdf = buildSamplePaperPdf();

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, pdf);

console.log(
  `✓ ${SAMPLE_PAPER.title}\n  ${SAMPLE_PAPER.questions.length} questions · ${totalMarksOf()} marks · ` +
    `${SAMPLE_PAPER.durationMinutes} minutes\n  ${out} (${(pdf.length / 1024).toFixed(1)} KB)`,
);
