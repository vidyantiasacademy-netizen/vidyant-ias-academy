/**
 * The sample Mains answer-writing paper: its content, its marking scheme, and
 * the printable PDF built from them.
 *
 * One source for both, so the PDF a student writes on and the scheme an
 * evaluator marks against can never disagree. Used by
 * `generate-answer-writing-sample.mjs` (writes the PDF to docs/samples/) and
 * `seed-answer-writing-sample.mjs` (uploads it and publishes the paper).
 *
 * The PDF is written by hand rather than with a library: it is text, rules and
 * boxes in the standard Helvetica fonts, which every PDF reader carries, so no
 * font is embedded and no dependency is added. Output is deterministic — the
 * same input produces the same bytes — so a regenerated file only shows up in
 * a diff when the paper actually changed.
 */

import { deflateSync } from "node:zlib";

export const SAMPLE_PAPER = {
  /** Fixed, so re-running the seeder finds the paper instead of making another. */
  testId: "answer-writing-sample-01",
  title: "Answer Writing Sample Paper 01 — GS Paper II",
  subject: "GS Paper II",
  heading: "General Studies Paper II",
  topics: "Polity, Governance and Constitution",
  durationMinutes: 45,
  questions: [
    {
      label: "Q1",
      maxMarks: 10,
      wordLimit: 150,
      pages: 1,
      text: "The 73rd Constitutional Amendment gave Panchayati Raj Institutions constitutional status, yet many remain dependent on state governments. Discuss the significance of the amendment for grassroots democracy and the challenges that limit the effectiveness of panchayats.",
    },
    {
      label: "Q2",
      maxMarks: 10,
      wordLimit: 150,
      pages: 1,
      text: "The office of the Governor has often been at the centre of Centre–State friction. Examine the constitutional position of the Governor in the light of the recommendations of the Sarkaria and Punchhi Commissions.",
    },
    {
      label: "Q3",
      maxMarks: 10,
      wordLimit: 150,
      pages: 1,
      text: "“Judicial activism has filled governance gaps, but it risks judicial overreach.” Critically analyse with suitable examples.",
    },
    {
      label: "Q4",
      maxMarks: 15,
      wordLimit: 250,
      pages: 2,
      text: "Evaluate the role of the Comptroller and Auditor General of India in securing the financial accountability of the executive. What reforms would strengthen the institution?",
    },
    {
      label: "Q5",
      maxMarks: 15,
      wordLimit: 250,
      pages: 2,
      text: "Outline the key features of the Digital Personal Data Protection Act, 2023. How far does it balance the individual’s right to privacy with the needs of the State and of businesses?",
    },
  ],
  instructions: [
    "There are five questions. All of them are compulsory.",
    "Write each answer in the space printed below its question. Keep to the word limit shown — content matters more than length.",
    "Write legibly in blue or black ink. Leave the left margin blank: it is for the evaluator.",
    "Strike off any page, or part of a page, that you leave blank.",
    "Time yourself: 45 minutes for the paper — about 7 minutes for a 10-mark answer and 11 for a 15-mark one.",
    "On paper: print single-sided on A4, write, then photograph every page flat and in order — or scan it.",
    "On a tablet: open this PDF in a stylus app, write in the spaces, and export it as a PDF.",
    "Upload your answer sheet under Mains Answer Writing in the student portal and press Submit before the deadline.",
  ],
};

/** The scheme stored on the paper — what evaluators mark against. */
export function markingSchemeOf(paper = SAMPLE_PAPER) {
  return paper.questions.map(({ label, maxMarks, wordLimit }) => ({ label, maxMarks, wordLimit }));
}

export function totalMarksOf(paper = SAMPLE_PAPER) {
  return paper.questions.reduce((sum, question) => sum + question.maxMarks, 0);
}

// ─── Typography ──────────────────────────────────────────────────────────────

