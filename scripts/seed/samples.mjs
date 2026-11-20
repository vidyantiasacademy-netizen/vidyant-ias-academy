/**
 * Sample editorial content, published so the blog, current-affairs and
 * noticeboard sections render with real documents.
 *
 * House rules still apply (see the comments that used to sit in
 * `src/data/*`): no selection counts, student numbers, discounts or invented
 * dates. Concretely:
 *  - blog posts are evergreen method; the only figures are the examination's
 *    own marks scheme from the UPSC notice;
 *  - current-affairs analyses cover real, dated developments, each with an
 *    official source;
 *  - the announcement has no date or deadline, and points at a real route.
 *
 * Body text uses a small format turned into Portable Text by the seed script:
 * a string is a paragraph; `{ h2 }` / `{ h3 }` are headings; `{ bullets }` /
 * `{ numbers }` are lists.
 */

export const SEED_AUTHOR = {
  id: "author-academic-team",
  name: "vidyantIAS Academic Team",
  slug: "academic-team",
  designation: "Faculty and mentors, vidyantIAS Pune",
};

export const SEED_CATEGORIES = [
  { id: "category-strategy", title: "Strategy", slug: "strategy", order: 10 },
  { id: "category-prelims", title: "Prelims", slug: "prelims", order: 20 },
  { id: "category-mains", title: "Mains", slug: "mains", order: 30 },
  { id: "category-polity-governance", title: "Polity & Governance", slug: "polity-governance", order: 40 },
  { id: "category-science-technology", title: "Science & Technology", slug: "science-technology", order: 50 },
];

export const SEED_POSTS = [
  {
    slug: "how-the-civil-services-examination-is-scored",
    title: "How the Civil Services Examination is scored",
    categories: ["category-strategy", "category-prelims"],
    excerpt:
      "Three stages, but only two of them decide your rank. Knowing which marks count — and which only have to clear a bar — changes how you divide your time.",
    body: [
      "Most aspirants can name the three stages of the examination. Fewer can say which marks actually decide the final list. That gap matters, because it is the difference between preparing for a cut-off and preparing for a rank.",
      { h2: "Prelims: a screening test" },
      "The Preliminary examination has two objective papers of 200 marks each. General Studies Paper I is the one that decides whether you move on. Paper II, the CSAT, is qualifying: you need 33 per cent, and beyond that it adds nothing.",
      "Wrong answers carry a penalty of one-third of the marks for that question. And Prelims marks are not added to your final total at all. Their only job is to get you into Mains.",
      { h2: "Mains: where the rank is built" },
      "The Main examination has nine written papers. Two are qualifying: an Indian language paper and an English paper, 300 marks each. You must clear them, but they do not count towards merit.",
      "The other seven count:",
      {
        bullets: [
          "Essay — 250 marks",
          "General Studies I to IV — 250 marks each",
          "Optional subject, Paper I and Paper II — 250 marks each",
        ],
      },
      "That is 1,750 marks of written work, and most of the final list is decided here.",
      { h2: "The interview" },
      "The Personality Test carries 275 marks. Added to Mains, the final merit list is out of 2,025.",
      { h2: "What this means for your preparation" },
      {
        numbers: [
          "Treat Prelims as a threshold to cross reliably, not a score to maximise. Accuracy beats attempting everything, because of the negative marking.",
          "Do not neglect CSAT because it is 'only qualifying'. Failing a qualifying paper ends the attempt just as surely as failing GS.",
          "Start writing early. Mains carries most of the merit marks, and writing well is a skill built over months, not in the gap after Prelims.",
        ],
      },
      "The official notice for each year's examination is the final word on the scheme. Read it when it is published, before you build your plan around anything else.",
    ],
  },
  {
    slug: "read-the-syllabus-before-you-read-a-book",
    title: "Read the syllabus before you read a book",
    categories: ["category-strategy"],
    excerpt:
      "The syllabus is two pages long, and it is the most useful document in your preparation. Here is how to use it as a map rather than a list.",
    body: [
      "New aspirants usually start with a booklist. A better first step is the syllabus itself. It is short, it is official, and it tells you what the examination can ask — which also tells you what it cannot.",
      { h2: "Read it as a set of questions" },
      "Each line of the GS syllabus is a topic heading, but it is also a description of the questions that can come from it. When you read 'Separation of powers between various organs', imagine the Prelims statement and the Mains question that could follow. That habit turns reading into preparation.",
      { h2: "Map it before you start" },
      {
        bullets: [
          "Break each paper into its lines and give every line its own row in a notebook or spreadsheet.",
          "Next to each line, note the source you will use — one standard source, not five.",
          "Mark lines that overlap: Environment appears in Prelims and in GS III; Polity runs through Prelims, GS II and the Essay.",
          "Leave a column for previous-year questions on that line. You will fill it as you go.",
        ],
      },
      { h2: "Use it to decide what not to read" },
      "Every aspirant reads too much. The syllabus is your filter: if a chapter does not connect to a line on the map, it can wait. That is not cutting corners — it is how a fixed number of months gets spent on what is examined.",
      { h2: "Go back to it every month" },
      "Coverage drifts. A monthly review against the map shows which lines you have revised, which you have only read once, and which you have not touched. It is the simplest progress report you will ever have, and it costs ten minutes.",
      "Our free syllabus map on the Resources page is organised exactly this way, if you would rather start from a template.",
    ],
  },
  {
    slug: "mains-answer-writing-structure-before-speed",
    title: "Mains answer writing: structure before speed",
    categories: ["category-mains"],
    excerpt:
      "Speed is the problem everyone notices in the exam hall. Structure is the problem that causes it. Fix the second and the first gets easier.",
    body: [
      "Aspirants who run out of time in Mains rarely type or write slowly. They spend the first minutes of every answer deciding what the answer should look like. A fixed structure removes that decision.",
      { h2: "Read what the question demands" },
      "The directive word sets the shape. 'Discuss' wants several sides. 'Critically examine' wants a judgement at the end. 'Explain' wants causes and mechanism. Underline the directive and every part of the question before you write a word — a common reason for low marks is a good answer to a different question.",
      { h2: "A structure you can repeat" },
      {
        numbers: [
          "Introduction — one or two lines that define the term, give context, or state a fact that frames the issue.",
          "Body — the demand of the question, in short paragraphs or points under clear sub-headings. Each point should earn its place.",
          "Way forward or conclusion — balanced, specific, and connected to the question rather than a general statement about development.",
        ],
      },
      { h2: "Make the body easy to evaluate" },
      {
        bullets: [
          "Use sub-headings that mirror the parts of the question.",
          "Add a simple diagram or flowchart where it says more than a paragraph would.",
          "Quote a committee, a judgement, a report or a constitutional article where one genuinely fits — not as decoration.",
        ],
      },
      { h2: "Then work on speed" },
      "Once the structure is automatic, timed practice does the rest. Write against the clock, get the answer evaluated, and rewrite one answer each week using the feedback. Improvement in Mains comes from that loop, not from the number of answers written.",
    ],
  },
];

