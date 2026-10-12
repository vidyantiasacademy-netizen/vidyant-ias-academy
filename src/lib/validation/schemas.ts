import { z } from "zod";

/**
 * Shared form schemas. Used by React Hook Form on the client *and* by the
 * lead API route on the server, so validation can never be bypassed.
 */

/** Accepts 10-digit Indian mobile numbers, with optional +91 / 0 prefix and spacing. */
const INDIAN_PHONE = /^(?:\+?91[\s-]?|0)?[6-9]\d{9}$/;

export const nameField = z
  .string()
  .trim()
  .min(2, "Please enter at least 2 characters.")
  .max(80, "Please use 80 characters or fewer.");

export const phoneField = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s\-()]/g, ""))
  .refine((value) => INDIAN_PHONE.test(value), {
    message: "Enter a valid 10-digit Indian mobile number.",
  })
  // Store one canonical form (10 digits) regardless of how it was typed.
  .transform((value) => value.replace(/^(?:\+?91|0)/, ""));

export const emailField = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .pipe(z.email("Enter a valid email address."));

export const optionalText = (max = 120) =>
  z
    .string()
    .trim()
    .max(max, `Please use ${max} characters or fewer.`)
    .optional()
    .or(z.literal(""));

/**
 * Hidden decoy field. It stays permissive on purpose: the API route inspects the
 * value and silently accepts bot submissions instead of returning an error that
 * would teach a scraper the rule.
 */
export const honeypotField = z.string().max(200).optional();

export const ATTEMPT_OPTIONS = [
  "Not started yet",
  "Preparing for first attempt",
  "1 attempt given",
  "2 attempts given",
  "3 or more attempts given",
] as const;

export const PREPARATION_LEVELS = [
  "Just exploring UPSC",
  "Beginner",
  "Intermediate",
  "Advanced",
  "Revision stage",
] as const;

export const COUNSELLING_SLOTS = [
  "Morning (9 am – 12 pm)",
  "Afternoon (12 pm – 4 pm)",
  "Evening (4 pm – 8 pm)",
] as const;

export const DEMO_SLOTS = [
  "Morning batch",
  "Afternoon batch",
  "Evening batch",
  "Weekend batch",
] as const;

/** The four programme stages, as a student would describe themselves. */
export const PREPARATION_STAGES = [
  "Starting out",
  "Preparing for Prelims",
  "Preparing for Mains",
  "Optional subject",
  "Not sure yet",
] as const;

export const CALLBACK_TOPICS = [
  "Programmes and syllabus",
  "Fees and instalments",
  "Batch dates and timings",
  "Optional subject guidance",
  "A parent's questions",
  "Something else",
] as const;

export const ATTENDANCE_MODES = [
  "Classroom (Pune)",
  "Live online",
  "Either — advise me",
] as const;

export const demoRegistrationSchema = z.object({
  name: nameField,
  phone: phoneField,
  email: emailField,
  college: optionalText(120),
  graduationYear: optionalText(20),
  attempt: z.enum(ATTEMPT_OPTIONS, "Select your attempt status."),
  course: z.string().min(1, "Select a program."),
  preferredDate: z.string().min(1, "Choose a preferred date."),
  preferredTime: z.enum(DEMO_SLOTS, "Choose a preferred time."),
  honeypot: honeypotField,
});

export const counsellingSchema = z.object({
  name: nameField,
  phone: phoneField,
  email: emailField,
  age: optionalText(3),
  college: optionalText(120),
  graduationYear: optionalText(20),
  workingProfessional: z.enum(["Yes", "No"], "Select an option."),
  attempt: z.enum(ATTEMPT_OPTIONS, "Select your attempt status."),
  targetAttempt: z.string().min(4, "Which attempt are you targeting?"),
  optionalSubject: optionalText(80),
  preparationLevel: z.enum(PREPARATION_LEVELS, "Select your current level."),
  biggestChallenge: z
    .string()
    .trim()
    .min(10, "A sentence or two helps our counsellor prepare.")
    .max(600, "Please use 600 characters or fewer."),
  preferredTime: z.enum(COUNSELLING_SLOTS, "Choose a preferred time."),
  honeypot: honeypotField,
});

export const enquirySchema = z.object({
  name: nameField,
  phone: phoneField,
  email: emailField,
  subject: optionalText(120),
  message: z
    .string()
    .trim()
    .min(10, "Please tell us a little more.")
    .max(800, "Please use 800 characters or fewer."),
  honeypot: honeypotField,
});

/**
 * "Request a Callback" — the shortest conversion on the site.
 *
 * Only a name and a number are required: the hero asks for three fields, the
 * full block asks for five. Each form tightens what it actually renders with
 * `.extend()`, so the server stays permissive without accepting junk.
 */