/** Advance widths (1/1000 em) for character codes 32–126, from the Adobe AFMs. */
const WIDTHS = {
  F1: [
    278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556,
    556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667,
    611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667,
    667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500,
    222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
  ],
  F2: [
    278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556,
    556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667,
    611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667,
    667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556,
    278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
  ],
};
// Helvetica-Oblique shares Helvetica's metrics.
WIDTHS.F3 = WIDTHS.F1;

/** The few non-ASCII characters used, as WinAnsiEncoding codes. */
const WIN_ANSI = { "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95, "–": 0x96, "—": 0x97, "·": 0xb7 };
const SPECIAL_WIDTHS = {
  F1: { 0x91: 222, 0x92: 222, 0x93: 333, 0x94: 333, 0x95: 350, 0x96: 556, 0x97: 1000, 0xb7: 278 },
  F2: { 0x91: 278, 0x92: 278, 0x93: 500, 0x94: 500, 0x95: 350, 0x96: 556, 0x97: 1000, 0xb7: 278 },
};
SPECIAL_WIDTHS.F3 = SPECIAL_WIDTHS.F1;

function codesOf(text) {
  return [...text].map((char) => {
    if (WIN_ANSI[char]) return WIN_ANSI[char];
    const code = char.charCodeAt(0);
    if (code < 32 || code > 126) throw new Error(`No WinAnsi mapping for ${JSON.stringify(char)}`);
    return code;
  });
}

function widthOf(text, font, size) {
  const units = codesOf(text).reduce(
    (sum, code) => sum + (code <= 126 ? WIDTHS[font][code - 32] : SPECIAL_WIDTHS[font][code]),
    0,
  );
  return (units / 1000) * size;
}

function pdfString(text) {
  const body = codesOf(text)
    .map((code) => {
      if (code === 40 || code === 41 || code === 92) return `\\${String.fromCharCode(code)}`;
      if (code > 126) return `\\${code.toString(8).padStart(3, "0")}`;
      return String.fromCharCode(code);
    })
    .join("");
  return `(${body})`;
}

function wrap(text, font, size, maxWidth) {
  const lines = [];
  let line = "";

  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || widthOf(candidate, font, size) <= maxWidth) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }

  if (line) lines.push(line);
  return lines;
}

// ─── Drawing ─────────────────────────────────────────────────────────────────

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const LEFT = 48;
const RIGHT = PAGE_W - 48;
const WIDTH = RIGHT - LEFT;
const MARGIN_RULE_X = LEFT + 36;
const LINE_GAP = 25;
const ANSWER_BOTTOM = 62;

// The brand palette (src/app/globals.css), as PDF RGB.
const INDIGO = [0.114, 0.141, 0.439];
const KESAR = [0.953, 0.604, 0.118];
const INK = [0.067, 0.067, 0.067];
const MUTED = [0.255, 0.278, 0.412];
const RULE = [0.761, 0.796, 0.894];
const PAPER = [0.945, 0.953, 0.98];

const num = (value) => String(Math.round(value * 100) / 100);
const rgb = ([r, g, b]) => `${num(r)} ${num(g)} ${num(b)}`;

class Canvas {
  ops = [];

  text(x, y, text, { font = "F1", size = 10.5, color = INK } = {}) {
    this.ops.push(`BT /${font} ${num(size)} Tf ${rgb(color)} rg ${num(x)} ${num(y)} Td ${pdfString(text)} Tj ET`);
    return x + widthOf(text, font, size);
  }

  textRight(right, y, text, options = {}) {
    const { font = "F1", size = 10.5 } = options;
    this.text(right - widthOf(text, font, size), y, text, options);
  }

  textCentre(centre, y, text, options = {}) {
    const { font = "F1", size = 10.5 } = options;
    this.text(centre - widthOf(text, font, size) / 2, y, text, options);
  }

  /** Reads bottom to top, for the margin label. */
  textUp(x, y, text, { font = "F3", size = 7, color = MUTED } = {}) {
    this.ops.push(`BT /${font} ${num(size)} Tf ${rgb(color)} rg 0 1 -1 0 ${num(x)} ${num(y)} Tm ${pdfString(text)} Tj ET`);
  }

