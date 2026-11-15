/**
 * Single source of truth for brand, contact and navigation data.
 *
 * PLACEHOLDER NOTICE: values marked `TODO(institute)` are not yet verified by
 * vidyantIAS. Replace them here — nothing else in the codebase hardcodes them.
 */

export const BRAND = {
  /** Exact casing is part of the brand. Do not render as "Vidyant IAS". */
  name: "vidyantIAS",
  legalName: "vidyantIAS",
  /**
   * The drawn logotype, split so the lockup can set the two parts separately.
   * The Breakout lockup sets the name with a capital V; `name` above is the casing used in running
   * copy. TODO(institute): confirm which casing wins, and align the other.
   */
  logotype: { lead: "Vidyant", trail: "IAS" },
  city: "Pune",
  state: "Maharashtra",
  /** The line that sits under the logo. */
  slogan: "Knowledge. Direction. Excellence.",
  tagline: "Prepare with clarity. Practice with purpose. Improve with mentorship.",
  /** The single promise the hero leads with. One sentence, no numbers. */
  usp: "A mentorship-first UPSC institute: concept-led classes, a fixed test calendar, Mains answer evaluation and one mentor who tracks your progress from day one.",
  description:
    "A structured UPSC preparation ecosystem combining expert teaching, rigorous practice, personalised mentorship and continuous performance tracking.",
  philosophy: ["Learn", "Practice", "Evaluate", "Mentor", "Improve"] as const,
  foundedYear: 2026,
} as const;

/**
 * The examination cycle the current admission drive targets.
 * TODO(institute): roll this forward when admissions move to the next cycle.
 */
export const EXAM_CYCLE = {
  label: "UPSC CSE 2027",
  year: "2027",
  admissionNote: "Admissions open",
} as const;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.vidyantias.com";

export const CONTACT = {
  // TODO(institute): replace with the verified centre address.
  addressLines: ["vidyantIAS Study Centre", "Pune", "Maharashtra 411001"],
  addressLocality: "Pune",
  addressRegion: "Maharashtra",
  postalCode: "411001",
  country: "IN",
  // TODO(institute): replace with the verified phone number (E.164 for tel:).
  phoneDisplay: "+91 00000 00000",
  phoneHref: "+910000000000",
  // TODO(institute): replace with the verified WhatsApp business number.
  whatsappNumber: "910000000000",
  whatsappMessage:
    "Hi vidyantIAS, I would like to know more about your UPSC programs.",
  // TODO(institute): replace with the official mailbox.
  email: "admissions@vidyantias.com",
  openingHours: [
    { days: "Monday – Saturday", hours: "9:00 am – 8:00 pm" },
    { days: "Sunday", hours: "10:00 am – 4:00 pm" },
  ],
  /** TODO(institute): replace with the Google Business Profile place embed. */
  mapsEmbedQuery: "vidyantIAS Pune",
  mapsDirectionsUrl:
    "https://www.google.com/maps/search/?api=1&query=vidyantIAS+Pune",
} as const;

export const SOCIAL_LINKS = [
  // TODO(institute): replace with official handles.
  { label: "Instagram", href: "https://instagram.com/", icon: "instagram" },
  { label: "YouTube", href: "https://youtube.com/", icon: "youtube" },
  { label: "LinkedIn", href: "https://linkedin.com/", icon: "linkedin" },
] as const;

export const ROUTES = {
  home: "/",
  about: "/about",
  courses: "/courses",
  faculty: "/faculty",
  results: "/results",
  testimonials: "/testimonials",
  resources: "/resources",
  currentAffairs: "/current-affairs",
  notes: "/notes",
  quizzes: "/quizzes",
  upscGuide: "/upsc-guide",
  mockTest: "/mock-test",
  parents: "/parents",
  blog: "/blog",
  events: "/events",
  demo: "/demo",
  counselling: "/counselling",
  enrol: "/enrol",
  brochure: "/brochure",
  contact: "/contact",
  faq: "/faq",
  login: "/login",
  search: "/search",
  privacy: "/privacy-policy",
  terms: "/terms",
  refund: "/refund-policy",
} as const;

/**
 * Primary navigation: the homepage's own sections. On the homepage a click
 * scrolls to the section; anywhere else `/#id` lands on home at that section.
 * `id` is the section's element id; `key` indexes `dict.nav` in
 * `src/i18n/dictionaries`, which is what the header renders. Keep the list in
 * page order — the active-section marker depends on it. Separate pages
 * are reached from the homepage cards (`ExploreCards`), the footer and the
 * mobile drawer. `onPhone` marks the sections the decluttered phone homepage
 * still renders (below `md`); the drawer hides the rest there, as their pages
 * are already listed under `MOBILE_NAV`.
 */
export const PRIMARY_NAV = [
  { key: "programs", label: "Programs", id: "programs", href: "/#programs", onPhone: true },
  { key: "resources", label: "Resources", id: "resources", href: "/#resources", onPhone: false },
  { key: "whatsNew", label: "What's New", id: "noticeboard", href: "/#noticeboard", onPhone: false },
  { key: "ourSystem", label: "Our System", id: "learning-system", href: "/#learning-system", onPhone: false },
  { key: "faq", label: "FAQ", id: "faq", href: "/#faq", onPhone: false },
  { key: "contact", label: "Contact", id: "contact", href: "/#contact", onPhone: false },
] as const;