export const callbackSchema = z.object({
  name: nameField,
  phone: phoneField,
  email: emailField.optional().or(z.literal("")),
  /** Programme the request came from, when the form asked. */
  course: optionalText(120),
  topic: z.enum(CALLBACK_TOPICS).optional().or(z.literal("")),
  preferredTime: z.enum(COUNSELLING_SLOTS).optional().or(z.literal("")),
  /** Where the student is — asked by the phone homepage's callback form. */
  preparationStage: z.enum(PREPARATION_STAGES).optional().or(z.literal("")),
  targetAttempt: optionalText(40),
  honeypot: honeypotField,
});

/** Brochure request. Email is required — that is where the PDF is sent. */
export const brochureSchema = z.object({
  name: nameField,
  phone: phoneField,
  email: emailField,
  course: optionalText(120),
  honeypot: honeypotField,
});

/** Enrolment enquiry. Admission itself is confirmed by the academic team. */
export const enrolmentSchema = z.object({
  name: nameField,
  phone: phoneField,
  email: emailField,
  course: z.string().min(1, "Select a programme."),
  batch: optionalText(120),
  attempt: z.enum(ATTEMPT_OPTIONS, "Select your attempt status."),
  mode: z.enum(ATTENDANCE_MODES, "Select how you want to attend."),
  message: optionalText(600),
  honeypot: honeypotField,
});

/** Free mock test registration — the details a counsellor calls back on. */
export const mockTestRegistrationSchema = z.object({
  name: nameField,
  phone: phoneField,
  email: emailField.optional().or(z.literal("")),
  targetAttempt: optionalText(20),
  honeypot: honeypotField,
});

export const eventRegistrationSchema = z.object({
  name: nameField,
  phone: phoneField,
  email: emailField,
  eventId: z.string().min(1, "Select an event."),
  honeypot: honeypotField,
});

export type DemoRegistrationInput = z.input<typeof demoRegistrationSchema>;
export type DemoRegistrationValues = z.output<typeof demoRegistrationSchema>;
export type CounsellingInput = z.input<typeof counsellingSchema>;
export type CounsellingValues = z.output<typeof counsellingSchema>;
export type EnquiryInput = z.input<typeof enquirySchema>;
export type EnquiryValues = z.output<typeof enquirySchema>;
export type EventRegistrationInput = z.input<typeof eventRegistrationSchema>;
export type EventRegistrationValues = z.output<typeof eventRegistrationSchema>;
export type CallbackInput = z.input<typeof callbackSchema>;
export type CallbackValues = z.output<typeof callbackSchema>;
export type BrochureInput = z.input<typeof brochureSchema>;
export type BrochureValues = z.output<typeof brochureSchema>;
export type EnrolmentInput = z.input<typeof enrolmentSchema>;
export type EnrolmentValues = z.output<typeof enrolmentSchema>;
export type MockTestRegistrationInput = z.input<typeof mockTestRegistrationSchema>;

export const LEAD_FORMS = {
  demo: "demo",
  counselling: "counselling",
  enquiry: "enquiry",
  event: "event",
  resource: "resource",
  callback: "callback",
  brochure: "brochure",
  enrolment: "enrolment",
  /** Registration for the free public mock test. Created by its Server Action, never by `/api/leads`. */
  mockTest: "mock-test",
  /** A chat with the WhatsApp bot. Created by its webhook, never by `/api/leads`. */
  whatsapp: "whatsapp",
} as const;

export type LeadFormType = (typeof LEAD_FORMS)[keyof typeof LEAD_FORMS];

/** Envelope posted to /api/leads by every public form. */
export const leadSubmissionSchema = z.object({
  form: z.enum([
    LEAD_FORMS.demo,
    LEAD_FORMS.counselling,
    LEAD_FORMS.enquiry,
    LEAD_FORMS.event,
    LEAD_FORMS.resource,
    LEAD_FORMS.callback,
    LEAD_FORMS.brochure,
    LEAD_FORMS.enrolment,
  ]),
  /** Form-specific answers; validated per form on the server. */
  data: z.record(z.string(), z.unknown()),
  context: z.object({
    page: z.string().max(200).optional(),
    source: z.string().max(80).optional(),
    campaign: z.string().max(120).optional(),
    course: z.string().max(120).optional(),
    event: z.string().max(120).optional(),
    referrer: z.string().max(300).optional(),
  }),
});

export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;

/** Picks the right schema for a given form on the server. */
export function schemaForForm(form: LeadFormType) {
  switch (form) {
    case LEAD_FORMS.demo:
      return demoRegistrationSchema;
    case LEAD_FORMS.counselling:
      return counsellingSchema;
    case LEAD_FORMS.event:
      return eventRegistrationSchema;
    case LEAD_FORMS.callback:
      return callbackSchema;
    case LEAD_FORMS.brochure:
      return brochureSchema;
    case LEAD_FORMS.enrolment:
      return enrolmentSchema;
    case LEAD_FORMS.mockTest:
      return mockTestRegistrationSchema;
    case LEAD_FORMS.resource:
      return z.object({
        name: nameField,
        phone: phoneField,
        email: emailField,
        resource: z.string().min(1),
        honeypot: honeypotField,
      });
    case LEAD_FORMS.enquiry:
    default:
      return enquirySchema;
  }
}
