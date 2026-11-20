/**
 * Sample page content for the free resources, keyed by document id. Each body
 * is rendered on `/resources/<slug>` and exercises every style the Studio
 * offers (h2, h3, quote, bullet and numbered lists).
 *
 * The starter kit, PYQ strategy and study planner are vidyantIAS's own copy
 * (pasted into the Studio on 2026-11-20, structured here). The booklist and
 * syllabus are starting copy for editors to review. None of it states
 * institute results, student numbers or dates (no-unverified-claims rule).
 *
 * Format: see `blocks()` in `./sanity.mjs`.
 */
export const RESOURCE_CONTENT = {
  "upsc-starter-kit": [
    "Starting your UPSC journey? Here’s what you need to know before you begin.",
    "Preparing for the UPSC Civil Services Examination can feel overwhelming, especially when you are unsure where to start. With countless resources, strategies and opinions available, beginners often struggle to identify what truly matters.",
    { quote: "The key is simple: start with clarity, not confusion." },
    { h2: "1. Understand the Examination" },
    "The UPSC Civil Services Examination has three stages:",
    {
      bullets: [
        "**Prelims:** Tests conceptual understanding, factual accuracy and decision-making.",
        "**Mains:** Evaluates analytical thinking, subject knowledge and written expression.",
        "**Personality Test:** Assesses judgment, awareness and suitability for public service.",
      ],
    },
    "Each stage demands a different set of skills, making it essential to understand the examination before beginning preparation.",
    { h2: "2. Focus on Concepts, Not Just Facts" },
    "UPSC increasingly tests the application of knowledge rather than isolated memorisation.",
    "For example, understanding federalism means more than knowing its definition. It involves recognising how Centre–State relations function in practice.",
    "Build conceptual clarity first. Facts become easier to remember when you understand their context.",
    { h2: "3. Connect Current Affairs With Static Subjects" },
    "Current affairs should not be studied as disconnected news events.",
    "A Supreme Court judgment may relate to constitutional provisions, while a climate summit may connect with environmental conventions and international relations.",
    "Focus on understanding **why** an issue matters, not merely what happened.",
    { h2: "4. Develop the Right Preparation Habits" },
    "Effective preparation depends on a few essential practices:",
    {
      bullets: [
        "Study consistently rather than irregularly for long hours.",
        "Revise concepts to strengthen retention.",
        "Develop analytical and critical thinking.",
        "Focus on understanding rather than collecting excessive information.",
        "Evaluate your progress without comparing yourself with others.",
      ],
    },
    { h2: "5. Avoid Common Beginner Mistakes" },
    "Many aspirants lose valuable time by following multiple strategies, changing resources frequently or focusing excessively on study hours.",
    { quote: "The quality of preparation matters more than the quantity of material covered." },
    "Choose a clear approach, remain consistent and make improvements based on your learning needs.",
    { h2: "Final Takeaway" },
    "UPSC preparation is a journey of developing knowledge, discipline and perspective. You do not need to master everything from the beginning.",
    "Start by understanding the examination, strengthening your fundamentals and developing the ability to think critically.",
    "**A strong foundation today creates better preparation tomorrow.**",
    "*Vidyant IAS — Right knowledge. Right direction. Every step.*",
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
    "Previous-Year Questions (PYQs) are an essential part of UPSC preparation. They help aspirants understand the nature of questions, important areas of the syllabus and the level of conceptual clarity required for the examination.",
    { h2: "1. Start with Previous-Year Questions" },
    "Before beginning a subject, go through its previous-year questions to understand the areas UPSC has focused on.",
    {
      bullets: [
        "**Prelims:** last 10–15 years.",
        "**Mains:** last 10 years.",
      ],
    },
    { h2: "2. Analyse Questions Subject-Wise" },
    "Arrange PYQs according to the syllabus. Pay attention to frequently tested concepts, recurring themes and changes in the way questions are framed.",
    { h2: "3. Focus on Understanding" },
    {
      bullets: [
        "**For Prelims:** examine each statement carefully. Understand why an option is correct or incorrect and practise elimination techniques.",
        "**For Mains:** identify the demand of the question, directive words and key points that need to be addressed.",
      ],
    },
    { h2: "4. Connect with Current Affairs" },
    "While studying current affairs, revisit related PYQs. This helps in understanding how static subjects are connected with contemporary developments.",
    { h2: "5. Practise and Revise" },
    "Solve PYQs after completing each subject. Review incorrect answers, revise weak areas and practise full-length papers within the prescribed time.",
    { h2: "6. Avoid Selective Preparation" },
    "PYQs help identify important areas, but they do not cover the entire syllabus. Do not limit preparation to previously asked topics.",
    { h2: "A Final Note" },
    "PYQs should be studied alongside standard books and the UPSC syllabus, not left until the final months of preparation.",
    { quote: "Regular analysis and revision will make PYQs far more useful than simply solving a large number of questions." },
    "*Vidyant IAS — Right knowledge. Right direction. Every step.*",
  ],
  "study-planner": [
    "Clearing UPSC is not about studying the maximum number of hours. It is about mastering the syllabus, understanding UPSC’s question patterns, revising consistently and improving through tests.",
    "No study plan can guarantee selection, but a disciplined, examination-oriented approach can significantly improve an aspirant’s chances.",
    { h2: "1. The 12-Month Preparation Roadmap" },
    {
      bullets: [
        "**Month 1:** NCERTs (Classes 6–12), syllabus analysis and PYQs.",
        "**Month 2:** Polity and Modern Indian History.",
        "**Month 3:** Geography and Indian Economy.",
        "**Month 4:** Environment, Ecology and Biodiversity.",
        "**Month 5:** Ancient & Medieval History, Art & Culture.",
        "**Month 6:** Science & Technology and Indian Society.",
        "**Month 7:** Governance, Social Justice and International Relations.",
        "**Month 8:** Ethics, Internal Security and Disaster Management.",
        "**Month 9:** GS consolidation, Essay and Mains answer writing.",
        "**Month 10:** First comprehensive revision and sectional tests.",
        "**Month 11:** Prelims-focused revision, PYQs and mock tests.",
        "**Month 12:** Intensive Prelims practice, CSAT and final revision.",
      ],
    },
    "**Throughout the year:** Optional Subject, Current Affairs, CSAT, PYQs and regular revision. Begin Mains answer writing once foundational concepts are clear. Align the final Prelims phase with the actual examination date.",
    { h2: "2. Daily Study Schedule" },
    {
      bullets: [
        "**General Studies:** 3 hours",
        "**Optional Subject:** 2 hours",
        "**Current Affairs:** 1 hour",
        "**PYQs / MCQs / Answer Writing:** 1 hour",
        "**Revision:** 1 hour",
      ],
    },
    "**Total: 8 focused hours.**",
    { quote: "Quality of study matters more than the number of hours recorded." },
    { h2: "3. Weekly Strategy" },
    {
      bullets: [
        "**Monday–Friday:** Complete GS and Optional targets with daily revision.",
        "**Saturday:** Practise PYQs, CSAT and sectional tests.",
        "**Sunday:** Revise the week’s topics, analyse mistakes and clear backlogs.",
      ],
    },
    { h2: "4. The Topper-Oriented Approach" },
    {
      numbers: [
        "**Syllabus First:** Keep the UPSC syllabus accessible and connect every topic to its relevant syllabus heading.",
        "**PYQ-Driven Preparation:** Analyse at least 10 years of Prelims and Mains PYQs to identify recurring themes, question patterns and expected depth.",
        "**Limited Resources, Multiple Revisions:** Follow one reliable foundational source per topic and supplement it selectively.",
        "**Integrated Preparation:** Study each topic from both Prelims and Mains perspectives instead of preparing for them as completely separate examinations.",
        "**Active Recall:** After completing a topic, test your understanding without referring to notes.",
        "**Answer Writing:** Develop structured, analytical answers supported by relevant examples, constitutional provisions, data and diagrams where appropriate.",
        "**Test Analysis:** Maintain an error notebook. Identify conceptual gaps, factual mistakes and errors in question interpretation.",
        "**Revision Before Expansion:** Prioritise retaining completed subjects over continuously adding new material.",
      ],
    },
    { h2: "5. Monthly Performance Review" },
    "At the end of each month, evaluate:",
    {
      bullets: [
        "Syllabus completed against planned targets.",
        "Accuracy and performance in sectional tests.",
        "Optional subject progress.",
        "Quality of Mains answers.",
        "Revision backlog and recurring mistakes.",
      ],
    },
    "Set the following month’s targets based on these findings.",
    { h2: "Final Advice" },
    "The strongest aspirants do not simply complete the syllabus. They develop the ability to recall, analyse and apply what they have studied under examination conditions.",
    { quote: "Study with the syllabus. Think through PYQs. Improve through tests. Succeed through consistency." },
    "*Vidyant IAS — Right knowledge. Right direction. Every step.*",
  ],
};
