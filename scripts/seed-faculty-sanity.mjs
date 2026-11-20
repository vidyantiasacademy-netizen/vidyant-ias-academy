/**
 * Seeds the verified faculty profiles supplied by vidyantIAS
 * (Faculty_Profiles document, 2026-11-20) into Sanity, with their photos.
 *
 *   npm run seed:faculty:sanity -- --photos <dir>              # create missing
 *   npm run seed:faculty:sanity -- --photos <dir> --replace    # overwrite
 *   npm run seed:faculty:sanity -- --dry-run
 *
 * Also links each profile from its course documents (see `courses`).
 *
 * `<dir>` holds one image per profile, named `<slug>.<ext>` (jpeg/jpg/png).
 * Photos are uploaded only when the document is written, so a re-run without
 * `--replace` leaves Studio edits and existing photos alone.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { blocks, commitAll, sanityFlags, seedClient } from "./seed/sanity.mjs";

const flags = sanityFlags();
const client = seedClient(flags);

const photosArg = process.argv.indexOf("--photos");
const photosDir = photosArg > -1 ? process.argv[photosArg + 1] : null;

const ref = (id, key) => ({ _type: "reference", _ref: id, _key: key });
const slug = (current) => ({ _type: "slug", current });

/** Subjects the profiles need that the dataset did not have yet. */
const NEW_SUBJECTS = [
  { id: "subject-current-affairs", title: "Current Affairs", slug: "current-affairs" },
  { id: "subject-public-administration", title: "Public Administration (Optional)", slug: "public-administration", paper: "optional" },
  { id: "subject-psir", title: "PSIR (Optional)", slug: "psir", paper: "optional" },
  { id: "subject-mentorship", title: "Mentorship & Strategy", slug: "mentorship-strategy" },
];

/** Created in the Studio before this script existed. */
const ENVIRONMENT = "4e0df94f-09bd-4f63-a71a-4559cdf7c40f";

const FACULTY = [
  {
    slug: "ajay-kumar",
    courses: ["foundation-program", "prelims-program", "optional-subjects"],
    name: "Ajay Kumar",
    designation: "Faculty — Indian Economy, Public Administration & Current Affairs",
    subjects: ["subject-economy", "subject-public-administration", "subject-current-affairs"],
    experience: "8+ years of UPSC teaching and mentorship · 400+ Civil Services aspirants mentored",
    bio: [
      "An experienced UPSC educator and Civil Services mentor with over 8 years of teaching and mentorship experience, specialising in Indian Economy, Public Administration and Current Affairs.",
      "Having mentored over 400 Civil Services aspirants, he brings valuable first-hand examination experience, having appeared four times in the UPSC Civil Services Mains Examination and twice in the Personality Test. His teaching combines conceptual clarity, analytical thinking and practical examination insights to help aspirants develop a comprehensive understanding of the UPSC syllabus.",
    ],
    teachingPhilosophy:
      "His teaching philosophy centres on conceptual clarity, analytical understanding and the practical application of knowledge. By integrating foundational concepts with contemporary developments and first-hand examination insights, he aims to make complex subjects accessible, relevant and examination-oriented.",
    achievements: [
      "B.E. — Electronics and Telecommunication Engineering",
      "UPSC Civil Services Mains: four appearances",
      "UPSC Personality Test (Interview): two appearances",
      "Public Administration Optional: 288 marks",
      "Essay: 142 marks (2018)",
    ],
    order: 2,
  },
  {
    slug: "surya-bhutada",
    courses: ["foundation-program", "test-series"],
    name: "Surya Bhutada",
    designation: "Faculty — UPSC Mentorship, Mains Guidance & Student Counselling",
    subjects: ["subject-mentorship", "subject-essay"],
    experience:
      "UPSC mentorship and academic counselling · Workshops on mental health and motivation at coaching centres",
    bio: [
      "An experienced Civil Services mentor and psychology professional specialising in UPSC examination guidance, preparation strategy and student counselling.",
      "She combines first-hand examination experience with expertise in psychology and academic mentorship to support aspirants throughout their preparation journey. Her approach focuses on strengthening examination readiness, improving study effectiveness and helping aspirants manage the academic and psychological challenges of Civil Services preparation.",
    ],
    teachingPhilosophy:
      "Civil Services preparation requires a combination of academic discipline, strategic planning and psychological resilience. Through personalised guidance, structured preparation strategies and student-focused counselling, she helps aspirants approach the examination with clarity, consistency and confidence.",
    achievements: [
      "M.A. — Psychology",
      "Certified Rational Emotive Behaviour Therapy (REBT) Practitioner",
      "Guides aspirants on preparation planning, time management and examination anxiety",
    ],
    order: 3,
  },
  {
    slug: "deepak-dalal",
    courses: ["foundation-program", "prelims-program", "optional-subjects", "test-series"],
    name: "Deepak Dalal",
    designation: "Faculty — Indian Polity, Governance & PSIR",
    subjects: ["subject-polity", "subject-governance", "subject-psir"],
    experience: "8+ years of UPSC teaching and mentorship · 4,000+ UPSC Mains test copies evaluated",
    bio: [
      "An experienced UPSC educator with over 8 years of teaching and mentorship experience, specialising in Indian Polity, Governance, Constitutional Studies and Political Science & International Relations (PSIR).",
      "With over 4,000 UPSC test copies evaluated and mentorship experience with 20+ successful civil services candidates, he combines conceptual clarity, first-hand examination experience and a practical approach to answer writing.",
    ],
    teachingPhilosophy:
      "His teaching focuses on building strong conceptual foundations, developing analytical thinking and translating subject knowledge into effective examination performance — through structured learning, individual feedback and examination-oriented mentorship.",
    achievements: [
      "LL.B. — University of Delhi",
      "M.A. — Political Science",
      "UGC-NET qualified (2015)",
      "B.A. — English",
      "UPSC Prelims 2015: 146.66 marks in GS Paper I",
      "UPSC Prelims 2016: 128 marks in GS Paper I",
      "UPSC Mains: 165-mark improvement between 2015 and 2016",
      "Mentored AIR 9 — Saumaya Sharma (2017)",
      "Mentored AIR 21 — Pratyush Pandey (2019)",
      "Mentored AIR 27 — Suryabhan Yadav (2022)",
      "Mentored AIR 33 — Navneet Kaur (2019)",
      "Mentored AIR 54 — Sumit Kumar Rai (2018)",
      "Mentored AIR 57 — Yashni Nagarajan (2019)",
    ],
    order: 4,
  },
  {
    slug: "rutuja-salve",
    courses: ["foundation-program", "prelims-program"],
    name: "Rutuja Salve",
    designation: "Faculty — Environment, Ecology & Biodiversity",
    subjects: [ENVIRONMENT, "subject-current-affairs"],
    experience: "3+ years of teaching and academic mentorship",
    bio: [
      "An Environment and Ecology educator with over 3 years of teaching and mentorship experience, specialising in conceptual learning, UPSC Prelims preparation and environmental current affairs.",
      "Having qualified UGC-NET twice, she combines a strong academic foundation with practical teaching experience to help Civil Services aspirants understand complex environmental concepts and develop effective examination strategies. Her teaching emphasises conceptual clarity, analytical understanding and the integration of environmental developments with the UPSC syllabus.",
    ],
    teachingPhilosophy:
      "Understanding the environment begins with understanding the connections that sustain it.",
    achievements: ["UGC-NET qualified — twice", "M.A.", "B.A."],
    order: 5,
  },
];

