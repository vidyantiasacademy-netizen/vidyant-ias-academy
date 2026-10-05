import type { Faq } from "@/types";

/**
 * Answers describe how vidyantIAS programs are structured. Anything that
 * depends on the final academic calendar or price list points the visitor to
 * counselling instead of stating an unverified figure.
 */
export const faqs: Faq[] = [
  {
    id: "faq-beginners",
    question: "Is vidyantIAS only for beginners?",
    answer:
      "No. Programs are available for beginners starting from the syllabus, aspirants focused on Prelims, aspirants working on Mains answer writing, and students preparing an optional subject. During counselling we map your stage to the right program.",
    topics: ["general"],
    featured: true,
    status: "published",
  },
  {
    id: "faq-online",
    question: "Do you provide online classes?",
    answer:
      "Programs run in a hybrid format: classroom teaching at our Pune centre with live online access for students who cannot attend in person. Availability differs by program, so confirm the mode for your batch with the academic team.",
    topics: ["general", "mode"],
    featured: true,
    status: "published",
  },
  {
    id: "faq-recordings",
    question: "Are classes recorded?",
    answer:
      "Recordings are provided for programs that include them, primarily to support working professionals and revision. The exact recording window and access period are confirmed for each batch at enrolment.",
    topics: ["mode"],
    featured: true,
    status: "published",
  },
  {
    id: "faq-mentorship",
    question: "Do you provide mentorship?",
    answer:
      "Yes, where it is included in the selected program. Mentorship covers study planning, priority setting, test analysis, periodic progress reviews and doubt resolution with a mentor who tracks your preparation over time.",
    topics: ["mentorship"],
    featured: true,
    status: "published",
  },
  {
    id: "faq-evaluation",
    question: "Do you provide answer evaluation?",
    answer:
      "Mains-focused programs and Mains test series include written answer evaluation with specific feedback on structure, content, argument and presentation. The number of evaluated answers depends on the program you choose.",
    topics: ["mains", "evaluation"],
    featured: true,
    status: "published",
  },
  {
    id: "faq-location",
    question: "Where is vidyantIAS located?",
    answer:
      "Our centre is in Pune, Maharashtra. Full address, directions and visiting hours are on the Contact page, and you are welcome to visit before enrolling.",
    topics: ["general", "location"],
    featured: true,
    status: "published",
  },
  {
    id: "faq-demo",
    question: "How can I attend a demo class?",
    answer:
      "Register on the Demo Classes page with your preferred date and time. Our team confirms the slot and shares the classroom or joining details before the session.",
    topics: ["demo"],
    featured: true,
    status: "published",
  },
  {
    id: "faq-counsellor",
    question: "How can I speak to a counsellor?",
    answer:
      "Book a free counselling session and an academic counsellor will call you at your preferred time. You can also call or message us on WhatsApp during working hours.",
    topics: ["counselling"],
    featured: true,
    status: "published",
  },
  {
    id: "faq-fees",
    question: "What are the course fees?",
    answer:
      "Fees depend on the program, batch and mode you choose. Each program page lists what is included, and the current fee, instalment options and any scholarship criteria are shared transparently by the academic team — no form is required to ask.",
    topics: ["fees"],
    featured: true,
    status: "published",
  },
  {
    id: "faq-material",
    question: "Is study material included?",
    answer:
      "Programs include vidyantIAS class notes, current affairs compilations and practice question sets. We also publish a recommended booklist so you are not buying material you do not need.",
    topics: ["material"],
    featured: false,
    status: "published",
  },
  {
    id: "faq-working-professional",
    question: "I work full time. Can I still prepare with vidyantIAS?",
    answer:
      "Yes. Weekend and evening batches, recorded sessions and a mentor-led weekly plan are designed for working professionals who have limited study hours and need a realistic sequence.",
    topics: ["general", "mode"],
    featured: false,
    status: "published",
  },
  {
    id: "faq-optional",
    question: "Which optional subjects do you offer?",
    answer:
      "Optional subject batches are opened based on faculty availability and student demand for each cycle. Ask the academic team which optionals are running for your target attempt before you decide.",
    topics: ["optional"],
    featured: false,
    status: "published",
  },
];

export const featuredFaqs = faqs.filter((faq) => faq.featured && faq.status === "published");
export const publishedFaqs = faqs.filter((faq) => faq.status === "published");

export function faqsByIds(ids: string[]) {
  return faqs.filter((faq) => ids.includes(faq.id));
}
