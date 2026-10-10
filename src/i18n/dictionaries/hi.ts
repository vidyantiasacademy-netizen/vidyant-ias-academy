import type { Dictionary } from "./en";

/**
 * Hindi UI strings. Typed against the English dictionary, so a missing key
 * fails the build rather than rendering blank.
 *
 * The brand name stays in Latin script — it is a logotype, not a word.
 */
export const hi: Dictionary = {
  common: {
    skipToContent: "मुख्य सामग्री पर जाएँ",
    search: "vidyantIAS में खोजें",
    call: "{phone} पर कॉल करें",
    whatsappChat: "WhatsApp पर vidyantIAS से बात करें",
    whatsappShort: "WhatsApp करें",
    backToTop: "ऊपर जाएँ",
    followUs: "हमें फ़ॉलो करें",
  },
  nav: {
    primary: "मुख्य",
    mobile: "मोबाइल",
    openMenu: "मेनू खोलें",
    contactDetails: "संपर्क विवरण",
    closeMenu: "मेनू बंद करें",
    home: "होम",
    programs: "प्रोग्राम",
    whatsNew: "नया क्या है",
    ourSystem: "हमारी पद्धति",
    mentorship: "मेंटरशिप",
    onThisPage: "होमपेज पर",
    explorePages: "और देखें",
    about: "हमारे बारे में",
    courses: "कोर्स",
    faculty: "फ़ैकल्टी",
    results: "परिणाम",
    resources: "संसाधन",
    currentAffairs: "करंट अफ़ेयर्स",
    enrol: "प्रवेश और बैच",
    quizzes: "क्विज़",
    practiceQuizzes: "अभ्यास क्विज़",
    mockTest: "निःशुल्क मॉक टेस्ट",
    upscGuide: "UPSC परीक्षा गाइड",
    parents: "अभिभावकों के लिए",
    events: "कार्यक्रम",
    testimonials: "विद्यार्थियों के अनुभव",
    faq: "सामान्य प्रश्न",
    contact: "संपर्क",
    search: "खोजें",
    blog: "ब्लॉग",
    starterKit: "UPSC स्टार्टर किट",
    pyqStrategy: "PYQ रणनीति",
    brochure: "ब्रोशर डाउनलोड करें",
    privacy: "गोपनीयता नीति",
    terms: "नियम और शर्तें",
    refund: "रिफ़ंड नीति",
  },
  cta: {
    enrol: "अभी प्रवेश लें",
    counselling: "निःशुल्क काउंसलिंग बुक करें",
    counsellingShort: "निःशुल्क काउंसलिंग",
    brochure: "ब्रोशर डाउनलोड करें",
    demo: "निःशुल्क डेमो क्लास",
    login: "विद्यार्थी लॉगिन",
    courses: "कोर्स देखें",
  },
  footer: {
    explore: "जानें",
    resources: "संसाधन",
    contact: "संपर्क",
    social: "{network} पर vidyantIAS",
    rights: "सर्वाधिकार सुरक्षित।",
    openingHours: [
      { days: "सोमवार – शनिवार", hours: "सुबह 9:00 – रात 8:00" },
      { days: "रविवार", hours: "सुबह 10:00 – शाम 4:00" },
    ],
  },
  language: {
    label: "भाषा",
    switchTo: "यह पेज {language} में पढ़ें",
  },
  notFound: {
    title: "रास्ता भटक गए?",
    body: "चलिए, आपको फिर से UPSC की तैयारी पर ले चलते हैं।",
    home: "होम पर लौटें",
  },
};
