# 04 — Data Models

## Overview

All persistent data lives in **Supabase (Postgres)**. GoHighLevel (GHL) holds the
CRM/contact record and is the system of record for messaging history and workflow state.
The Supabase DB is the system of record for health data, guides, consultations, and
appointment metadata.

---

## TypeScript Types

These types are the canonical definition. Supabase table schemas must match these exactly.

```typescript
// ─────────────────────────────────────────────
// PATIENT
// ─────────────────────────────────────────────

/** The lifecycle state of a patient in the portal */
type PatientStatus = "onboarding" | "booked" | "active";

interface Patient {
  /** Supabase internal UUID — primary key */
  id: string;
  /** GoHighLevel contact ID — used as the URL path segment and cookie identifier */
  ghlContactId: string;
  /** Full name as provided during onboarding or entered by Dr. Jasmine */
  fullName: string;
  /** Email address — sourced from GHL contact record */
  email: string;
  /** Primary phone number — sourced from GHL contact record (E.164 format) */
  phone: string;
  /** Current lifecycle status */
  status: PatientStatus;
  /** ISO 8601 datetime when the patient record was created (link was generated) */
  createdAt: string;
  /** ISO 8601 datetime of the last update to any field on this record */
  updatedAt: string;
}

// ─────────────────────────────────────────────
// ONBOARDING FORM
// ─────────────────────────────────────────────

interface OnboardingResponse {
  id: string;
  patientId: string;
  /** Age in years */
  age: number;
  /** Biological sex */
  sex: "male" | "female" | "prefer_not_to_say";
  /** Race / ethnicity — free text to accommodate all nationalities */
  race: string;
  /** Occupation — free text */
  occupation: string;
  /** Primary health concerns or reason for consultation — free text */
  chiefComplaint: string;
  /** List of known diagnosed medical conditions */
  existingConditions: string[];
  /** List of current medications with dosages — free text per item */
  currentMedications: string[];
  /** List of known allergies */
  allergies: string[];
  /** Family history notes — free text */
  familyHistory: string;
  /** Smoking status */
  smokingStatus: "never" | "former" | "current";
  /** Alcohol consumption */
  alcoholUse: "none" | "occasional" | "moderate" | "frequent";
  /** Physical activity level */
  activityLevel: "sedentary" | "light" | "moderate" | "active";
  /** Dietary preferences or restrictions — free text */
  dietaryNotes: string;
  /** Any additional notes the patient wants Dr. Jasmine to know — free text */
  additionalNotes: string;
  /** Name of emergency contact */
  emergencyContactName: string;
  /** Phone number of emergency contact (E.164 format) */
  emergencyContactPhone: string;
  /** ISO 8601 datetime of submission */
  submittedAt: string;
}

// ─────────────────────────────────────────────
// DAILY READINGS
// ─────────────────────────────────────────────

/**
 * A single daily health reading submission.
 * All numeric fields use the units specified — no unit conversion is done server-side.
 * UI must display units clearly to prevent patient entry errors.
 */
interface DailyReading {
  id: string;
  patientId: string;
  /** Date the reading was taken — ISO 8601 date string (YYYY-MM-DD), not datetime */
  readingDate: string;
  /** Fasting blood sugar in mmol/L */
  fastingBloodSugar: number;
  /** 2-hour post-dinner blood sugar in mmol/L */
  postDinnerBloodSugar: number;
  /** Systolic blood pressure in mmHg */
  bloodPressureSystolic: number;
  /** Diastolic blood pressure in mmHg */
  bloodPressureDiastolic: number;
  /** Pulse rate in beats per minute */
  pulseRate: number;
  /** Weight in kilograms */
  weightKg: number;
  /** Waistline circumference measured at the umbilicus in centimetres */
  waistlineCm: number;
  /**
   * How the reading was entered.
   * "manual" = patient typed values.
   * "photo_extracted" = values extracted from photo via OpenAI, confirmed by patient.
   */
  entryMethod: "manual" | "photo_extracted";
  /** ISO 8601 datetime of submission */
  submittedAt: string;
}

// ─────────────────────────────────────────────
// APPOINTMENTS
// ─────────────────────────────────────────────

type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "rescheduled" | "no_show";

interface Appointment {
  id: string;
  patientId: string;
  /** Cal.com booking UID — used to reference the booking in Cal.com API */
  calBookingUid: string;
  /** ISO 8601 datetime of appointment start */
  startsAt: string;
  /** ISO 8601 datetime of appointment end */
  endsAt: string;
  /** Zoom meeting join URL for the patient */
  zoomJoinUrl: string;
  /** Zoom meeting host URL for Dr. Jasmine */
  zoomHostUrl: string;
  /** Whether this is the patient's first consultation */
  isFirstConsultation: boolean;
  status: AppointmentStatus;
  /** ISO 8601 datetime of record creation */
  createdAt: string;
  /** ISO 8601 datetime of last update */
  updatedAt: string;
}

// ─────────────────────────────────────────────
// CONSULTATION NOTES
// ─────────────────────────────────────────────

interface ConsultationNote {
  id: string;
  patientId: string;
  /** The appointment this note belongs to — nullable for notes added outside a booking */
  appointmentId: string | null;
  /** Full note content — written by Dr. Jasmine, free text, supports newlines */
  content: string;
  /** ISO 8601 datetime of note creation */
  createdAt: string;
  /** ISO 8601 datetime of last edit */
  updatedAt: string;
}

// ─────────────────────────────────────────────
// PATIENT GUIDE
// ─────────────────────────────────────────────

/**
 * A food replacement pair — "instead of X, eat Y"
 */
interface FoodReplacement {
  original: string;
  replacement: string;
}

/**
 * A category within the YES food list (e.g. "Meat", "Vegetables", "Drinks")
 */
interface FoodCategory {
  /** Display name for the category */
  name: string;
  /** List of specific allowed items within this category */
  items: string[];
  /** Optional sub-notes for this category (e.g. "Fatty meat preferred over lean meat") */
  notes: string[];
}

/**
 * Meal portion guidance
 */
interface PortionGuidance {
  /** Label for this portion (e.g. "Meat", "Eggs or Tofu", "Vegetables") */
  label: string;
  /** Fraction as a string for display (e.g. "1/3") */
  fraction: string;
}

/** A free-text section with a title and body content */
interface FreeTextSection {
  title: string;
  content: string;
}

/**
 * The full personalised guide for a patient.
 * All fields are optional — Dr. Jasmine can populate as many or as few sections as needed.
 * The guide is stored as structured data and rendered in-app; PDF export is generated
 * from this structure at request time.
 */
interface PatientGuide {
  id: string;
  patientId: string;
  /** Diet protocol name or label (e.g. "Low Carb High Fat Diet") — shown as the guide title */
  title: string;
  /** Items the patient must NOT eat */
  noList: string[];
  /** Allowed food categories with items */
  yesCategories: FoodCategory[];
  /** Allowed snack items (flat list, not categorised) */
  snacks: string[];
  /** Food replacement pairs */
  replacements: FoodReplacement[];
  /** Meal portioning guidance */
  portions: PortionGuidance[];
  /** Cooking methods — flat list of allowed methods */
  cookingMethods: string[];
  /** Additional free-text sections (e.g. "Quantity", "Taste of Food", "Disclaimer") */
  additionalSections: FreeTextSection[];
  /** ISO 8601 datetime of guide creation */
  createdAt: string;
  /** ISO 8601 datetime of last update */
  updatedAt: string;
}

// ─────────────────────────────────────────────
// TIMELINE EVENTS
// ─────────────────────────────────────────────

type TimelineEventType =
  | "patient_created"
  | "onboarding_completed"
  | "appointment_booked"
  | "appointment_cancelled"
  | "appointment_rescheduled"
  | "appointment_completed"
  | "patient_activated"
  | "reading_submitted"
  | "guide_created"
  | "guide_updated"
  | "note_added";

/**
 * A single event in the patient's journey timeline.
 * Timeline events are append-only — never updated or deleted.
 * metadata is event-type-specific structured data for rendering the event card.
 */
interface TimelineEvent {
  id: string;
  patientId: string;
  type: TimelineEventType;
  /**
   * Flexible metadata object. Shape depends on event type.
   * Examples:
   *   appointment_booked: { appointmentId: string; startsAt: string; zoomJoinUrl: string }
   *   reading_submitted:  { readingId: string; fastingBloodSugar: number; weightKg: number }
   *   note_added:         { noteId: string; preview: string }
   *   guide_updated:      { guideId: string; changedFields: string[] }
   */
  metadata: Record<string, string | number | boolean | string[]>;
  /** ISO 8601 datetime the event occurred */
  occurredAt: string;
}
```