  /** Wrapped text from a top edge. Returns the y just below the last line. */
  paragraph(x, top, width, text, { font = "F1", size = 10.5, leading = size * 1.38, color = INK } = {}) {
    const lines = wrap(text, font, size, width);
    lines.forEach((line, index) => this.text(x, top - size - index * leading, line, { font, size, color }));
    return top - size - (lines.length - 1) * leading - (leading - size);
  }

  line(x1, y1, x2, y2, { width = 0.5, color = RULE } = {}) {
    this.ops.push(`q ${num(width)} w ${rgb(color)} RG ${num(x1)} ${num(y1)} m ${num(x2)} ${num(y2)} l S Q`);
  }

  rect(x, y, w, h, { fill = null, stroke = null, width = 0.6 } = {}) {
    const paint = fill && stroke ? "B" : fill ? "f" : "S";
    const style = [fill ? `${rgb(fill)} rg` : "", stroke ? `${rgb(stroke)} RG ${num(width)} w` : ""]
      .filter(Boolean)
      .join(" ");
    this.ops.push(`q ${style} ${num(x)} ${num(y)} ${num(w)} ${num(h)} re ${paint} Q`);
  }
}

function header(canvas, paper) {
  const after = canvas.text(LEFT, 812, "vidyantIAS", { font: "F2", size: 9, color: INDIGO });
  canvas.text(after, 812, "  ·  Mains Answer Writing", { size: 9, color: MUTED });
  canvas.textRight(RIGHT, 812, `Sample Paper 01  ·  ${paper.subject}`, { size: 9, color: MUTED });
  canvas.line(LEFT, 802, RIGHT, 802, { width: 0.6 });
}

function footer(canvas, page, pages) {
  canvas.line(LEFT, 46, RIGHT, 46, { width: 0.6 });
  const after = canvas.text(LEFT, 32, "Roll No.", { size: 8.5, color: MUTED });
  canvas.line(after + 6, 30, after + 120, 30, { width: 0.6, color: MUTED });
  canvas.textCentre(PAGE_W / 2, 32, `Page ${page} of ${pages}`, { size: 8.5, color: MUTED });
  canvas.textRight(RIGHT, 32, "Leave the left margin for the evaluator", { font: "F3", size: 8, color: MUTED });
}

/** Ruled lines from `top` down, with the evaluator's margin on the left. */
function answerArea(canvas, top) {
  for (let y = top - LINE_GAP; y >= ANSWER_BOTTOM; y -= LINE_GAP) {
    canvas.line(LEFT, y, RIGHT, y, { width: 0.45 });
  }
  canvas.line(MARGIN_RULE_X, top, MARGIN_RULE_X, ANSWER_BOTTOM - 4, { width: 0.9, color: KESAR });
  canvas.textUp(LEFT + 22, ANSWER_BOTTOM + 6, "Evaluator’s margin — do not write here");
}

function questionBlock(canvas, question, top) {
  const padding = 14;
  const textX = LEFT + padding + 30;
  const textWidth = RIGHT - padding - textX;
  const size = 10.5;
  const leading = 14.5;
  const lines = wrap(question.text, "F1", size, textWidth);
  const height = padding + lines.length * leading + 26;
  const bottom = top - height;

  canvas.rect(LEFT, bottom, WIDTH, height, { fill: PAPER });
  canvas.rect(LEFT, bottom, 3, height, { fill: INDIGO });
  canvas.text(LEFT + padding, top - padding - 9, question.label, { font: "F2", size: 12, color: INDIGO });
  lines.forEach((line, index) =>
    canvas.text(textX, top - padding - 9 - index * leading, line, { size }),
  );
  canvas.textRight(
    RIGHT - padding,
    bottom + 10,
    `Answer in ${question.wordLimit} words  ·  ${question.maxMarks} marks`,
    { font: "F3", size: 9, color: MUTED },
  );

  return bottom;
}