export const SEED_CURRENT_AFFAIRS = [
  {
    slug: "dpdp-rules-2025-notified",
    title: "DPDP Rules, 2025 notified: India's data protection law becomes operational",
    date: "2025-11-14",
    category: "category-science-technology",
    importance: "important",
    relevance: ["Prelims", "Mains"],
    summary:
      "The rules under the Digital Personal Data Protection Act, 2023 have been notified with an 18-month phased timeline — moving the Act from statute to practice.",
    body: [
      { h2: "What happened" },
      "The Government notified the Digital Personal Data Protection (DPDP) Rules, 2025, which operationalise the Digital Personal Data Protection Act, 2023. The rules give organisations an 18-month phased compliance timeline.",
      { h2: "Key features" },
      {
        bullets: [
          "The Data Protection Board of India is designed as a fully digital body: complaints can be filed and tracked online. Appeals against its decisions lie with the Telecom Disputes Settlement and Appellate Tribunal (TDSAT).",
          "Consent Managers — entities that help individuals manage the permissions they give — must be Indian companies.",
          "In a personal data breach, Data Fiduciaries must inform affected individuals in plain language: what happened, the likely consequences, the steps taken and whom to contact.",
          "Under the Act, the penalty for failing to take reasonable security safeguards against a breach may extend to ₹250 crore.",
        ],
      },
      { h2: "Why it matters for UPSC" },
      "For Prelims, expect questions on the institutions (the Board, the appellate route), the terms (Data Principal, Data Fiduciary, Consent Manager) and the Act's year. For Mains, this sits in GS II (government policies, statutory bodies) and GS III (cyber security), and connects to the right to privacy recognised in Justice K.S. Puttaswamy v. Union of India (2017).",
      { h2: "Static link" },
      "Article 21 and the privacy judgment; the Information Technology Act, 2000, whose section 43A the DPDP Act omits; and the Right to Information Act, 2005, whose personal-information exemption the DPDP Act amends — a frequent debate point in Mains answers.",
    ],
    sources: [
      {
        label: "PIB — Government notifies DPDP Rules (14 Nov 2025)",
        url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190014",
      },
      {
        label: "The Digital Personal Data Protection Act, 2023 (Gazette of India)",
        url: "https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf",
      },
    ],
  },
  {
    slug: "new-criminal-laws-in-force",
    title: "Three new criminal laws replace the IPC, CrPC and Evidence Act",
    date: "2024-07-01",
    category: "category-polity-governance",
    importance: "must-read",
    relevance: ["Prelims", "Mains", "Interview"],
    summary:
      "The Bharatiya Nyaya Sanhita, Bharatiya Nagarik Suraksha Sanhita and Bharatiya Sakshya Adhiniyam came into force on 1 July 2024, replacing the three colonial-era codes that had governed criminal justice since the nineteenth century.",
    body: [
      { h2: "What happened" },
      "Three laws enacted in 2023 came into force on 1 July 2024, replacing colonial-era statutes:",
      {
        bullets: [
          "Bharatiya Nyaya Sanhita, 2023 (BNS) replaces the Indian Penal Code, 1860.",
          "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS) replaces the Code of Criminal Procedure, 1973.",
          "Bharatiya Sakshya Adhiniyam, 2023 (BSA) replaces the Indian Evidence Act, 1872.",
        ],
      },
      "One provision — sub-section (2) of section 106 of the BNS — was kept out of the notification.",
      { h2: "What is new" },
      "New offences include terrorist acts, acts endangering the sovereignty, unity and integrity of India, mob lynching, snatching, and organised crime, including petty organised crime.",
      { h2: "Why it matters for UPSC" },
      "Prelims can test the pairing of each new law with the statute it replaced, and the commencement date. In Mains, the change belongs in GS II (criminal justice, police reforms) and invites a balanced answer: the case for decolonising and updating the codes, alongside the concerns raised about specific provisions and about transition for courts and police.",
      { h2: "Static link" },
      "Criminal law and criminal procedure are in the Concurrent List (entries 1 and 2), so states can amend within limits. Connect this to earlier reform efforts such as the Malimath Committee report on criminal justice reform (2003).",
    ],
    sources: [
      {
        label: "PIB — New criminal laws",
        url: "https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=2082757&reg=3&lang=2",
      },
    ],
  },
];

