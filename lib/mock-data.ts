// Patient
export interface Patient {
  id: string;
  ghlContactId: string;
  fullName: string;
  email: string;
  phone: string;
  status: "onboarding" | "booked" | "active";
  createdAt: string;
  /** Total sessions the patient is entitled to under their current programme (default: 5) */
  sessionsEntitled: number;
  /** Number of consultations that have status = "completed" */
  sessionsCompleted: number;
}

// Onboarding
export interface OnboardingResponse {
  icOrPassport: string;
  gender: "male" | "female";
  contactNumber: string;
  email: string;
  homeAddress: string;
  occupation: string;
  emergencyContact: string;
  referredBy: string;
  payerFullName: string;
  agreedToTerms: boolean;
  agreedToTestimonial: boolean;
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
  /** Diabetes/metabolic symptoms the patient is currently experiencing. */
  symptoms: string[];
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
  /** Which session number this is (1 = first consultation, 2 = second, etc.) */
  sessionNumber: number;
  /** Duration in minutes — always 60 for session 1, always 30 for sessions 2+ */
  durationMinutes: 30 | 60;
  /** Who initiated the booking. "patient" = portal, "admin" = admin panel. */
  scheduledBy: "patient" | "admin";
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
  dietType: string;
  noList: string[];
  yesCategories: FoodCategory[];
  snacks: string[];
  replacements: FoodReplacement[];
  portions: PortionGuidance[];
  cookingMethods: string[];
  additionalSections: FreeTextSection[];
  updatedAt: string;
}

export interface GuideVersion {
  id: string;
  patientId: string;
  /** Incrementing version number starting at 1 */
  versionNumber: number;
  /** Human-readable name for this protocol phase, shown as the guide title to the patient. */
  protocolName: string;
  /** Private clinical note explaining why this phase was started. Only visible to Dr. Jasmine. */
  clinicalRationale: string;
  /** The session number during which this guide version was introduced */
  introducedAtSession: number;
  /** ISO 8601 date this version became active */
  activeFrom: string;
  /** ISO 8601 date this version was replaced by a newer one. null = this is the current active guide. */
  supersededAt: string | null;
  /** All existing guide content fields */
  noList: string[];
  yesCategories: FoodCategory[];
  snacks: string[];
  replacements: FoodReplacement[];
  portions: PortionGuidance[];
  cookingMethods: string[];
  additionalSections: FreeTextSection[];
  createdAt: string;
  updatedAt: string;
}

/** A recurring weekly availability window — the hours Dr. Jasmine is open for consultations. */
export interface AvailabilityWindow {
  id: string;
  /** 0 = Sunday, 1 = Monday, ..., 6 = Saturday */
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;   /** "HH:mm" — e.g. "09:00" */
  endTime: string;     /** "HH:mm" — e.g. "12:00" */
}

