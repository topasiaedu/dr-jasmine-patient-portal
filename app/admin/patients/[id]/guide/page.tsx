"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";
import type { GuideVersion } from "@/lib/mock-data";
import type { PatientGuideContent } from "@/lib/types/patient-guide";
import { patientContentToGuideVersion } from "@/lib/guide/patient-content-to-guide-version";
import { guideVersionToWritePayload } from "@/lib/guide/guide-version-to-write-payload";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, X, Save, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/** Standard LCHF base loaded for patients who have no guide yet. Dr. Jasmine adjusts per patient. */
function lchfTemplateGuideVersion(patientId: string): GuideVersion {
  const now = new Date().toISOString();
  return {
    id: "local-draft",
    patientId,
    versionNumber: 1,
    protocolName: "Personalised Diabetes Reversal Plan",
    clinicalRationale: "Low Carb High Fat (LCHF) protocol targeting blood sugar stabilisation and metabolic improvement.",
    introducedAtSession: 1,
    activeFrom: now,
    supersededAt: null,
    noList: [
      "White rice",
      "White bread / roti canai / naan / chapati",
      "Noodles (mee, bihun, koay teow)",
      "Sugar, honey, syrups",
      "Sweetened drinks (teh tarik, Milo, fruit juice, sodas)",
      "Potatoes, sweet potatoes, tapioca",
      "High-sugar fruits (mango, durian, banana, grapes, longan, lychee)",
      "Pastries, cakes, biscuits, kuih",
      "Processed / fast food",
    ],
    yesCategories: [
      {
        name: "Proteins",
        items: [
          "Eggs",
          "Chicken (skin on OK)",
          "Beef / lamb",
          "Fish (any type)",
          "Prawns / seafood",
          "Tofu / tempeh",
        ],
        notes: ["Prepare without breading or sugary sauces."],
      },
      {
        name: "Low-starch vegetables",
        items: [
          "Leafy greens (bayam, kangkung, pak choy)",
          "Cabbage",
          "Broccoli & cauliflower",
          "Cucumber & celery",
          "Bitter gourd",
          "Lady's finger (okra)",
          "Long beans",
          "Bean sprouts",
          "Mushrooms",
        ],
        notes: [],
      },
      {
        name: "Healthy fats",
        items: [
          "Avocado",
          "Full-fat cheese",
          "Butter",
          "Coconut oil",
          "Olive oil",
        ],
        notes: [],
      },
      {
        name: "Low-sugar fruits (small portions only)",
        items: [
          "Berries (strawberry, blueberry)",
          "Watermelon (½ cup max)",
          "Papaya (small slice)",
        ],
        notes: ["Eat fruit after a meal, not alone, to reduce blood-sugar spike."],
      },
    ],
    snacks: [
      "Boiled eggs",
      "A small handful of almonds or walnuts",
      "Cheese cubes",
      "Cucumber slices",
      "Full-fat plain yogurt (no sugar, small bowl)",
    ],
    replacements: [
      { original: "White rice", replacement: "Cauliflower rice" },
      { original: "White bread", replacement: "Lettuce wrap" },
      { original: "Mee / bihun", replacement: "Zucchini noodles or shirataki" },
      { original: "Sugar / condensed milk", replacement: "Stevia or erythritol" },
      { original: "Sweetened teh tarik", replacement: "Teh-o kosong or black coffee" },
      { original: "Potato chips", replacement: "Nuts or cheese cubes" },
    ],
    portions: [
      { label: "Non-starchy vegetables", fraction: "½ plate" },
      { label: "Protein", fraction: "¼ plate" },
      { label: "Healthy fats", fraction: "¼ plate" },
    ],
    cookingMethods: [
      "Grill or bake",
      "Steam",
      "Stir-fry in butter, coconut oil, or olive oil",
      "Air-fry",
      "Poach or boil",
    ],
    additionalSections: [],
    createdAt: now,
    updatedAt: now,
  };
}