export const SEED_ANNOUNCEMENTS = [
  {
    id: "announcement-free-counselling",
    title: "Free one-to-one counselling with the academic team",
    body: "Not sure which program fits your stage? Book a call and leave with a plan for your attempt.",
    tone: "info",
    href: "/counselling",
  },
];

/** UPSC subjects the sample faculty reference. `paper` drives the /faculty filters. */
export const SEED_SUBJECTS = [
  { id: "subject-polity", title: "Polity", slug: "polity", paper: "gs2" },
  { id: "subject-governance", title: "Governance", slug: "governance", paper: "gs2" },
  { id: "subject-economy", title: "Indian Economy", slug: "indian-economy", paper: "gs3" },
  { id: "subject-ethics", title: "Ethics (GS-IV)", slug: "ethics", paper: "gs4" },
  { id: "subject-essay", title: "Essay", slug: "essay", paper: "essay" },
  { id: "subject-reasoning", title: "Reasoning & Comprehension", slug: "reasoning-comprehension", paper: "csat" },
  { id: "subject-quantitative-aptitude", title: "Quantitative Aptitude", slug: "quantitative-aptitude", paper: "csat" },
];

/**
 * Sample faculty role cards — retired. Real, verified profiles are seeded by
 * `scripts/seed-faculty-sanity.mjs`. Kept as an empty list so
 * `seed:content:sanity` no longer recreates the placeholders.
 *
 * Shape, if ever reused: `{ slug, name, designation, subjects, bio,
 * teachingPhilosophy, courses, order }`; `courses` are course slugs.
 */
export const SEED_FACULTY = [];
