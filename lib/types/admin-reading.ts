/**
 * Daily reading row returned by admin list API (camelCase for UI).
 */
export interface AdminReadingJson {
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
