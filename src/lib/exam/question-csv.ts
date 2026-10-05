import { z } from "zod";

import { questionSchema } from "@/lib/validation/entities";
import type { Difficulty } from "@/types/db";

/**
 * Bulk import of MCQs from a CSV file, one question per row.
 *
 * Runs in the browser, so a faculty member sees every problem in the file
 * before anything is written, and again on the server, which trusts nothing the
 * browser parsed. Both sides validate against `questionSchema` — the same rules
 * as the single-question form — so a row the preview accepts is a row the
 * server accepts.
 *
 * The file is meant to be filled in Excel or Google Sheets and saved as
 * "CSV UTF-8". Plain "CSV" from Excel on Windows is not UTF-8 and mangles any
 * Hindi text, which is why `decodeCsvFile` refuses it rather than importing
 * question marks.
 */

export const MAX_IMPORT_ROWS = 500;

/** Large enough for 500 questions with long explanations, small enough to refuse a wrong file. */
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

const OPTION_LETTERS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const OPTION_COLUMNS = OPTION_LETTERS.map((letter) => `option_${letter}`);

const REQUIRED_COLUMNS = ["statement", "option_a", "option_b", "correct"] as const;

export const CSV_COLUMNS = [
  "statement",
  ...OPTION_COLUMNS,
  "correct",
  "type",
  "marks",
  "subject",
  "topic",
  "difficulty",
  "explanation",
  "pyq_exam",
  "pyq_year",
] as const;

type Column = (typeof CSV_COLUMNS)[number];

/** What a question takes from its paper when the row leaves a column blank. */
export interface ImportDefaults {
  subject: string;
  marks: number;
}

/** The single-question form's payload, minus `testIds` and `status`, which the server sets. */
export type ImportedQuestion = Omit<z.input<typeof questionSchema>, "testIds" | "status">;

export interface ImportRow {
  /** The row number as the spreadsheet shows it — the header is row 1. */
  row: number;
  question: ImportedQuestion | null;
  errors: string[];
}

export interface ImportParseResult {
  /** Problems with the file as a whole. When non-empty, `rows` is empty. */
  fileErrors: string[];
  rows: ImportRow[];
}

// ─── Reading the file ────────────────────────────────────────────────────────

/**
 * Decodes the file as UTF-8, refusing anything that is not.
 *
 * `fatal: true` makes a non-UTF-8 byte an error instead of a silent U+FFFD,
 * which is the difference between "save it as CSV UTF-8" and a paper of
 * questions with their Hindi replaced by diamonds.
 */
export function decodeCsvFile(bytes: ArrayBuffer): { text: string } | { error: string } {
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { text: text.replace(/^﻿/, "") };
  } catch {
    return {
      error:
        "This file is not UTF-8. In Excel, use File → Save As → \"CSV UTF-8 (Comma delimited)\"; in Google Sheets, File → Download → CSV.",
    };
  }
}

/**
 * RFC 4180 CSV: quoted fields, `""` for a literal quote, and line breaks inside
 * quotes. The last matters here — statement-style questions put each statement
 * on its own line, which Excel writes as a quoted multi-line cell.
 */
export function parseCsv(text: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"' && field === "") {
      quoted = true;
    } else if (char === ",") {
      record.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      record.push(field);
      records.push(record);
      record = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field !== "" || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  return records;
}

// ─── Rows to questions ───────────────────────────────────────────────────────

function normaliseHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

/** Schema field → the column a faculty member would fix. */
const FIELD_COLUMN: Record<string, string> = {
  statement: "statement",
  options: "options",
  correctOptionIds: "correct",
  kind: "type",
  marks: "marks",
  subject: "subject",
  topic: "topic",
  difficulty: "difficulty",
  explanation: "explanation",
  pyq: "pyq_exam / pyq_year",
};

