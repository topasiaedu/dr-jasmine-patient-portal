# Demo App — Agent Implementation Prompts (Original Build — Completed)

> **STATUS: COMPLETED** — These 9 agent prompts built the initial demo app.
> All have been executed. For current work, see the `docs/` folder:
> - **Design overhaul prompts:** [`docs/12-design-implementation-prompts.md`](./docs/12-design-implementation-prompts.md)
> - **UX audit & improvements:** [`docs/10-ux-audit-improvements.md`](./docs/10-ux-audit-improvements.md)
> - **Design system:** [`docs/08-ui-ux.md`](./docs/08-ui-ux.md)

Run these prompts **in order**, one agent at a time. Each agent builds on the previous.
Pass the relevant prompt in full to each agent session.

---

## Shared Project Context
> Copy this block into every agent prompt alongside the specific task section.

```
PROJECT: Dr. Jasmine Patient Portal — Demo App

This is a DEMO ONLY. No real backend, no API calls, no environment variables.
All data is mocked. State is managed with localStorage (patient portal) and
React useState (admin panel). The purpose is for the doctor (Dr. Jasmine) to
see and click through a realistic prototype of the final product.

TECH STACK:
- Next.js 14 (App Router, TypeScript strict mode)
- Tailwind CSS
- shadcn/ui (for base components like Button, Input, Card, etc.)
- Plus Jakarta Sans font (from Google Fonts)
- No backend. No API routes needed. No .env file needed.

STRICT TYPESCRIPT RULES (non-negotiable):
- No `any` type
- No non-null assertion operator (!)
- No `as unknown as T` casts
- Define explicit types/interfaces for all data shapes
- Use double quotes for all strings
- Use template literals instead of string concatenation

DEMO ROUTING:
- Patient portal lives at: /p/demo
- Admin panel lives at: /admin
- The demo patient ID is always the string "demo"
- There is NO real auth. Admin "login" just sets a localStorage flag and redirects.

DESIGN TOKENS (apply via Tailwind config and CSS variables):
  Primary (warm teal):     #2A9D8F
  Primary hover:           #238276
  Primary light (bg tint): #E8F5F3
  Background:              #FAFAF8
  Surface (cards):         #FFFFFF
  Border:                  #E5E5E0
  Text primary:            #1A1A2E
  Text secondary:          #6B7280
  Accent (CTA buttons):    #E76F51
  Accent hover:            #CF5F41
  Success (green):         #16A34A
  Danger (red):            #DC2626
  Warning (amber):         #D97706
  Admin sidebar bg:        #1E293B

TYPOGRAPHY:
- Font: Plus Jakarta Sans (import from Google Fonts in layout)
- Patient portal minimum body font: 18px
- All button labels: 18px, font-weight 600
- Primary button height: 56px, border-radius: 14px, full-width on mobile
- Touch targets: minimum 48x48px on all interactive elements

DEMO CONTROLS PANEL:
Every page in the patient portal (/p/demo/*) must include a floating
"Demo Controls" panel — a small pill button pinned bottom-right that,
when clicked, expands to show:
  - Current patient status (onboarding / booked / active)
  - Buttons to switch to any status instantly
  - A "Reset demo" button that clears localStorage
This is purely for demo/presentation purposes so Dr. Jasmine can jump
between states during a walkthrough.

PATIENT STATUS (stored in localStorage key "demo_patient_status"):
  "onboarding" → shows onboarding form
  "booked"     → shows pending/holding screen
  "active"     → shows full portal (home, log, appointment, guide, faq)
```

---

## Agent 1 — Project Scaffold + Mock Data + Shared Components

### Your Task

Set up the entire Next.js 14 project from scratch. Install all dependencies.
Configure Tailwind with the design tokens. Create the central mock data file.
Build all shared/layout components that every other agent will use.
Do NOT build any pages yet — only foundation.

### Steps

1. Initialise a Next.js 14 project with TypeScript, Tailwind CSS, App Router, and the src directory disabled (use the root `app/` directory). Use `npm` as the package manager.

2. Install these additional dependencies:
   - `shadcn/ui` (run: `npx shadcn@latest init` with default settings, New York style, neutral base colour)
   - Install these shadcn components: `button`, `input`, `card`, `badge`, `separator`, `textarea`, `label`, `progress`, `accordion`, `dialog`, `sheet`, `tabs`, `avatar`, `scroll-area`, `tooltip`
   - `@radix-ui/react-icons` (already included with shadcn)
   - `lucide-react` (icon library)
   - `clsx` and `tailwind-merge` (usually included with shadcn)
   - `date-fns` (for date formatting)

3. Update `tailwind.config.ts` to add all the design token colours listed in the shared context as named colours (e.g. `primary: "#2A9D8F"`, `accent-cta: "#E76F51"`, `bg-app: "#FAFAF8"`, `text-main: "#1A1A2E"`, etc.).

4. Update `app/globals.css`:
   - Import Plus Jakarta Sans from Google Fonts
   - Set `font-family: "Plus Jakarta Sans", sans-serif` as the base font
   - Set `background-color: #FAFAF8` as the html/body background
   - Define CSS custom properties for all design tokens

5. Create `lib/mock-data.ts` with ALL of the following exported constants (use strict TypeScript interfaces, define them all in this file):

