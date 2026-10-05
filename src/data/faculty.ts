import type { Faculty } from "@/types";

/**
 * PLACEHOLDER FACULTY PROFILES.
 *
 * vidyantIAS has not yet supplied verified faculty details, so no names,
 * credentials or experience figures are invented here. Each entry describes a
 * teaching role only and carries `isPlaceholder: true`, which makes the UI show
 * a "Profile pending" label.
 *
 * To publish a real profile: replace the fields, set `isPlaceholder: false`,
 * add the photograph under /public/images and keep the `id` stable.
 */
export const faculty: Faculty[] = [
  {
    id: "faculty-gs-polity",
    slug: "gs-polity-governance",
    name: "GS Faculty — Polity & Governance",
    subject: "Polity, Governance & Constitution",
    areas: ["gs"],
    experience: "Experience details pending verification",
    specialisations: ["Polity", "Governance", "Current Affairs"],
    bio: "Leads the Polity and Governance track across the Foundation and Prelims programs, linking constitutional provisions to current developments and to the way questions are actually asked in the examination.",
    qualifications: ["Qualifications pending verification"],
    teachingPhilosophy:
      "Concepts first, application immediately after — every class ends with questions that test whether the idea can be used.",
    courseIds: ["foundation-program", "prelims-program"],
    image: "",
    isPlaceholder: true,
    status: "published",
  },
  {
    id: "faculty-gs-economy",
    slug: "gs-economy",
    name: "GS Faculty — Economy",
    subject: "Indian Economy & Economic Survey",
    areas: ["gs"],
    experience: "Experience details pending verification",
    specialisations: ["Economy", "Budget & Survey", "Data interpretation"],
    bio: "Handles the Economy syllabus from fundamentals to the Budget and Economic Survey, with a focus on the vocabulary and data reading that Prelims and Mains both demand.",
    qualifications: ["Qualifications pending verification"],
    teachingPhilosophy:
      "Economics becomes simple when the student can explain a headline in their own words.",
    courseIds: ["foundation-program", "prelims-program", "mains-program"],
    image: "",
    isPlaceholder: true,
    status: "published",
  },
  {
    id: "faculty-mains-essay",
    slug: "mains-essay-ethics",
    name: "Mains Faculty — Essay & Ethics",
    subject: "Essay, Ethics and Answer Writing",
    areas: ["essay", "ethics", "gs"],
    experience: "Experience details pending verification",
    specialisations: ["Essay", "Ethics (GS-IV)", "Answer structure"],
    bio: "Runs the answer-writing and evaluation track: structure, argument, examples and the discipline of writing to the demand of the question within the time available.",
    qualifications: ["Qualifications pending verification"],
    teachingPhilosophy:
      "Marks improve when feedback is specific. Every evaluated answer should tell the student exactly what to change next.",
    courseIds: ["mains-program"],
    image: "",
    isPlaceholder: true,
    status: "published",
  },
  {
    id: "faculty-csat",
    slug: "csat-quantitative",
    name: "CSAT Faculty",
    subject: "CSAT — Reasoning, Comprehension & Quantitative Aptitude",
    areas: ["csat"],
    experience: "Experience details pending verification",
    specialisations: ["Reasoning", "Comprehension", "Quantitative aptitude"],
    bio: "Prepares students for Paper II with a method-led approach so that CSAT is cleared comfortably without consuming time that GS preparation needs.",
    qualifications: ["Qualifications pending verification"],
    teachingPhilosophy:
      "CSAT is a qualifying paper — the goal is reliability and speed, not difficulty for its own sake.",
    courseIds: ["foundation-program", "prelims-program"],
    image: "",
    isPlaceholder: true,
    status: "published",
  },
];

export const publishedFaculty = faculty.filter((member) => member.status === "published");

export function facultyByIds(ids: string[]) {
  return faculty.filter((member) => ids.includes(member.id));
}

export function facultyBySlug(slug: string) {
  return faculty.find((member) => member.slug === slug);
}
