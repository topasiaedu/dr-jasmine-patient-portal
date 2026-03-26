"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";
import { MOCK_PATIENT, MOCK_GUIDE, PatientGuide } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Plus, X, ListPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminGuideBuilder() {
  const router = useRouter();
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [guide, setGuide] = useState<PatientGuide>(MOCK_GUIDE);
  const [newNoItem, setNewNoItem] = useState("");
  const [newSnack, setNewSnack] = useState("");

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem("admin_auth")) {
      router.replace("/admin/login");
    } else {
      const local = localStorage.getItem("demo_patient_guide");
      if (local) {
        try {
          setGuide(JSON.parse(local));
        } catch (e: unknown) {
          console.error("Failed to parse localStorage:", e);
        }
      }
    }
  }, [router]);

  if (!mounted) {
    return (
      <AdminLayout>
        <AdminPageSkeleton />
      </AdminLayout>
    );
  }

  const handleSave = () => {
    const updated = {
      ...guide,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem("demo_patient_guide", JSON.stringify(updated));
    toast.success(`Guide published to ${MOCK_PATIENT.fullName}'s portal.`);
    router.push(`/admin/patients/${params.id}`);
  };

  const addNoItem = () => {
    if (newNoItem.trim()) {
      setGuide(g => ({ ...g, noList: [...g.noList, newNoItem.trim()] }));
      setNewNoItem("");
    }
  };

  const removeNoItem = (idx: number) => {
    setGuide(g => ({ ...g, noList: g.noList.filter((_, i) => i !== idx) }));
  };

  const addSnack = () => {
    if (newSnack.trim()) {
      setGuide(g => ({ ...g, snacks: [...g.snacks, newSnack.trim()] }));
      setNewSnack("");
    }
  };

  const removeSnack = (idx: number) => {
    setGuide(g => ({ ...g, snacks: g.snacks.filter((_, i) => i !== idx) }));
  };

  const updateTitle = (val: string) => setGuide(g => ({...g, title: val}));
  const updateDietType = (val: string) => setGuide(g => ({...g, dietType: val}));

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
              <h1 className="text-2xl font-bold text-main">Guide Builder</h1>
              <p className="text-secondary text-sm">Modifying printable guide for {MOCK_PATIENT.fullName}</p>
            </div>
          </div>
          <Button onClick={handleSave} className="h-11 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold px-6 shadow-sm">
            <Save size={16} className="mr-2" /> Save & Publish
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8 space-y-8">
          
          {/* General */}
          <div>
            <h2 className="text-lg font-bold text-main mb-4 border-b pb-2">Diet Plan Configuration</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-secondary mb-1.5 uppercase tracking-wider">Diet Title</label>
                <Input 
                  value={guide.title} 
                  onChange={e => updateTitle(e.target.value)}
                  className="font-bold text-main"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary mb-1.5 uppercase tracking-wider">Diet Type</label>
                <select 
                  value={guide.dietType || "LCHF"}
                  onChange={e => updateDietType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="LCHF (Low Carb High Fat)">LCHF (Low Carb High Fat)</option>
                  <option value="Mediterranean">Mediterranean</option>
                  <option value="Low GI">Low GI</option>
                  <option value="Intermittent Fasting">Intermittent Fasting</option>
                  <option value="Custom">Custom</option>
                  <option value="LCHF">LCHF</option>
                </select>
              </div>
            </div>
          </div>

          {/* DO NOT EAT */}
          <div>
            <h2 className="text-lg font-bold text-main mb-4 border-b pb-2 text-danger">Strictly Avoid (DO NOT EAT)</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {guide.noList.map((item, idx) => (
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

          {/* ALLOWED SNACKS */}
          <div>
            <h2 className="text-lg font-bold text-main mb-4 border-b pb-2 text-green-700">Allowed Snacks</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {guide.snacks.map((item, idx) => (
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

          {/* ADVANCED */}
          <div>
            <h2 className="text-lg font-bold text-main mb-4 border-b pb-2">Advanced Sections</h2>
            <p className="text-sm text-secondary mb-4">Categories, Replacements, Portions and Free Text sections can be edited here.</p>
            
            <div className="p-8 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center bg-gray-50/50">
              <ListPlus size={32} className="text-gray-400 mb-3" />
              <p className="font-semibold text-main">Advanced Editor Linked</p>
              <p className="text-sm text-secondary max-w-sm">For the demo sandbox, large data structures (Replacements, Rules) are read-only. In production, this renders a dynamic spreadsheet view.</p>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
