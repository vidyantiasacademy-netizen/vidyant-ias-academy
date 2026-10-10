import type { Locale } from "@/i18n/config";

/**
 * Everything the WhatsApp bot says, in both site languages.
 *
 * Kept out of `src/i18n/dictionaries` on purpose: those ship to every page,
 * and nothing on the website renders these lines.
 *
 * Meta rejects a message whose labels run long, so mind the limits when
 * editing: button titles ≤ 20 characters, list row titles ≤ 24, row
 * descriptions ≤ 72, the list's own button ≤ 20. Same rule as the site: no
 * selection counts, fees, discounts or dates that the institute has not
 * confirmed.
 */

/** Sent before a language is known, so it speaks both. */
export const GREETING =
  "Namaste! Welcome to vidyantIAS.\nPlease choose your language.\n\nनमस्ते! vidyantIAS में आपका स्वागत है।\nकृपया अपनी भाषा चुनें।";

export const LANGUAGE_BUTTONS = [
  { id: "lang:en", title: "English" },
  { id: "lang:hi", title: "हिंदी" },
] as const;

interface BotCopy {
  menuBody: string;
  menuButton: string;
  menu: Record<"courses" | "fees" | "counselling" | "mock" | "human", { title: string; description: string }>;
  coursesIntro: (link: string) => string;
  feesIntro: string;
  counsellingIntro: string;
  mock: (link: string) => string;
  handoff: string;
  attemptBody: string;
  chooseButton: string;
  /** Same order as `ATTEMPT_OPTIONS`. */
  attempts: readonly string[];
  modeBody: string;
  /** Same order as `ATTENDANCE_MODES`. */
  modes: readonly string[];
  nameConfirm: (name: string) => string;
  nameYes: string;
  nameNo: string;
  nameInput: string;
  nameInvalid: string;
  slotBody: string;
  /** Same order as `COUNSELLING_SLOTS`. */
  slots: readonly string[];
  done: (firstName: string, slot: string, coursesLink: string) => string;
  tapAnOption: string;
  idle: string;
}

