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
   * The drawn logotype, split so the two weights of the lockup can be set
   * separately. The logo deck ("VidyantIAS Logo Concepts", concept 01 — Kalam)
   * sets the name with a capital V; `name` above is the casing used in running
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
  label: "UPSC CSE 2026",
  year: "2026",
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
  quizzes: "/quizzes",
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

/** Desktop primary navigation. */
export const PRIMARY_NAV = [
  { label: "Home", href: ROUTES.home },
  { label: "About", href: ROUTES.about },
  { label: "Courses", href: ROUTES.courses },
  { label: "Faculty", href: ROUTES.faculty },
  { label: "Results", href: ROUTES.results },
  { label: "Resources", href: ROUTES.resources },
  { label: "Current Affairs", href: ROUTES.currentAffairs },
] as const;

/** Mobile drawer navigation — a superset of the desktop links. */
export const MOBILE_NAV = [
  ...PRIMARY_NAV,
  { label: "Admissions & Batches", href: ROUTES.enrol },
  { label: "Quizzes", href: ROUTES.quizzes },
  { label: "Events", href: ROUTES.events },
  { label: "Testimonials", href: ROUTES.testimonials },
  { label: "FAQ", href: ROUTES.faq },
  { label: "Contact", href: ROUTES.contact },
  { label: "Search", href: ROUTES.search },
] as const;

export const CTA = {
  enrol: { label: "Enroll Now", href: ROUTES.enrol },
  counselling: { label: "Book Free Counselling", href: ROUTES.counselling },
  brochure: { label: "Download Brochure", href: ROUTES.brochure },
  demo: { label: "Attend Free Demo", href: ROUTES.demo },
  callback: { label: "Request a Callback", href: `${ROUTES.contact}#callback` },
  enquiry: { label: "Send an Enquiry", href: `${ROUTES.contact}#enquiry` },
  orientation: { label: "Join Free UPSC Orientation", href: ROUTES.events },
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
 * TODO(institute): set `available: true` and add the store links once the app
 * ships. Until then the homepage asks to be notified rather than linking to a
 * store page that does not exist.
 */
export const APP: {
  available: boolean;
  android: string | null;
  ios: string | null;
} = {
  available: false,
  android: null,
  ios: null,
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
    { label: "About", href: ROUTES.about },
    { label: "Courses", href: ROUTES.courses },
    { label: "Admissions & Batches", href: ROUTES.enrol },
    { label: "Faculty", href: ROUTES.faculty },
    { label: "Results", href: ROUTES.results },
    { label: "Testimonials", href: ROUTES.testimonials },
  ],
  resources: [
    { label: "Current Affairs", href: ROUTES.currentAffairs },
    { label: "Practice Quizzes", href: ROUTES.quizzes },
    { label: "Blog", href: ROUTES.blog },
    { label: "UPSC Starter Kit", href: `${ROUTES.resources}#upsc-starter-kit` },
    { label: "PYQ Strategy", href: `${ROUTES.resources}#pyq-strategy` },
    { label: "Download Brochure", href: ROUTES.brochure },
    { label: "Events", href: ROUTES.events },
  ],
  legal: [
    { label: "Privacy Policy", href: ROUTES.privacy },
    { label: "Terms & Conditions", href: ROUTES.terms },
    { label: "Refund Policy", href: ROUTES.refund },
  ],
} as const;

export function whatsappUrl(message: string = CONTACT.whatsappMessage) {
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