/** A specific blocked period — overrides availability windows. Only visible to Dr. Jasmine. */
export interface BlockedSlot {
  id: string;
  startsAt: string;   /** ISO 8601 datetime */
  endsAt: string;     /** ISO 8601 datetime */
  /** Private label, only shown to Dr. Jasmine. */
  privateLabel: string;
  isAllDay: boolean;
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
  /** Dr. Jasmine's private clinical notes. Never shown to the patient. */
  privateNotes: string;
  /** The note Dr. Jasmine writes for the patient, sent via WhatsApp after the session. */
  patientNote: string;
  /** ISO 8601 datetime when the patient note was dispatched via WhatsApp. null = not sent. */
  patientNoteSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const MOCK_PATIENT: Patient = {
  id: "demo",
  ghlContactId: "ghl-demo",
  fullName: "Lily Tan",
  email: "lily@example.com",
  phone: "+60 12 345 6789",
  status: "active",
  createdAt: "2026-01-01T08:00:00Z",
  sessionsEntitled: 5,
  sessionsCompleted: 2
};

export const MOCK_ONBOARDING: OnboardingResponse = {
  icOrPassport: "880101-14-5678",
  gender: "female",
  contactNumber: "+60 12 345 6789",
  email: "lily@example.com",
  homeAddress: "123 Jalan Bukit Bintang, 55100 Kuala Lumpur",
  occupation: "retired",
  emergencyContact: "Ken Tan — +60 12 987 6543",
  referredBy: "Dr. Ahmad",
  payerFullName: "Lily Tan",
  agreedToTerms: true,
  agreedToTestimonial: true,
  chiefComplaint: "High blood sugar and weight gain",
  existingConditions: ["Type 2 Diabetes", "Hypertension"],
  currentMedications: ["Metformin 500mg twice daily", "Lisinopril 10mg once daily"],
  allergies: ["Penicillin"],
  familyHistory: "",
  smokingStatus: "never",
  alcoholUse: "occasional",
  activityLevel: "sedentary",
  dietaryNotes: "",
  additionalNotes: "",
  symptoms: ["Frequent urination at night", "Fatigue", "Numbness in feet"]
};

export const MOCK_READINGS: DailyReading[] = [
  { id: "r7", patientId: "demo", readingDate: "2026-03-25", fastingBloodSugar: 6.2, postDinnerBloodSugar: 7.8, bloodPressureSystolic: 128, bloodPressureDiastolic: 82, pulseRate: 74, weightKg: 68.5, waistlineCm: 90, entryMethod: "photo_extracted", submittedAt: "2026-03-25T08:30:00Z" },
  { id: "r6", patientId: "demo", readingDate: "2026-03-24", fastingBloodSugar: 6.4, postDinnerBloodSugar: 8.0, bloodPressureSystolic: 131, bloodPressureDiastolic: 84, pulseRate: 76, weightKg: 69.0, waistlineCm: 90.5, entryMethod: "manual", submittedAt: "2026-03-24T08:15:00Z" },
  { id: "r5", patientId: "demo", readingDate: "2026-03-23", fastingBloodSugar: 6.6, postDinnerBloodSugar: 8.2, bloodPressureSystolic: 133, bloodPressureDiastolic: 85, pulseRate: 77, weightKg: 69.2, waistlineCm: 91, entryMethod: "manual", submittedAt: "2026-03-23T09:00:00Z" },
  { id: "r4", patientId: "demo", readingDate: "2026-03-22", fastingBloodSugar: 6.8, postDinnerBloodSugar: 8.4, bloodPressureSystolic: 135, bloodPressureDiastolic: 86, pulseRate: 78, weightKg: 69.5, waistlineCm: 91.5, entryMethod: "photo_extracted", submittedAt: "2026-03-22T08:45:00Z" },
  { id: "r3", patientId: "demo", readingDate: "2026-03-21", fastingBloodSugar: 6.9, postDinnerBloodSugar: 8.6, bloodPressureSystolic: 136, bloodPressureDiastolic: 87, pulseRate: 79, weightKg: 70.0, waistlineCm: 92, entryMethod: "manual", submittedAt: "2026-03-21T08:20:00Z" },
  { id: "r2", patientId: "demo", readingDate: "2026-03-20", fastingBloodSugar: 7.1, postDinnerBloodSugar: 8.8, bloodPressureSystolic: 138, bloodPressureDiastolic: 88, pulseRate: 80, weightKg: 70.2, waistlineCm: 92.5, entryMethod: "manual", submittedAt: "2026-03-20T08:10:00Z" },
  { id: "r1", patientId: "demo", readingDate: "2026-03-19", fastingBloodSugar: 7.3, postDinnerBloodSugar: 9.1, bloodPressureSystolic: 140, bloodPressureDiastolic: 90, pulseRate: 82, weightKg: 70.5, waistlineCm: 93, entryMethod: "manual", submittedAt: "2026-03-19T08:50:00Z" }
];

export const MOCK_APPOINTMENT: Appointment = {
  id: "appt-1",
  patientId: "demo",
  calBookingUid: "demo-cal",
  startsAt: "2026-03-28T10:00:00Z",
  endsAt: "2026-03-28T10:30:00Z",
  zoomJoinUrl: "https://zoom.us/j/demo",
  isFirstConsultation: true,
  status: "scheduled",
  sessionNumber: 1,
  durationMinutes: 60,
  scheduledBy: "patient"
};

export const MOCK_GUIDE: PatientGuide = {
  id: "guide-1",
  patientId: "demo",
  title: "Personalised Diabetes Reversal Plan",
  dietType: "LCHF",
  noList: [
    "White Rice", "Brown Rice", "Basmati Rice", "Mee Hoon", "Kway Teow", 
    "Noodles", "Bread", "Biscuits", "Cakes", "Rolled Oats", "White Sugar", 
    "Brown Sugar", "Honey", "All fruits (except avocado, strawberries, blueberries)", 
    "Milk", "Fruit Juices", "Soft Drinks", "Beer"
  ],
  yesCategories: [
    { name: "Meat", items: ["Pork", "Beef", "Mutton", "Duck", "Chicken", "Fish", "Crab", "Prawns"], notes: ["Fatty meat preferred"] },
    { name: "Eggs", items: ["Chicken Eggs", "Duck Eggs"], notes: ["No limit per day, eat both white and yolk"] },
    { name: "Tofu/Tempe", items: ["Tofu", "Tempe"], notes: [] },
    { name: "Vegetables", items: ["Leafy greens", "Beans", "Mushrooms", "Carrot", "Radish", "Ginger", "Garlic", "Onion"], notes: ["All above-ground including leafy greens, beans, mushrooms except corn", "Underground: only carrot, radish, ginger, garlic, onion allowed"] }
  ],
  snacks: [
    "Avocados", "Strawberries", "Blueberries", "Cherries", "Star Fruits", 
    "Natural Greek Yogurt", "Nuts (except cashew, pistachios, chestnut)", 
    "Cheese (except sliced cheese)", "Chicken skin", "Fish skin", "Seaweed"
  ],
  replacements: [
    { original: "Rice", replacement: "Cauliflower rice or konjac rice" },
    { original: "Noodles", replacement: "Konjac noodles or zucchini noodles" },
    { original: "Flour", replacement: "Almond flour or coconut flour" },
    { original: "Milk", replacement: "Whipping cream or almond milk or coconut milk" }
  ],
  portions: [
    { label: "Meat", fraction: "1/3" },
    { label: "Eggs or Tofu", fraction: "1/3" },
    { label: "Vegetables", fraction: "1/3" }
  ],
  cookingMethods: [
    "Pan-fried", "Deep Fried", "Steamed", "BBQ", "Grilled", "Boiled", "Stewed", "Raw (e.g. Sashimi)"
  ],
  additionalSections: [
    { title: "Quantity", content: "Eat when you are hungry, stop when you are 100% full. Drink when you are thirsty." },
    { title: "Disclaimer", content: "Metanova Health Disclaimer: This plan is part of Dr. Jasmine's diabetes reversal programme and is personalised for you. It should not be construed as medical advice. Please consult your physician before making significant dietary changes." }
  ],
  updatedAt: "2026-03-25T10:00:00Z"
};

/**
 * Five consultation guides issued after each session with Dr. Jasmine.
 * Index 0 = earliest (Consultation 1), index 4 = latest (Consultation 5).
 * The last entry mirrors MOCK_GUIDE content with the most refined plan.
 */
export const MOCK_CONSULTATION_GUIDES: PatientGuide[] = [
  {
    id: "guide-c1",
    patientId: "demo",
    title: "Initial LCHF Introduction Plan",
    dietType: "LCHF",
    noList: [
      "White Rice", "Brown Rice", "Noodles", "Bread", "Biscuits", "Cakes",
      "White Sugar", "Brown Sugar", "Honey", "All fruits",
      "Milk", "Fruit Juices", "Soft Drinks"
    ],
    yesCategories: [
      { name: "Meat", items: ["Chicken", "Fish", "Pork", "Beef"], notes: ["Moderate portions to start"] },
      { name: "Eggs", items: ["Chicken Eggs"], notes: ["Up to 3 per day"] },
      { name: "Vegetables", items: ["Leafy greens", "Mushrooms", "Beans"], notes: ["Prioritise above-ground vegetables"] }
    ],
    snacks: ["Nuts (almonds, walnuts)", "Avocados", "Hard-boiled eggs"],
    replacements: [
      { original: "Rice", replacement: "Cauliflower rice" },
      { original: "Noodles", replacement: "Konjac noodles" }
    ],
    portions: [
      { label: "Meat", fraction: "1/2" },
      { label: "Vegetables", fraction: "1/2" }
    ],
    cookingMethods: ["Steamed", "Boiled", "Pan-fried", "Grilled"],
    additionalSections: [
      { title: "Week 1 Goal", content: "Focus on eliminating rice and sugary drinks first. Do not try to change everything at once." },
      { title: "Disclaimer", content: "Metanova Health Disclaimer: This plan is part of Dr. Jasmine's diabetes reversal programme and is personalised for you. It should not be construed as medical advice." }
    ],
    updatedAt: "2026-01-14T10:00:00Z"
  },
  {
    id: "guide-c2",
    patientId: "demo",
    title: "Phase 2 — Stricter Carb Removal",
    dietType: "LCHF",
    noList: [
      "White Rice", "Brown Rice", "Basmati Rice", "Mee Hoon", "Noodles",
      "Bread", "Biscuits", "Cakes", "White Sugar", "Brown Sugar", "Honey",
      "All fruits (except berries)", "Milk", "Fruit Juices", "Soft Drinks"
    ],
    yesCategories: [
      { name: "Meat", items: ["Pork", "Beef", "Chicken", "Fish", "Prawns"], notes: ["Fatty cuts are fine"] },
      { name: "Eggs", items: ["Chicken Eggs", "Duck Eggs"], notes: ["No limit per day"] },
      { name: "Tofu/Tempe", items: ["Tofu", "Tempe"], notes: [] },
      { name: "Vegetables", items: ["Leafy greens", "Beans", "Mushrooms", "Carrot", "Garlic", "Onion"], notes: ["Unlimited leafy greens"] }
    ],
    snacks: ["Avocados", "Strawberries", "Blueberries", "Almonds", "Walnuts", "Cheese"],
    replacements: [
      { original: "Rice", replacement: "Cauliflower rice or konjac rice" },
      { original: "Noodles", replacement: "Konjac noodles" },
      { original: "Milk", replacement: "Almond milk or coconut milk" }
    ],
    portions: [
      { label: "Meat", fraction: "1/2" },
      { label: "Eggs or Tofu", fraction: "1/4" },
      { label: "Vegetables", fraction: "1/4" }
    ],
    cookingMethods: ["Pan-fried", "Steamed", "Grilled", "Boiled", "Stewed"],
    additionalSections: [
      { title: "Progress Note", content: "Fasting sugar improved by 0.4 mmol/L since last visit. Continue reducing carbs and increase fat intake for satiety." },
      { title: "Disclaimer", content: "Metanova Health Disclaimer: This plan is part of Dr. Jasmine's diabetes reversal programme and is personalised for you. It should not be construed as medical advice." }
    ],
    updatedAt: "2026-02-04T10:00:00Z"
  },
  {
    id: "guide-c3",
    patientId: "demo",
    title: "Refinement — Adding Replacements",
    dietType: "LCHF",
    noList: [
      "White Rice", "Brown Rice", "Basmati Rice", "Mee Hoon", "Kway Teow",
      "Noodles", "Bread", "Biscuits", "Cakes", "Rolled Oats", "White Sugar",
      "Brown Sugar", "Honey", "All fruits (except avocado, berries)",
      "Milk", "Fruit Juices", "Soft Drinks", "Beer"
    ],
    yesCategories: [
      { name: "Meat", items: ["Pork", "Beef", "Mutton", "Duck", "Chicken", "Fish", "Prawns", "Crab"], notes: ["Fatty meat preferred"] },
      { name: "Eggs", items: ["Chicken Eggs", "Duck Eggs"], notes: ["No limit per day, eat both white and yolk"] },
      { name: "Tofu/Tempe", items: ["Tofu", "Tempe"], notes: [] },
      { name: "Vegetables", items: ["Leafy greens", "Beans", "Mushrooms", "Carrot", "Radish", "Garlic", "Onion"], notes: ["All above-ground vegetables; limited underground roots"] }
    ],
    snacks: ["Avocados", "Strawberries", "Blueberries", "Greek Yogurt", "Nuts", "Cheese", "Seaweed"],
    replacements: [
      { original: "Rice", replacement: "Cauliflower rice or konjac rice" },
      { original: "Noodles", replacement: "Konjac noodles or zucchini noodles" },
      { original: "Flour", replacement: "Almond flour" },
      { original: "Milk", replacement: "Whipping cream or almond milk" }
    ],
    portions: [
      { label: "Meat", fraction: "1/3" },
      { label: "Eggs or Tofu", fraction: "1/3" },
      { label: "Vegetables", fraction: "1/3" }
    ],
    cookingMethods: ["Pan-fried", "Deep Fried", "Steamed", "Grilled", "Boiled", "Stewed"],
    additionalSections: [
      { title: "Progress Note", content: "Weight down 1.5 kg. Waistline reduced by 2 cm. Patient is adapting well. Adding more replacement options this month." },
      { title: "Disclaimer", content: "Metanova Health Disclaimer: This plan is part of Dr. Jasmine's diabetes reversal programme and is personalised for you. It should not be construed as medical advice." }
    ],
    updatedAt: "2026-02-18T10:00:00Z"
  },
  {
    id: "guide-c4",
    patientId: "demo",
    title: "Sustained Progress — Fine-Tuning",
    dietType: "LCHF",
    noList: [
      "White Rice", "Brown Rice", "Basmati Rice", "Mee Hoon", "Kway Teow",
      "Noodles", "Bread", "Biscuits", "Cakes", "Rolled Oats", "White Sugar",
      "Brown Sugar", "Honey", "All fruits (except avocado, strawberries, blueberries)",
      "Milk", "Fruit Juices", "Soft Drinks", "Beer"
    ],
    yesCategories: [
      { name: "Meat", items: ["Pork", "Beef", "Mutton", "Duck", "Chicken", "Fish", "Crab", "Prawns"], notes: ["Fatty meat preferred for satiety"] },
      { name: "Eggs", items: ["Chicken Eggs", "Duck Eggs"], notes: ["No limit per day, eat both white and yolk"] },
      { name: "Tofu/Tempe", items: ["Tofu", "Tempe"], notes: [] },
      { name: "Vegetables", items: ["Leafy greens", "Beans", "Mushrooms", "Carrot", "Radish", "Ginger", "Garlic", "Onion"], notes: ["All above-ground including leafy greens and beans except corn", "Underground: only carrot, radish, ginger, garlic, onion"] }
    ],
    snacks: [
      "Avocados", "Strawberries", "Blueberries", "Cherries", "Star Fruits",
      "Natural Greek Yogurt", "Nuts (except cashew, pistachios)", "Cheese", "Chicken skin", "Seaweed"
    ],
    replacements: [
      { original: "Rice", replacement: "Cauliflower rice or konjac rice" },
      { original: "Noodles", replacement: "Konjac noodles or zucchini noodles" },
      { original: "Flour", replacement: "Almond flour or coconut flour" },
      { original: "Milk", replacement: "Whipping cream or almond milk or coconut milk" }
    ],
    portions: [
      { label: "Meat", fraction: "1/3" },
      { label: "Eggs or Tofu", fraction: "1/3" },
      { label: "Vegetables", fraction: "1/3" }
    ],
    cookingMethods: ["Pan-fried", "Deep Fried", "Steamed", "BBQ", "Grilled", "Boiled", "Stewed", "Raw (e.g. Sashimi)"],
    additionalSections: [
      { title: "Progress Note", content: "Fasting sugar now averaging 6.4 mmol/L, down from 7.8 at intake. Blood pressure stabilising. Continue current plan with no major changes." },
      { title: "Disclaimer", content: "Metanova Health Disclaimer: This plan is part of Dr. Jasmine's diabetes reversal programme and is personalised for you. It should not be construed as medical advice." }
    ],
    updatedAt: "2026-03-05T10:00:00Z"
  },
  {
    id: "guide-c5",
    patientId: "demo",
    title: "Personalised Diabetes Reversal Plan",
    dietType: "LCHF",
    noList: [
      "White Rice", "Brown Rice", "Basmati Rice", "Mee Hoon", "Kway Teow",
      "Noodles", "Bread", "Biscuits", "Cakes", "Rolled Oats", "White Sugar",
      "Brown Sugar", "Honey", "All fruits (except avocado, strawberries, blueberries)",
      "Milk", "Fruit Juices", "Soft Drinks", "Beer"
    ],
    yesCategories: [
      { name: "Meat", items: ["Pork", "Beef", "Mutton", "Duck", "Chicken", "Fish", "Crab", "Prawns"], notes: ["Fatty meat preferred"] },
      { name: "Eggs", items: ["Chicken Eggs", "Duck Eggs"], notes: ["No limit per day, eat both white and yolk"] },
      { name: "Tofu/Tempe", items: ["Tofu", "Tempe"], notes: [] },
      { name: "Vegetables", items: ["Leafy greens", "Beans", "Mushrooms", "Carrot", "Radish", "Ginger", "Garlic", "Onion"], notes: ["All above-ground including leafy greens, beans, mushrooms except corn", "Underground: only carrot, radish, ginger, garlic, onion allowed"] }
    ],
    snacks: [
      "Avocados", "Strawberries", "Blueberries", "Cherries", "Star Fruits",
      "Natural Greek Yogurt", "Nuts (except cashew, pistachios, chestnut)",
      "Cheese (except sliced cheese)", "Chicken skin", "Fish skin", "Seaweed"
    ],
    replacements: [
      { original: "Rice", replacement: "Cauliflower rice or konjac rice" },
      { original: "Noodles", replacement: "Konjac noodles or zucchini noodles" },
      { original: "Flour", replacement: "Almond flour or coconut flour" },
      { original: "Milk", replacement: "Whipping cream or almond milk or coconut milk" }
    ],
    portions: [
      { label: "Meat", fraction: "1/3" },
      { label: "Eggs or Tofu", fraction: "1/3" },
      { label: "Vegetables", fraction: "1/3" }
    ],
    cookingMethods: [
      "Pan-fried", "Deep Fried", "Steamed", "BBQ", "Grilled", "Boiled", "Stewed", "Raw (e.g. Sashimi)"
    ],
    additionalSections: [
      { title: "Quantity", content: "Eat when you are hungry, stop when you are 100% full. Drink when you are thirsty." },
      {
        title: "Intermittent Fasting Protocol",
        content:
          "Dr. Jasmine has asked you to follow this on top of your LCHF plan from now on. Eat all meals within an 8-hour window (for example 11:00 AM to 7:00 PM). Outside that window, drink water, plain tea, or black coffee only — no milk, juice, or snacks. If you feel unwell, dizzy, or very hungry, stop fasting and message the clinic. She will adjust this with you when you next speak.",
      },
      { title: "Disclaimer", content: "Metanova Health Disclaimer: This plan is part of Dr. Jasmine's diabetes reversal programme and is personalised for you. It should not be construed as medical advice. Please consult your physician before making significant dietary changes." }
    ],
    updatedAt: "2026-03-25T10:00:00Z"
  }
];

export const MOCK_TIMELINE_EVENTS: TimelineEvent[] = [
  { id: "evt-8", patientId: "demo", type: "reading_submitted", occurredAt: "2026-03-25T08:30:00Z", metadata: { date: "2026-03-25", fasting: 6.2, sysBP: 128, diaBP: 82, weight: 68.5 } },
  { id: "evt-7", patientId: "demo", type: "note_added", occurredAt: "2026-03-24T14:00:00Z", metadata: { preview: "Patient reports feeling less bloated..." } },
  { id: "evt-6", patientId: "demo", type: "reading_submitted", occurredAt: "2026-03-24T08:15:00Z", metadata: {} },
  { id: "evt-5", patientId: "demo", type: "reading_submitted", occurredAt: "2026-03-23T09:00:00Z", metadata: {} },
  { id: "evt-4", patientId: "demo", type: "patient_activated", occurredAt: "2026-03-20T10:00:00Z", metadata: {} },
  { id: "evt-3", patientId: "demo", type: "guide_created", occurredAt: "2026-03-19T11:00:00Z", metadata: {} },
  { id: "evt-2", patientId: "demo", type: "appointment_booked", occurredAt: "2026-03-18T09:00:00Z", metadata: {} },
  { id: "evt-1", patientId: "demo", type: "onboarding_completed", occurredAt: "2026-03-18T08:45:00Z", metadata: {} },
  { id: "evt-0", patientId: "demo", type: "patient_created", occurredAt: "2026-03-18T08:00:00Z", metadata: {} }
];

export const MOCK_CONSULTATION_NOTES: ConsultationNote[] = [
  {
    id: "note-2",
    patientId: "demo",
    appointmentId: null,
    privateNotes: "Patient reports feeling less bloated. Fasting readings improving. Updated guide with replacement options. Encouraged to log readings daily.",
    patientNote:
      "Hi Lily — great to see your readings trending down. Keep following your LCHF plan and logging daily. I have added a fasting window to your guide in the app; start gently this week and WhatsApp us if anything feels off. We will review how it feels at your next session.",
    patientNoteSentAt: "2026-03-24T14:05:00Z",
    createdAt: "2026-03-24T14:00:00Z",
    updatedAt: "2026-03-24T14:00:00Z"
  },
  {
    id: "note-1",
    patientId: "demo",
    appointmentId: "appt-0",
    privateNotes: "First consultation. Patient is motivated to start LCHF. Introduced the diet plan, explained the homework sheet. Advised to reduce portion sizes gradually. Follow up in 2 weeks.",
    patientNote:
      "Hi Lily — lovely to meet you today. Your personalised LCHF plan is now in your app under Guide. Focus this fortnight on cutting rice, noodles, and sweet drinks; use the replacements list when you cook. Log your readings every morning. Any questions, message us on WhatsApp.",
    patientNoteSentAt: "2026-03-14T10:45:00Z",
    createdAt: "2026-03-14T10:30:00Z",
    updatedAt: "2026-03-14T10:30:00Z"
  }
];

export const MOCK_GUIDE_VERSIONS: GuideVersion[] = MOCK_CONSULTATION_GUIDES.map((guide, idx) => {
  const versions = [
    { protocolName: "Initial LCHF Plan", clinicalRationale: "Patient ready to start eliminating carbs.", supersededAt: "2026-02-04T10:00:00Z" },
    { protocolName: "Stricter LCHF", clinicalRationale: "Fasting blood sugar improved, tightening carb limit.", supersededAt: "2026-02-18T10:00:00Z" },
    { protocolName: "LCHF + Replacements", clinicalRationale: "Weight down 1.5kg, adding safe replacements.", supersededAt: "2026-03-05T10:00:00Z" },
    { protocolName: "LCHF Sustained", clinicalRationale: "Great progress, sustaining current macros.", supersededAt: "2026-03-25T10:00:00Z" },
    { protocolName: "Full LCHF Plan", clinicalRationale: "Patient fully adapted, continuing long term.", supersededAt: null }
  ];
  return {
    id: guide.id,
    patientId: guide.patientId,
    versionNumber: idx + 1,
    protocolName: versions[idx].protocolName,
    clinicalRationale: versions[idx].clinicalRationale,
    introducedAtSession: idx + 1,
    activeFrom: guide.updatedAt,
    supersededAt: versions[idx].supersededAt,
    noList: guide.noList,
    yesCategories: guide.yesCategories,
    snacks: guide.snacks,
    replacements: guide.replacements,
    portions: guide.portions,
    cookingMethods: guide.cookingMethods,
    additionalSections: guide.additionalSections,
    createdAt: guide.updatedAt,
    updatedAt: guide.updatedAt
  };
});

export const MOCK_AVAILABILITY_WINDOWS: AvailabilityWindow[] = [
  { id: "win-1", dayOfWeek: 1, startTime: "09:00", endTime: "12:00" },
  { id: "win-2", dayOfWeek: 1, startTime: "14:00", endTime: "17:00" },
  { id: "win-3", dayOfWeek: 2, startTime: "09:00", endTime: "12:00" },
  { id: "win-4", dayOfWeek: 4, startTime: "10:00", endTime: "13:00" },
  { id: "win-5", dayOfWeek: 5, startTime: "09:00", endTime: "12:00" }
];

export const MOCK_BLOCKED_SLOTS: BlockedSlot[] = [
  { id: "blk-1", startsAt: "2026-04-02T14:00:00Z", endsAt: "2026-04-02T16:00:00Z", privateLabel: "Dental appointment", isAllDay: false },
  { id: "blk-2", startsAt: "2026-04-15T00:00:00Z", endsAt: "2026-04-15T23:59:59Z", privateLabel: "Conference", isAllDay: true }
];
