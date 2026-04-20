-- Phase 1 schema per docs/04-data-models.md (RLS on; app uses service role from Route Handlers)

create extension if not exists "pgcrypto";

create table patients (
  id                    uuid primary key default gen_random_uuid(),
  ghl_contact_id        text not null unique,
  full_name             text not null,
  email                 text not null,
  phone                 text not null,
  reading_cadence_note  text,
  status                text not null default 'active'
                        check (status in ('onboarding', 'booked', 'active')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table onboarding_responses (
  id                      uuid primary key default gen_random_uuid(),
  patient_id              uuid not null references patients(id) on delete cascade,
  ic_or_passport          text not null,
  gender                  text not null check (gender in ('male', 'female')),
  contact_number          text not null,
  email                   text not null,
  home_address            text not null,
  occupation              text not null check (occupation in (
                            'business_owner', 'leader', 'freelancer',
                            'employee', 'retired', 'unemployed'
                          )),
  emergency_contact       text not null,
  referred_by             text not null default '',
  payer_full_name         text not null,
  agreed_to_terms         boolean not null default false,
  agreed_to_testimonial   boolean not null default false,
  chief_complaint         text not null default '',
  existing_conditions     text[] not null default '{}',
  current_medications     text[] not null default '{}',
  allergies               text[] not null default '{}',
  family_history          text not null default '',
  smoking_status          text not null default 'never'
                          check (smoking_status in ('never', 'former', 'current')),
  alcohol_use             text not null default 'none'
                          check (alcohol_use in ('none', 'occasional', 'moderate', 'frequent')),
  activity_level          text not null default 'sedentary'
                          check (activity_level in ('sedentary', 'light', 'moderate', 'active')),
  dietary_notes           text not null default '',
  additional_notes        text not null default '',
  submitted_at            timestamptz not null default now()
);

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
  unique (patient_id, reading_date)
);

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

create table consultation_notes (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid not null references patients(id) on delete cascade,
  appointment_id  uuid references appointments(id) on delete set null,
  content         text not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table patient_guides (
  id                  uuid primary key default gen_random_uuid(),
  patient_id          uuid not null unique references patients(id) on delete cascade,
  title               text not null default '',
  no_list             text[] not null default '{}',
  yes_categories      jsonb not null default '[]'::jsonb,
  snacks              text[] not null default '{}',
  replacements        jsonb not null default '[]'::jsonb,
  portions            jsonb not null default '[]'::jsonb,
  cooking_methods     text[] not null default '{}',
  additional_sections jsonb not null default '[]'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table timeline_events (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references patients(id) on delete cascade,
  type        text not null,
  metadata    jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index patients_ghl_contact_id_idx on patients (ghl_contact_id);
create index daily_readings_patient_date_idx on daily_readings (patient_id, reading_date desc);
create index appointments_patient_starts_idx on appointments (patient_id, starts_at desc);
create index consultation_notes_patient_created_idx on consultation_notes (patient_id, created_at desc);
create index timeline_events_patient_occurred_idx on timeline_events (patient_id, occurred_at desc);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger patients_updated_at
  before update on patients
  for each row execute function set_updated_at();

create trigger appointments_updated_at
  before update on appointments
  for each row execute function set_updated_at();

create trigger consultation_notes_updated_at
  before update on consultation_notes
  for each row execute function set_updated_at();

create trigger patient_guides_updated_at
  before update on patient_guides
  for each row execute function set_updated_at();

alter table patients             enable row level security;
alter table onboarding_responses enable row level security;
alter table daily_readings       enable row level security;
alter table appointments         enable row level security;
alter table consultation_notes   enable row level security;
alter table patient_guides       enable row level security;
alter table timeline_events      enable row level security;

-- Optional local / preview seed (matches redirected /p/ghl-demo/* from legacy /p/demo/*)
insert into patients (id, ghl_contact_id, full_name, email, phone, status)
values (
  '00000000-0000-4000-8000-000000000001',
  'ghl-demo',
  'Lily Tan (demo)',
  'lily@example.com',
  '+60123456789',
  'active'
) on conflict (ghl_contact_id) do nothing;

insert into patient_guides (
  patient_id,
  title,
  no_list,
  yes_categories,
  snacks,
  replacements,
  portions,
  cooking_methods,
  additional_sections
)
values (
  '00000000-0000-4000-8000-000000000001',
  'Personalised Diabetes Reversal Plan',
  array['White rice', 'Noodles'],
  '[]'::jsonb,
  array['Apples'],
  '[]'::jsonb,
  '[]'::jsonb,
  array['Steam', 'Grill'],
  '[]'::jsonb
) on conflict (patient_id) do nothing;
