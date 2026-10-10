# Growth roadmap — getting more enrolments

What the website should do to make a UPSC aspirant (or their parent) choose
vidyantIAS over another institute. Written from the visitor's side: what they
look for, what makes them leave, and what makes them fill a form or pay.

**The core problem.** vidyantIAS has not completed an exam cycle, so there are
no results to publish (`src/data/results.ts` is empty, by policy). Results are
the first thing an Indian aspirant compares. Until they exist, the site has to
earn trust by **letting people try the teaching before they pay**, and by being
more transparent than the competition about faculty, fees and process.

Status key: ✅ done · 🚧 in progress · ⬜ not started · 🏫 needs input from the institute

---

## Priority order

1. ✅ Analytics and conversion tracking (#23) — so every later change can be measured.
2. ✅ Leads CRM in the admin panel (#21); 🚧 fast WhatsApp follow-up (#20).
3. ✅ Free mock test on the existing question bank and scoring rules (#1); ⬜ scholarship test (#2) — the same engine, plus discount slabs from the institute.
4. Faculty video intros and sample lectures (#4, #6).
5. Clear fees with EMI, and a "For Parents" page (#12, #15, #16).

---

## 1. Let people try before they pay

| # | Item | Status | Notes |
| --- | --- | --- | --- |
| 1 | **Free public mock test** — timed paper, score, rank, subject-wise weak areas, answer key, counselling CTA | ✅ | Live at `/mock-test`. Admins write the paper in **Admin → Tests** and set *Who can sit it* to "Anyone on the website". Visitors register with name + mobile (email and target attempt optional) — each registration is a lead (`mock-test`), and the score and weakest subjects are written onto it when they finish. One sitting per number per paper. Sittings are tied to the browser by an httpOnly cookie. Visitor scores are listed under the paper's **Results** tab. Next: phone OTP if fake numbers become a problem. |
| 2 | **Scholarship / admission test** — fee discount by score band | ⬜ 🏫 | Creates a deadline to promote. Discount slabs come from the institute. |
| 3 | **Fill the quizzes page** — daily current-affairs quiz, weekly subject quizzes, run on our own engine rather than external forms | ⬜ 🏫 | `src/data/quizzes.ts` ships empty. |
| 4 | **Recorded sample lectures** on every course and faculty page | ⬜ 🏫 | Many visitors will watch 10 minutes but will not fill a demo form. |
| 5 | **Free trial week / refund promise** stated in plain words next to the price | ⬜ 🏫 | Must match `refund-policy`. |

## 2. Trust without results

| # | Item | Status | Notes |
| --- | --- | --- | --- |
| 6 | **Faculty depth** — years teaching, own UPSC stages reached, publications, a video intro | ⬜ 🏫 | For a new institute, the faculty *is* the brand. |
| 7 | **Mentor track record** — candidates faculty mentored elsewhere, verified and with consent | ⬜ 🏫 | |
| 8 | **Testimonials from current students** (short video) and **Google Reviews** rating on the site | ⬜ 🏫 | |
| 9 | **Founder story** — a "why we started" video and a named person a parent can call | ⬜ 🏫 | |
| 10 | **Centre photos / virtual tour** — classrooms, library, study hall | ⬜ 🏫 | |
| 11 | **Verifiable activity counters** — mock tests attempted, answer copies evaluated | ⬜ | Real numbers from Firestore, never estimates. |

## 3. Speak to parents

| # | Item | Status | Notes |
| --- | --- | --- | --- |
| 12 | **"For Parents" page** — safety, attendance, progress reports, hostel/PG tie-ups, total cost, realistic timeline | 🚧 🏫 | `/parents` is live: realistic timeline and costs, how to support at home, five questions to ask any institute (each answered with a link to our proof), parent FAQ, and a callback form preset to "A parent's questions". Still needs the institute's own facts — accommodation near the centre, safety arrangements, how parents receive progress updates. |
| 13 | **Parent progress reports** — attendance and test scores, monthly via the dashboard or WhatsApp | ⬜ | Builds on the existing performance pages. |
| 14 | **Complete Hindi (and Marathi) coverage** of course, fee and FAQ pages | ⬜ | `src/i18n/dictionaries/hi.ts` exists. |

## 4. Pricing and payment friction

| # | Item | Status | Notes |
| --- | --- | --- | --- |
| 15 | **Fees shown openly** on every course with what is included | ⬜ 🏫 | |
| 16 | **EMI / no-cost EMI** shown as the headline ("₹6,500/month") | ⬜ 🏫 | Razorpay supports EMI. Needs the institute's instalment plan — a monthly figure computed from the fee would be wrong once interest or a down payment applies. |
| 17 | **Course comparison table** — Foundation vs Prelims vs Mains vs Test Series | ✅ | `/courses#compare`, built from the live catalogue. Shows once two or more programmes are published. |
| 18 | **Early-bird pricing and real seats-left per batch** | ⬜ 🏫 | The public batch list (`src/data/batches.ts`) is empty and not yet read from Firestore, where `seatLimit` / `seatsFilled` live. Wire it up once real batches are scheduled. Only show when true. |
| 19 | **Concessions** — group, sibling, women, defence families, EWS | ⬜ 🏫 | |

## 5. Lead capture and follow-up

| # | Item | Status | Notes |
| --- | --- | --- | --- |
| 20 | **WhatsApp follow-up within minutes** of every form | 🚧 | Phase 1 (done): one-tap WhatsApp/call buttons with prefilled messages in the CRM. Phase 2: automatic message via the WhatsApp Business API once credentials exist — add a `LeadSink` in `src/lib/leads/service.ts`. |
| 21 | **Leads CRM in admin** — status pipeline, owner, follow-up date, call notes | ✅ | `/admin/leads`. Backend was `enquiryService`. |
| 22 | **Exit-intent offer** | ✅ | Desktop only: a two-field callback dialog when the pointer leaves for the tab bar, after 20s on the site, at most once per 14 days, never on form pages, never after any form was sent. Lands in the CRM with source `exit-intent`; `exit_offer_shown` is tracked. Swap the offer for a free PDF once one exists. |
| 23 | **GA4 + Microsoft Clarity** with conversion events | ✅ | Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_CLARITY_PROJECT_ID`. Events in `src/lib/analytics/events.ts`. Public site only. |

## 6. Content that brings in search traffic

| # | Item | Status | Notes |
| --- | --- | --- | --- |
| 24 | **Daily current affairs + monthly PDF magazine**, kept consistently updated | ⬜ 🏫 | |
| 25 | **Evergreen guides** — syllabus, exam pattern, eligibility, age limit, dates, optional-subject guides | ✅ | `/upsc-guide` plus eligibility, exam pattern, syllabus and beginner's roadmap, with FAQ rich results, in the sitemap and site search. Content in `src/data/upsc-guides.ts` — re-check figures against each February notification. Next: one guide per optional subject; point CTAs at the mock test once #1 ships. |
| 26 | **YouTube / Instagram shorts** embedded on the site | ⬜ 🏫 | `SOCIAL_LINKS` are still placeholders. |
| 27 | **Pune local SEO** — Google Business Profile, "UPSC coaching in Pune" and area landing pages | ⬜ 🏫 | `CONTACT` address/phone are still placeholders. |

## 7. Student experience as a selling point

| # | Item | Status | Notes |
| --- | --- | --- | --- |
| 28 | **Show the student dashboard publicly** — screenshots or a walkthrough of performance tracking | ⬜ | Most local competitors have nothing like it. |
| 29 | **Service promises with a time limit** — doubts answered in 24h, Mains copies returned in 72h | ⬜ 🏫 | |
| 30 | **One mentor per student**, with meeting frequency stated | ⬜ 🏫 | |
| 31 | **Referral programme** — fee credit for each friend who enrols | ⬜ 🏫 | |

---

## Blocking placeholders

These `TODO(institute)` values in `src/lib/constants/site.ts` hurt conversion
directly and should be filled before any campaign spend:

- `CONTACT.phoneDisplay`, `phoneHref`, `whatsappNumber` — every call and WhatsApp button points at `+91 00000 00000`.
- `CONTACT.addressLines` — the centre address.
- `SOCIAL_LINKS` — bare platform home pages.
- `BROCHURE.href` — no PDF yet.