function coverPage(canvas, paper) {
  const totalMarks = totalMarksOf(paper);

  canvas.rect(0, PAGE_H - 12, PAGE_W, 12, { fill: KESAR });
  canvas.text(LEFT, 776, "vidyantIAS", { font: "F2", size: 24, color: INDIGO });
  canvas.textRight(RIGHT, 780, "Mains Answer Writing Programme", { size: 10.5, color: MUTED });
  canvas.line(LEFT, 760, RIGHT, 760, { width: 1.2, color: INDIGO });

  canvas.text(LEFT, 722, "Sample Paper 01", { font: "F2", size: 22 });
  canvas.text(LEFT, 700, `${paper.heading} — ${paper.topics}`, { size: 12.5 });

  const facts = [
    ["Time allowed", `${paper.durationMinutes} minutes`],
    ["Maximum marks", String(totalMarks)],
    ["Questions", `${paper.questions.length}, all compulsory`],
  ];
  const gap = 8;
  const boxWidth = (WIDTH - gap * (facts.length - 1)) / facts.length;
  facts.forEach(([label, value], index) => {
    const x = LEFT + index * (boxWidth + gap);
    canvas.rect(x, 626, boxWidth, 44, { fill: PAPER });
    canvas.text(x + 12, 655, label, { size: 8.5, color: MUTED });
    canvas.text(x + 12, 636, value, { font: "F2", size: 13, color: INDIGO });
  });

  canvas.text(LEFT, 596, "Candidate details", { font: "F2", size: 11, color: INDIGO });
  const column = (WIDTH - 16) / 2;
  [
    ["Name", "Roll number"],
    ["Date", "Mode (online / offline)"],
  ].forEach((pair, row) => {
    const y = 570 - row * 26;
    pair.forEach((label, index) => {
      const x = LEFT + index * (column + 16);
      const after = canvas.text(x, y, label, { size: 9.5, color: MUTED });
      canvas.line(after + 8, y - 2, x + column, y - 2, { width: 0.6, color: MUTED });
    });
  });

  canvas.text(LEFT, 512, "Instructions", { font: "F2", size: 11, color: INDIGO });
  let y = 504;
  for (const instruction of paper.instructions) {
    canvas.text(LEFT + 2, y - 9.5, "•", { size: 9.5, color: INDIGO });
    y = canvas.paragraph(LEFT + 14, y, WIDTH - 14, instruction, { size: 9.5, leading: 13 }) - 5;
  }

  y -= 16;
  canvas.text(LEFT, y, "For the evaluator", { font: "F2", size: 11, color: INDIGO });
  canvas.text(LEFT, y - 14, "Your evaluated copy comes back with marks here and comments in the margins.", {
    font: "F3",
    size: 9,
    color: MUTED,
  });

  const columns = [
    { label: "Question", width: 80 },
    { label: "Max marks", width: 80 },
    { label: "Marks awarded", width: 100 },
    { label: "Remarks", width: WIDTH - 260 },
  ];
  const rowHeight = 21;
  const rows = [
    ...paper.questions.map((question) => [question.label, String(question.maxMarks)]),
    ["Total", String(totalMarks)],
  ];
  const tableTop = y - 26;
  const tableBottom = tableTop - rowHeight * (rows.length + 1);

  canvas.rect(LEFT, tableTop - rowHeight, WIDTH, rowHeight, { fill: PAPER });
  let x = LEFT;
  for (const { label, width } of columns) {
    canvas.text(x + 8, tableTop - 14, label, { font: "F2", size: 9 });
    x += width;
  }
  rows.forEach(([label, max], index) => {
    const baseline = tableTop - rowHeight * (index + 2) + 7;
    const bold = index === rows.length - 1;
    canvas.text(LEFT + 8, baseline, label, { font: bold ? "F2" : "F1", size: 9.5 });
    canvas.text(LEFT + 88, baseline, max, { font: bold ? "F2" : "F1", size: 9.5 });
  });
  for (let index = 0; index <= rows.length + 1; index += 1) {
    const lineY = tableTop - index * rowHeight;
    canvas.line(LEFT, lineY, RIGHT, lineY, { width: index === 0 || index === rows.length + 1 ? 0.8 : 0.5 });
  }
  x = LEFT;
  for (const { width } of [{ width: 0 }, ...columns]) {
    x += width;
    canvas.line(x, tableTop, x, tableBottom, { width: 0.5 });
  }
}

