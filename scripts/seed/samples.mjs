/**
 * Sample editorial content, published so the blog, current-affairs and
 * noticeboard sections render with real documents.
 *
 * House rules still apply (see the comments that used to sit in
 * `src/data/*`): no selection counts, student numbers, discounts or invented
 * dates. Concretely:
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

/** Blog posts are the academic team's articles in `./blog-posts.mjs`. */
export const SEED_POSTS = [];

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

/**
 * Sample announcements — retired (2026-11-21). The strip's standing lines now
 * carry the institute's real batch dates (`src/data/strip-notices.ts`); dated
 * notices are written in the Studio. Kept as an empty list so the content
 * seeder still runs.
 */
export const SEED_ANNOUNCEMENTS = [];

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
