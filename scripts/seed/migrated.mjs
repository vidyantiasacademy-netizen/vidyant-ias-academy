/**
 * FAQs and free resources carried over verbatim from the former
 * `src/data/faqs.ts` and `src/data/resources.ts`. Document ids keep the old
 * ids, so `COURSE_FAQ_IDS` and `/resources#<slug>` links keep resolving.
 */
export const SEED_FAQS = [
  {
    "id": "faq-beginners",
    "question": "Is vidyantIAS only for beginners?",
    "answer": "No. Programs are available for beginners starting from the syllabus, aspirants focused on Prelims, aspirants working on Mains answer writing, and students preparing an optional subject. During counselling we map your stage to the right program.",
    "topics": [
      "general"
    ],
    "featured": true,
    "order": 10
  },
  {
    "id": "faq-online",
    "question": "Do you provide online classes?",
    "answer": "Programs run in a hybrid format: classroom teaching at our Pune centre with live online access for students who cannot attend in person. Availability differs by program, so confirm the mode for your batch with the academic team.",
    "topics": [
      "general",
      "mode"
    ],
    "featured": true,
    "order": 20
  },
  {
    "id": "faq-recordings",
    "question": "Are classes recorded?",
    "answer": "Recordings are provided for programs that include them, primarily to support working professionals and revision. The exact recording window and access period are confirmed for each batch at enrolment.",
    "topics": [
      "mode"
    ],
    "featured": true,
    "order": 30
  },
  {
    "id": "faq-mentorship",
    "question": "Do you provide mentorship?",
    "answer": "Yes, where it is included in the selected program. Mentorship covers study planning, priority setting, test analysis, periodic progress reviews and doubt resolution with a mentor who tracks your preparation over time.",
    "topics": [
      "mentorship"
    ],
    "featured": true,
    "order": 40
  },
  {
    "id": "faq-evaluation",
    "question": "Do you provide answer evaluation?",
    "answer": "Mains-focused programs and Mains test series include written answer evaluation with specific feedback on structure, content, argument and presentation. The number of evaluated answers depends on the program you choose.",
    "topics": [
      "mains",
      "evaluation"
    ],
    "featured": true,
    "order": 50
  },
  {
    "id": "faq-location",
    "question": "Where is vidyantIAS located?",
    "answer": "Our centre is in Pune, Maharashtra. Full address, directions and visiting hours are on the Contact page, and you are welcome to visit before enrolling.",
    "topics": [
      "general",
      "location"
    ],
    "featured": true,
    "order": 60
  },
  {
    "id": "faq-demo",
    "question": "How can I attend a demo class?",
    "answer": "Register on the Demo Classes page with your preferred date and time. Our team confirms the slot and shares the classroom or joining details before the session.",
    "topics": [
      "demo"
    ],
    "featured": true,
    "order": 70
  },
  {
    "id": "faq-counsellor",
    "question": "How can I speak to a counsellor?",
    "answer": "Book a free counselling session and an academic counsellor will call you at your preferred time. You can also call or message us on WhatsApp during working hours.",
    "topics": [
      "counselling"
    ],
    "featured": true,
    "order": 80
  },
  {
    "id": "faq-fees",
    "question": "What are the course fees?",
    "answer": "Fees depend on the program, batch and mode you choose. Each program page lists what is included, and the current fee, instalment options and any scholarship criteria are shared transparently by the academic team — no form is required to ask.",
    "topics": [
      "fees"
    ],
    "featured": true,
    "order": 90
  },
  {
    "id": "faq-material",
    "question": "Is study material included?",
    "answer": "Programs include vidyantIAS class notes, current affairs compilations and practice question sets. We also publish a recommended booklist so you are not buying material you do not need.",
    "topics": [
      "material"
    ],
    "featured": false,
    "order": 100
  },
  {
    "id": "faq-working-professional",
    "question": "I work full time. Can I still prepare with vidyantIAS?",
    "answer": "Yes. Weekend and evening batches, recorded sessions and a mentor-led weekly plan are designed for working professionals who have limited study hours and need a realistic sequence.",
    "topics": [
      "general",
      "mode"
    ],
    "featured": false,
    "order": 110
  },
  {
    "id": "faq-optional",
    "question": "Which optional subjects do you offer?",
    "answer": "Optional subject batches are opened based on faculty availability and student demand for each cycle. Ask the academic team which optionals are running for your target attempt before you decide.",
    "topics": [
      "optional"
    ],
    "featured": false,
    "order": 120
  }
];

export const SEED_RESOURCES = [
  {
    "id": "upsc-starter-kit",
    "slug": "upsc-starter-kit",
    "title": "UPSC Starter Kit",
    "description": "A complete beginner roadmap: how the examination is structured, what to read first, and the sequence that avoids wasted months.",
    "resourceType": "guide",
    "tracks": [
      "beginner"
    ],
    "requiresLead": true,
    "order": 10
  },
  {
    "id": "upsc-booklist",
    "slug": "upsc-booklist",
    "title": "UPSC Booklist",
    "description": "Recommended sources for each subject, with a reading order — and an explicit note on what you can safely skip.",
    "resourceType": "pdf",
    "tracks": [
      "beginner",
      "prelims",
      "mains"
    ],
    "requiresLead": true,
    "order": 20
  },
  {
    "id": "upsc-syllabus",
    "slug": "upsc-syllabus",
    "title": "UPSC Syllabus — Prelims & Mains",
    "description": "The official syllabus for both stages, organised topic-wise so you can track coverage instead of re-reading the PDF.",
    "resourceType": "pdf",
    "tracks": [
      "beginner",
      "prelims",
      "mains"
    ],
    "requiresLead": false,
    "order": 30
  },
  {
    "id": "pyq-strategy",
    "slug": "pyq-strategy",
    "title": "PYQ Strategy",
    "description": "How to use previous-year questions to decide what to study, how deep to go and when a topic is genuinely finished.",
    "resourceType": "pyq",
    "tracks": [
      "prelims",
      "mains"
    ],
    "requiresLead": true,
    "order": 40
  },
  {
    "id": "study-planner",
    "slug": "study-planner",
    "title": "Study Planner",
    "description": "A weekly planning template for building a preparation routine you can sustain for a full cycle, including revision slots.",
    "resourceType": "guide",
    "tracks": [
      "beginner",
      "prelims",
      "mains"
    ],
    "requiresLead": true,
    "order": 50
  }
];
