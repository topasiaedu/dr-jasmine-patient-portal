import type { GuideVersion } from "@/lib/mock-data";
import type { PatientGuideContent } from "@/lib/types/patient-guide";

/**
 * Maps the single persisted guide row to the richer `GuideVersion` shape the admin
 * builder UI was designed around (one active version; version history UI is display-only).
 */
export function patientContentToGuideVersion(content: PatientGuideContent): GuideVersion {
  return {
    id: content.id,
    patientId: content.patientId,
    versionNumber: 1,
    protocolName: content.title.length > 0 ? content.title : "Personalised plan",
    clinicalRationale: "",
    introducedAtSession: 1,
    activeFrom: content.updatedAt,
    supersededAt: null,
    noList: content.noList,
    yesCategories: content.yesCategories.map((c) => ({
      name: c.name,
      items: c.items,
      notes: c.notes,
    })),
    snacks: content.snacks,
    replacements: content.replacements,
    portions: content.portions,
    cookingMethods: content.cookingMethods,
    additionalSections: content.additionalSections,
    createdAt: content.updatedAt,
    updatedAt: content.updatedAt,
  };
}
