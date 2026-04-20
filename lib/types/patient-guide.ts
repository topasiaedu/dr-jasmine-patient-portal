/**
 * Patient guide shapes stored in `patient_guides` JSONB columns (see docs/04-data-models.md).
 */

export interface GuideFoodCategory {
  name: string;
  items: string[];
  notes: string[];
}

export interface GuideFoodReplacement {
  original: string;
  replacement: string;
}

export interface GuidePortion {
  label: string;
  fraction: string;
}

export interface GuideFreeTextSection {
  title: string;
  content: string;
}

export interface PatientGuideContent {
  id: string;
  patientId: string;
  title: string;
  noList: string[];
  yesCategories: GuideFoodCategory[];
  snacks: string[];
  replacements: GuideFoodReplacement[];
  portions: GuidePortion[];
  cookingMethods: string[];
  additionalSections: GuideFreeTextSection[];
  updatedAt: string;
}
