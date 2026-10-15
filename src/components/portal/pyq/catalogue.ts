import type { PyqPaper } from "@/lib/sanity/types";

/**
 * Turns the flat list of PYQ papers into the shelves a student browses.
 *
 * Sanity stores a paper as `stage` + a free-text `paper` name, the way
 * students say it ("GS Paper III", "Optional – Sociology II", "Hindi
 * (compulsory)"). The categories are read from that name rather than stored,
 * so an editor uploading a paper never has to pick one — and a name that
 * matches no pattern still shows up, under "Other papers".
 *
 * A shelf holds rows; a row is one paper across every year it was set
 * (Mains GS Paper I: 2025, 2024, …). An optional subject is a single row with
 * one line per paper, so Sociology I and II sit together.
 */

export type PyqStage = PyqPaper["stage"];

export type PyqCategoryId =
  | "prelims-gs"
  | "csat"
  | "mains-gs"
  | "essay"
  | "optional"
  | "language"
  | "other";

export interface PyqCategory {
  id: PyqCategoryId;
  stage: PyqStage;
  label: string;
  description: string;
}

/** Display order, and the only place a category's wording lives. */
export const PYQ_CATEGORIES: PyqCategory[] = [
  {
    id: "prelims-gs",
    stage: "prelims",
    label: "Prelims · General Studies",
    description: "GS Paper I — the paper that decides the Prelims cut-off.",
  },
  {
    id: "csat",
    stage: "prelims",
    label: "Prelims · CSAT",
    description: "GS Paper II. Qualifying at 33%.",
  },
  {
    id: "mains-gs",
    stage: "mains",
    label: "Mains · General Studies",
    description: "GS I to GS IV.",
  },
  {
    id: "essay",
    stage: "mains",
    label: "Mains · Essay",
    description: "Two essays, one from each section.",
  },
  {
    id: "optional",
    stage: "mains",
    label: "Mains · Optional subjects",
    description: "Paper I and Paper II for every optional.",
  },
  {
    id: "language",
    stage: "mains",
    label: "Mains · Compulsory language",
    description: "Paper A (Indian language) and Paper B (English). Qualifying only.",
  },
  {
    id: "other",
    stage: "mains",
    label: "Other papers",
    description: "Papers that do not fit the categories above.",
  },
];

export interface PyqLine {
  /** "Paper I" inside an optional; null when the row is a single paper. */
  label: string | null;
  /** Newest first. */
  papers: PyqPaper[];
}

export interface PyqRow {
  key: string;
  category: PyqCategoryId;
  stage: PyqStage;
  title: string;
  lines: PyqLine[];
  /** Lower-cased words the search box matches against. */
  words: string[];
}

/**
 * What students type that the paper name does not say. Keyed by row title;
 * the GS papers in particular are searched by subject far more than by number.
 */
const ALIASES: Record<string, string> = {
  "prelims-gs:GS Paper I": "gs1 paper 1 general studies polity history geography economy environment science current affairs",
  "csat:CSAT": "gs2 paper 2 aptitude comprehension reasoning maths quant",
  "mains-gs:GS Paper I": "gs1 paper 1 history art culture geography society",
  "mains-gs:GS Paper II": "gs2 paper 2 polity constitution governance social justice international relations ir",
  "mains-gs:GS Paper III": "gs3 paper 3 economy agriculture environment science technology security disaster",
  "mains-gs:GS Paper IV": "gs4 paper 4 ethics integrity aptitude case studies",
  "optional:Political Science & IR": "psir polsci pol sci international relations",
  "optional:Public Administration": "pub ad pubad",
  "optional:Animal Husbandry & Veterinary Science": "ahvs veterinary",
  "optional:Commerce & Accountancy": "accounts accountancy",
};

const OPTIONAL = /^optional\s*[–—-]\s*(.+?)\s+(I{1,3}|IV|\d)$/i;
const COMPULSORY = /^(.+?)\s*\(compulsory\)$/i;

function classify(paper: PyqPaper): { category: PyqCategoryId; title: string; line: string | null } {
  const name = paper.paper.trim();

  if (paper.stage === "prelims") {
    return /csat|paper\s*ii\b/i.test(name)
      ? { category: "csat", title: "CSAT", line: null }
      : { category: "prelims-gs", title: name, line: null };
  }

  const optional = OPTIONAL.exec(name);
  if (optional) return { category: "optional", title: optional[1], line: `Paper ${optional[2].toUpperCase()}` };

  const language = COMPULSORY.exec(name);
  if (language) return { category: "language", title: language[1], line: null };

  if (/essay/i.test(name)) return { category: "essay", title: "Essay", line: null };
  if (/^(gs|general studies)\b/i.test(name)) return { category: "mains-gs", title: name, line: null };

  return { category: "other", title: name, line: null };
}

