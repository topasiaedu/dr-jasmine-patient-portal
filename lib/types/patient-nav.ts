import type { LucideIcon } from "lucide-react";

/** One tab in the patient portal chrome (bottom + top nav). */
export interface PatientNavTab {
  label: string;
  href: string;
  icon: LucideIcon;
}
