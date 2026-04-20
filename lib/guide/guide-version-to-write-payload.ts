import type { GuideVersion } from "@/lib/mock-data";
import type { GuideWritePayload } from "@/lib/guide/validate-payload";

/**
 * Persists the admin builder draft to the Phase 1 `patient_guides` columns.
 */
export function guideVersionToWritePayload(draft: GuideVersion): GuideWritePayload {
  return {
    title: draft.protocolName.trim().length > 0 ? draft.protocolName.trim() : "Personalised plan",
    noList: draft.noList,
    yesCategories: draft.yesCategories.map((c) => ({
      name: c.name,
      items: c.items,
      notes: c.notes ?? [],
    })),
    snacks: draft.snacks,
    replacements: draft.replacements,
    portions: draft.portions,
    cookingMethods: draft.cookingMethods,
    additionalSections: draft.additionalSections,
  };
}