export default function AdminGuideBuilder() {
  const params = useParams();
  const patientId = typeof params?.id === "string" ? params.id : "";
  const [mounted, setMounted] = useState(false);
  const [patientFullName, setPatientFullName] = useState("Patient");

  const [draft, setDraft] = useState<GuideVersion | null>(null);
  /** True when the guide was auto-loaded from the LCHF template (no saved guide exists yet). */
  const [isFromTemplate, setIsFromTemplate] = useState(false);

  const [newNoItem, setNewNoItem] = useState("");
  const [newSnack, setNewSnack] = useState("");
  const [newSwapOriginal, setNewSwapOriginal] = useState("");
  const [newSwapReplacement, setNewSwapReplacement] = useState("");
  const [newPortionLabel, setNewPortionLabel] = useState("");
  const [newPortionFraction, setNewPortionFraction] = useState("");
  const [newCookingMethod, setNewCookingMethod] = useState("");
  const [newYesItemInputs, setNewYesItemInputs] = useState<Record<string, string>>({});

  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (patientId.length === 0) {
      return;
    }
    let cancelled = false;
    const load = async (): Promise<void> => {
      const [patientRes, guideRes] = await Promise.all([
        fetch(`/api/admin/patients/${patientId}`, { credentials: "include" }),
        fetch(`/api/admin/guides/${patientId}`, { credentials: "include" }),
      ]);
      if (cancelled) {
        return;
      }
      if (patientRes.ok) {
        const pBody: unknown = await patientRes.json();
        const name =
          typeof pBody === "object" &&
          pBody !== null &&
          "patient" in pBody &&
          typeof (pBody as { patient: { full_name?: string } }).patient?.full_name === "string"
            ? (pBody as { patient: { full_name: string } }).patient.full_name
            : "Patient";
        setPatientFullName(name);
      }
      let nextDraft: GuideVersion;
      if (guideRes.ok) {
        const gBody: unknown = await guideRes.json();
        const content =
          typeof gBody === "object" &&
          gBody !== null &&
          "guide" in gBody &&
          (gBody as { guide: PatientGuideContent | null }).guide !== null
            ? (gBody as { guide: PatientGuideContent }).guide
            : null;
        nextDraft = content ? patientContentToGuideVersion(content) : lchfTemplateGuideVersion(patientId);
        if (!content) {
          setIsFromTemplate(true);
        }
      } else {
        nextDraft = lchfTemplateGuideVersion(patientId);
        setIsFromTemplate(true);
      }
      setDraft(nextDraft);
      setMounted(true);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const handleSaveChanges = async (): Promise<void> => {
    if (!draft) {
      return;
    }
    const payload = guideVersionToWritePayload(draft);
    const res = await fetch(`/api/admin/guides/${patientId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      toast.error("Could not save guide.");
      return;
    }
    const bodyUnknown: unknown = await res.json();
    const saved =
      typeof bodyUnknown === "object" &&
      bodyUnknown !== null &&
      "guide" in bodyUnknown &&
      (bodyUnknown as { guide: PatientGuideContent | null }).guide !== null
        ? (bodyUnknown as { guide: PatientGuideContent }).guide
        : null;
    if (saved) {
      const mapped = patientContentToGuideVersion(saved);
      setDraft(mapped);
      setIsFromTemplate(false);
    }
    toast.success("Changes saved successfully.");
  };

  const addNoItem = () => {
    if (newNoItem.trim()) {
      setDraft(g => g ? { ...g, noList: [...g.noList, newNoItem.trim()] } : g);
      setNewNoItem("");
    }
  };

  const removeNoItem = (idx: number) => {
    setDraft(g => g ? { ...g, noList: g.noList.filter((_, i) => i !== idx) } : g);
  };

  const addSnack = () => {
    if (newSnack.trim()) {
      setDraft(g => g ? { ...g, snacks: [...g.snacks, newSnack.trim()] } : g);
      setNewSnack("");
    }
  };

  const removeSnack = (idx: number) => {
    setDraft(g => g ? { ...g, snacks: g.snacks.filter((_, i) => i !== idx) } : g);
  };

  const addReplacement = (): void => {
    if (newSwapOriginal.trim() && newSwapReplacement.trim()) {
      setDraft((g) =>
        g
          ? {
              ...g,
              replacements: [
                ...g.replacements,
                { original: newSwapOriginal.trim(), replacement: newSwapReplacement.trim() },
              ],
            }
          : g
      );
      setNewSwapOriginal("");
      setNewSwapReplacement("");
    }
  };

  const removeReplacement = (idx: number) => {
    setDraft((g) => (g ? { ...g, replacements: g.replacements.filter((_, i) => i !== idx) } : g));
  };

  const addPortion = (): void => {
    if (newPortionLabel.trim() && newPortionFraction.trim()) {
      setDraft((g) =>
        g
          ? {
              ...g,
              portions: [...g.portions, { label: newPortionLabel.trim(), fraction: newPortionFraction.trim() }],
            }
          : g
      );
      setNewPortionLabel("");
      setNewPortionFraction("");
    }
  };

  const removePortion = (idx: number) => {
    setDraft((g) => (g ? { ...g, portions: g.portions.filter((_, i) => i !== idx) } : g));
  };

  const addCookingMethod = (): void => {
    if (newCookingMethod.trim()) {
      setDraft((g) => (g ? { ...g, cookingMethods: [...g.cookingMethods, newCookingMethod.trim()] } : g));
      setNewCookingMethod("");
    }
  };

  const removeCookingMethod = (idx: number) => {
    setDraft((g) => (g ? { ...g, cookingMethods: g.cookingMethods.filter((_, i) => i !== idx) } : g));
  };

  // Section 2: Yes Categories
  const addYesCategory = () => {
    const newCat = { name: "New Category", items: [], notes: [] };
    setDraft(g => g ? { ...g, yesCategories: [...(g.yesCategories||[]), newCat] } : g);
  };
  const updateYesCategory = (
    idx: number,
    field: "name" | "notes",
    val: string | string[]
  ) => {
    if (!draft) return;
    const newCats = [...(draft.yesCategories || [])];
    if (field === "notes") {
      newCats[idx] = {
        ...newCats[idx],
        notes: Array.isArray(val) ? val : val.split("\n"),
      };
    } else {
      newCats[idx] = { ...newCats[idx], name: typeof val === "string" ? val : val.join(" ") };
    }
    setDraft(g => g ? { ...g, yesCategories: newCats } : g);
  };
  const removeYesCategory = (idx: number) => {
    setDraft(g => g ? { ...g, yesCategories: (g.yesCategories||[]).filter((_, i) => i !== idx) } : g);
  };
  const addYesItem = (idx: number) => {
    if (!draft) return;
    const item = newYesItemInputs[idx];
    if (item?.trim()) {
      const newCats = [...(draft.yesCategories||[])];
      newCats[idx] = { ...newCats[idx], items: [...newCats[idx].items, item.trim()] };
      setDraft(g => g ? { ...g, yesCategories: newCats } : g);
      setNewYesItemInputs(prev => ({ ...prev, [idx]: "" }));
    }
  };
  const removeYesItem = (catIdx: number, itemIdx: number) => {
    if (!draft) return;
    const newCats = [...(draft.yesCategories||[])];
    newCats[catIdx].items = newCats[catIdx].items.filter((_, i) => i !== itemIdx);
    setDraft(g => g ? { ...g, yesCategories: newCats } : g);
  };

  return (
    <AdminLayout>
      {(!mounted || !draft) ? (
        <AdminPageSkeleton />
      ) : (
      <div className="max-w-4xl mx-auto space-y-6 pb-20">

        {/* Template banner — only shown before the first save */}
        {isFromTemplate && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
            <p className="text-amber-900 font-medium">
              <span className="font-bold">LCHF template loaded</span> — this patient has no guide yet. Customise below, then save.
            </p>
            <button
              type="button"
              onClick={() => {
                setDraft(lchfTemplateGuideVersion(patientId));
                toast.success("Reset to LCHF template.");
              }}
              className="shrink-0 text-xs font-semibold text-amber-700 border border-amber-300 rounded-lg px-3 py-1.5 hover:bg-amber-100 transition-colors"
            >
              Reset to template
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/admin/patients/${patientId}`} className="p-2 border border-border bg-white rounded-xl hover:bg-gray-50 text-main transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-main">Guide Builder — {patientFullName}</h1>
            </div>
          </div>
          <div className="flex gap-3">
            {!isFromTemplate && (
              <button
                type="button"
                onClick={() => {
                  setDraft(lchfTemplateGuideVersion(patientId));
                  setIsFromTemplate(true);
                  toast("Reset to LCHF template. Click Save to persist.", { icon: "↺" });
                }}
                className="h-11 px-4 text-sm font-semibold text-secondary border border-border bg-white rounded-xl hover:bg-gray-50 transition-colors"
              >
                Reset to LCHF
              </button>
            )}
            <Button
              type="button"
              onClick={() => void handleSaveChanges()}
              className="h-11 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold px-6 shadow-sm"
            >
              <Save size={16} className="mr-2" /> Save Changes
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8 space-y-8">

          {/* Hint — only while template is loaded */}
          {isFromTemplate && (
            <p className="text-sm text-text-secondary bg-[#F7F5F2] rounded-xl px-4 py-3">
              <span className="font-semibold text-main">Tip:</span> The LCHF base is pre-filled. Click the <span className="font-semibold">✕</span> on any item to remove it, or type in the field to add something specific for this patient. Hit <span className="font-semibold">Save</span> when done.
            </p>
          )}

          {/* FOODS TO AVOID */}
          <div>
            <div className="flex items-center gap-2 mb-4 border-b pb-3">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">✕</span>
              <h2 className="text-base font-bold text-red-700 uppercase tracking-wide">Foods to Avoid</h2>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {draft.noList.map((item, idx) => (
                <div key={idx} className="group bg-red-50 text-red-800 border border-red-200 pl-3 pr-2 py-1.5 rounded-lg text-sm flex items-center gap-1.5 font-medium">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeNoItem(idx)}
                    className="text-red-300 hover:text-red-700 transition-colors"
                    aria-label={`Remove ${item}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <Input
                placeholder="Add a food to avoid…"
                value={newNoItem}
                onChange={e => setNewNoItem(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addNoItem()}
              />
              <Button onClick={addNoItem} variant="outline" className="font-semibold text-red-700 border-red-200 hover:bg-red-50 shrink-0">
                <Plus size={15} />
              </Button>
            </div>
          </div>

          {/* FOODS YOU CAN EAT */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                <h2 className="text-base font-bold text-green-700 uppercase tracking-wide">Foods to Eat</h2>
              </div>
              <button
                type="button"
                onClick={addYesCategory}
                className="text-xs font-semibold text-green-700 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-50 transition-colors flex items-center gap-1"
              >
                <Plus size={13} /> Add category
              </button>
            </div>

            <div className="space-y-5">
              {(draft.yesCategories ?? []).map((cat, catIdx) => (
                <div key={catIdx} className="border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#F7F5F2] border-b border-border">
                    <input
                      type="text"
                      value={cat.name}
                      onChange={e => updateYesCategory(catIdx, "name", e.target.value)}
                      className="font-bold text-sm text-main bg-transparent outline-none w-full"
                      aria-label="Category name"
                    />
                    <button
                      type="button"
                      onClick={() => removeYesCategory(catIdx)}
                      className="text-xs text-text-secondary hover:text-danger transition-colors ml-4 shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="p-3">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {cat.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="bg-green-50 text-green-800 border border-green-200 pl-2.5 pr-1.5 py-1 rounded-full text-sm flex items-center gap-1 font-medium">
                          {item}
                          <button
                            type="button"
                            onClick={() => removeYesItem(catIdx, itemIdx)}
                            className="text-green-400 hover:text-green-800 transition-colors"
                            aria-label={`Remove ${item}`}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 max-w-xs">
                      <Input
                        placeholder="Add item…"
                        className="h-8 text-sm"
                        value={newYesItemInputs[catIdx] ?? ""}
                        onChange={e => setNewYesItemInputs(prev => ({ ...prev, [catIdx]: e.target.value }))}
                        onKeyDown={e => e.key === "Enter" && addYesItem(catIdx)}
                      />
                      <Button
                        onClick={() => addYesItem(catIdx)}
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 font-medium text-green-700 border-green-200 shrink-0"
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SNACKS */}
          <div>
            <div className="flex items-center gap-2 mb-4 border-b pb-3">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0">◎</span>
              <h2 className="text-base font-bold text-green-700 uppercase tracking-wide">Snacks</h2>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {draft.snacks.map((item, idx) => (
                <div key={idx} className="bg-green-50 text-green-800 border border-green-200 pl-3 pr-2 py-1.5 rounded-lg text-sm flex items-center gap-1.5 font-medium">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeSnack(idx)}
                    className="text-green-300 hover:text-green-700 transition-colors"
                    aria-label={`Remove ${item}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <Input
                placeholder="Add a snack…"
                value={newSnack}
                onChange={e => setNewSnack(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addSnack()}
              />
              <Button onClick={addSnack} variant="outline" className="font-semibold text-green-700 border-green-200 hover:bg-green-50 shrink-0">
                <Plus size={15} />
              </Button>
            </div>
          </div>

          {/* SECONDARY DETAILS — collapsed by default */}
          <div className="border border-border rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-[#F7F5F2] hover:bg-[#EFECE8] transition-colors text-sm font-bold text-main"
            >
              <span>Smart Swaps · Plate Portions · Cooking Methods</span>
              <ChevronDown size={16} className={`transition-transform duration-200 text-text-secondary ${showDetails ? "rotate-180" : ""}`} />
            </button>

            {showDetails && (
              <div className="p-6 space-y-8 border-t border-border">

                {/* SMART SWAPS */}
                <div>
                  <h3 className="text-sm font-bold text-main uppercase tracking-wider mb-3">Smart Swaps</h3>
                  <p className="text-xs text-text-secondary mb-3">What to eat instead of common carb-heavy choices.</p>
                  <div className="space-y-2 mb-4">
                    {draft.replacements.map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 text-sm text-main border border-border rounded-lg px-3 py-2 bg-[#FDFCFB]">
                        <span className="font-medium">
                          {row.original} <span className="text-text-secondary mx-1">→</span> {row.replacement}
                        </span>
                        <button type="button" onClick={() => removeReplacement(idx)} className="text-secondary hover:text-danger transition-colors shrink-0" aria-label="Remove swap">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 max-w-2xl">
                    <Input placeholder="Instead of… (e.g. White rice)" value={newSwapOriginal} onChange={(e) => setNewSwapOriginal(e.target.value)} className="flex-1" />
                    <Input placeholder="Eat… (e.g. Cauliflower rice)" value={newSwapReplacement} onChange={(e) => setNewSwapReplacement(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addReplacement()} className="flex-1" />
                    <Button onClick={addReplacement} variant="outline" className="font-semibold shrink-0"><Plus size={15} /> Add</Button>
                  </div>
                </div>

                {/* YOUR PLATE */}
                <div>
                  <h3 className="text-sm font-bold text-main uppercase tracking-wider mb-3">Your Plate</h3>
                  <p className="text-xs text-text-secondary mb-3">How much of each food group should fill the plate.</p>
                  <div className="space-y-2 mb-4">
                    {draft.portions.map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 text-sm text-main border border-border rounded-lg px-3 py-2 bg-[#FDFCFB]">
                        <span className="font-medium">{row.label} <span className="text-text-tertiary mx-1">·</span> {row.fraction}</span>
                        <button type="button" onClick={() => removePortion(idx)} className="text-secondary hover:text-danger transition-colors shrink-0" aria-label="Remove portion"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 max-w-2xl">
                    <Input placeholder="Food group (e.g. Vegetables)" value={newPortionLabel} onChange={(e) => setNewPortionLabel(e.target.value)} className="flex-1" />
                    <Input placeholder="Amount (e.g. ½ plate)" value={newPortionFraction} onChange={(e) => setNewPortionFraction(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPortion()} className="flex-1" />
                    <Button onClick={addPortion} variant="outline" className="font-semibold shrink-0"><Plus size={15} /> Add</Button>
                  </div>
                </div>

                {/* COOKING METHODS */}
                <div>
                  <h3 className="text-sm font-bold text-main uppercase tracking-wider mb-3">Cooking Methods</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {draft.cookingMethods.map((item, idx) => (
                      <div key={idx} className="bg-gray-100 text-gray-700 border border-gray-200 pl-3 pr-2 py-1.5 rounded-lg text-sm flex items-center gap-1.5 font-medium">
                        {item}
                        <button type="button" onClick={() => removeCookingMethod(idx)} className="text-gray-400 hover:text-gray-800 transition-colors" aria-label={`Remove ${item}`}><X size={13} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 max-w-sm">
                    <Input placeholder="Add a cooking method…" value={newCookingMethod} onChange={(e) => setNewCookingMethod(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCookingMethod()} />
                    <Button onClick={addCookingMethod} variant="outline" className="font-semibold shrink-0"><Plus size={15} /> Add</Button>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
      )}
    </AdminLayout>
  );
}