```typescript
// Patient
export interface Patient {
  id: string;
  ghlContactId: string;
  fullName: string;
  email: string;
  phone: string;
  status: "onboarding" | "booked" | "active";
  createdAt: string;
}

// Onboarding
export interface OnboardingResponse {
  age: number;
  sex: "male" | "female" | "prefer_not_to_say";
  race: string;
  occupation: string;
  chiefComplaint: string;
  existingConditions: string[];
  currentMedications: string[];
  allergies: string[];
  familyHistory: string;
  smokingStatus: "never" | "former" | "current";
  alcoholUse: "none" | "occasional" | "moderate" | "frequent";
  activityLevel: "sedentary" | "light" | "moderate" | "active";
  dietaryNotes: string;
  additionalNotes: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

// Daily Reading
export interface DailyReading {
  id: string;
  patientId: string;
  readingDate: string;
  fastingBloodSugar: number;
  postDinnerBloodSugar: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  pulseRate: number;
  weightKg: number;
  waistlineCm: number;
  entryMethod: "manual" | "photo_extracted";
  submittedAt: string;
}

// Appointment
export interface Appointment {
  id: string;
  patientId: string;
  calBookingUid: string;
  startsAt: string;
  endsAt: string;
  zoomJoinUrl: string;
  isFirstConsultation: boolean;
  status: "scheduled" | "completed" | "cancelled";
}

// Guide
export interface FoodReplacement { original: string; replacement: string; }
export interface FoodCategory { name: string; items: string[]; notes: string[]; }
export interface PortionGuidance { label: string; fraction: string; }
export interface FreeTextSection { title: string; content: string; }
export interface PatientGuide {
  id: string;
  patientId: string;
  title: string;
  noList: string[];
  yesCategories: FoodCategory[];
  snacks: string[];
  replacements: FoodReplacement[];
  portions: PortionGuidance[];
  cookingMethods: string[];
  additionalSections: FreeTextSection[];
  updatedAt: string;
}

// Timeline
export type TimelineEventType =
  | "patient_created" | "onboarding_completed" | "appointment_booked"
  | "appointment_completed" | "patient_activated" | "reading_submitted"
  | "guide_created" | "guide_updated" | "note_added";

export interface TimelineEvent {
  id: string;
  patientId: string;
  type: TimelineEventType;
  metadata: Record<string, string | number | boolean | string[]>;
  occurredAt: string;
}

// Consultation Note
export interface ConsultationNote {
  id: string;
  patientId: string;
  appointmentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

Populate mock data for ONE demo patient (id: "demo") with the following values:

- **Patient:** Lily Tan, lily@example.com, +60 12 345 6789, status "active"
- **Onboarding:** Age 58, female, Chinese, retired teacher. Chief complaint: "High blood sugar and weight gain". Conditions: ["Type 2 Diabetes", "Hypertension"]. Medications: ["Metformin 500mg twice daily", "Lisinopril 10mg once daily"]. Allergies: ["Penicillin"]. Smoking: never. Alcohol: occasional. Activity: sedentary.
- **Readings:** 7 entries for dates March 19–25, 2026 with these values (oldest to newest):
  - Mar 19: 7.3 / 9.1 / 140/90 / 82 / 70.5 / 93
  - Mar 20: 7.1 / 8.8 / 138/88 / 80 / 70.2 / 92.5
  - Mar 21: 6.9 / 8.6 / 136/87 / 79 / 70.0 / 92
  - Mar 22: 6.8 / 8.4 / 135/86 / 78 / 69.5 / 91.5
  - Mar 23: 6.6 / 8.2 / 133/85 / 77 / 69.2 / 91
  - Mar 24: 6.4 / 8.0 / 131/84 / 76 / 69.0 / 90.5
  - Mar 25: 6.2 / 7.8 / 128/82 / 74 / 68.5 / 90
  (format: fasting / postDinner / sysBP/diaBP / pulse / weight / waist)
- **Appointment:** March 28, 2026, 10:00–10:30 AM, status "scheduled", zoomJoinUrl: "https://zoom.us/j/demo"
- **Guide:** Title "Low Carb High Fat Diet (LCHF)". Populate with realistic data matching the LCHF diet we know about:
  - noList: ["White Rice", "Brown Rice", "Basmati Rice", "Mee Hoon", "Kway Teow", "Noodles", "Bread", "Biscuits", "Cakes", "Rolled Oats", "White Sugar", "Brown Sugar", "Honey", "All fruits (except avocado, strawberries, blueberries)", "Milk", "Fruit Juices", "Soft Drinks", "Beer"]
  - yesCategories with: Meat (Pork, Beef, Mutton, Duck, Chicken, Fish, Crab, Prawns — with note "Fatty meat preferred"), Eggs (No limit per day, eat both white and yolk), Tofu/Tempe, Vegetables (All above-ground including leafy greens, beans, mushrooms except corn — underground: only carrot, radish, ginger, garlic, onion allowed)
  - snacks: ["Avocados", "Strawberries", "Blueberries", "Cherries", "Star Fruits", "Natural Greek Yogurt", "Nuts (except cashew, pistachios, chestnut)", "Cheese (except sliced cheese)", "Chicken skin", "Fish skin", "Seaweed"]
  - replacements: rice→cauliflower rice or konjac rice, noodles→konjac noodles or zucchini noodles, flour→almond flour or coconut flour, milk→whipping cream or almond milk or coconut milk
  - portions: 1/3 Meat, 1/3 Eggs or Tofu, 1/3 Vegetables
  - cookingMethods: ["Pan-fried", "Deep Fried", "Steamed", "BBQ", "Grilled", "Boiled", "Stewed", "Raw (e.g. Sashimi)"]
  - additionalSections: one section "Quantity" with content "Eat when you are hungry, stop when you are 100% full. Drink when you are thirsty.", one section "Disclaimer" with the Metanova Health disclaimer text.
- **Timeline:** Create 8 events covering: patient created, onboarding completed, appointment booked, guide created, patient activated, 3 reading submissions, 1 note added.
- **Consultation notes:** 2 notes. First: "First consultation. Patient is motivated to start LCHF. Introduced the diet plan, explained the homework sheet. Advised to reduce portion sizes gradually. Follow up in 2 weeks." Second: "Patient reports feeling less bloated. Fasting readings improving. Updated guide with replacement options. Encouraged to log readings daily."

6. Create these shared components:

**`components/patient/BottomNav.tsx`**
A fixed bottom navigation bar for the patient portal with 4 tabs:
- Home (House icon) → /p/demo/home
- Log (ClipboardList icon) → /p/demo/log
- Appointment (Calendar icon) → /p/demo/appointment
- Guide (BookOpen icon) → /p/demo/guide
Each tab: icon (24px) + label below (12px). Active tab uses primary colour (#2A9D8F). Height: 64px. White background with top border. Receives `activePath` prop (string) to highlight the active tab.

**`components/patient/PatientPageLayout.tsx`**
A wrapper layout for all active patient pages. Renders children with bottom padding to account for the bottom nav (80px), and renders `<BottomNav>` fixed at bottom. Also renders `<DemoControls>` (see below). Accepts `activePath` prop.

**`components/demo/DemoControls.tsx`**
A floating pill button fixed at bottom-right (above the bottom nav, z-index 50).
- Default state: small pill showing "Demo ⚙" 
- Expanded state (on click): a white card showing:
  - "Patient Status" label
  - 3 buttons: "Onboarding" / "Booked" / "Active" — the current status is highlighted
  - "Reset All Data" button (clears localStorage and reloads)
  - A small "×" to collapse
- Clicking a status button: updates localStorage key `demo_patient_status` to that value and does `window.location.href = "/p/demo"` to re-evaluate the redirect

**`components/admin/AdminLayout.tsx`**
A layout wrapper for all admin pages. Renders a dark sidebar (bg #1E293B, 240px wide) on the left with navigation links:
- Dashboard → /admin/dashboard
- Patients → /admin/patients
- Schedule → /admin/schedule
Logo/name area at the top of sidebar: "Dr. Jasmine" in white, small "Admin Panel" subtitle in slate-400. Main content area to the right with white background and padding. On mobile: sidebar collapses to a top bar with a hamburger menu.

**`components/patient/StepProgress.tsx`**
A row of dots showing progress through a multi-step form. Props: `totalSteps: number`, `currentStep: number` (1-indexed). Renders filled dots for completed/current steps, empty dots for future steps. Primary colour for filled, border-only for empty. Space evenly across full width.

**`components/patient/NumberStepper.tsx`**
A large number input with minus and plus buttons. Props: `value: number`, `onChange: (v: number) => void`, `step: number`, `min: number`, `max: number`, `unit: string`, `label: string`, `labelZh: string`. Layout: label (English, large) + labelZh (Chinese, secondary) at top. Then a row: [−] [large value display] [+]. Unit shown below the value in secondary text. Minus and plus buttons are 48×48px minimum, rounded, border style.

7. Create root redirect pages:
- `app/page.tsx` → redirects to `/p/demo`
- `app/p/demo/page.tsx` → reads `demo_patient_status` from localStorage (default: "onboarding"), redirects accordingly:
  - "onboarding" → /p/demo/onboarding
  - "booked" → /p/demo/pending
  - "active" → /p/demo/home
  Note: since this reads localStorage (client-side), this page must be a Client Component with a useEffect for the redirect.
- `app/admin/page.tsx` → redirects to `/admin/login`

8. Update `app/layout.tsx` to import Plus Jakarta Sans, set the html lang to "en", apply the base font class and bg-app background.

### Deliverables
A fully set up Next.js 14 project that compiles without errors. No pages with actual content yet (just redirects). The `lib/mock-data.ts` file fully populated. All shared components built and exported.

---

## Agent 2 — Patient Onboarding Flow (Stepped Form + Mock Booking + Pending Screen)

### Your Task

Build the three pages that cover the "locked" portion of the patient journey:
the onboarding form, the mock booking page, and the holding screen.

### Context From Previous Agent
The project scaffold is complete. The following already exist and should be imported/used:
- `lib/mock-data.ts` — all types and mock data
- `components/demo/DemoControls.tsx` — must be rendered on all patient pages
- `components/patient/StepProgress.tsx` — use for form step indicators
- `components/patient/NumberStepper.tsx` — available if needed
- All shadcn/ui components are installed
- Design tokens are set up in Tailwind

### Pages to Build

**`app/p/demo/onboarding/page.tsx`** — Client Component

A 6-step onboarding form. State is managed entirely with `useState`.
On final submit: save the form data to `localStorage` as `demo_onboarding_data` (JSON),
set `demo_patient_status` to `"booked"`, redirect to `/p/demo/book`.

Form steps (one screen per step, animated slide-left/right transition between steps):

Step 1 — Personal Details
- Full Name (pre-filled with "Lily Tan" from mock data, but editable)
- Age (number input, min 1 max 120)
- Sex (3 large radio cards: Male / Female / Prefer not to say)
- Race / Ethnicity (text input)

Step 2 — Health Background
- Chief Complaint / Why are you seeing Dr. Jasmine today? (textarea)
- Existing medical conditions (multi-add: text input + "Add" button → adds chips/tags below, × to remove)
- Current medications (same multi-add pattern)
- Known allergies (same multi-add pattern)

Step 3 — Lifestyle
- Smoking status (3 radio cards: Never / Former Smoker / Current Smoker)
- Alcohol use (4 radio cards: None / Occasional / Moderate / Frequent)
- Physical activity (4 radio cards: Sedentary / Light / Moderate / Active)
- Dietary notes (textarea, placeholder: "Any food preferences, restrictions, or cultural requirements")

Step 4 — Family History & Additional Notes
- Family history of illness (textarea)
- Anything else you'd like Dr. Jasmine to know (textarea)

Step 5 — Emergency Contact
- Emergency contact name (text input)
- Emergency contact phone (text input, type="tel")

Step 6 — Review & Confirm
- Read-only summary of all answers, grouped by step with collapsible sections
- Primary "Submit →" button (full width, 56px, accent colour)
- Secondary "Go back and edit" button

UX requirements:
- Progress dots at top (StepProgress component, 6 steps)
- "Next →" primary button + "← Back" secondary button at bottom (step 1 has no back)
- Validate required fields before allowing Next (show inline error if missing)
- Required fields: full name, age, sex, chief complaint, emergency contact name and phone
- Animate step transitions: current step slides out left, next step slides in from right (reverse for back)
- Entire layout: white bg, 16px horizontal padding, generous spacing between fields
- On mobile the page should not scroll horizontally

Include DemoControls component on this page (floating, does not interfere with form).

---

**`app/p/demo/book/page.tsx`** — Client Component

A mock appointment booking page. Does NOT use Cal.com — it's a simplified date/time picker.

Layout:
- Page title: "Book Your First Consultation"
- Subtitle: "Pick a time that works for you."
- A simple week-view calendar showing the next 14 days with available slots.
  - Available: weekdays only, 9AM–12PM, 2PM–5PM in 30-minute slots
  - Hard-code 3–4 slots as "unavailable" (greyed out) to make it look realistic
  - Clicking a date shows the time slots for that day
  - Clicking a time slot selects it (highlight in primary colour)
- A "Confirm Booking" button (disabled until slot is selected)
- On confirm: save `demo_appointment` to localStorage (the selected date + time),
  set `demo_patient_status` to `"booked"`, redirect to `/p/demo/pending`
- Show the patient's pre-filled name and email below the confirm button (greyed, not editable): "Booking for: Lily Tan · lily@example.com"

Include DemoControls.

---

**`app/p/demo/pending/page.tsx`** — Client Component

The holding screen. Patient is booked but account not yet activated.

Layout (centred, single column, max-width 420px, vertically centred on screen):
- A large calendar-check icon (from lucide-react) in primary colour, 64px
- Heading: "You're all booked in!"
- Appointment card (rounded, border, teal-tinted background):
  - "Your first consultation with Dr. Jasmine"
  - Date: reads from localStorage `demo_appointment` if available, otherwise shows "Friday, 28 March 2026"
  - Time: 10:00 AM – 10:30 AM
  - "Join on Zoom" button: shown but GREYED OUT with tooltip "This button will appear 15 minutes before your appointment"
- Divider
- Section heading: "What happens next?"
- Body text: "Dr. Jasmine will introduce you to the rest of this app during your consultation. You're all set for now!"
- A "Need help?" link at the bottom that links to WhatsApp (href="https://wa.me/60123456789", opens new tab)

Include DemoControls. The DemoControls "Active" button is how Dr. Jasmine will demo the activation step.

---

## Agent 3 — Patient Active Portal: Home + Appointment + FAQ

### Your Task

Build the home screen, appointment screen, and FAQ screen for the active patient portal.
These pages are only shown when `demo_patient_status` is `"active"`.

### Context From Previous Agents
Already built:
- `lib/mock-data.ts` — import `MOCK_APPOINTMENT`, `MOCK_PATIENT`
- `components/patient/PatientPageLayout.tsx` — use as the wrapper for all 3 pages (handles BottomNav + DemoControls)
- All shadcn/ui components available
- Design tokens in Tailwind

---

**`app/p/demo/home/page.tsx`** — Client Component

The main dashboard screen.

Layout (inside PatientPageLayout with activePath="/p/demo/home"):
- Top greeting bar: "Good morning, Lily 👋" (time-aware: Good morning/afternoon/evening based on current hour). Use text-2xl font-bold text-main.
- Today's task card (the most prominent element, full-width, rounded-2xl, border):
  - Reads localStorage to check if today's reading has been submitted (key: `demo_reading_today`, value: the date string "YYYY-MM-DD")
  - If NOT submitted: white card with teal left border accent:
    - Small label: "TODAY'S TASK" in primary colour, text-sm font-semibold uppercase tracking-wide
    - Heading: "Have you logged your readings today?" in text-xl font-bold
    - Primary button: "Log my readings →" (full width, accent colour, 56px, navigates to /p/demo/log)
  - If submitted: teal-tinted card (#E8F5F3 bg):
    - Large green checkmark icon (48px)
    - "All done for today! Great work, Lily." in text-xl font-semibold
    - Small secondary text: "Your readings have been sent to Dr. Jasmine."
- Section heading: "UPCOMING APPOINTMENT" in text-sm font-semibold uppercase tracking-wide text-secondary
- Appointment card (white, rounded-xl, border, padding):
  - Date and time in large text: "Friday, 28 March 2026 · 10:00 AM"
  - "Video call with Dr. Jasmine" in secondary text
  - "Join on Zoom" button: show a note "(Available 15 min before appointment)" in grey text, button is greyed out (variant="outline" disabled-style) — in the real app this becomes active 15 min before, for demo purposes show it as always greyed with that label
  - If no appointment: show "No appointment booked." with a "Book a consultation →" link

---

**`app/p/demo/appointment/page.tsx`** — Client Component

Inside PatientPageLayout with activePath="/p/demo/appointment".

Layout:
- Page title: "Your Appointment" (text-2xl font-bold)
- Upcoming appointment card (same card style as home page but more detailed):
  - "NEXT APPOINTMENT" label
  - Day, date, time in large text
  - Duration: "30 minutes"
  - "Video call with Dr. Jasmine"
  - "Join on Zoom" button — large, full-width, primary colour BUT with a note under it:
    "(The Join button activates 15 minutes before your call)"
  - Show button in outline/disabled visual state
- Divider with "OR" text
- Two secondary action buttons (outline style, full-width, spaced):
  - "Book a new appointment" (navigates to /p/demo/book)
  - "Reschedule this appointment" (shows a toast/alert: "To reschedule, please contact Dr. Jasmine's clinic via WhatsApp." with a WhatsApp link)
- If no appointment in localStorage: only show "You don't have an appointment booked yet." and the "Book a consultation" button.

---

**`app/p/demo/faq/page.tsx`** — Client Component

Inside PatientPageLayout with activePath="/p/demo/faq" (the BottomNav doesn't have an FAQ tab — render a back arrow instead of the normal layout, or add FAQ as a 5th item if preferred. Actually: since the BottomNav only has 4 tabs and FAQ doesn't have a tab, render this page with a simple top-back-button layout instead of the PatientPageLayout. Use a plain white page with a "← Back" link to /p/demo/home at the top.)

Page title: "Frequently Asked Questions"

Use shadcn Accordion component. 4 categories, each is an accordion section:

Category 1 — "About My Readings"
- Q: How do I measure fasting blood sugar?
  A: Measure in the morning before eating or drinking anything (except water). Use your glucometer and record the number shown.
- Q: When should I log my readings?
  A: Log your fasting reading first thing in the morning. Log your post-dinner reading 2 hours after you finish eating dinner.
- Q: What is a normal blood sugar reading?
  A: Fasting: 3.9–5.6 mmol/L is normal. 2-hour post-meal: under 7.8 mmol/L is normal. Dr. Jasmine will discuss your personal targets with you.
- Q: What if my reading seems very high or very low?
  A: If your fasting reading is above 15 or below 3.5, please contact Dr. Jasmine immediately via WhatsApp.

Category 2 — "About My Diet Guide"
- Q: Can I eat something that is not on my guide?
  A: If you are unsure, the general rule is: avoid anything sweet, starchy, or made from flour. When in doubt, contact Dr. Jasmine.
- Q: My guide says I can't eat rice — what do I eat instead?
  A: Check the Replacements section in your guide. Cauliflower rice and konjac rice are good alternatives that look and feel similar.

Category 3 — "About Appointments"
- Q: How do I join the video call?
  A: On the day of your appointment, open this app and go to the Appointment tab. A "Join on Zoom" button will appear 15 minutes before your call. Tap it and Zoom will open automatically.
- Q: What if I need to reschedule?
  A: Tap "Reschedule this appointment" on the Appointment page, or contact Dr. Jasmine's clinic via WhatsApp.
- Q: What if I have a technical problem during the call?
  A: Send Dr. Jasmine a WhatsApp message immediately. Her team will respond as quickly as possible.

Category 4 — "About This App"
- Q: I can't find my link to this app — what do I do?
  A: Visit the "Find My Link" page and enter your email address. We will resend your link via WhatsApp immediately.
- Q: Does Dr. Jasmine see my readings?
  A: Yes. Every time you submit your readings, Dr. Jasmine can see them in her system. She reviews them regularly.

Style: accordion items have generous padding (py-4), font-size 18px for question text, 16px for answer text, leading-relaxed for answers. A teal arrow/chevron indicator.

Include DemoControls on the FAQ page.

---

## Agent 4 — Patient Portal: Daily Readings Form

### Your Task

Build the daily readings entry flow — the most important patient-facing feature.
This includes both the manual stepped form and a UI stub for the photo extraction path.

### Context From Previous Agents
Already built:
- `lib/mock-data.ts` — types available
- `components/patient/PatientPageLayout.tsx`
- `components/patient/StepProgress.tsx`
- `components/patient/NumberStepper.tsx`
- All shadcn components

---

**`app/p/demo/log/page.tsx`** — Client Component

This is a 9-screen stepped flow (8 reading steps + 1 review screen). Wrap in PatientPageLayout with activePath="/p/demo/log".

**Step 0 — Entry Choice Screen** (shown first, before the steps):
- Heading: "Log Your Readings"
- Two large choice cards (full width, tappable, rounded-2xl, bordered):
  - Card 1 (primary): Pencil icon. "Enter readings manually". Subtitle: "Type in each reading one at a time."
  - Card 2 (secondary): Camera icon. "Take a photo instead". Subtitle: "Photograph your filled-in homework sheet."
- Selecting Card 1 → proceed to Step 1 (date selection)
- Selecting Card 2 → proceed to Photo Stub screen (see below)
- No "Next" button needed — selecting a card immediately navigates

**Photo Stub Screen** (only reached via Card 2):
- Heading: "Upload Your Homework Sheet"
- A large dashed upload area (rounded-2xl, border-dashed, border-2, teal border colour) with:
  - Camera icon (48px, teal)
  - "Tap to take a photo or upload from your gallery"
  - A real `<input type="file" accept="image/*" capture="environment">` hidden behind a styled button
- When a file is selected: show a preview of the image (using URL.createObjectURL)
- Below the preview: "Extracting your readings..." loading skeleton animation for 2 seconds (simulated with setTimeout), then reveal the pre-filled form values (use today's mock values):
  - Show a card saying "We found these readings in your photo — please confirm they are correct:"
  - List all 7 values with green checkmarks, styled as a read-only review
  - Primary "These look right — submit" button
  - Secondary "Enter manually instead" button (goes back to Step 1)
- On "These look right — submit": save to localStorage as `demo_reading_today` with today's date, save reading data, redirect to /p/demo/log/success

**Steps 1–8 (manual path):**
Use StepProgress component showing 8 steps. Step number shown above: "Step 2 of 8".

Step 1 — Date Selection
- Label: "Which date are these readings for?"
- A date picker: show the last 7 days as large tappable pill buttons (Mon 24 Mar, Tue 25 Mar, etc.), with today highlighted as default selected. Allow selecting past dates (patients may log yesterday's).
- If the selected date already has a reading in localStorage:
  Show a yellow warning card: "You've already submitted readings for this date. Continuing will replace them." — don't block, just warn.

Step 2 — Fasting Blood Sugar
- Use NumberStepper component
- Props: value starts at 6.0, step 0.1, min 1.0, max 30.0, unit "mmol/L", label "Fasting Blood Sugar", labelZh "空腹血糖"
- Helper text below stepper: "Measure before eating or drinking in the morning"
- Teal info box: "Normal range: 3.9 – 5.6 mmol/L"

Step 3 — Post-Dinner Blood Sugar
- NumberStepper: start 7.0, step 0.1, min 1.0, max 30.0, unit "mmol/L", label "2-Hour Post-Dinner Blood Sugar", labelZh "餐后血糖"
- Helper text: "Measure 2 hours after you finish dinner"
- Teal info box: "Normal range: under 7.8 mmol/L"

Step 4 — Blood Pressure
- TWO number inputs side by side (NOT using NumberStepper — use two simple large number inputs):
  - Left: "Systolic" top number, unit "mmHg", start 120, step 1, min 60, max 220
  - Right: "Diastolic" bottom number, unit "mmHg", start 80, step 1, min 40, max 140
- Main label: "Blood Pressure" + "血压"
- Helper text: "Enter the two numbers shown on your blood pressure monitor"
- A small diagram showing "120 / 80" with "Top number" and "Bottom number" labels

Step 5 — Pulse Rate
- NumberStepper: start 72, step 1, min 30, max 200, unit "bpm", label "Pulse Rate", labelZh "心跳"
- Helper text: "Beats per minute shown on your blood pressure monitor"

Step 6 — Weight
- NumberStepper: start 68.5, step 0.1, min 20.0, max 300.0, unit "kg", label "Weight", labelZh "体重"
- Helper text: "Weigh yourself in the morning before eating"

Step 7 — Waistline
- NumberStepper: start 90, step 0.5, min 40.0, max 200.0, unit "cm", label "Waistline", labelZh "腰围"
- Helper text: "Measure around your belly button area"
- Small illustration placeholder (grey rounded box with text "Measure at belly button level")

Step 8 — Review & Submit
- Heading: "Check Your Readings"
- A clean card showing all 7 values in a 2-column list:
  - Fasting Blood Sugar: [value] mmol/L
  - Post-Dinner Blood Sugar: [value] mmol/L
  - Blood Pressure: [sys]/[dia] mmHg
  - Pulse Rate: [value] bpm
  - Weight: [value] kg
  - Waistline: [value] cm
  - Date: [selected date]
- Primary "Submit Readings" button (full width, 56px, accent colour)
- Secondary "Change a value" button → goes back to step 1

**On final submission:**
1. Save readings to localStorage:
   - Key `demo_reading_today`: today's date string
   - Key `demo_readings_history`: JSON array of all readings (prepend new reading to existing array from mock data)
2. Redirect to `/p/demo/log/success`

**`app/p/demo/log/success/page.tsx`** — simple success screen:
- Large green checkmark circle (64px, animated draw-in with CSS)
- "Done!" heading (text-3xl font-bold)
- "Dr. Jasmine will review your readings." in secondary text
- Auto-redirects to /p/demo/home after 3 seconds (with a countdown: "Returning home in 3...")
- "Go home now" link if they don't want to wait

Navigation UX on the form:
- Back button always in top-left as an arrow (not in the bottom button area)
- "Next →" primary button pinned to bottom above the BottomNav
- Step 1 back button goes to the entry choice screen (Step 0)
- No swipe gesture needed

---

## Agent 5 — Patient Portal: Guide View

### Your Task

Build the patient-facing guide view page. This renders the patient's personalised dietary
and lifestyle guide from mock data. Include a print/export to PDF feature.

### Context From Previous Agents
Already built:
- `lib/mock-data.ts` — import `MOCK_GUIDE` (the fully populated PatientGuide object)
- `components/patient/PatientPageLayout.tsx`
- All shadcn components and design tokens

---

**`app/p/demo/guide/page.tsx`** — Client Component

Inside PatientPageLayout with activePath="/p/demo/guide".

Page header:
- Title: "My Guide" (text-2xl font-bold)
- Subtitle: the guide title from MOCK_GUIDE.title ("Low Carb High Fat Diet (LCHF)")
- "Last updated: March 2026" in secondary text (derive from MOCK_GUIDE.updatedAt)
- Top-right: "Export as PDF" button (outline style, small, with a Download icon)

On "Export as PDF": call `window.print()`. The page has a separate print stylesheet (via `@media print` in a `<style>` tag or global CSS) that:
- Hides the BottomNav, DemoControls, and the "Export as PDF" button itself
- Removes the background colour, shows white
- Expands all sections (no collapsing)
- Formats the content cleanly for A4

Page body (all sections rendered in order, each as a visually distinct card):

**Section 1 — Foods to Avoid** (red-tinted card):
- Card with a red left border (4px, #DC2626) and very light red background (#FEF2F2)
- Header row with red X icon and bold heading "Foods to Avoid / 不可以吃"
- The noList items rendered as a wrapping list of red pill chips
- Chips: red background (#FEE2E2), red text (#DC2626), rounded-full, px-3 py-1, text-sm font-medium

**Section 2 — Foods You Can Eat** (green-tinted card):
- Card with a green left border (4px, #16A34A) and light green background (#F0FDF4)
- Header row with green checkmark icon and bold heading "Foods You Can Eat / 可以吃"
- For each category in MOCK_GUIDE.yesCategories:
  - Category name as a small section label (font-semibold, text-sm, uppercase, text-green-700)
  - Items rendered as green pill chips (green bg #DCFCE7, green text #16A34A)
  - If category has notes: show each note in italic text-sm text-secondary below the chips
  - Separate categories with a thin divider

**Section 3 — Snacks** (green-tinted, same style as Section 2 but a separate card):
- Header: "Allowed Snacks"
- All snack items as green chips
- Footer note (italic): "Only eat snacks when you are hungry"

**Section 4 — Replacements** (neutral card, white):
- Header with swap/arrows icon: "Food Replacements"
- Each replacement rendered as a row:
  `[original] → [replacement]`
  The arrow is a teal → icon. Original in regular text. Replacement in bold.
  
**Section 5 — Meal Portions** (neutral card):
- Header: "Recommended Portions"
- Visual representation: 3 equal segments as a horizontal bar (use flexbox with 3 equal divs, each a different shade of teal/green, with the label inside)
- Below: list each portion with fraction and label

**Section 6 — Cooking Methods** (neutral card):
- Header: "Allowed Cooking Methods"
- Items as neutral grey chips (bg-gray-100, text-gray-700, rounded-full)

**Section 7+ — Additional Sections** (neutral card each):
- For each item in MOCK_GUIDE.additionalSections:
  - Card with the title as heading and content as body text (preserving newlines)

Spacing: `space-y-4` between all cards. Each card: `rounded-2xl p-5 border`.
On mobile, the chips should wrap naturally.
At the very bottom of the page, add a bottom padding of 96px to account for the fixed BottomNav.

---

## Agent 6 — Admin Panel: Login + Dashboard + Patient List + New Patient

### Your Task

Build the admin-facing pages: login, dashboard, patient list, and new patient form.
The admin panel is for Dr. Jasmine only. No real auth — "login" just sets a localStorage
flag and redirects.

### Context From Previous Agents
Already built:
- `lib/mock-data.ts` — import `MOCK_PATIENT`, `MOCK_READINGS`, `MOCK_APPOINTMENT`, `MOCK_TIMELINE_EVENTS`
- `components/admin/AdminLayout.tsx` — use as wrapper for all admin pages (sidebar + main content)
- All shadcn components and design tokens

---

**`app/admin/login/page.tsx`** — Client Component

Simple centred login form. No sidebar (full page).

Layout (centred card, max-width 400px, vertically centred):
- Logo/name: "Dr. Jasmine" in large text (primary colour), "Patient Portal — Admin" in secondary
- Email input (label: "Email address")
- Password input (label: "Password", type="password")
- "Sign In" primary button (full width, 56px)
- On submit (any email + any password): set localStorage `demo_admin_auth` = "true", redirect to /admin/dashboard
- Small note below: "Demo mode — any credentials work"
- Form validation: both fields must be non-empty

---

**`app/admin/dashboard/page.tsx`** — Client Component

Inside AdminLayout.

Check localStorage for `demo_admin_auth`. If not set → redirect to /admin/login.
(Add this check to ALL admin pages.)

Top section:
- Greeting: "Good morning, Dr. Jasmine" (time-aware)
- Today's date in secondary text

"TODAY'S CONSULTATIONS" section:
- Section heading (uppercase, text-sm, font-semibold, text-secondary)
- A list of appointment cards. Use MOCK_APPOINTMENT data to show one appointment:
  Card: white, rounded-xl, border, padding. Contains:
  - Time: "10:00 AM"
  - Patient name: "Lily Tan"
  - Duration: "30 min"
  - Status badge: "Scheduled" (blue badge)
  - "Open Consultation Panel" button (primary, navigates to /admin/patients/demo/consult)
- If no appointments: "No consultations today."

"RECENT ACTIVITY" section:
- Section heading
- Show the last 5 timeline events from MOCK_TIMELINE_EVENTS as a simple vertical feed:
  Each item: coloured dot (based on event type) + event description text + "time ago" relative time
  Event descriptions to render:
  - reading_submitted → "Lily Tan submitted her daily readings"
  - appointment_booked → "Lily Tan booked an appointment"  
  - guide_updated → "Patient guide updated for Lily Tan"
  - note_added → "Consultation note added for Lily Tan"
  - patient_activated → "Lily Tan's account was activated"
  Use `date-fns` `formatDistanceToNow` for relative time.

"QUICK STATS" row (3 stat cards in a row):
- Total active patients: 1 (mock)
- Readings submitted this week: 7 (mock)
- Upcoming appointments: 1 (mock)
Each stat card: white, rounded-xl, border, padding. Large number + label.

---

**`app/admin/patients/page.tsx`** — Client Component

Inside AdminLayout. Patient list page.

Top bar:
- Heading: "Patients"
- "+ New Patient" button (primary, right-aligned, navigates to /admin/patients/new)
- Search input with magnifying glass icon (placeholder: "Search by name, email or phone...")
  In demo mode, search filters the mock patient list (only 1 patient, but the UI should work)
- Filter pills: "All" / "Active" / "Booked" / "Onboarding" — clicking highlights the selected filter

Patient table (responsive: cards on mobile, table on desktop):

Desktop table columns:
| Name | Email | Status | Last Reading | Next Appointment | Actions |

- Name: bold, with avatar (circle with initials, teal background)
- Status: coloured badge (Active=green, Booked=blue, Onboarding=amber)
- Last Reading: "Today" / "X days ago" / "—" (use date-fns)
- Next Appointment: "28 Mar 2026" / "—"
- Actions: "View" button (outline, small, navigates to /admin/patients/demo)

Show one row for the MOCK_PATIENT ("Lily Tan", active).
Below the table: "Showing 1 of 1 patient" in secondary text.

Mobile: each patient rendered as a card instead of a table row.

---

**`app/admin/patients/new/page.tsx`** — Client Component

Inside AdminLayout. "New Patient" form.

Top: "← Back to Patients" link. Heading: "Add New Patient".

Form fields:
- Full Name (required)
- Email Address (required, type="email")
- Phone Number (required, type="tel", placeholder: "+60 12 345 6789")
- A note in secondary text: "Once created, a unique portal link will be generated and you can send it to the patient via GoHighLevel."

On submit (validation: all fields required, email valid format):
1. Show a success state (same page, replace form with success message):
   - Large checkmark icon
   - "Patient created!"
   - Show the (fake) generated link: `https://portal.drjasmine.com/p/new-demo-patient`
   - "Copy Link" button (copies to clipboard using navigator.clipboard.writeText)
   - "Send via WhatsApp" button (opens wa.me link — in demo just shows a toast: "In the live app, this would trigger a WhatsApp message via GoHighLevel")
   - "Add Another Patient" button + "Back to Patient List" button