const ROMAN: Record<string, string> = { I: "1", II: "2", III: "3", IV: "4" };

/** "GS Paper III" also answers to "gs paper 3". */
function withArabic(text: string): string {
  return text.replace(/\b(IV|I{1,3})\b/g, (numeral) => `${numeral} ${ROMAN[numeral]}`);
}

/** Natural order inside a shelf: GS I before GS II, then alphabetical. */
const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
const romanRank = (label: string | null) => (label ? Number(ROMAN[label.replace("Paper ", "")] ?? 9) : 0);

export function buildCatalogue(papers: PyqPaper[]): PyqRow[] {
  const rows = new Map<string, PyqRow & { byLine: Map<string, PyqPaper[]> }>();

  for (const paper of papers) {
    if (!paper.url) continue;

    const { category, title, line } = classify(paper);
    const key = `${category}:${title}`;
    let row = rows.get(key);

    if (!row) {
      const meta = PYQ_CATEGORIES.find((entry) => entry.id === category)!;
      row = {
        key,
        category,
        stage: paper.stage,
        title,
        lines: [],
        words: tokenize(withArabic(`${meta.label} ${paper.stage} ${title} ${ALIASES[key] ?? ""}`)),
        byLine: new Map(),
      };
      rows.set(key, row);
    }

    const lineKey = line ?? "";
    row.byLine.set(lineKey, [...(row.byLine.get(lineKey) ?? []), paper]);
  }

  const order = new Map(PYQ_CATEGORIES.map((category, index) => [category.id, index]));

  return [...rows.values()]
    .map(({ byLine, ...row }) => ({
      ...row,
      lines: [...byLine.entries()]
        .map(([label, linePapers]) => ({
          label: label || null,
          papers: linePapers.toSorted((a, b) => b.year - a.year),
        }))
        .sort((a, b) => romanRank(a.label) - romanRank(b.label)),
    }))
    .sort(
      (a, b) =>
        order.get(a.category)! - order.get(b.category)! ||
        (a.category === "mains-gs" ? collator.compare(withArabic(a.title), withArabic(b.title)) : 0) ||
        collator.compare(a.title, b.title),
    );
}

export interface PyqFilters {
  query: string;
  stage: PyqStage | "all";
  category: PyqCategoryId | "all";
  year: number | "all";
}

const YEAR = /^(19|20)\d{2}$/;
const NUMERAL = /^(i{1,3}|iv|\d)$/;

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^\p{L}\p{N}&]+/u).filter(Boolean);
}

/**
 * A word in the search box matches the start of a word in the row — "soc"
 * finds Sociology, "pub ad" Public Administration. Numerals match whole, or
 * "GS II" would also find GS III.
 */
function matches(row: PyqRow, term: string): boolean {
  return NUMERAL.test(term)
    ? row.words.includes(term)
    : row.words.some((word) => word.startsWith(term));
}

/**
 * Every word in the search box has to match. A four-digit word is a year and
 * narrows the papers inside each row; anything else narrows the rows.
 */
export function filterCatalogue(rows: PyqRow[], filters: PyqFilters): PyqRow[] {
  const words = tokenize(filters.query);
  const years = words.filter((word) => YEAR.test(word)).map(Number);
  const terms = words.filter((word) => !YEAR.test(word));

  const keepYear = (year: number) =>
    (filters.year === "all" || year === filters.year) && (years.length === 0 || years.includes(year));

  return rows.flatMap((row) => {
    if (filters.stage !== "all" && row.stage !== filters.stage) return [];
    if (filters.category !== "all" && row.category !== filters.category) return [];
    if (!terms.every((term) => matches(row, term))) return [];

    const lines = row.lines
      .map((line) => ({ ...line, papers: line.papers.filter((paper) => keepYear(paper.year)) }))
      .filter((line) => line.papers.length > 0);

    return lines.length > 0 ? [{ ...row, lines }] : [];
  });
}

export function countPapers(rows: PyqRow[]): number {
  return rows.reduce((total, row) => total + row.lines.reduce((sum, line) => sum + line.papers.length, 0), 0);
}

const MEGABYTES = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

export function formatSize(bytes: number | null): string | null {
  if (!bytes) return null;
  return bytes < 1e6 ? `${Math.max(1, Math.round(bytes / 1e3))} KB` : `${MEGABYTES.format(bytes / 1e6)} MB`;
}
