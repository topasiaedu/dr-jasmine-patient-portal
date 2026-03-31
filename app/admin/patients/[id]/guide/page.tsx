"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";
import { MOCK_PATIENT, MOCK_GUIDE_VERSIONS, GuideVersion } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, X, ArrowRight, History, Save, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export default function AdminGuideBuilder() {
  const router = useRouter();
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  
  const [versions, setVersions] = useState<GuideVersion[]>([]);
  const [draft, setDraft] = useState<GuideVersion | null>(null);

  const [newNoItem, setNewNoItem] = useState("");
  const [newSnack, setNewSnack] = useState("");
  const [newYesItemInputs, setNewYesItemInputs] = useState<Record<string, string>>({});

  const [isNewPhaseOpen, setIsNewPhaseOpen] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");
  const [newPhaseRationale, setNewPhaseRationale] = useState("");

  const [showHistory, setShowHistory] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<GuideVersion | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem("admin_auth")) {
      router.replace("/admin/login");
      return;
    } 

    const local = localStorage.getItem("demo_guide_versions");
    let vList = MOCK_GUIDE_VERSIONS;
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          vList = parsed;
        }
      } catch (e: unknown) {
        console.error("Failed to parse localStorage:", e);
      }
    }
    setVersions(vList);
    
    // Find the active guide to use as a template for the draft
    const activeGuide = vList.find(g => g.supersededAt === null) || vList[vList.length - 1];
    setDraft({ ...activeGuide });
  }, [router]);

  if (!mounted || !draft) {
    return (
      <AdminLayout>
        <AdminPageSkeleton />
      </AdminLayout>
    );
  }

  const handleSaveChanges = () => {
    const updatedVersions = versions.map(v => v.id === draft.id ? draft : v);
    setVersions(updatedVersions);
    localStorage.setItem("demo_guide_versions", JSON.stringify(updatedVersions));
    toast.success("Changes saved successfully.");
  };

  const handleStartNewPhase = () => {
    if (!newPhaseName.trim()) {
      toast.error("Please enter a protocol name.");
      return;
    }

    const now = new Date().toISOString();
    const nextVerInt = parseFloat(draft.versionNumber?.toString() || "1") + 1;

    const updatedVersions = versions.map(v => 
      v.supersededAt === null ? { ...v, supersededAt: now } : v
    );

    const newGuide: GuideVersion = {
      ...draft,
      id: `guide-v${Date.now()}`,
      versionNumber: nextVerInt,
      protocolName: newPhaseName,
      clinicalRationale: newPhaseRationale,
      introducedAtSession: MOCK_PATIENT.sessionsCompleted + 1,
      activeFrom: now,
      supersededAt: null,
      updatedAt: now
    };

    updatedVersions.push(newGuide);
    setVersions(updatedVersions);
    setDraft({ ...newGuide });
    localStorage.setItem("demo_guide_versions", JSON.stringify(updatedVersions));
    
    setIsNewPhaseOpen(false);
    setNewPhaseName("");
    setNewPhaseRationale("");
    toast.success(`New phase started: ${newPhaseName}`);
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
    const item = newYesItemInputs[idx];
    if (item?.trim()) {
      const newCats = [...(draft.yesCategories||[])];
      newCats[idx] = { ...newCats[idx], items: [...newCats[idx].items, item.trim()] };
      setDraft(g => g ? { ...g, yesCategories: newCats } : g);
      setNewYesItemInputs(prev => ({ ...prev, [idx]: "" }));
    }
  };
  const removeYesItem = (catIdx: number, itemIdx: number) => {
    const newCats = [...(draft.yesCategories||[])];
    newCats[catIdx].items = newCats[catIdx].items.filter((_, i) => i !== itemIdx);
    setDraft(g => g ? { ...g, yesCategories: newCats } : g);
  };
  const moveYesCategory = (idx: number, direction: -1 | 1) => {
    const newCats = [...(draft.yesCategories||[])];
    const targetIdx = idx + direction;
    if (targetIdx >= 0 && targetIdx < newCats.length) {
      const temp = newCats[idx];
      newCats[idx] = newCats[targetIdx];
      newCats[targetIdx] = temp;
      setDraft(g => g ? { ...g, yesCategories: newCats } : g);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/admin/patients/${params.id}`} className="p-2 border border-border bg-white rounded-xl hover:bg-gray-50 text-main transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-main">Guide Builder — {MOCK_PATIENT.fullName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-primary/10 text-primary font-medium px-2 py-0.5 rounded text-sm">
                  Current: {draft.protocolName} · Version {draft.versionNumber}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setIsNewPhaseOpen(true)} className="h-11 bg-white border border-primary text-primary hover:bg-primary-light rounded-xl font-bold px-6 shadow-sm">
              Start New Phase <ArrowRight size={16} className="ml-2" />
            </Button>
            <Button onClick={handleSaveChanges} className="h-11 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold px-6 shadow-sm">
              <Save size={16} className="mr-2" /> Save Changes
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8 space-y-8">
          
          {/* FOODS TO AVOID */}
          <div>
            <h2 className="text-lg font-bold text-main mb-4 border-b pb-2 text-danger">FOODS TO AVOID</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {draft.noList.map((item, idx) => (
                <div key={idx} className="bg-red-50 text-red-800 border border-red-200 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 font-medium shadow-sm">
                  {item}
                  <button onClick={() => removeNoItem(idx)} className="text-red-400 hover:text-red-700 p-0.5 rounded-full hover:bg-red-200 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <Input 
                placeholder="E.g. Sweetened Yogurt" 
                value={newNoItem} 
                onChange={e => setNewNoItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addNoItem()}
              />
              <Button onClick={addNoItem} variant="outline" className="font-semibold text-danger border-red-200 hover:bg-red-50">
                <Plus size={16} className="mr-1" /> Add
              </Button>
            </div>
          </div>

          {/* FOODS YOU CAN EAT */}
          <div>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-main text-green-700">FOODS YOU CAN EAT</h2>
              <Button onClick={addYesCategory} variant="outline" size="sm" className="font-semibold text-green-700 border-green-200 hover:bg-green-50">
                <Plus size={14} className="mr-1" /> Add Category
              </Button>
            </div>
            
            <div className="space-y-4">
              {(draft.yesCategories||[]).map((cat, catIdx) => (
                <div key={catIdx} className="border border-border rounded-xl p-4 relative">
                  <div className="absolute right-4 top-4 flex gap-1">
                    <button onClick={() => moveYesCategory(catIdx, -1)} disabled={catIdx === 0} className="p-1 text-secondary hover:bg-gray-100 rounded disabled:opacity-30"><ChevronUp size={16}/></button>
                    <button onClick={() => moveYesCategory(catIdx, 1)} disabled={catIdx === (draft.yesCategories||[]).length - 1} className="p-1 text-secondary hover:bg-gray-100 rounded disabled:opacity-30"><ChevronDown size={16}/></button>
                  </div>
                  
                  <Input 
                    value={cat.name}
                    onChange={e => updateYesCategory(catIdx, "name", e.target.value)}
                    className="font-bold text-main w-[60%] mb-3 h-9"
                    placeholder="Category Name"
                  />
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {cat.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="bg-green-50 text-green-800 border border-green-200 px-3 py-1 rounded-full text-sm flex items-center gap-1 font-medium shadow-sm">
                        {item}
                        <button onClick={() => removeYesItem(catIdx, itemIdx)} className="text-green-500 hover:text-green-800 p-0.5 rounded-full hover:bg-green-200 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 max-w-sm mb-3">
                    <Input 
                      placeholder="Add item..." 
                      className="h-8 text-sm"
                      value={newYesItemInputs[catIdx] || ""}
                      onChange={e => setNewYesItemInputs(prev => ({...prev, [catIdx]: e.target.value}))}
                      onKeyDown={e => e.key === 'Enter' && addYesItem(catIdx)}
                    />
                    <Button onClick={() => addYesItem(catIdx)} variant="outline" size="sm" className="h-8 px-2 font-medium text-green-700">Add</Button>
                  </div>

                  <Textarea
                    placeholder="Category notes (optional)"
                    value={cat.notes ? cat.notes.join('\n') : ""}
                    onChange={e => updateYesCategory(catIdx, "notes", e.target.value.split("\n"))}
                    className="h-16 text-sm mb-3 resize-none"
                  />

                  <button onClick={() => removeYesCategory(catIdx)} className="text-sm text-danger hover:underline">
                    Remove category
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SNACKS */}
          <div>
            <h2 className="text-lg font-bold text-main mb-4 border-b pb-2 text-green-700">SNACKS</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {draft.snacks.map((item, idx) => (
                <div key={idx} className="bg-green-50 text-green-800 border border-green-200 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 font-medium shadow-sm">
                  {item}
                  <button onClick={() => removeSnack(idx)} className="text-green-500 hover:text-green-800 p-0.5 rounded-full hover:bg-green-200 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <Input 
                placeholder="E.g. Macadamia Nuts" 
                value={newSnack} 
                onChange={e => setNewSnack(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSnack()}
              />
              <Button onClick={addSnack} variant="outline" className="font-semibold text-green-700 border-green-200 hover:bg-green-50">
                <Plus size={16} className="mr-1" /> Add
              </Button>
            </div>
          </div>

        </div>

        {/* PHASE HISTORY PANEL */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="w-full p-4 flex justify-center items-center gap-2 font-semibold text-main hover:bg-gray-50 transition-colors"
          >
            <History size={18} /> Phase History {showHistory ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          </button>
          
          {showHistory && (
            <div className="border-t border-border bg-white divide-y">
              {[...versions].reverse().map(v => (
                <div key={v.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setPreviewVersion(v)}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-main">v{v.versionNumber} {v.protocolName}</span>
                      {v.supersededAt === null && <span className="bg-primary/10 text-primary text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold">Current</span>}
                    </div>
                    <p className="text-sm text-secondary mt-1">
                      {v.activeFrom ? format(parseISO(v.activeFrom), "MMM yyyy") : ""} · Session {v.introducedAtSession || "Unknown"}
                    </p>
                  </div>
                  <ArrowRight size={18} className="text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* START NEW PHASE MODAL */}
      <Dialog open={isNewPhaseOpen} onOpenChange={setIsNewPhaseOpen}>
        <DialogContent className="sm:max-w-md border-0 p-0 overflow-hidden bg-bg-app rounded-2xl">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-display text-main font-semibold">Start New Phase for {MOCK_PATIENT.fullName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-main mb-1.5">Protocol name (shown to patient) *</label>
                <Input 
                  value={newPhaseName} 
                  onChange={e => setNewPhaseName(e.target.value)} 
                  placeholder="E.g. LCHF + Intermittent Fasting"
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-main mb-1.5">Why are you advancing this patient? (Private)</label>
                <Textarea 
                  value={newPhaseRationale} 
                  onChange={e => setNewPhaseRationale(e.target.value)} 
                  placeholder="E.g. Patient has stabilised blood sugar, ready to introduce 16:8 fasting."
                  className="rounded-xl min-h-[100px]"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8 justify-end">
              <Button variant="outline" onClick={() => setIsNewPhaseOpen(false)} className="rounded-xl border-[#D1C8C0]">Cancel</Button>
              <Button onClick={handleStartNewPhase} className="rounded-xl px-6 bg-primary text-white hover:bg-primary-hover">Create New Phase →</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* HISTORY PREVIEW SHEET */}
      <Sheet open={!!previewVersion} onOpenChange={(open) => !open && setPreviewVersion(null)}>
        <SheetContent className="bg-bg-app w-full sm:max-w-md overflow-y-auto p-6 sm:p-8">
          <SheetHeader className="mb-6 border-b pb-4">
            <SheetTitle className="text-2xl font-display text-main">
              {previewVersion?.protocolName}
            </SheetTitle>
            <p className="text-sm text-secondary mt-1">v{previewVersion?.versionNumber} (Read-only)</p>
          </SheetHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-secondary uppercase mb-2">Foods to Avoid</h3>
              <p className="text-sm text-main">{previewVersion?.noList?.join(", ") || "None"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-secondary uppercase mb-2">Foods You Can Eat</h3>
              {previewVersion?.yesCategories?.map((c, i) => (
                <div key={i} className="mb-3 border-l-2 border-green-200 pl-3">
                  <p className="font-semibold text-main text-sm">{c.name}</p>
                  <p className="text-sm text-secondary">{c.items.join(", ")}</p>
                  {c.notes && c.notes.length > 0 && <p className="text-xs text-tertiary mt-1 italic">{c.notes.join(" ")}</p>}
                </div>
              ))}
            </div>

            <div>
               <h3 className="text-sm font-semibold text-secondary uppercase mb-2">Clinical Rationale (Private)</h3>
               <p className="text-sm text-main italic">{previewVersion?.clinicalRationale || "None provided"}</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

    </AdminLayout>
  );
}