---

## Agent 7 — Admin Panel: Patient Profile + Journey Timeline

### Your Task

Build the patient profile page showing all patient information, the journey timeline,
and the readings history table.

### Context From Previous Agents
Already built:
- `lib/mock-data.ts` — import all mock data types
- `components/admin/AdminLayout.tsx`
- All shadcn components

---

**`app/admin/patients/[id]/page.tsx`** — Client Component

Inside AdminLayout. The `[id]` param will be "demo" in practice.
Load the MOCK_PATIENT data. Check admin auth in localStorage.

**Layout: two-column on desktop (1/3 left, 2/3 right), stacked on mobile.**

**LEFT COLUMN:**

Patient info card (white, rounded-xl, border, padding):
- Avatar: large circle (64px) with initials "LT" on teal background
- Name: "Lily Tan" (text-xl font-bold)
- Status badge (Active — green)
- Email with email icon
- Phone with phone icon
- "Added: 1 January 2026"

Quick Actions section (below the info card):
- "Open Consultation Panel" → primary button, full width, navigates to /admin/patients/demo/consult
- "Edit Guide" → outline button, full width, navigates to /admin/patients/demo/guide
- "View Guide (as patient)" → outline button, full width, opens /p/demo/guide in new tab
- "Generate New Link" → outline button, full width, shows a sheet/dialog with the fake link and copy button

