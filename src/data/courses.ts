import type { Course, CourseCategory } from "@/types";

/**
 * Program catalogue.
 *
 * Structure, inclusions and pedagogy are vidyantIAS decisions and are safe to
 * publish. Anything commercial or calendar-bound (fee, batch dates, exact
 * duration) is written as "confirmed by the academic team" rather than guessed.
 * TODO(institute): confirm durations, batch schedules and fees, then update here.
 */
export const courses: Course[] = [
  {
    id: "foundation-program",
    slug: "foundation-program",
    category: "foundation",
    title: "UPSC Foundation Program",
    shortDescription:
      "A structured program covering GS, Prelims, Mains, CSAT and mentorship for aspirants starting their UPSC journey.",
    description:
      "The Foundation Program takes an aspirant from the syllabus document to examination readiness. It builds General Studies from first principles, adds Prelims practice and CSAT method early, introduces Mains answer writing before it becomes urgent, and keeps a mentor involved throughout so the plan adjusts to how you are actually progressing.",
    audience: [
      "College students preparing alongside their degree",
      "Fresh graduates beginning a full-time attempt",
      "Aspirants who have read on their own but need structure",
    ],
    duration: "Full-cycle program — duration confirmed by the academic team",
    mode: ["Classroom (Pune)", "Live online", "Recorded revision access"],
    features: [
      "GS Foundation",
      "Prelims preparation",
      "Mains answer writing",
      "CSAT",
      "Tests & evaluation",
      "Personal mentorship",
    ],
    outcomes: [
      "Complete coverage of the Prelims and Mains GS syllabus",
      "A tested revision routine you can sustain",
      "Answer writing practice built up gradually, not crammed",
      "A realistic plan for your target attempt",
    ],
    curriculum: [
      {
        title: "General Studies core",
        topics: ["Polity & Governance", "History & Culture", "Geography", "Economy", "Environment & Ecology", "Science & Technology"],
      },
      {
        title: "Current affairs integration",
        topics: ["Daily news analysis", "Monthly compilations", "Linking news to static syllabus", "Prelims-relevant factual notes"],
      },
      {
        title: "Prelims skills",
        topics: ["PYQ analysis", "Elimination technique", "Sectional tests", "Full-length mocks"],
      },
      {
        title: "Mains foundation",
        topics: ["Answer structure", "Introduction & conclusion", "Diagrams and data use", "Essay basics", "Ethics fundamentals"],
      },
      {
        title: "CSAT",
        topics: ["Comprehension", "Logical reasoning", "Basic numeracy", "Practice sets"],
      },
    ],
    tests: "Sectional tests through the teaching phase, followed by full-length Prelims mocks and introductory Mains tests with evaluation.",
    mentorship:
      "A personal mentor, periodic progress reviews, test-performance analysis and study planning for the whole program duration.",
    studyMaterial: [
      "vidyantIAS class notes",
      "Monthly current affairs compilations",
      "PYQ workbooks",
      "Recommended booklist with reading order",
    ],
    schedule: "Weekday batches, with weekend options subject to availability",
    fee: "Shared transparently during counselling, including instalment options",
    facultyIds: ["faculty-gs-polity", "faculty-gs-economy", "faculty-csat"],
    faqIds: ["faq-beginners", "faq-online", "faq-mentorship", "faq-fees", "faq-material"],
    status: "published",
  },
  {
    id: "prelims-program",
    slug: "prelims-program",
    category: "prelims",
    title: "Prelims Program",
    shortDescription:
      "Focused preparation for Prelims with CSAT, previous-year questions and a continuous test cycle.",
    description:
      "A Prelims-first program for aspirants who have covered the syllabus at least once and now need accuracy, recall and test temperament. Teaching is organised around what Prelims actually rewards: high-yield revision, disciplined elimination, and enough mocks to make your score predictable rather than lucky.",
    audience: [
      "Aspirants targeting the next Prelims",
      "Repeat aspirants who missed the cut-off narrowly",
      "Students who need a revision-and-testing structure",
    ],
    duration: "Prelims cycle — duration confirmed by the academic team",
    mode: ["Classroom (Pune)", "Live online", "Recorded revision access"],
    features: [
      "High-yield GS revision",
      "PYQ-driven teaching",
      "CSAT preparation",
      "Sectional & full-length tests",
      "Test analysis sessions",
      "Mentor check-ins",
    ],
    outcomes: [
      "A revision cycle you complete more than once",
      "Improved accuracy under time pressure",
      "A tested approach to attempting borderline questions",
      "CSAT cleared without last-minute anxiety",
    ],
    curriculum: [
      {
        title: "Revision modules",
        topics: ["Polity", "History", "Geography", "Economy", "Environment", "Science & Technology"],
      },
      {
        title: "Current affairs for Prelims",
        topics: ["Fact-focused notes", "Government schemes", "Reports & indices", "Monthly quizzes"],
      },
      {
        title: "Question practice",
        topics: ["PYQ decoding", "Statement-based questions", "Match-the-pair drills", "Assertion-reason sets"],
      },
      {
        title: "CSAT",
        topics: ["Comprehension speed", "Reasoning patterns", "Numeracy essentials", "Timed sets"],
      },
    ],
    tests: "A published Prelims test calendar with sectional tests, full-length mocks, detailed solutions and post-test analysis.",
    mentorship:
      "Mentor-led test analysis after each full-length mock, with a corrective plan for weak areas before the next test.",
    studyMaterial: [
      "Revision notes and one-pagers",
      "PYQ workbooks with explanations",
      "Current affairs compilations",
      "CSAT practice sets",
    ],
    schedule: "Aligned to the Prelims calendar; batch timings shared at enrolment",
    fee: "Shared transparently during counselling, including instalment options",
    facultyIds: ["faculty-gs-polity", "faculty-gs-economy", "faculty-csat"],
    faqIds: ["faq-online", "faq-recordings", "faq-mentorship", "faq-fees"],
    status: "published",
  },
  {
    id: "mains-program",
    slug: "mains-program",
    category: "mains",
    title: "Mains Program",
    shortDescription:
      "Answer writing, GS papers, Essay and Ethics with detailed written evaluation and feedback.",
    description:
      "Mains rewards writing, not reading. This program is built around a weekly cycle of teaching, writing and evaluated feedback across GS-I to GS-IV, Essay and Ethics, so that structure, argument and time discipline improve measurably between one test and the next.",
    audience: [
      "Aspirants who have cleared or expect to clear Prelims",
      "Repeat aspirants whose Mains score has plateaued",
      "Students who read well but write inconsistently",
    ],
    duration: "Mains cycle — duration confirmed by the academic team",
    mode: ["Classroom (Pune)", "Live online", "Recorded revision access"],
    features: [
      "GS-I to GS-IV",
      "Essay preparation",
      "Ethics & case studies",
      "Weekly answer writing",
      "Detailed evaluation",
      "One-to-one feedback",
    ],
    outcomes: [
      "A repeatable answer structure for each question type",
      "Faster writing without losing content quality",
      "Case-study approach for Ethics",
      "Essays with a clear argument rather than a list of points",
    ],
    curriculum: [
      {
        title: "GS-I",
        topics: ["History & Culture", "Society", "Geography", "World history"],
      },
      {
        title: "GS-II",
        topics: ["Polity", "Governance", "Social justice", "International relations"],
      },
      {
        title: "GS-III",
        topics: ["Economy", "Agriculture", "Science & Technology", "Environment", "Internal security"],
      },
      {
        title: "GS-IV & Essay",
        topics: ["Ethics fundamentals", "Case studies", "Essay structure", "Philosophical essays"],
      },
      {
        title: "Answer writing lab",
        topics: ["Question demand analysis", "Introductions & conclusions", "Diagrams and data", "Time management drills"],
      },
    ],
    tests: "Sectional and full-length Mains tests on a published calendar, each returned with written evaluation and a follow-up discussion.",
    mentorship:
      "Evaluation-linked mentorship: your mentor reads your feedback trail and sets the next writing target with you.",
    studyMaterial: [
      "Model answers and structure templates",
      "Topic-wise question banks",
      "Ethics case-study compendium",
      "Essay reference material",
    ],
    schedule: "Weekly writing and discussion cycle; timings shared at enrolment",
    fee: "Shared transparently during counselling, including instalment options",
    facultyIds: ["faculty-mains-essay", "faculty-gs-economy", "faculty-gs-polity"],
    faqIds: ["faq-evaluation", "faq-mentorship", "faq-online", "faq-fees"],
    status: "published",
  },
  {
    id: "optional-subjects",
    slug: "optional-subjects",
    category: "optional",
    title: "Optional Subject Programs",
    shortDescription:
      "Focused optional preparation with experienced subject faculty, structured practice and evaluation.",
    description:
      "The optional paper carries 500 marks and decides many final results. Optional batches at vidyantIAS cover the syllabus completely, connect it to previous-year questions, and run subject-specific answer writing with evaluation by the subject faculty rather than a generalist.",
    audience: [
      "Aspirants choosing an optional for the first time",
      "Students whose optional score is holding back their total",
      "Aspirants who need subject-specific answer writing practice",
    ],
    duration: "Subject-wise cycle — duration confirmed by the academic team",
    mode: ["Classroom (Pune)", "Live online"],
    features: [
      "Complete syllabus coverage",
      "Subject-specific answer writing",
      "PYQ analysis",
      "Subject test series",
      "Faculty evaluation",
      "Doubt sessions",
    ],
    outcomes: [
      "Syllabus covered in the sequence the paper expects",
      "A tested answer template for your subject",
      "Confidence in Paper I and Paper II equally",
    ],
    curriculum: [
      {
        title: "Syllabus coverage",
        topics: ["Paper I modules", "Paper II modules", "Terminology and frameworks", "Standard references"],
      },
      {
        title: "Application",
        topics: ["PYQ mapping", "Answer templates", "Diagrams and case examples", "Subject-specific data"],
      },
      {
        title: "Testing",
        topics: ["Sectional tests", "Full-length papers", "Evaluated practice", "Improvement review"],
      },
    ],
    tests: "Subject-wise sectional tests and full-length papers with evaluation by the subject faculty.",
    mentorship: "Subject mentor guidance on sequencing, sources and revision depth.",
    studyMaterial: [
      "Subject notes",
      "Question banks with model answers",
      "Reference and reading list",
    ],
    schedule: "Batches open per cycle based on subject demand and faculty availability",
    fee: "Shared transparently during counselling, including instalment options",
    facultyIds: ["faculty-mains-essay"],
    faqIds: ["faq-optional", "faq-evaluation", "faq-fees"],
    status: "published",
  },
  {
    id: "test-series",
    slug: "test-series",
    category: "test-series",
    title: "Prelims & Mains Test Series",
    shortDescription:
      "A structured testing cycle with solutions, evaluation and performance analysis you can act on.",
    description:
      "Testing is where preparation becomes measurable. The vidyantIAS test series follows a published calendar, returns detailed solutions and — for Mains — written evaluation, and pairs every test with an analysis view that shows which areas are costing you marks.",
    audience: [
      "Self-study aspirants who need structured testing",
      "Students enrolled elsewhere who want additional practice",
      "Repeat aspirants working on accuracy and writing speed",
    ],
    duration: "Test calendar published per cycle",
    mode: ["Centre-based", "Online"],
    features: [
      "Prelims sectional & full-length tests",
      "Mains sectional & full-length tests",
      "Detailed solutions",
      "Written evaluation for Mains",
      "Performance analysis",
      "Discussion sessions",
    ],
    outcomes: [
      "A clear picture of your current standing",
      "Mistake patterns identified early enough to fix",
      "Steady improvement in attempt strategy and accuracy",
    ],
    curriculum: [
      {
        title: "Prelims testing",
        topics: ["Subject-wise sectional tests", "Current affairs tests", "CSAT tests", "Full-length mocks"],
      },
      {
        title: "Mains testing",
        topics: ["GS paper-wise tests", "Essay tests", "Ethics tests", "Full-length simulations"],
      },
      {
        title: "Analysis",
        topics: ["Solution discussion", "Error classification", "Improvement targets"],
      },
    ],
    tests: "Full published calendar for both stages, with make-up windows for students who miss a scheduled test.",
    mentorship: "Post-test analysis sessions; personal mentorship where the enrolled program includes it.",
    studyMaterial: ["Solution booklets", "Model answers", "Performance reports"],
    schedule: "Published test calendar per cycle",
    fee: "Shared transparently during counselling, including instalment options",
    facultyIds: ["faculty-gs-polity", "faculty-mains-essay", "faculty-csat"],
    faqIds: ["faq-evaluation", "faq-fees", "faq-online"],
    status: "published",
  },
];

export const publishedCourses = courses.filter((course) => course.status === "published");

export const COURSE_CATEGORY_LABELS: Record<CourseCategory, string> = {
  foundation: "Foundation",
  prelims: "Prelims",
  mains: "Mains",
  optional: "Optional",
  "test-series": "Test Series",
};

/** Programs featured on the homepage, in display order. */
export const homepageCourseIds = [
  "foundation-program",
  "prelims-program",
  "mains-program",
  "optional-subjects",
] as const;

export const homepageCourses = homepageCourseIds
  .map((id) => courses.find((course) => course.id === id))
  .filter((course): course is Course => Boolean(course));

export function courseBySlug(slug: string) {
  return courses.find((course) => course.slug === slug);
}

export function coursesByIds(ids: string[]) {
  return courses.filter((course) => ids.includes(course.id));
}