---

## Supabase Table Definitions (SQL)

```sql
-- Enable UUID generation
create extension if not exists "pgcrypto";

-- PATIENTS
create table patients (
  id                uuid primary key default gen_random_uuid(),
  ghl_contact_id    text not null unique,
  full_name         text not null,
  email             text not null,
  phone             text not null,
  status            text not null default 'onboarding'
                    check (status in ('onboarding', 'booked', 'active')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ONBOARDING RESPONSES
create table onboarding_responses (
  id                      uuid primary key default gen_random_uuid(),
  patient_id              uuid not null references patients(id) on delete cascade,
  age                     integer not null check (age > 0 and age < 130),
  sex                     text not null check (sex in ('male', 'female', 'prefer_not_to_say')),
  race                    text not null,
  occupation              text not null default '',
  chief_complaint         text not null,
  existing_conditions     text[] not null default '{}',
  current_medications     text[] not null default '{}',
  allergies               text[] not null default '{}',
  family_history          text not null default '',
  smoking_status          text not null check (smoking_status in ('never', 'former', 'current')),
  alcohol_use             text not null check (alcohol_use in ('none', 'occasional', 'moderate', 'frequent')),
  activity_level          text not null check (activity_level in ('sedentary', 'light', 'moderate', 'active')),
  dietary_notes           text not null default '',
  additional_notes        text not null default '',
  emergency_contact_name  text not null,
  emergency_contact_phone text not null,
  submitted_at            timestamptz not null default now()
);

-- DAILY READINGS
create table daily_readings (
  id                        uuid primary key default gen_random_uuid(),
  patient_id                uuid not null references patients(id) on delete cascade,
  reading_date              date not null,
  fasting_blood_sugar       numeric(5,2) not null,
  post_dinner_blood_sugar   numeric(5,2) not null,
  blood_pressure_systolic   integer not null,
  blood_pressure_diastolic  integer not null,
  pulse_rate                integer not null,
  weight_kg                 numeric(5,2) not null,
  waistline_cm              numeric(5,1) not null,
  entry_method              text not null default 'manual'
                            check (entry_method in ('manual', 'photo_extracted')),
  submitted_at              timestamptz not null default now(),
  -- One reading per patient per day
  unique (patient_id, reading_date)
);

-- APPOINTMENTS
create table appointments (
  id                    uuid primary key default gen_random_uuid(),
  patient_id            uuid not null references patients(id) on delete cascade,
  cal_booking_uid       text not null unique,
  starts_at             timestamptz not null,
  ends_at               timestamptz not null,
  zoom_join_url         text not null,
  zoom_host_url         text not null,
  is_first_consultation boolean not null default false,
  status                text not null default 'scheduled'
                        check (status in ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- CONSULTATION NOTES
create table consultation_notes (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid not null references patients(id) on delete cascade,
  appointment_id  uuid references appointments(id) on delete set null,
  content         text not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- PATIENT GUIDES
create table patient_guides (
  id                  uuid primary key default gen_random_uuid(),
  patient_id          uuid not null unique references patients(id) on delete cascade,
  title               text not null default '',
  no_list             text[] not null default '{}',
  yes_categories      jsonb not null default '[]',
  snacks              text[] not null default '{}',
  replacements        jsonb not null default '[]',
  portions            jsonb not null default '[]',
  cooking_methods     text[] not null default '{}',
  additional_sections jsonb not null default '[]',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- TIMELINE EVENTS
create table timeline_events (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references patients(id) on delete cascade,
  type        text not null,
  metadata    jsonb not null default '{}',
  occurred_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
create index on patients (ghl_contact_id);
create index on daily_readings (patient_id, reading_date desc);
create index on appointments (patient_id, starts_at desc);
create index on consultation_notes (patient_id, created_at desc);
create index on timeline_events (patient_id, occurred_at desc);

-- ─────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger patients_updated_at before update on patients
  for each row execute procedure set_updated_at();

create trigger appointments_updated_at before update on appointments
  for each row execute procedure set_updated_at();

create trigger consultation_notes_updated_at before update on consultation_notes
  for each row execute procedure set_updated_at();

create trigger patient_guides_updated_at before update on patient_guides
  for each row execute procedure set_updated_at();

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
-- RLS is enabled on all tables.
-- The patient-facing API routes use the service role key and enforce
-- patient isolation in application code (not via RLS policies), since
-- patients authenticate via cookie rather than Supabase Auth.
-- The admin panel also uses the service role key.
-- Direct client-side Supabase access is not used in this application.
alter table patients             enable row level security;
alter table onboarding_responses enable row level security;
alter table daily_readings       enable row level security;
alter table appointments         enable row level security;
alter table consultation_notes   enable row level security;
alter table patient_guides       enable row level security;
alter table timeline_events      enable row level security;
```

---

## Data Ownership Summary

| Data | System of Record | Notes |
|---|---|---|
| Patient contact info (name, email, phone) | GHL | Synced to Supabase on patient creation |
| Patient status | Supabase | GHL contact tags can mirror this but Supabase is authoritative |
| Onboarding form answers | Supabase | Key fields also pushed to GHL contact custom fields |
| Daily readings | Supabase | Not synced to GHL |
| Appointments | Supabase | Cal.com is the booking source; Supabase stores the metadata |
| Consultation notes | Supabase | Never synced to GHL |
| Patient guides | Supabase | Never synced to GHL |
| Messaging / reminder history | GHL | Not stored in Supabase |
| Workflow enrollment state | GHL | Not stored in Supabase |