**RIGHT COLUMN:**

Tab bar with two tabs: "Journey" and "Readings"

**Tab: Journey**
A vertical timeline feed (most recent at top). For each event in MOCK_TIMELINE_EVENTS (sorted by occurredAt descending):

Each timeline item:
- Left: a vertical line with a coloured dot at the item's position
- Right: event card (white, rounded-lg, border, padding)
  - Date in secondary text (formatted: "March 25, 2026 · 3:42 PM")
  - Event title (bold) based on type:
    - reading_submitted → "Daily readings submitted"
    - appointment_booked → "Appointment booked"
    - appointment_completed → "Consultation completed"
    - guide_updated → "Guide updated"
    - guide_created → "Guide created"
    - patient_activated → "Account activated"
    - onboarding_completed → "Onboarding form completed"
    - patient_created → "Patient added to portal"
    - note_added → "Consultation note added"
  - For `reading_submitted` events: show the key reading values inline in a grey code-style row: "Fasting: 6.2 · BP: 128/82 · Weight: 68.5 kg"
  - For `note_added` events: show a collapsed preview of the note text (first 80 chars + "...") with an "Expand" button to show full text
  - Dot colour: teal for positive events (activated, guide), blue for readings, amber for appointments, grey for created

**Tab: Readings**
A table of all readings from MOCK_READINGS (most recent first):

