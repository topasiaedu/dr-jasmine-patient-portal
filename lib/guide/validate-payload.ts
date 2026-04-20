import type {
  GuideFoodCategory,
  GuideFoodReplacement,
  GuideFreeTextSection,
  GuidePortion,
} from "@/lib/types/patient-guide";

export interface GuideWritePayload {
  title: string;
  noList: string[];
  yesCategories: GuideFoodCategory[];
  snacks: string[];
  replacements: GuideFoodReplacement[];
  portions: GuidePortion[];
  cookingMethods: string[];
  additionalSections: GuideFreeTextSection[];
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function isCategory(value: unknown): value is GuideFoodCategory {
  if (!value || typeof value !== "object") {
    return false;
  }
  const o = value as Record<string, unknown>;
  return (
    typeof o.name === "string" &&
    isStringArray(o.items) &&
    isStringArray(o.notes)
  );
}

function isReplacement(value: unknown): value is GuideFoodReplacement {
  if (!value || typeof value !== "object") {
    return false;
  }
  const o = value as Record<string, unknown>;
  return typeof o.original === "string" && typeof o.replacement === "string";
}

function isPortion(value: unknown): value is GuidePortion {
  if (!value || typeof value !== "object") {
    return false;
  }
  const o = value as Record<string, unknown>;
  return typeof o.label === "string" && typeof o.fraction === "string";
}

function isSection(value: unknown): value is GuideFreeTextSection {
  if (!value || typeof value !== "object") {
    return false;
  }
  const o = value as Record<string, unknown>;
  return typeof o.title === "string" && typeof o.content === "string";
}

export function parseGuideWritePayload(body: unknown): GuideWritePayload | null {
  if (!body || typeof body !== "object") {
    return null;
  }
  const o = body as Record<string, unknown>;
  if (typeof o.title !== "string") {
    return null;
  }
  if (!isStringArray(o.noList)) {
    return null;
  }
  if (!Array.isArray(o.yesCategories) || !o.yesCategories.every(isCategory)) {
    return null;
  }
  if (!isStringArray(o.snacks)) {
    return null;
  }
  if (!Array.isArray(o.replacements) || !o.replacements.every(isReplacement)) {
    return null;
  }
  if (!Array.isArray(o.portions) || !o.portions.every(isPortion)) {
    return null;
  }
  if (!isStringArray(o.cookingMethods)) {
    return null;
  }
  if (!Array.isArray(o.additionalSections) || !o.additionalSections.every(isSection)) {
    return null;
  }
  return {
    title: o.title,
    noList: o.noList,
    yesCategories: o.yesCategories,
    snacks: o.snacks,
    replacements: o.replacements,
    portions: o.portions,
    cookingMethods: o.cookingMethods,
    additionalSections: o.additionalSections,
  };
}