// ─── Assembly ────────────────────────────────────────────────────────────────

/** Builds the printable paper. Returns the PDF as a Buffer. */
export function buildSamplePaperPdf(paper = SAMPLE_PAPER) {
  /** Each page is drawn once its number and the total are known. */
  const pages = [(canvas) => coverPage(canvas, paper)];

  for (const question of paper.questions) {
    pages.push((canvas) => {
      header(canvas, paper);
      answerArea(canvas, questionBlock(canvas, question, 790) - 10);
    });

    for (let extra = 1; extra < question.pages; extra += 1) {
      pages.push((canvas) => {
        header(canvas, paper);
        canvas.text(LEFT, 786, `${question.label} — continued`, { font: "F3", size: 9, color: MUTED });
        answerArea(canvas, 776);
      });
    }
  }

  pages.push((canvas) => {
    header(canvas, paper);
    canvas.text(LEFT, 784, "Additional space", { font: "F2", size: 11, color: INDIGO });
    canvas.text(LEFT, 770, "Continue an answer here. Write the question number in the margin before you start.", {
      font: "F3",
      size: 9,
      color: MUTED,
    });
    answerArea(canvas, 758);
  });

  const streams = pages.map((draw, index) => {
    const canvas = new Canvas();
    draw(canvas);
    footer(canvas, index + 1, pages.length);
    return deflateSync(Buffer.from(canvas.ops.join("\n"), "latin1"));
  });

  return serialise(streams, paper);
}

function serialise(streams, paper) {
  const objects = [];
  // Object numbers start at 1, so the new length is the new object's number.
  const add = (body) => objects.push(body);
  const reserve = () => add(null);

  const catalogId = reserve();
  const pagesId = reserve();
  const fonts = {
    F1: add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"),
    F2: add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"),
    F3: add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>"),
  };
  const fontDict = Object.entries(fonts)
    .map(([name, id]) => `/${name} ${id} 0 R`)
    .join(" ");

  const pageIds = streams.map((stream) => {
    const contentId = add({ stream });
    return add(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
        `/Resources << /Font << ${fontDict} >> >> /Contents ${contentId} 0 R >>`,
    );
  });

  objects[pagesId - 1] =
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  objects[catalogId - 1] =
    `<< /Type /Catalog /Pages ${pagesId} 0 R /Lang (en-IN) /ViewerPreferences << /DisplayDocTitle true >> >>`;

  const infoId = add(
    `<< /Title ${pdfString(paper.title)} /Author (vidyantIAS) /Subject ${pdfString(
      `${paper.heading} — ${paper.topics}`,
    )} /Creator (vidyantIAS answer writing) /CreationDate (D:20261017000000Z) >>`,
  );

  const chunks = [Buffer.from("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n", "latin1")];
  let offset = chunks[0].length;
  const offsets = [];

  objects.forEach((body, index) => {
    offsets.push(offset);
    const parts =
      typeof body === "string"
        ? [Buffer.from(`${index + 1} 0 obj\n${body}\nendobj\n`, "latin1")]
        : [
            Buffer.from(
              `${index + 1} 0 obj\n<< /Length ${body.stream.length} /Filter /FlateDecode >>\nstream\n`,
              "latin1",
            ),
            body.stream,
            Buffer.from("\nendstream\nendobj\n", "latin1"),
          ];
    for (const part of parts) {
      chunks.push(part);
      offset += part.length;
    }
  });

  const xref = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.map((value) => `${String(value).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${objects.length + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>`,
    "startxref",
    String(offset),
    "%%EOF",
    "",
  ].join("\n");

  chunks.push(Buffer.from(xref, "latin1"));
  return Buffer.concat(chunks);
}