Columns: Date | Fasting | Post-Dinner | Blood Pressure | Pulse | Weight | Waistline

- Date formatted: "25 Mar 2026"
- Blood pressure shown as "128 / 82"
- Units shown in table header (mmol/L, mmHg, bpm, kg, cm)
- Table is striped (alternate row bg: white / #F9FAFB)
- Last row (most recent) has a subtle "Latest" badge
- Below table: "Showing 7 readings"
- In a real app this would be paginated, but for demo show all 7.

---

## Agent 8 — Admin Panel: Consultation Panel

### Your Task

Build the consultation panel — the most important admin-side screen. This is what
Dr. Jasmine uses during a live Zoom call to see everything about a patient at once.

### Context From Previous Agents
Already built:
- `lib/mock-data.ts` — import all mock data
- `components/admin/AdminLayout.tsx`
- All shadcn components

---

**`app/admin/patients/[id]/consult/page.tsx`** — Client Component

This page does NOT use AdminLayout's full sidebar + content split. Instead it is
a full-width "focused mode" layout — the sidebar is replaced with a slimmer version
or hidden to maximise screen space. Design it as a standalone full-height page.

Top bar (full width, white, border-bottom, h-14, flex align-center justify-between, px-4):
- Left: "← Exit Consultation" link (returns to /admin/patients/demo)
- Centre: "CONSULTATION — Lily Tan" in font-semibold
- Right: Two buttons:
  - "Activate Patient" button (primary, shown only when status is NOT "active"):
    On click: shows a confirmation dialog ("Activate Lily Tan? This will unlock their full portal and trigger a WhatsApp notification.") → on confirm: set localStorage `demo_patient_status` = "active", show a success toast: "Patient activated! WhatsApp sent via GoHighLevel."
  - "End Consultation" button (outline): shows a toast "Consultation marked as complete." 

Below the top bar: a 3-column grid (each column is `1/3` width) taking up the remaining viewport height. Each column is independently scrollable.

**Column 1 — Onboarding Summary** (bg white, border-right, p-4, overflow-y-auto):
Heading: "Patient Background" (text-sm font-semibold uppercase text-secondary mb-3)

Render from MOCK_ONBOARDING (or derive from mock data):
- Age & Sex: "58 years old, Female"
- Race: "Chinese"
- Conditions: render each as a small amber badge chip
- Medications: render each as a list item with a pill icon
- Allergies: render each as a small red badge chip
- Chief Complaint: in a teal-tinted quote box
- Activity: "Sedentary"
- Smoking / Alcohol: "Non-smoker · Occasional drinker"

At bottom: "Full profile →" link to /admin/patients/demo

**Column 2 — Latest Readings** (bg white, border-right, p-4, overflow-y-auto):
Heading: "Latest Readings" (text-sm font-semibold uppercase text-secondary mb-3)

Show the 3 most recent readings from MOCK_READINGS as stacked cards. Each card:
- Date in secondary text (e.g. "Monday, 25 Mar")
- 2-column grid of values:
  - Fasting: 6.2 mmol/L
  - Post-Dinner: 7.8 mmol/L
  - Blood Pressure: 128 / 82
  - Pulse: 74 bpm
  - Weight: 68.5 kg
  - Waistline: 90 cm
- Subtle divider between cards

At bottom: "All readings →" link to /admin/patients/demo (readings tab)

**Column 3 — Notes** (bg white, p-4, overflow-y-auto):
Heading: "Consultation Notes" (text-sm font-semibold uppercase text-secondary mb-3)

Autosaving notes textarea:
- A tall textarea (min-height: 180px) with placeholder: "Type your notes here..."
- Pre-filled with today's empty string (this is the current session's notes)
- A small status indicator above-right: "Autosaving..." or "Saved ✓"
- Simulate autosave: on any change to the textarea, after 2 seconds of no typing,
  save to localStorage key `demo_consult_notes` and show "Saved ✓" for 2 seconds
  then fade to nothing. While typing: show "Autosaving..."