export function parseQuestionCsv(text: string, defaults: ImportDefaults): ImportParseResult {
  const records = parseCsv(text);

  if (records.length === 0 || records[0].every((cell) => cell.trim() === "")) {
    return { fileErrors: ["The file is empty."], rows: [] };
  }

  const headers = records[0].map(normaliseHeader);
  const fileErrors: string[] = [];

  const unknown = headers.filter(
    (header) => header !== "" && !(CSV_COLUMNS as readonly string[]).includes(header),
  );
  if (unknown.length > 0) {
    fileErrors.push(
      `Unrecognised column${unknown.length > 1 ? "s" : ""}: ${unknown.join(", ")}. Download the template or sample for the expected headings.`,
    );
  }

  const duplicated = headers.filter((header, index) => header !== "" && headers.indexOf(header) !== index);
  if (duplicated.length > 0) {
    fileErrors.push(`Column${duplicated.length > 1 ? "s" : ""} appear more than once: ${[...new Set(duplicated)].join(", ")}.`);
  }

  const missing = REQUIRED_COLUMNS.filter((column) => !headers.includes(column));
  if (missing.length > 0) {
    fileErrors.push(`Missing required column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`);
  }

  if (fileErrors.length > 0) return { fileErrors, rows: [] };

  const rows: ImportRow[] = [];

  for (let index = 1; index < records.length; index++) {
    const cells = records[index];
    // Spreadsheets pad files with empty rows; they are not questions.
    if (cells.every((cell) => cell.trim() === "")) continue;

    const get = (column: Column): string => {
      const at = headers.indexOf(column);
      return at === -1 ? "" : (cells[at] ?? "").trim();
    };

    rows.push({ row: index + 1, ...rowToQuestion(get, defaults) });
  }

  if (rows.length === 0) {
    return { fileErrors: ["The file has headings but no questions."], rows: [] };
  }

  if (rows.length > MAX_IMPORT_ROWS) {
    return {
      fileErrors: [`The file has ${rows.length} questions; import at most ${MAX_IMPORT_ROWS} at a time.`],
      rows: [],
    };
  }

  return { fileErrors: [], rows };
}

function rowToQuestion(
  get: (column: Column) => string,
  defaults: ImportDefaults,
): Pick<ImportRow, "question" | "errors"> {
  const errors: string[] = [];

  // Options are lettered by position, so a gap would silently re-letter every
  // option after it and move the answer key with them.
  const texts = OPTION_COLUMNS.map((column) => get(column as Column));
  const lastFilled = texts.findLastIndex((text) => text !== "");
  const options = texts.slice(0, lastFilled + 1).map((text, index) => ({
    id: OPTION_LETTERS[index],
    text,
  }));

  options.forEach((option, index) => {
    if (option.text === "") {
      errors.push(`option_${OPTION_LETTERS[index]} is blank but a later option is filled.`);
    }
  });

  const correctRaw = get("correct").toLowerCase();
  const correct = correctRaw.split(/[\s,;/]+/).filter(Boolean);
  const correctOptionIds = [...new Set(correct)];

  if (correctOptionIds.length === 0) {
    errors.push("correct is blank — give the answer letter, e.g. B, or A,C for more than one.");
  } else {
    for (const letter of correctOptionIds) {
      if (!(OPTION_LETTERS as readonly string[]).includes(letter)) {
        errors.push(`correct has "${letter.toUpperCase()}", which is not an option letter (A to H).`);
      } else if (!options.some((option) => option.id === letter && option.text !== "")) {
        errors.push(`correct says ${letter.toUpperCase()}, but option_${letter} is blank.`);
      }
    }
  }

  const typeRaw = get("type").toLowerCase();
  let multiple = correctOptionIds.length > 1;
  if (typeRaw === "multiple") multiple = true;
  else if (typeRaw === "single") multiple = false;
  else if (typeRaw !== "") errors.push(`type must be "single" or "multiple", not "${get("type")}".`);

  const marksRaw = get("marks");
  const marks = marksRaw === "" ? defaults.marks : Number(marksRaw);
  if (marksRaw !== "" && !Number.isFinite(marks)) errors.push(`marks must be a number, not "${marksRaw}".`);

  const difficultyRaw = get("difficulty").toLowerCase();
  const difficulty = (difficultyRaw === "" ? "moderate" : difficultyRaw) as Difficulty;
  if (!["easy", "moderate", "hard"].includes(difficulty)) {
    errors.push(`difficulty must be easy, moderate or hard, not "${get("difficulty")}".`);
  }

  const pyqExam = get("pyq_exam");
  const pyqYear = get("pyq_year");
  let pyq: { exam: string; year: number } | null = null;
  if (pyqExam !== "" || pyqYear !== "") {
    if (pyqExam === "" || pyqYear === "") {
      errors.push("Fill both pyq_exam and pyq_year for a previous-year question, or neither.");
    } else if (!/^\d{4}$/.test(pyqYear)) {
      errors.push(`pyq_year must be a four-digit year, not "${pyqYear}".`);
    } else {
      pyq = { exam: pyqExam, year: Number(pyqYear) };
    }
  }

  const question: ImportedQuestion = {
    kind: multiple ? "mcq-multiple" : "mcq-single",
    subject: get("subject") || defaults.subject,
    topic: get("topic") || null,
    difficulty,
    pyq,
    statement: get("statement"),
    imagePath: null,
    options,
    correctOptionIds,
    modelAnswer: null,
    explanation: get("explanation") || null,
    marks,
  };

  // The row-specific checks above say it better; the schema catches the rest
  // (lengths, a single-answer row with two keys, a blank statement).
  if (errors.length === 0) errors.push(...schemaErrors(question));

  return errors.length > 0 ? { question: null, errors } : { question, errors: [] };
}

