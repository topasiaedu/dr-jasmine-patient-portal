import type { PatientGuideContent } from "@/lib/types/patient-guide";

interface PatientGuideRow {
  id: string;
  patient_id: string;
  title: string;
  no_list: string[];
  yes_categories: unknown;
  snacks: string[];
  replacements: unknown;
  portions: unknown;
  cooking_methods: string[];
  additional_sections: unknown;
  updated_at: string;
}

function parseJsonArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value;
}

/**
 * Maps a Supabase `patient_guides` row into the patient-facing guide content shape.
 */
export function mapPatientGuideRow(row: PatientGuideRow): PatientGuideContent {
  return {
    id: row.id,
    patientId: row.patient_id,
    title: row.title,
    noList: Array.isArray(row.no_list) ? row.no_list : [],
    yesCategories: parseJsonArray(row.yes_categories) as PatientGuideContent["yesCategories"],
    snacks: Array.isArray(row.snacks) ? row.snacks : [],
    replacements: parseJsonArray(row.replacements) as PatientGuideContent["replacements"],
    portions: parseJsonArray(row.portions) as PatientGuideContent["portions"],
    cookingMethods: Array.isArray(row.cooking_methods) ? row.cooking_methods : [],
    additionalSections: parseJsonArray(
      row.additional_sections
    ) as PatientGuideContent["additionalSections"],
    updatedAt: row.updated_at,
  };
}

export type { PatientGuideRow };