Previous notes heading: "Previous Notes" (text-sm font-semibold uppercase text-secondary mt-4 mb-2)

For each note in MOCK_CONSULTATION_NOTES (sorted most recent first):
- Date in secondary text
- Note content (truncated to 100 chars with "..." if longer)
- "Expand" button that reveals full text inline (toggle)
- Thin divider between notes

**Bottom bar** (full width, white, border-top, h-16, flex align-center justify-between px-4):
- Left: Guide title "Guide: Low Carb High Fat Diet (LCHF)" in text-sm + "Last updated: March 2026" in secondary text
- Right: "Quick Edit Guide" button (outline, small, navigates to /admin/patients/demo/guide) and "View Guide" button (outline, small, opens /p/demo/guide in new tab)

---

## Agent 9 — Admin Panel: Guide Builder

### Your Task

Build the guide builder page — the most interactive admin screen. Dr. Jasmine uses
this to create and edit a patient's personalised dietary guide. All changes are saved
to localStorage for the demo (so the patient-side guide page reflects changes).

### Context From Previous Agents
Already built:
- `lib/mock-data.ts` — import `MOCK_GUIDE` and `PatientGuide` type plus all sub-types
- `components/admin/AdminLayout.tsx`
- `app/p/demo/guide/page.tsx` — this page reads the guide from localStorage key `demo_guide_data` (fall back to MOCK_GUIDE if not set). Make sure the guide builder saves to `demo_guide_data`.
- All shadcn components

