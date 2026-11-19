/**
 * Sample page content for the free resources, keyed by document id. Each body
 * is rendered on `/resources/<slug>` and exercises every style the Studio
 * offers (h2, h3, quote, bullet and numbered lists).
 *
 * Starting copy for testing the resource pages — editors are expected to
 * review and replace it in the Studio. It states only the examination's
 * published structure and general preparation advice: no institute results,
 * student numbers or dates (see the no-unverified-claims rule).
 *
 * Format: see `blocks()` in `./sanity.mjs`.
 */
export const RESOURCE_CONTENT = {
  "upsc-starter-kit": [
    "If you are starting UPSC preparation, the hardest part is not the volume of material — it is knowing what to do first. This kit lays out the examination, the order in which to build your foundation, and the habits worth forming in your first months.",
    { h2: "How the examination is structured" },
    "The Civil Services Examination runs in three stages, each a filter for the next.",
    {
      numbers: [
        "Preliminary Examination — two objective papers. General Studies Paper I decides whether you qualify; Paper II (CSAT) only has to be passed.",
        "Main Examination — nine descriptive papers: two qualifying language papers, and seven papers (Essay, four General Studies papers and two papers of your optional subject) that count towards your rank.",
        "Personality Test — an interview with a board, added to your Mains marks for the final merit list.",
      ],
    },
    { h2: "What to read first" },
    "Begin with the NCERT textbooks for History, Geography, Polity and Economics. They are short, accurate, and written for someone meeting the subject for the first time — which is exactly where you are.",
    { h3: "A sensible order" },
    {
      bullets: [
        "Polity and Geography first: they connect to almost every other subject.",
        "Then Modern History and Economy, alongside a daily newspaper.",
        "Environment, Science and Technology, and Ancient and Medieval History once the basics are steady.",
        "Pick your optional subject after you have read a little of each candidate subject, not before.",
      ],
    },
    { quote: "Read less, revise more. A book read three times beats three books read once." },
    { h2: "Habits for the first months" },
    {
      bullets: [
        "Read the newspaper daily, but limit it to an hour — note issues, not facts.",
        "Keep the syllabus printed beside you and tick off topics as you cover them.",
        "Start answering previous-year questions early, even badly. It shows you what the examination actually asks.",
        "Fix a weekly revision slot from the first week, not after the first month.",
      ],
    },
    "When you are ready to turn this into a dated plan for your own attempt, the Study Planner resource walks you through it.",
  ],

  "upsc-booklist": [
    "Most aspirants do not fail for want of books — they fail because they read too many. This list gives one standard source per area, the order to read them in, and what you can leave out.",
    { h2: "Foundation: NCERT textbooks" },
    {
      bullets: [
        "History: Classes 6 to 12, with particular attention to the Class 12 Themes in Indian History series.",
        "Geography: Classes 6 to 12, especially Fundamentals of Physical Geography and India: Physical Environment.",
        "Polity: Class 11 Indian Constitution at Work and Class 12 Politics in India since Independence.",
        "Economics: Class 11 Indian Economic Development and Class 12 Introductory Macroeconomics.",
      ],
    },
    { h2: "Standard references" },
    { h3: "General Studies" },
    {
      bullets: [
        "Polity — M. Laxmikanth, Indian Polity.",
        "Modern History — Spectrum, A Brief History of Modern India.",
        "Geography — G. C. Leong, Certificate Physical and Human Geography, with a good atlas.",
        "Economy — Ramesh Singh, Indian Economy, read alongside the latest Economic Survey and Union Budget.",
        "Environment — Shankar IAS, Environment.",
      ],
    },
    { h3: "Current affairs" },
    "One national newspaper daily, and one monthly compilation for revision. Government sources — PIB releases, the Economic Survey, India Year Book — are worth knowing for reference rather than reading cover to cover.",
    { quote: "Finish one source completely before you open a second one on the same subject." },
    { h2: "What you can safely skip" },
    {
      bullets: [
        "A second standard book for a subject you have already covered well.",
        "Several current-affairs compilations at once — they mostly repeat each other.",
        "Coaching notes for subjects where the NCERT and one standard book already cover the syllabus.",
      ],
    },
  ],

  "upsc-syllabus": [
    "The syllabus is the one document every question is drawn from. Read it until you know it by heart, and use it as a checklist — every topic you study should map to a line here.",
    { h2: "Preliminary Examination" },
    { h3: "General Studies Paper I" },
    {
      bullets: [
        "Current events of national and international importance.",
        "History of India and the Indian National Movement.",
        "Indian and World Geography — physical, social and economic geography of India and the world.",
        "Indian Polity and Governance — Constitution, political system, Panchayati Raj, public policy, rights issues.",
        "Economic and Social Development — sustainable development, poverty, inclusion, demographics, social sector initiatives.",
        "General issues on environmental ecology, biodiversity and climate change.",
        "General Science.",
      ],
    },
    { h3: "General Studies Paper II (CSAT)" },
    "Comprehension, interpersonal and communication skills, logical reasoning and analytical ability, decision-making and problem-solving, general mental ability, and basic numeracy and data interpretation. This paper is qualifying: you need to pass it, and its marks do not count towards your Prelims cut-off.",
    { h2: "Main Examination" },
    {
      numbers: [
        "Paper A — an Indian language (qualifying).",
        "Paper B — English (qualifying).",
        "Essay.",
        "General Studies I — Indian heritage and culture, history and geography of the world and society.",
        "General Studies II — governance, Constitution, polity, social justice and international relations.",
        "General Studies III — technology, economic development, biodiversity, environment, security and disaster management.",
        "General Studies IV — ethics, integrity and aptitude.",
        "Optional subject — Paper I.",
        "Optional subject — Paper II.",
      ],
    },
    { quote: "Always check the latest UPSC notification for the official syllabus; this page is a study aid, not a substitute for it." },
    { h2: "How to use this page" },
    "Break each line into sub-topics in your notebook and mark them as read, revised once, and revised twice. Before any test, you should be able to say which lines of the syllabus it covers.",
  ],

  "pyq-strategy": [
    "Previous-year questions are the most honest guide to the examination you will sit. They show which topics recur, how deep the questions go, and what the examiner treats as basic knowledge.",
    { h2: "Why start with PYQs" },
    {
      bullets: [
        "They tell you what not to study as clearly as what to study.",
        "They show the level of detail expected — usually less than coaching material suggests.",
        "They train you to read options and question wording carefully.",
      ],
    },
    { h2: "A method that works" },
    { h3: "For Prelims" },
    {
      numbers: [
        "Collect the last ten years of General Studies Paper I and sort the questions by subject.",
        "Before reading a topic, attempt its past questions cold. Note what you could not answer.",
        "Read the topic with those gaps in mind, then attempt the questions again.",
        "For every option — right or wrong — ask what you would need to know to eliminate it.",
      ],
    },
    { h3: "For Mains" },
    {
      numbers: [
        "Map each past question to a line of the syllabus.",
        "Write answers within the word limit and time, even for questions you find difficult.",
        "Compare your structure with the directive in the question: discuss, examine, critically analyse.",
        "Revisit the same question a month later and write it again.",
      ],
    },
    { quote: "A topic is finished when you can answer its past questions — not when you have finished the chapter." },
    { h2: "Common mistakes" },
    {
      bullets: [
        "Treating PYQs as a final-month revision tool instead of a starting point.",
        "Memorising answers instead of understanding why an option is wrong.",
        "Looking only at the last two or three years.",
      ],
    },
    "Our previous-year paper library has the question papers themselves, if you want to start right away.",
  ],

  "study-planner": [
    "A plan you can keep for a full cycle beats an ambitious one you abandon in a month. This planner helps you build a weekly routine with revision built in from the start.",
    { h2: "Build your week" },
    {
      numbers: [
        "Fix your available hours honestly — after work, college or family time.",
        "Assign one main subject and one secondary subject per week.",
        "Block a daily slot for the newspaper and a weekly slot for revision.",
        "Reserve one session for answer writing or a test.",
        "Leave half a day free: plans without slack break at the first disruption.",
      ],
    },
    { h2: "A sample weekly layout" },
    { h3: "Weekdays" },
    {
      bullets: [
        "Morning: main subject — new reading.",
        "Afternoon or evening: secondary subject, or optional subject.",
        "Daily: newspaper and short notes.",
      ],
    },
    { h3: "Weekend" },
    {
      bullets: [
        "Saturday: revision of everything read during the week.",
        "Sunday: a test or answer-writing session, then review of mistakes.",
      ],
    },
    { quote: "Revision is not what you do when you finish the syllabus. It is part of every week." },
    { h2: "Review every month" },
    "At the end of each month, compare what you planned with what you actually covered. Adjust the plan to fit your real pace rather than forcing yourself to catch up — falling behind is information, not failure.",
    {
      bullets: [
        "Which subjects slipped, and why?",
        "Did revision actually happen?",
        "Are your test scores moving, and on which topics?",
      ],
    },
  ],
};
