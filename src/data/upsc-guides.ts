/**
 * Evergreen UPSC guides — eligibility, exam pattern, syllabus and a beginner's
 * roadmap.
 *
 * These pages exist for search: "UPSC age limit", "UPSC syllabus" and "how to
 * start UPSC preparation" are what aspirants type long before they search for
 * an institute. Each page answers the question fully, then offers the next step.
 *
 * Facts follow the UPSC Civil Services Examination notification. UPSC revises
 * the rules from time to time, so every page tells the reader to confirm against
 * the current notification, and `reviewedOn` records when this copy was last
 * checked. TODO(institute): re-check every figure here when each year's notice
 * is published (usually in February) and update `reviewedOn`.
 */

export interface GuideTable {
  caption: string;
  head: string[];
  rows: string[][];
}

export interface GuideSection {
  /** Anchor id, also used by the "On this page" list. */
  id: string;
  heading: string;
  paragraphs?: string[];
  list?: string[];
  table?: GuideTable;
  /** A short highlighted aside — the point most people get wrong. */
  note?: string;
}

export interface UpscGuide {
  slug: string;
  /** H1 and the page title. */
  title: string;
  /** Short label for cards and related links. */
  shortTitle: string;
  /** Meta description and the hero's lead. */
  description: string;
  keywords: string[];
  sections: GuideSection[];
  faqs: { id: string; question: string; answer: string }[];
}

/** When the figures below were last checked against the UPSC notification. */
export const GUIDES_REVIEWED_ON = "October 2026";

export const UPSC_OFFICIAL_SITE = "https://upsc.gov.in";