---

**`app/admin/patients/[id]/guide/page.tsx`** — Client Component

Inside AdminLayout. Full-width content area.

**State management:**
Load initial guide state from localStorage `demo_guide_data` (parse JSON), or fall back to MOCK_GUIDE.
All edits update a `guide` React state object (deep copy of PatientGuide).
Autosave to localStorage `demo_guide_data` after every state change (use a useEffect with debounce of 1 second). Show "Unsaved changes" banner when current state differs from last saved state. Show "All changes saved" when in sync.

**Top bar:**
- Back link: "← Back to Patient Profile"
- Heading: "Guide Builder — Lily Tan"
- Right: "Preview as Patient" button (outline, opens /p/demo/guide in a new tab)
- Autosave status indicator (text-sm text-secondary: "Autosaving..." / "All changes saved")

**Guide Title Field:**
- Label: "Guide Title"
- Full-width text input, font-size 18px, pre-filled with guide.title
- On change: update guide.title

**Section: Foods to Avoid**
Label: "FOODS TO AVOID" (uppercase, font-semibold, text-sm, text-secondary)
TagInput component (build this inline or as a local component):
- Shows existing noList items as red removable chips (same style as patient view)
- Text input at the end: placeholder "Add a food + press Enter"
- On Enter or comma: add the trimmed text as a new chip (ignore empty/duplicate)
- Chips have an × button to remove
Bind to guide.noList

