/**
 * Uploads previous-year question papers to Sanity as `pyqPaper` documents.
 *
 * Reads a manifest — a JSON array of
 *   { id, year, stage, paper, file, pageCount? }
 * where `file` is a PDF path relative to the manifest — uploads each PDF as a
 * file asset and creates the document that points at it.
 *
 *   npm run seed:pyq:sanity -- path/to/manifest.json
 *   npm run seed:pyq:sanity -- path/to/manifest.json --dry-run
 *   npm run seed:pyq:sanity -- path/to/manifest.json --replace
 *
 * Idempotent: ids are deterministic (`pyq-mains-2019-gs-paper-i`), and a
 * paper that already exists is skipped *before* its PDF is uploaded, so a
 * re-run after a failure resumes instead of uploading duplicates. `--replace`
 * re-uploads and overwrites.
 *
 * Optimise scans before building the manifest (`ocrmypdf --optimize 3`): raw
 * scans are 10–30 MB, which students download on mobile data.
 */
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";

import { sanityFlags, seedClient } from "./seed/sanity.mjs";

const manifestPath = process.argv.slice(2).find((arg) => !arg.startsWith("--"));

if (!manifestPath) {
  console.error("Usage: npm run seed:pyq:sanity -- <manifest.json> [--dry-run] [--replace]");
  process.exit(1);
}

const flags = sanityFlags();
const client = seedClient(flags);

const root = dirname(resolve(manifestPath));
const papers = JSON.parse(await readFile(manifestPath, "utf8"));

const existing = new Set(
  flags.replace
    ? []
    : await client.fetch(`*[_type == "pyqPaper" && _id in $ids]._id`, {
        ids: papers.map((paper) => paper.id),
      }),
);

const CONCURRENCY = 4;
let created = 0;
let skipped = 0;
const failed = [];

async function seed(paper) {
  if (existing.has(paper.id)) {
    skipped += 1;
    return;
  }

  const label = `${paper.year} ${paper.stage} · ${paper.paper}`;

  if (flags.dryRun) {
    console.log(`  would create  ${paper.id}  (${label})`);
    created += 1;
    return;
  }

  try {
    const filePath = resolve(root, paper.file);
    const asset = await client.assets.upload("file", createReadStream(filePath), {
      filename: basename(filePath),
      contentType: "application/pdf",
    });

    await client.createOrReplace({
      _id: paper.id,
      _type: "pyqPaper",
      year: paper.year,
      stage: paper.stage,
      paper: paper.paper,
      file: { _type: "file", asset: { _type: "reference", _ref: asset._id } },
      ...(paper.pageCount ? { pageCount: paper.pageCount } : {}),
      publishedAt: new Date().toISOString(),
    });

    created += 1;
    console.log(`  created  ${paper.id}  (${label}, ${(asset.size / 1e6).toFixed(1)} MB)`);
  } catch (error) {
    failed.push(paper.id);
    console.error(`  FAILED   ${paper.id}: ${error.message}`);
  }
}

const queue = [...papers];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) await seed(queue.shift());
  }),
);

console.log(
  `\n${flags.dryRun ? "Would create" : "Created"} ${created}, skipped ${skipped} existing, failed ${failed.length}.`,
);
if (failed.length) process.exit(1);
