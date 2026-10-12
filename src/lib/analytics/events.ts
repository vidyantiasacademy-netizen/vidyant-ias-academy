/** Canonical analytics event names. Add new events here, never inline. */
export const ANALYTICS_EVENTS = {
  pageView: "page_view",
  courseView: "course_view",
  demoClick: "demo_click",
  demoSubmit: "demo_submit",
  counsellingClick: "counselling_click",
  counsellingSubmit: "counselling_submit",
  eventRegister: "event_register",
  resourceDownload: "resource_download",
  whatsappClick: "whatsapp_click",
  phoneClick: "phone_click",
  courseCtaClick: "course_cta_click",
  loginClick: "login_click",
  enquirySubmit: "enquiry_submit",
  enrolClick: "enrol_click",
  enrolSubmit: "enrol_submit",
  brochureClick: "brochure_click",
  brochureSubmit: "brochure_submit",
  callbackClick: "callback_click",
  callbackSubmit: "callback_submit",
  batchView: "batch_view",
  appDownloadClick: "app_download_click",
  socialClick: "social_click",
  noticeClick: "notice_click",
  checkoutStart: "checkout_start",
  checkoutSuccess: "checkout_success",
  resourceBuyClick: "resource_buy_click",
  exitOfferShown: "exit_offer_shown",
  mockTestClick: "mock_test_click",
  mockTestRegister: "mock_test_register",
  mockTestStart: "mock_test_start",
  mockTestSubmit: "mock_test_submit",
  tabBarClick: "tab_bar_click",
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export type AnalyticsPayload = Record<
  string,
  string | number | boolean | null | undefined
>;
