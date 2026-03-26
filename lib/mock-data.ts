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

export const MOCK_PATIENT: Patient = {
  id: "demo",
  ghlContactId: "ghl-demo",
  fullName: "Lily Tan",
  email: "lily@example.com",
  phone: "+60 12 345 6789",
  status: "active",
  createdAt: "2026-01-01T08:00:00Z"
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
  additionalNotes: ""
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
  status: "scheduled"
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
    content: "Patient reports feeling less bloated. Fasting readings improving. Updated guide with replacement options. Encouraged to log readings daily.",
    createdAt: "2026-03-24T14:00:00Z",
    updatedAt: "2026-03-24T14:00:00Z"
  },
  {
    id: "note-1",
    patientId: "demo",
    appointmentId: "appt-0",
    content: "First consultation. Patient is motivated to start LCHF. Introduced the diet plan, explained the homework sheet. Advised to reduce portion sizes gradually. Follow up in 2 weeks.",
    createdAt: "2026-03-14T10:30:00Z",
    updatedAt: "2026-03-14T10:30:00Z"
  }
];
