/**
 * The institute's four programmes as they appear on the homepage cards,
 * taken from the institute's own card artwork (2026-11-21). Keyed by the
 * Firestore course id, which is also the Sanity slug.
 *
 * `card` fills the Sanity "Programme card" group; `highlights` puts the three
 * card highlights first. `create` is the copy for a course that has a
 * Firestore record but no Sanity document yet — written only when the
 * document is missing, so an editor's text is never overwritten by it.
 */
export const COURSE_CARDS = {
  "current-affairs-prelims-2027": {
    order: 5,
    title: "Current Affairs Class for Prelims",
    card: {
      tagline: "Stay Updated. Stay Ahead.",
      badge: "2027",
      format: "Live Online Classes | Recorded",
      keyFact: "Dec – Apr 2027",
    },
    highlights: ["Comprehensive Coverage", "Prelims Linkages", "Monthly Revision"],
    create: {
      summary:
        "Current affairs classes for UPSC Prelims 2027, from December to April: comprehensive coverage, linked to the Prelims syllabus and revised every month. Live online classes with recorded access.",
      body: "Current affairs carry marks across the Prelims paper, but only when they are connected to the syllabus. These classes cover the developments that matter, link each one to the static topics UPSC asks about, and bring them back in a monthly revision so they are still with you on the day of the exam.",
      durationNote: "December to April, ahead of Prelims 2027",
    },
  },
  "foundation-program": {
    order: 10,
    title: "Foundation Program",
    card: {
      tagline: "Build a Strong Foundation.",
      badge: null,
      format: null,
      keyFact: "5 Modules",
    },
    highlights: [
      "GS Core",
      "Prelims Skills",
      "Mains Foundation",
      "CSAT",
      "Tests & evaluation",
      "Personal mentorship",
    ],
  },
  "upsc-prelims-test-series": {
    order: 15,
    title: "Prelims Test Series",
    card: {
      tagline: "Practice with Precision. Attempt with Confidence.",
      badge: "2027",
      format: "GS Sectional + Full Length Tests",
      keyFact: "40 Tests",
    },
    highlights: [
      "UPSC Prelims Pattern",
      "Detailed Analysis",
      "Solutions & Explanations",
      "Prelims sectional tests",
      "Current affairs tests",
      "Full-length mocks",
    ],
  },
  "mentorship-program": {
    order: 20,
    title: "Mentorship Program",
    card: {
      tagline: "Personal Guidance. Structured Support.",
      badge: null,
      format: "Online | Offline",
      keyFact: "At Every Step",
    },
    highlights: ["Personalised Study Plan", "Progress Tracking", "Doubt Resolution"],
    create: {
      summary:
        "Personal guidance and structured support at every step of your UPSC preparation: a personalised study plan, regular progress tracking and doubt resolution, online or offline.",
      body: "Every aspirant follows the same syllabus but not the same journey. The Mentorship Program pairs you with a mentor who builds a study plan around your stage, strengths and constraints, tracks your progress against it, and resolves doubts as they come up — so the plan keeps working as your preparation changes.",
      durationNote: "At every step of your preparation",
      mentorship:
        "A personalised study plan, regular progress reviews and doubt resolution with your mentor, online or offline.",
    },
  },
};