**Section: Foods Allowed (by category)**
Label: "FOODS YOU CAN EAT" with a "+ Add Category" button on the right

For each category in guide.yesCategories:
- A white card with a slightly inset appearance (rounded-xl, border, p-4, bg-gray-50)
- Top row: editable category name input (inline text input, styled as a heading — no box until focused) + "Delete category" button (small, danger colour)
- TagInput for the category items (green chips)
- "Category note" text input below chips (placeholder: "Optional note, e.g. 'Fatty meat preferred'") — shows the first note if exists, updates notes[0]
- Drag handle icon (GripVertical from lucide) on the left for reorder (implement reorder by simply having ↑ and ↓ buttons for demo — drag-and-drop is complex)

"+ Add Category" button: adds a new empty category object to yesCategories and scrolls to it.

**Section: Allowed Snacks**
Label: "SNACKS"
TagInput (green chips). Bind to guide.snacks.
Note below: "Tip: Add a reminder — 'Only when hungry'"

**Section: Replacements**
Label: "FOOD REPLACEMENTS" with "+ Add Replacement" button

For each replacement in guide.replacements:
- A row: "Instead of" [original text input] "→" [replacement text input] [× delete]
- Both inputs are inline, width ~200px each
- The → arrow is a fixed label between them

"+ Add Replacement" adds a new empty {original: "", replacement: ""} and focuses the first input.

**Section: Meal Portions**
Label: "MEAL PORTIONS" with "+ Add Portion" button

For each portion in guide.portions:
- A row: fraction input (small, width 80px, e.g. "1/3") + label input (full width, e.g. "Meat") + [× delete]

**Section: Cooking Methods**
Label: "COOKING METHODS"
TagInput (grey chips). Bind to guide.cookingMethods.

**Section: Additional Notes / Custom Sections**
Label: "ADDITIONAL SECTIONS" with "+ Add Section" button

For each section in guide.additionalSections:
- A card with:
  - Title input (full width, font-semibold style)
  - Textarea for content (min 3 rows)
  - "Delete section" button (small, danger)

**Bottom action bar** (sticky at bottom of page, white bg, border-top, p-4):
- Left: "Copy guide from another patient" button (outline) — in demo: shows a dialog saying "In the live app, you can copy from any other patient's guide." (just a toast or a dialog with one close button)
- Right: "Save Guide" primary button (accent colour, 48px height)
  On click: save current guide state to localStorage `demo_guide_data`, show a success toast: "Guide saved! The patient can now see the updated guide in their portal."

**TagInput component** (reuse across all tag sections):
Build as a reusable component in `components/admin/TagInput.tsx`:
```typescript
interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  chipColour: "red" | "green" | "grey";
}
```
Renders existing tags as coloured chips with × buttons, plus a text input at the end.
On Enter or comma in the input: trim and add (ignore empty/duplicate). On Backspace in empty input: remove last tag.

---

## Final Notes for All Agents

- Every page in the patient portal must render `<DemoControls />` (unless already
  included via PatientPageLayout).
- Every admin page must check `localStorage.getItem("demo_admin_auth")` and redirect
  to `/admin/login` if not set.
- Use `"use client"` at the top of all components that use useState, useEffect,
  localStorage, or event handlers.
- Server Components (no `"use client"`) are only appropriate for pure layout/wrapper
  components that pass no interactivity.
- All TypeScript must be strict: no `any`, no `!`, no `as unknown as T`.
- All strings use double quotes.
- Run `npm run build` mentally — no unused imports, no missing keys in .map() calls,
  all required props provided.