/** Mobile drawer: page links, listed under the homepage sections. */
export const MOBILE_NAV = [
  { key: "about", label: "About", href: ROUTES.about },
  { key: "courses", label: "Courses", href: ROUTES.courses },
  { key: "enrol", label: "Admissions & Batches", href: ROUTES.enrol },
  { key: "faculty", label: "Faculty", href: ROUTES.faculty },
  { key: "results", label: "Results", href: ROUTES.results },
  { key: "mockTest", label: "Free Mock Test", href: ROUTES.mockTest },
  { key: "quizzes", label: "Quizzes", href: ROUTES.quizzes },
  { key: "currentAffairs", label: "Current Affairs", href: ROUTES.currentAffairs },
  { key: "notes", label: "Notes", href: ROUTES.notes },
  { key: "resources", label: "Resources", href: ROUTES.resources },
  { key: "upscGuide", label: "UPSC Exam Guide", href: ROUTES.upscGuide },
  { key: "parents", label: "For Parents", href: ROUTES.parents },
  { key: "events", label: "Events", href: ROUTES.events },
  { key: "testimonials", label: "Testimonials", href: ROUTES.testimonials },
  { key: "faq", label: "FAQ", href: ROUTES.faq },
  { key: "contact", label: "Contact", href: ROUTES.contact },
  { key: "search", label: "Search", href: ROUTES.search },
] as const;

export const CTA = {
  enrol: { label: "Enroll Now", href: ROUTES.enrol },
  counselling: { label: "Book Free Counselling", href: ROUTES.counselling },
  brochure: { label: "Download Brochure", href: ROUTES.brochure },
  demo: { label: "Attend Free Demo", href: ROUTES.demo },
  callback: { label: "Request a Callback", href: `${ROUTES.contact}#callback` },
  enquiry: { label: "Send an Enquiry", href: `${ROUTES.contact}#enquiry` },
  orientation: { label: "Join Free UPSC Orientation", href: ROUTES.events },
  mockTest: { label: "Take the Free Mock Test", href: ROUTES.mockTest },
  courses: { label: "Explore Courses", href: ROUTES.courses },
  resources: { label: "Free Study Material", href: ROUTES.resources },
  login: { label: "Student Login", href: ROUTES.login },
} as const;

/**
 * Programme brochure.
 * TODO(institute): upload the PDF to /public and set `href`. While it is null
 * the brochure page captures the request and emails the file instead of
 * serving a broken download.
 */
export const BROCHURE: { href: string | null; note: string } = {
  href: null,
  note: "Programmes, batch structure, test calendar and fee structure in one PDF.",
};

/**
 * Student app.
 * TODO(institute): set `available: true` and add the Play Store link once the app
 * ships. Until then the homepage asks to be notified rather than linking to a
 * store page that does not exist.
 */
export const APP: {
  available: boolean;
  android: string | null;
} = {
  available: false,
  android: null,
};

/**
 * YouTube channel used by the homepage video block.
 * TODO(institute): replace the channel URL and add real video ids. An empty
 * `featuredVideoIds` renders a channel invitation instead of an empty embed.
 */
export const YOUTUBE: {
  channelUrl: string;
  handle: string;
  featuredVideoIds: string[];
} = {
  channelUrl: "https://youtube.com/",
  handle: "@vidyantIAS",
  featuredVideoIds: [],
};

export const FOOTER_NAV = {
  explore: [
    { key: "about", label: "About", href: ROUTES.about },
    { key: "courses", label: "Courses", href: ROUTES.courses },
    { key: "enrol", label: "Admissions & Batches", href: ROUTES.enrol },
    { key: "faculty", label: "Faculty", href: ROUTES.faculty },
    { key: "results", label: "Results", href: ROUTES.results },
    { key: "testimonials", label: "Testimonials", href: ROUTES.testimonials },
    { key: "parents", label: "For Parents", href: ROUTES.parents },
  ],
  resources: [
    { key: "mockTest", label: "Free Mock Test", href: ROUTES.mockTest },
    { key: "upscGuide", label: "UPSC Exam Guide", href: ROUTES.upscGuide },
    { key: "currentAffairs", label: "Current Affairs", href: ROUTES.currentAffairs },
    { key: "notes", label: "Notes", href: ROUTES.notes },
    { key: "practiceQuizzes", label: "Practice Quizzes", href: ROUTES.quizzes },
    { key: "blog", label: "Blog", href: ROUTES.blog },
    { key: "starterKit", label: "UPSC Starter Kit", href: `${ROUTES.resources}#upsc-starter-kit` },
    { key: "pyqStrategy", label: "PYQ Strategy", href: `${ROUTES.resources}#pyq-strategy` },
    { key: "brochure", label: "Download Brochure", href: ROUTES.brochure },
    { key: "events", label: "Events", href: ROUTES.events },
  ],
  legal: [
    { key: "privacy", label: "Privacy Policy", href: ROUTES.privacy },
    { key: "terms", label: "Terms & Conditions", href: ROUTES.terms },
    { key: "refund", label: "Refund Policy", href: ROUTES.refund },
  ],
} as const;

export function whatsappUrl(message: string = CONTACT.whatsappMessage) {
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