export const UPSC_GUIDES: UpscGuide[] = [
  {
    slug: "eligibility",
    title: "UPSC eligibility: age limit, attempts and qualification",
    shortTitle: "Eligibility, age limit & attempts",
    description:
      "Who can sit the UPSC Civil Services Examination: the age limit and relaxations by category, the number of attempts, the degree you need and what counts as an attempt.",
    keywords: [
      "UPSC eligibility",
      "UPSC age limit",
      "UPSC number of attempts",
      "IAS eligibility",
      "UPSC qualification",
    ],
    sections: [
      {
        id: "education",
        heading: "Educational qualification",
        paragraphs: [
          "You need a bachelor's degree from a university recognised in India, or an equivalent qualification. Any subject and any percentage is acceptable — an engineering, commerce, arts or medical degree counts the same.",
          "Final-year students can apply for the Preliminary examination before their results are out. You must then show proof of passing your degree when you apply for the Main examination, so plan your Prelims year around when your degree will actually be complete.",
        ],
      },
      {
        id: "age",
        heading: "Age limit",
        paragraphs: [
          "Age is counted on 1 August of the examination year. You must be at least 21, and not older than the upper limit for your category.",
        ],
        table: {
          caption: "Upper age limit by category",
          head: ["Category", "Upper age limit", "Relaxation"],
          rows: [
            ["General / EWS", "32 years", "—"],
            ["OBC (non-creamy layer)", "35 years", "3 years"],
            ["SC / ST", "37 years", "5 years"],
            ["Persons with Benchmark Disability (PwBD)", "Up to 42 years for General", "10 years, on top of any category relaxation"],
            ["Defence services personnel disabled in operations", "35 years for General", "3 years"],
            ["Ex-servicemen (with qualifying service)", "37 years for General", "5 years"],
          ],
        },
        note: "Relaxations stack only in the ways the notification allows. If you fall in more than one category, check the exact combined limit in the current notice before you plan an attempt around it.",
      },
      {
        id: "attempts",
        heading: "Number of attempts",
        table: {
          caption: "Maximum attempts by category",
          head: ["Category", "Attempts allowed"],
          rows: [
            ["General / EWS", "6"],
            ["OBC", "9"],
            ["SC / ST", "Unlimited, until the upper age limit"],
            ["PwBD (General, EWS or OBC)", "9"],
            ["PwBD (SC / ST)", "Unlimited, until the upper age limit"],
          ],
        },
        paragraphs: [
          "An attempt is counted the moment you sit even one paper of the Preliminary examination. Applying and then not appearing does not use up an attempt; appearing and walking out after one paper does.",
        ],
        note: "If you are not ready, do not appear \"just to see the paper\". It costs one of a limited number of attempts. Take a full-length mock under exam conditions instead.",
      },
      {
        id: "nationality",
        heading: "Nationality",
        paragraphs: [
          "For the IAS, IPS and Indian Foreign Service you must be a citizen of India. Some of the other services filled through the same examination are also open to a few other categories — such as subjects of Nepal or Bhutan — under conditions set out in the notification.",
        ],
      },
      {
        id: "medical",
        heading: "Physical and medical standards",
        paragraphs: [
          "Every candidate recommended for appointment goes through a medical examination. Some services, particularly the police and other uniformed services, have additional physical standards. The standards are published as an appendix to the notification each year.",
        ],
      },
    ],
    faqs: [
      {
        id: "elig-final-year",
        question: "Can I write UPSC Prelims while in the final year of graduation?",
        answer:
          "Yes. Final-year students may apply for the Preliminary examination. You must produce proof of passing your degree when you apply for the Main examination.",
      },
      {
        id: "elig-percentage",
        question: "Is there a minimum percentage required for UPSC?",
        answer:
          "No. Any recognised bachelor's degree is enough, whatever the subject or percentage.",
      },
      {
        id: "elig-attempt-count",
        question: "Does applying for UPSC count as an attempt?",
        answer:
          "No. An attempt is counted only when you appear in at least one paper of the Preliminary examination.",
      },
      {
        id: "elig-age-date",
        question: "On which date is age calculated for UPSC?",
        answer:
          "On 1 August of the year of the examination. You must be at least 21 on that date and not older than your category's upper limit.",
      },
    ],
  },
  {
    slug: "exam-pattern",
    title: "UPSC exam pattern: Prelims, Mains and Interview",
    shortTitle: "Exam pattern & marks",
    description:
      "The three stages of the UPSC Civil Services Examination — Prelims, Mains and the Personality Test — with every paper, its marks, duration, negative marking and what counts towards your final rank.",
    keywords: [
      "UPSC exam pattern",
      "UPSC prelims pattern",
      "UPSC mains pattern",
      "UPSC marks distribution",
      "CSAT qualifying marks",
    ],
    sections: [
      {
        id: "overview",
        heading: "Three stages, one rank",
        paragraphs: [
          "The examination is held in three stages, each a filter for the next: the Preliminary examination (objective), the Main examination (written, descriptive) and the Personality Test (interview).",
          "Your final rank is decided by your Mains and Interview marks together — out of 2,025. Prelims only decides whether you reach Mains; its marks are not added to your final score.",
        ],
        table: {
          caption: "Stages at a glance",
          head: ["Stage", "Format", "Marks", "Counts towards rank?"],
          rows: [
            ["Preliminary", "2 objective papers", "400", "No — screening only"],
            ["Main", "9 descriptive papers", "1,750 (merit papers)", "Yes"],
            ["Personality Test", "Interview board", "275", "Yes"],
          ],
        },
      },
      {
        id: "prelims",
        heading: "Preliminary examination",
        table: {
          caption: "Prelims papers",
          head: ["Paper", "Questions", "Marks", "Duration", "Nature"],
          rows: [
            ["General Studies Paper I", "100", "200", "2 hours", "Decides the Mains cut-off"],
            ["General Studies Paper II (CSAT)", "80", "200", "2 hours", "Qualifying — 33% needed"],
          ],
        },
        list: [
          "Both papers are multiple choice and held on the same day.",
          "One-third of the marks for a question is deducted for each wrong answer. An unanswered question costs nothing.",
          "CSAT is qualifying: you need 33% (66 marks) to pass, but anything above that is not counted.",
          "Candidates who clear the Paper I cut-off — roughly 12 to 13 times the number of vacancies — move to Mains.",
        ],
        note: "Many strong candidates fail Prelims on CSAT, not on GS. If maths and reasoning are not your strength, practise CSAT from the first month, not the last.",
      },
      {
        id: "mains",
        heading: "Main examination",
        paragraphs: [
          "Mains has nine papers, each three hours long and written in answer booklets. Two are qualifying language papers; the other seven count towards your rank.",
        ],
        table: {
          caption: "Mains papers",
          head: ["Paper", "Subject", "Marks"],
          rows: [
            ["Paper A", "One Indian language (from the Eighth Schedule)", "300 — qualifying"],
            ["Paper B", "English", "300 — qualifying"],
            ["Paper I", "Essay", "250"],
            ["Paper II", "General Studies I — Heritage, culture, history, geography, society", "250"],
            ["Paper III", "General Studies II — Polity, governance, social justice, international relations", "250"],
            ["Paper IV", "General Studies III — Economy, environment, science & technology, security, disaster management", "250"],
            ["Paper V", "General Studies IV — Ethics, integrity and aptitude", "250"],
            ["Paper VI", "Optional subject — Paper 1", "250"],
            ["Paper VII", "Optional subject — Paper 2", "250"],
          ],
        },
        list: [
          "The language papers need a minimum of 25% each. If you fail either, your other papers are not evaluated.",
          "Candidates from some north-eastern states and Sikkim are exempt from the Indian-language paper, as set out in the notification.",
          "You may write Mains in English or in any language of the Eighth Schedule.",
        ],
      },
      {
        id: "interview",
        heading: "Personality Test",
        paragraphs: [
          "Roughly twice as many candidates as there are vacancies are called for the interview, held before a UPSC board in New Delhi. It carries 275 marks and assesses suitability for a career in public service — not general knowledge.",
          "Questions are largely drawn from your Detailed Application Form (DAF): your education, hometown, hobbies, work experience and optional subject.",
        ],
      },
      {
        id: "calendar",
        heading: "A typical year",
        table: {
          caption: "Usual examination calendar",
          head: ["Step", "Usually"],
          rows: [
            ["Notification and application", "February – March"],
            ["Preliminary examination", "Late May or June"],
            ["Main examination", "September"],
            ["Personality Test", "January – April of the following year"],
            ["Final result", "April – May of the following year"],
          ],
        },
        note: "One cycle takes about a year from notification to final result. Check the exact dates in UPSC's annual examination calendar.",
      },
    ],
    faqs: [
      {
        id: "pattern-prelims-count",
        question: "Are Prelims marks counted in the final UPSC merit list?",
        answer:
          "No. Prelims is a screening test. The final merit list is based on Mains (1,750) and the Personality Test (275), a total of 2,025.",
      },
      {
        id: "pattern-negative",
        question: "Is there negative marking in UPSC Prelims?",
        answer:
          "Yes. One-third of the marks assigned to a question is deducted for every wrong answer, in both papers. Unanswered questions carry no penalty.",
      },
      {
        id: "pattern-csat",
        question: "What are the qualifying marks for CSAT?",
        answer:
          "33%, which is 66 out of 200. CSAT marks above that are not used for the Prelims cut-off.",
      },
      {
        id: "pattern-medium",
        question: "Can I write UPSC Mains in Hindi or Marathi?",
        answer:
          "Yes. Mains can be written in English or any language in the Eighth Schedule of the Constitution, including Hindi and Marathi.",
      },
    ],
  },
  {
    slug: "syllabus",
    title: "UPSC syllabus: Prelims and Mains, paper by paper",
    shortTitle: "Prelims & Mains syllabus",
    description:
      "The UPSC Civil Services syllabus explained: General Studies and CSAT for Prelims, and Essay, GS I–IV and the optional subject for Mains — with how the papers overlap.",
    keywords: [
      "UPSC syllabus",
      "UPSC prelims syllabus",
      "UPSC mains syllabus",
      "GS paper 1 syllabus",
      "CSAT syllabus",
    ],
    sections: [
      {
        id: "read-it",
        heading: "Read the syllabus before any book",
        paragraphs: [
          "The official syllabus is short — a few pages. Toppers often say they read it dozens of times. Every topic you study should map to a line in it; anything that does not is optional reading at best.",
          "Prelims and Mains overlap heavily. Polity, history, geography, economy and environment are tested in both — objectively in Prelims, analytically in Mains. Studying them once, for both, is what an integrated plan means.",
        ],
      },
      {
        id: "prelims-gs",
        heading: "Prelims — General Studies Paper I",
        list: [
          "Current events of national and international importance",
          "History of India and the Indian National Movement",
          "Indian and world geography — physical, social and economic",
          "Indian polity and governance — Constitution, political system, Panchayati Raj, public policy, rights issues",
          "Economic and social development — sustainable development, poverty, inclusion, demographics, social sector initiatives",
          "Environmental ecology, biodiversity and climate change — at a general, non-specialist level",
          "General science",
        ],
      },
      {
        id: "prelims-csat",
        heading: "Prelims — General Studies Paper II (CSAT)",
        list: [
          "Reading comprehension",
          "Interpersonal skills, including communication",
          "Logical reasoning and analytical ability",
          "Decision-making and problem-solving",
          "General mental ability",
          "Basic numeracy and data interpretation — charts, graphs, tables, data sufficiency (Class X level)",
        ],
      },
      {
        id: "gs1",
        heading: "Mains — General Studies I",
        paragraphs: ["Indian heritage and culture, history and geography of the world and society."],
        list: [
          "Indian culture — art forms, literature and architecture from ancient to modern times",
          "Modern Indian history from the mid-18th century, and the freedom struggle",
          "Post-independence consolidation and reorganisation",
          "World history from the 18th century — industrial revolution, world wars, colonisation and decolonisation, political philosophies",
          "Indian society — diversity, role of women, population, poverty, urbanisation, globalisation, communalism, regionalism and secularism",
          "World physical geography, natural resources, location of industries, and phenomena such as earthquakes, tsunamis, volcanoes and cyclones",
        ],
      },
      {
        id: "gs2",
        heading: "Mains — General Studies II",
        paragraphs: ["Governance, Constitution, polity, social justice and international relations."],
        list: [
          "The Constitution — evolution, features, amendments, basic structure",
          "Union and states — federal structure, separation of powers, Parliament, executive and judiciary",
          "Constitutional, statutory and regulatory bodies",
          "Government policies, welfare schemes and the development sector — NGOs, self-help groups",
          "Health, education, human resources, poverty and hunger",
          "Governance — transparency, accountability, e-governance, the role of the civil services",
          "India and its neighbourhood, bilateral and global groupings, the diaspora and international institutions",
        ],
      },
      {
        id: "gs3",
        heading: "Mains — General Studies III",
        paragraphs: ["Technology, economic development, biodiversity, environment, security and disaster management."],
        list: [
          "Indian economy — planning, growth, inclusive growth, government budgeting",
          "Agriculture — cropping patterns, irrigation, subsidies, MSP, public distribution, food processing, land reforms",
          "Infrastructure and investment models; effects of liberalisation",
          "Science and technology — space, IT, robotics, biotechnology, intellectual property",
          "Conservation, pollution and environmental impact assessment",
          "Disaster management",
          "Internal security — extremism, cyber security, money laundering, border management, organised crime and terrorism, security forces and their mandates",
        ],
      },
      {
        id: "gs4",
        heading: "Mains — General Studies IV",
        paragraphs: ["Ethics, integrity and aptitude."],
        list: [
          "Ethics and human interface; attitude; emotional intelligence",
          "Aptitude and foundational values for the civil service — integrity, impartiality, objectivity, empathy",
          "Contributions of moral thinkers from India and the world",
          "Public service values, probity in governance, codes of conduct, RTI",
          "Case studies on all of the above",
        ],
        note: "GS IV is the paper most improved by practice. Case studies reward a structure you can only build by writing them — reading model answers is not enough.",
      },
      {
        id: "essay-optional",
        heading: "Essay and the optional subject",
        paragraphs: [
          "The Essay paper asks for two essays, each chosen from a separate section of topics. It tests whether you can hold a balanced, structured argument over a thousand words or so.",
          "The optional is one subject you choose from the list in the notification — humanities, sciences, engineering, medicine, commerce, law or the literature of an Indian language. It has two papers, together worth 500 marks, which is why choosing it well matters so much.",
        ],
      },
    ],
    faqs: [
      {
        id: "syllabus-overlap",
        question: "How much do the UPSC Prelims and Mains syllabi overlap?",
        answer:
          "Substantially. Polity, history, geography, economy, environment and science appear in both. Preparing them together — facts for Prelims and analysis for Mains — saves months.",
      },
      {
        id: "syllabus-optional-choice",
        question: "How should I choose my UPSC optional subject?",
        answer:
          "Weigh your interest in the subject, your academic background, its overlap with General Studies, and the guidance available for it. Read its syllabus and five years of its previous papers before deciding.",
      },
      {
        id: "syllabus-ncert",
        question: "Are NCERT books enough for the UPSC syllabus?",
        answer:
          "They are the right start, not the finish. NCERTs build the foundation; standard reference books, a daily newspaper and previous years' questions take you to exam level.",
      },
    ],
  },
  {
    slug: "how-to-start",
    title: "How to start UPSC preparation: a beginner's roadmap",
    shortTitle: "Beginner's roadmap",
    description:
      "A step-by-step plan for starting UPSC preparation from zero — what to read first, when to start writing answers, how to choose an optional, and how long it realistically takes.",
    keywords: [
      "how to start UPSC preparation",
      "UPSC preparation for beginners",
      "UPSC strategy",
      "IAS preparation plan",
      "UPSC preparation while in college",
    ],
    sections: [
      {
        id: "time",
        heading: "How long it actually takes",
        paragraphs: [
          "Most serious first-time aspirants need 12 to 15 months of full-time preparation before their first Prelims — longer if they are studying alongside college or a job. Many successful candidates clear the examination in their second or third attempt.",
          "That is not a reason to delay starting; it is a reason to plan the first year properly, so that an attempt is spent when you are ready and not before.",
        ],
      },
      {
        id: "steps",
        heading: "The first six months, step by step",
        list: [
          "Week 1 — Read the official notification and syllabus twice. Download the last ten years' Prelims and Mains papers.",
          "Months 1–3 — Build the base with NCERT textbooks (Classes 6–12) for history, geography, polity, economy and science.",
          "From day one — Read one national newspaper daily and keep short notes by syllabus topic, not by date.",
          "Months 2–5 — Move to one standard reference book per subject, for example M. Laxmikanth for polity. One book read three times beats three books read once.",
          "Month 2 onwards — Start answering previous years' questions, topic by topic, as soon as you finish each topic.",
          "Month 3 onwards — Begin writing Mains answers, even badly. Writing is a skill that improves only with practice and feedback.",
          "Months 3–4 — Choose your optional subject after reading its syllabus and past papers.",
          "Month 5 onwards — Take full-length timed tests regularly, including CSAT, and review every mistake.",
        ],
      },
      {
        id: "mistakes",
        heading: "Mistakes that cost beginners a year",
        list: [
          "Collecting material instead of revising it — too many sources, each read once",
          "Leaving answer writing until after Prelims",
          "Ignoring CSAT because it is \"only qualifying\"",
          "Studying current affairs separately from the static syllabus instead of linking them",
          "Sitting the exam unprepared \"for experience\" — it spends a limited attempt",
          "Preparing without anyone to review your answers or adjust your plan",
        ],
      },
      {
        id: "college",
        heading: "If you are still in college",
        paragraphs: [
          "Two hours a day through your final years — NCERTs, the newspaper and basic answer writing — can save you most of a year after graduation. Use your degree subject where it helps: it may be your optional.",
          "Remember you can only apply for Prelims in your final year, and must have passed your degree by the time you apply for Mains.",
        ],
      },
      {
        id: "working",
        heading: "If you are working",
        paragraphs: [
          "Working aspirants do clear the examination, but on a longer timeline. Protect three to four hours on weekdays and longer blocks at weekends, and use weekend test series to stay exam-ready. Decide in advance at which point you would take leave or move to full-time preparation.",
        ],
      },
      {
        id: "help",
        heading: "Where coaching helps — and where it does not",
        paragraphs: [
          "No institute can study for you. What good guidance does is shorten the path: a syllabus-mapped plan, tests on a fixed calendar, someone who evaluates your answers and tells you specifically why you lost marks, and a mentor who notices when your preparation is drifting.",
          "Whichever institute you consider, ask to attend a class first, ask how answers are evaluated and how quickly, and ask who your mentor will be. A good institute will answer all three without hesitation.",
        ],
      },
    ],
    faqs: [
      {
        id: "start-zero",
        question: "Can I start UPSC preparation from zero?",
        answer:
          "Yes — most aspirants do. Start with the syllabus and NCERT textbooks, read a newspaper daily, and begin practising previous years' questions within the first two months.",
      },
      {
        id: "start-hours",
        question: "How many hours a day should I study for UPSC?",
        answer:
          "Consistency matters more than a number. Full-time aspirants typically manage six to eight focused hours; working aspirants three to four on weekdays with longer weekends.",
      },
      {
        id: "start-coaching",
        question: "Is coaching necessary for UPSC?",
        answer:
          "Not necessary, but it helps most with structure, test practice, answer evaluation and mentorship. Self-study works best when someone still reviews your answers and your plan.",
      },
      {
        id: "start-optional-when",
        question: "When should a beginner choose the optional subject?",
        answer:
          "Around the third or fourth month, after the foundation is in place and you have read the syllabus and past papers of two or three candidate subjects.",
      },
    ],
  },
];

export function getGuide(slug: string): UpscGuide | undefined {
  return UPSC_GUIDES.find((guide) => guide.slug === slug);
}
