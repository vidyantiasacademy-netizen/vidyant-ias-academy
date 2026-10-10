/**
 * English UI strings — the source dictionary. Its shape is the `Dictionary`
 * type, so a key added here is a type error in every other locale until it is
 * translated there too.
 *
 * UI chrome only. Editorial content (blog, current affairs, faculty, courses)
 * is translated in Sanity, per document.
 */
export const en = {
  common: {
    skipToContent: "Skip to main content",
    search: "Search vidyantIAS",
    call: "Call {phone}",
    whatsappChat: "Chat with vidyantIAS on WhatsApp",
    whatsappShort: "WhatsApp us",
    backToTop: "Back to top",
  },
  nav: {
    primary: "Primary",
    mobile: "Mobile",
    openMenu: "Open menu",
    contactDetails: "Contact details",
    closeMenu: "Close menu",
    home: "Home",
    about: "About",
    courses: "Courses",
    faculty: "Faculty",
    results: "Results",
    resources: "Resources",
    currentAffairs: "Current Affairs",
    enrol: "Admissions & Batches",
    quizzes: "Quizzes",
    practiceQuizzes: "Practice Quizzes",
    mockTest: "Free Mock Test",
    upscGuide: "UPSC Exam Guide",
    parents: "For Parents",
    events: "Events",
    testimonials: "Testimonials",
    faq: "FAQ",
    contact: "Contact",
    search: "Search",
    blog: "Blog",
    starterKit: "UPSC Starter Kit",
    pyqStrategy: "PYQ Strategy",
    brochure: "Download Brochure",
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
    refund: "Refund Policy",
  },
  cta: {
    enrol: "Enroll Now",
    counselling: "Book Free Counselling",
    counsellingShort: "Free Counselling",
    brochure: "Download Brochure",
    demo: "Attend Free Demo",
    login: "Student Login",
    courses: "Explore Courses",
  },
  footer: {
    explore: "Explore",
    resources: "Resources",
    contact: "Contact",
    social: "vidyantIAS on {network}",
    rights: "All rights reserved.",
    openingHours: [
      { days: "Monday – Saturday", hours: "9:00 am – 8:00 pm" },
      { days: "Sunday", hours: "10:00 am – 4:00 pm" },
    ],
  },
  language: {
    label: "Language",
    switchTo: "Read this page in {language}",
  },
  notFound: {
    title: "Lost your way?",
    body: "Let's get you back to your UPSC preparation.",
    home: "Back to Home",
  },
};

/** Widened to `string` leaves, so translations are not pinned to the English text. */
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof en>;
