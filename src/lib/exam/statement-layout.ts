/**
 * Splits a question statement into prose and tables.
 *
 * Match-the-list questions ("List 1 / List 2", "Organisation / Ministry") are
 * typed or pasted with their columns separated by a tab, a `|`, or a run of
 * spaces. Rendered as plain text those separators collapse to a single space
 * and the two columns run together, so a block of such lines is laid out as a
 * table instead.
 *
 * A block is a table only when at least two consecutive lines split into two
 * or more cells: one stray tab or double space in a sentence stays prose.
 */

export type StatementBlock =
  | { kind: "text"; text: string }
  | { kind: "table"; header: string[][]; body: string[][]; columns: number };

/** `|` (with optional surrounding spaces), a tab, or two or more spaces. */
const CELL_SEPARATOR = /\s*\|\s*|\t+| {2,}/;

/** "1.", "2)", "(a)", "A." — the numbering on a list row, which headings lack. */
const ENUMERATED = /^\(?[0-9a-zA-Z]{1,3}[.)]\s?/;

function splitCells(line: string): string[] {
  let trimmed = line.trim();
  // "| a | b |" — the edge pipes of a Markdown-style row are not empty cells.
  if (trimmed.includes("|")) trimmed = trimmed.replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split(CELL_SEPARATOR).map((cell) => cell.trim());
}

function isTableLine(line: string): boolean {
  if (line.trim() === "") return false;
  // A Markdown divider row ("|---|---|") carries no content.
  if (/^\s*\|?\s*:?-{3,}/.test(line)) return true;
  return splitCells(line).filter(Boolean).length >= 2;
}

function isDivider(line: string): boolean {
  return /^\s*\|?(\s*:?-{3,}:?\s*\|?)+\s*$/.test(line);
}

function toTable(lines: string[]): StatementBlock {
  const rows = lines.filter((line) => !isDivider(line)).map(splitCells);
  const columns = Math.max(...rows.map((row) => row.length));
  const padded = rows.map((row) => [...row, ...Array<string>(columns - row.length).fill("")]);

  // Headings ("List 1 | List 2") sit above the first numbered row. When no row
  // is numbered there is no way to tell, so nothing is treated as a heading.
  const firstNumbered = padded.findIndex((row) => ENUMERATED.test(row[0]));
  const headerCount = firstNumbered > 0 ? firstNumbered : 0;

  return {
    kind: "table",
    header: padded.slice(0, headerCount),
    body: padded.slice(headerCount),
    columns,
  };
}

export function layoutStatement(statement: string): StatementBlock[] {
  const lines = statement.replace(/\r\n?/g, "\n").split("\n");
  const blocks: StatementBlock[] = [];
  let prose: string[] = [];

  const flushProse = () => {
    const text = prose.join("\n").replace(/^\n+|\n+$/g, "");
    if (text !== "") blocks.push({ kind: "text", text });
    prose = [];
  };

  for (let i = 0; i < lines.length; ) {
    let end = i;
    while (end < lines.length && isTableLine(lines[end])) end++;

    const run = lines.slice(i, end).filter((line) => !isDivider(line));
    if (run.length >= 2) {
      flushProse();
      blocks.push(toTable(lines.slice(i, end)));
      i = end;
    } else {
      prose.push(lines[i]);
      i++;
    }
  }

  flushProse();
  return blocks;
}