/** Runs the shared question schema and phrases its complaints in column names. */
export function schemaErrors(question: ImportedQuestion): string[] {
  const parsed = questionSchema.safeParse({ ...question, testIds: [], status: "draft" });
  if (parsed.success) return [];

  return parsed.error.issues.map((issue) => {
    const field = String(issue.path[0] ?? "");
    const column = FIELD_COLUMN[field] ?? field;

    if (field === "correctOptionIds" && question.kind === "mcq-single") {
      return 'correct has more than one letter. Set type to "multiple" if that is intended.';
    }

    return column ? `${column}: ${issue.message}` : issue.message;
  });
}

// ─── Template and sample ─────────────────────────────────────────────────────

function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function toCsv(rows: Partial<Record<Column, string>>[]): string {
  const lines = [
    CSV_COLUMNS.join(","),
    ...rows.map((row) => CSV_COLUMNS.map((column) => csvCell(row[column] ?? "")).join(",")),
  ];

  // The BOM is what makes Excel open the file as UTF-8 rather than guessing.
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

/** The headings and nothing else, to fill in from scratch. */
export function questionCsvTemplate(): string {
  return toCsv([]);
}

/**
 * A worked example of every kind of row the importer accepts: single answer,
 * statement-style with line breaks in the cell, more than one answer, five
 * options with marks and subject left to the paper's defaults, and Hindi.
 * It imports cleanly as-is, so it doubles as a check that the importer works.
 *
 * No `pyq_exam` / `pyq_year` row: tagging a made-up question as a past UPSC
 * question would be exactly the kind of claim the sample must not teach.
 */
export function questionCsvSample(): string {
  return toCsv([
    {
      statement: "Which Article of the Constitution of India abolishes untouchability?",
      option_a: "Article 14",
      option_b: "Article 17",
      option_c: "Article 21",
      option_d: "Article 32",
      correct: "B",
      marks: "2",
      subject: "Polity",
      topic: "Fundamental Rights",
      difficulty: "easy",
      explanation: "Article 17 abolishes untouchability and forbids its practice in any form.",
    },
    {
      statement:
        "Consider the following:\n1. Ladakh\n2. Goa\n3. Puducherry\nWhich of the above are Union Territories of India?",
      option_a: "1 only",
      option_b: "1 and 3 only",
      option_c: "2 and 3 only",
      option_d: "1, 2 and 3",
      correct: "B",
      marks: "2",
      subject: "Polity",
      topic: "Union and its Territory",
      difficulty: "moderate",
      explanation: "Goa is a state. Ladakh and Puducherry are Union Territories.",
    },
    {
      statement: "Which of the following rivers flow into the Arabian Sea? Mark all that apply.",
      option_a: "Narmada",
      option_b: "Godavari",
      option_c: "Tapi",
      option_d: "Krishna",
      correct: "A,C",
      type: "multiple",
      marks: "2",
      subject: "Geography",
      topic: "Drainage",
      difficulty: "moderate",
      explanation:
        "The Narmada and the Tapi flow west into the Arabian Sea; the Godavari and the Krishna flow east into the Bay of Bengal.",
    },
    {
      statement: "The Tropic of Cancer does NOT pass through which of the following states?",
      option_a: "Gujarat",
      option_b: "Rajasthan",
      option_c: "Odisha",
      option_d: "Tripura",
      option_e: "Mizoram",
      correct: "C",
      topic: "Physical Geography of India",
      explanation: "Marks and subject are left blank in this row, so they take the paper's defaults.",
    },
    {
      statement: "भारत का राष्ट्रीय जलीय जीव कौन-सा है?",
      option_a: "घड़ियाल",
      option_b: "गंगा नदी डॉल्फ़िन",
      option_c: "हिल्सा मछली",
      option_d: "समुद्री कछुआ",
      correct: "B",
      marks: "2",
      subject: "Environment",
      topic: "Biodiversity",
      difficulty: "easy",
      explanation: "गंगा नदी डॉल्फ़िन को 2009 में भारत का राष्ट्रीय जलीय जीव घोषित किया गया।",
    },
  ]);
}
