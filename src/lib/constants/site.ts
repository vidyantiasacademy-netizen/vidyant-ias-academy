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
   * The drawn logotype, split so its two colours can be set separately
   * ("Vidyant" in the ink, "IAS" in saffron). The logo artwork sets the name
   * with a capital V; `name` above is the casing used in running copy. TODO(institute): confirm which casing wins, and align the other.
   */
  logotype: { lead: "Vidyant", trail: "IAS" },
  city: "Pune",
  state: "Maharashtra",
  /** The line that sits under the logo. */
  slogan: "Right knowledge. Right direction. Every step.",
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
  /** As the institute gave it (2026-11-21). Joined with ", " wherever it is printed. */
  addressLines: [
    "Second Floor, Amit Complex, Tilak Road",
    "Opposite New English School, Near Navgraha Mandir",
    "Pantancha Gate, Sadashiv Peth",
    "Pune, Maharashtra 411030",
  ],
  /** The street part alone, for structured data. */
  streetAddress:
    "Second Floor, Amit Complex, Tilak Road, Opposite New English School, Near Navgraha Mandir, Pantancha Gate, Sadashiv Peth",
  addressLocality: "Pune",
  addressRegion: "Maharashtra",
  postalCode: "411030",
  country: "IN",
  phoneDisplay: "+91 73978 23816",
  /** E.164, for `tel:` links. */
  phoneHref: "+917397823816",
  /** Country code and number, no `+`, for `wa.me` links. */
  whatsappNumber: "917397823816",
  whatsappMessage:
    "Hi vidyantIAS, I would like to know more about your UPSC programs.",
  email: "admissions@vidyantias.com",
  openingHours: [
    { days: "Monday – Saturday", hours: "9:00 am – 8:00 pm" },
    // "Closed" has no times, so structured data leaves Sunday out — which is how
    // schema.org says a day is closed.
    { days: "Sunday", hours: "Closed" },
  ],
  /** TODO(institute): swap for the Google Business Profile place embed once it exists. */
  mapsEmbedQuery: "Amit Complex, Tilak Road, Sadashiv Peth, Pune 411030",
  mapsDirectionsUrl:
    "https://www.google.com/maps/search/?api=1&query=Amit+Complex%2C+Tilak+Road%2C+Sadashiv+Peth%2C+Pune+411030",
} as const;

/**
 * Official profiles (institute, 2026-11-21). LinkedIn returns here once the
 * institute has a page — the icon set still supports it.
 */
export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/vidyant_ias_academy/", icon: "instagram" },
  { label: "YouTube", href: "https://www.youtube.com/@vidyantiasacademy", icon: "youtube" },
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
  pyqTest: "/pyq-test",
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
  { key: "faq", label: "FAQ", id: "faq", href: "/#faq", onPhone: false },
  { key: "contact", label: "Contact", id: "contact", href: "/#contact", onPhone: false },
] as const;

/**
 * Desktop header bar: the homepage sections plus two page links, About and
 * Blog. Section items carry an `id` (scroll-tracked marker); page items do
 * not and are marked by pathname instead. The phone drawer keeps sections and
 * pages in separate lists (`PRIMARY_NAV`, `MOBILE_NAV`).
 */
export const DESKTOP_NAV: ReadonlyArray<
  (typeof PRIMARY_NAV)[number] | { key: "about" | "blog"; label: string; href: string }
> = [
  { key: "about", label: "About", href: ROUTES.about },
  ...PRIMARY_NAV.filter((item) => item.key !== "faq" && item.key !== "contact"),
  { key: "blog", label: "Blog", href: ROUTES.blog },
  ...PRIMARY_NAV.filter((item) => item.key === "faq" || item.key === "contact"),
];

/** Mobile drawer: page links, listed under the homepage sections. */
export const MOBILE_NAV = [
  { key: "about", label: "About", href: ROUTES.about },
  { key: "courses", label: "Courses", href: ROUTES.courses },
  { key: "enrol", label: "Admissions & Batches", href: ROUTES.enrol },
  { key: "faculty", label: "Faculty", href: ROUTES.faculty },
  { key: "results", label: "Results", href: ROUTES.results },
  { key: "mockTest", label: "Free Mock Test", href: ROUTES.mockTest },
  { key: "pyqTest", label: "Free PYQ Test", href: ROUTES.pyqTest },
  { key: "currentAffairs", label: "Current Affairs", href: ROUTES.currentAffairs },
  { key: "notes", label: "Notes", href: ROUTES.notes },
  { key: "blog", label: "Blog", href: ROUTES.blog },
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
 * TODO(institute): add real video ids. An empty `featuredVideoIds` renders a
 * channel invitation instead of an empty embed.
 */
export const YOUTUBE: {
  channelUrl: string;
  handle: string;
  featuredVideoIds: string[];
} = {
  channelUrl: "https://www.youtube.com/@vidyantiasacademy",
  handle: "@vidyantiasacademy",
  featuredVideoIds: [],
};

export const FOOTER_NAV = {
  explore: [
    { key: "about", label: "About", href: ROUTES.about },
    { key: "courses", label: "Courses", href: ROUTES.courses },
    { key: "enrol", label: "Admissions & Batches", href: ROUTES.enrol },
    { key: "faculty", label: "Faculty", href: ROUTES.faculty },
  ],
  resources: [
    { key: "mockTest", label: "Free Mock Test", href: ROUTES.mockTest },
    { key: "upscGuide", label: "UPSC Exam Guide", href: ROUTES.upscGuide },
    { key: "currentAffairs", label: "Current Affairs", href: ROUTES.currentAffairs },
    { key: "notes", label: "Notes", href: ROUTES.notes },
    { key: "pyqTest", label: "Free PYQ Test", href: ROUTES.pyqTest },
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