function photoPath(memberSlug) {
  if (!photosDir) return null;

  for (const ext of ["jpeg", "jpg", "png"]) {
    const path = join(photosDir, `${memberSlug}.${ext}`);
    if (existsSync(path)) return path;
  }

  console.warn(`  no photo for ${memberSlug} in ${photosDir}`);
  return null;
}

async function uploadPhoto(member) {
  const path = photoPath(member.slug);
  if (!path) return undefined;

  if (flags.dryRun) {
    console.log(`  would upload ${path}`);
    return undefined;
  }

  const asset = await client.assets.upload("image", readFileSync(path), {
    filename: path.split("/").pop(),
  });
  console.log(`  uploaded ${asset._id}  (${member.slug})`);

  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: `Portrait of ${member.name}`,
  };
}

/**
 * Existing profiles → their current photo. Uploads are skipped for profiles
 * that already exist unless overwriting, and `--replace` without a new photo
 * keeps the one already set instead of wiping it.
 */
const existing = new Map(
  flags.dryRun && !process.env.SANITY_AUTH_TOKEN && !process.env.SANITY_API_WRITE_TOKEN
    ? []
    : (
        await client.fetch(`*[_id in $ids]{_id, photo}`, {
          ids: FACULTY.map((m) => `faculty-${m.slug}`),
        })
      ).map((doc) => [doc._id, doc.photo]),
);

const documents = [
  ...NEW_SUBJECTS.map((subject) => ({
    _id: subject.id,
    _type: "subject",
    title: subject.title,
    slug: slug(subject.slug),
    ...(subject.paper ? { paper: subject.paper } : {}),
  })),
];

for (const member of FACULTY) {
  const id = `faculty-${member.slug}`;
  const uploaded = flags.replace || !existing.has(id) ? await uploadPhoto(member) : undefined;
  const photo = uploaded ?? existing.get(id);

  documents.push({
    _id: id,
    _type: "faculty",
    language: "en",
    name: member.name,
    slug: slug(member.slug),
    designation: member.designation,
    ...(photo ? { photo } : {}),
    subjects: member.subjects.map((subjectId, i) => ref(subjectId, `s${i}`)),
    experience: member.experience,
    bio: blocks(member.bio),
    teachingPhilosophy: member.teachingPhilosophy,
    achievements: member.achievements,
    profilePending: false,
    order: member.order,
  });
}

await commitAll(client, documents, flags);

/**
 * Course → faculty links, in roster order. The reference lives on the course,
 * so it is written there. `--replace` overwrites a course's faculty list;
 * otherwise only courses with no faculty yet are filled.
 */
const facultyByCourse = new Map();

for (const member of FACULTY) {
  for (const course of member.courses) {
    facultyByCourse.set(course, [...(facultyByCourse.get(course) ?? []), `faculty-${member.slug}`]);
  }
}

const courseIds = [...facultyByCourse.keys()].map((course) => `course-${course}`);
const existingCourses = new Set(
  flags.dryRun && !process.env.SANITY_AUTH_TOKEN && !process.env.SANITY_API_WRITE_TOKEN
    ? courseIds
    : await client.fetch(`*[_id in $ids]._id`, { ids: courseIds }),
);

console.log("\nCourse → faculty links:");
const links = client.transaction();

for (const [course, facultyIds] of facultyByCourse) {
  const id = `course-${course}`;

  if (!existingCourses.has(id)) {
    console.log(`  skip  ${id} (no such course)`);
    continue;
  }

  const faculty = facultyIds.map((facultyId, i) => ref(facultyId, `f${i}`));
  console.log(`  ${flags.replace ? "set" : "set-if-missing"}  ${id}.faculty (${faculty.length})`);
  links.patch(id, (patch) => (flags.replace ? patch.set({ faculty }) : patch.setIfMissing({ faculty })));
}

if (!flags.dryRun) await links.commit({ visibility: "async" });