export const BOT_COPY: Record<Locale, BotCopy> = {
  en: {
    menuBody: "How can we help with your UPSC preparation? Tap *See options* and pick one.",
    menuButton: "See options",
    menu: {
      courses: { title: "Courses & syllabus", description: "Our UPSC programmes and what each one covers" },
      fees: { title: "Fees & instalments", description: "How fees work for each programme" },
      counselling: { title: "Free counselling", description: "Book a one-to-one call with a counsellor" },
      mock: { title: "Free mock test", description: "Take a free UPSC mock test online" },
      human: { title: "Talk to a counsellor", description: "Chat with our team directly" },
    },
    coursesIntro: (link) =>
      `Here are all our programmes: ${link}\n\nA few quick questions, so the right counsellor calls you.`,
    feesIntro:
      "Fees depend on the programme and how you attend. A counsellor will share the exact fee and the instalment options with you.\n\nA few quick questions first.",
    counsellingIntro: "Let's book your free counselling call. A few quick questions first.",
    mock: (link) =>
      `Take the free UPSC mock test here: ${link}\n\nType *MENU* anytime to see the options again.`,
    handoff:
      "Thank you! We have passed your request to our counsellors, and one of them will get back to you shortly.\n\nType *MENU* anytime to see the options again.",
    attemptBody: "Where are you in your UPSC journey?",
    chooseButton: "Choose",
    attempts: ["Not started yet", "Preparing for 1st", "1 attempt given", "2 attempts given", "3+ attempts given"],
    modeBody: "How would you like to attend classes?",
    modes: ["Classroom (Pune)", "Live online", "Either — advise me"],
    nameConfirm: (name) => `Shall we save your name as *${name}*?`,
    nameYes: "Yes, that's me",
    nameNo: "Different name",
    nameInput: "Please type your full name.",
    nameInvalid: "Please type your name in 2 to 80 characters.",
    slotBody:
      "When should our counsellor call you?\n\nMorning: 9 am – 12 pm\nAfternoon: 12 pm – 4 pm\nEvening: 4 pm – 8 pm",
    slots: ["Morning", "Afternoon", "Evening"],
    done: (firstName, slot, coursesLink) =>
      `Thank you, ${firstName}! A counsellor will call you in the ${slot.toLowerCase()}.\n\nMeanwhile, explore our programmes: ${coursesLink}\n\nType *MENU* anytime to see the options again.`,
    tapAnOption: "Please tap one of the options above.",
    idle: "Thanks for your message! Our counsellor will be in touch.\n\nType *MENU* to see the options again.",
  },
  hi: {
    menuBody: "UPSC की तैयारी में हम आपकी कैसे मदद कर सकते हैं? *विकल्प देखें* पर टैप करें।",
    menuButton: "विकल्प देखें",
    menu: {
      courses: { title: "कोर्स और सिलेबस", description: "हमारे UPSC प्रोग्राम और हर एक में क्या पढ़ाया जाता है" },
      fees: { title: "फीस और किस्तें", description: "हर प्रोग्राम की फीस कैसे तय होती है" },
      counselling: { title: "मुफ़्त काउंसलिंग", description: "काउंसलर के साथ वन-टू-वन कॉल बुक करें" },
      mock: { title: "मुफ़्त मॉक टेस्ट", description: "ऑनलाइन मुफ़्त UPSC मॉक टेस्ट दें" },
      human: { title: "काउंसलर से बात करें", description: "हमारी टीम से सीधे चैट करें" },
    },
    coursesIntro: (link) =>
      `हमारे सभी प्रोग्राम यहाँ देखें: ${link}\n\nकुछ छोटे सवाल, ताकि सही काउंसलर आपको कॉल करे।`,
    feesIntro:
      "फीस प्रोग्राम और पढ़ाई के तरीके पर निर्भर करती है। काउंसलर आपको सही फीस और किस्तों के विकल्प बताएँगे।\n\nपहले कुछ छोटे सवाल।",
    counsellingIntro: "आइए आपकी मुफ़्त काउंसलिंग कॉल बुक करें। पहले कुछ छोटे सवाल।",
    mock: (link) =>
      `मुफ़्त UPSC मॉक टेस्ट यहाँ दें: ${link}\n\nविकल्प दोबारा देखने के लिए कभी भी *MENU* लिखें।`,
    handoff:
      "धन्यवाद! आपका अनुरोध हमारे काउंसलर तक पहुँच गया है, उनमें से कोई जल्द ही आपसे संपर्क करेगा।\n\nविकल्प दोबारा देखने के लिए कभी भी *MENU* लिखें।",
    attemptBody: "आपकी UPSC तैयारी अभी किस चरण में है?",
    chooseButton: "चुनें",
    attempts: ["अभी शुरू नहीं किया", "पहले प्रयास की तैयारी", "1 प्रयास दिया", "2 प्रयास दिए", "3 या अधिक प्रयास"],
    modeBody: "आप कक्षाएँ कैसे करना चाहेंगे?",
    modes: ["क्लासरूम (पुणे)", "लाइव ऑनलाइन", "कोई भी — सलाह दें"],
    nameConfirm: (name) => `क्या हम आपका नाम *${name}* सेव करें?`,
    nameYes: "हाँ, सही है",
    nameNo: "दूसरा नाम",
    nameInput: "कृपया अपना पूरा नाम लिखें।",
    nameInvalid: "कृपया 2 से 80 अक्षरों में अपना नाम लिखें।",
    slotBody:
      "हमारे काउंसलर आपको कब कॉल करें?\n\nसुबह: 9 – 12 बजे\nदोपहर: 12 – 4 बजे\nशाम: 4 – 8 बजे",
    slots: ["सुबह", "दोपहर", "शाम"],
    done: (firstName, slot, coursesLink) =>
      `धन्यवाद, ${firstName}! काउंसलर आपको ${slot} के समय कॉल करेंगे।\n\nतब तक हमारे प्रोग्राम देखें: ${coursesLink}\n\nविकल्प दोबारा देखने के लिए कभी भी *MENU* लिखें।`,
    tapAnOption: "कृपया ऊपर दिए गए विकल्पों में से एक पर टैप करें।",
    idle: "आपके संदेश के लिए धन्यवाद! हमारे काउंसलर आपसे संपर्क करेंगे।\n\nविकल्प दोबारा देखने के लिए *MENU* लिखें।",
  },
};

/** Typed words that always bring the menu back, even while the bot is paused. */
export const RESTART_WORDS = new Set(["menu", "start", "restart", "मेनू"]);
