"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";
import { MOCK_PATIENT, MOCK_READINGS, MOCK_ONBOARDING } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { PhoneOff, Video, Mic, MicOff, VideoOff, History, CircleUser, Save, FileText, PencilLine } from "lucide-react";
import { toast } from "sonner";

export default function ConsultationPanel() {
  const router = useRouter();
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "context">("notes");
  const [noteContent, setNoteContent] = useState("");
  const [micMuted, setMicMuted] = useState(false);
  const [vidMuted, setVidMuted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem("admin_auth")) {
      router.replace("/admin/login");
    }
  }, [router]);

  if (!mounted) {
    return (
      <AdminLayout>
        <AdminPageSkeleton />
      </AdminLayout>
    );
  }

  const handleEndCall = () => {
    // Optionally trigger timeline event
    router.push(`/admin/patients/${params.id}`);
  };

  const handleSaveNote = () => {
    if (!noteContent.trim()) return;
    toast.success("Note saved successfully.");
    setNoteContent("");
  };

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
        
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-main flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0" />
              Live Consultation: {MOCK_PATIENT.fullName}
            </h1>
            <p className="text-sm md:text-base text-secondary font-medium mt-1">Session started at 10:00 AM &middot; Dr. Jasmine</p>
          </div>
          <Button onClick={handleEndCall} variant="destructive" className="font-bold flex items-center gap-2 rounded-xl text-sm md:text-base whitespace-nowrap">
            <PhoneOff size={18} /> End Consultation
          </Button>
        </div>

        {/* Workspace */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0 overflow-y-auto pb-4 md:overflow-hidden md:pb-0">
          
          {/* Left: Video Area */}
          <div className="bg-slate-900 rounded-3xl overflow-hidden flex flex-col relative shadow-lg min-h-[300px] max-md:aspect-video">
            
            {/* Main Video (Patient) */}
            <div className="flex-1 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-slate-800" />
              <CircleUser size={120} className="text-slate-600 relative z-10 opacity-30" />
              <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-lg text-white font-medium flex items-center gap-2 backdrop-blur-md z-20">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {MOCK_PATIENT.fullName}
              </div>
            </div>

            {/* PIP Video (Doctor) */}
            <div className="absolute top-6 right-6 w-48 h-32 bg-slate-700 rounded-xl overflow-hidden shadow-2xl border border-slate-600 flex items-center justify-center z-20">
              {vidMuted ? (
                <VideoOff size={32} className="text-slate-500" />
              ) : (
                <div className="absolute inset-0 bg-slate-600" />
              )}
               <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-xs text-white font-semibold flex items-center gap-1">
                {micMuted && <MicOff size={10} className="text-red-400" />}
                You
              </div>
            </div>

            {/* Video Controls */}
            <div className="h-20 bg-slate-950 flex items-center justify-center gap-4 relative z-20">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setMicMuted(!micMuted)}
                className={`w-12 h-12 rounded-full border-slate-700 ${micMuted ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
              >
                {micMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setVidMuted(!vidMuted)}
                className={`w-12 h-12 rounded-full border-slate-700 ${vidMuted ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
              >
                {vidMuted ? <VideoOff size={20} /> : <Video size={20} />}
              </Button>
            </div>
          </div>

          {/* Right: Notes & Context */}
          <div className="bg-white rounded-3xl border border-border shadow-sm flex flex-col overflow-hidden min-h-[300px]">
            
            <div className="flex border-b border-border">
              <button 
                className={`flex-1 py-4 font-bold text-sm tracking-wide uppercase transition-colors ${activeTab === "notes" ? "text-primary border-b-2 border-primary" : "text-secondary hover:text-main"}`}
                onClick={() => setActiveTab("notes")}
              >
                Consultation Notes
              </button>
              <button 
                className={`flex-1 py-4 font-bold text-sm tracking-wide uppercase transition-colors ${activeTab === "context" ? "text-primary border-b-2 border-primary" : "text-secondary hover:text-main"}`}
                onClick={() => setActiveTab("context")}
              >
                Medical Context
              </button>
            </div>

            <div className="flex-1 overflow-y-auto w-full">
              {activeTab === "notes" && (
                <div className="h-full flex flex-col w-full p-6">
                  <div className="flex items-center gap-2 text-secondary mb-3">
                    <FileText size={16} />
                    <span className="text-sm font-semibold">Write clinical assessment...</span>
                  </div>
                  <textarea 
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="flex-1 w-full resize-none outline-none text-main placeholder-gray-300 leading-relaxed"
                    placeholder="E.g. Patient reports feeling less bloated. FBS improved to avg 6.5. Advised to continue current diet plan..."
                  />
                  <div className="pt-4 border-t border-border mt-auto flex justify-end">
                    <Button onClick={handleSaveNote} className="font-bold rounded-xl gap-2 bg-primary hover:bg-primary-hover w-40">
                      <Save size={16} /> Save Note
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "context" && (
                <div className="p-6 space-y-8">
                  
                  <div>
                    <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-3">Patient Summary</h3>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-xs text-secondary mb-1">Age / Sex</p>
                        <p className="font-semibold text-main capitalize">{MOCK_ONBOARDING.gender}</p>
                      </div>
                      <div>
                        <p className="text-xs text-secondary mb-1">Conditions</p>
                        <p className="font-semibold text-main">{MOCK_ONBOARDING.existingConditions.join(", ")}</p>
                      </div>
                      <div className="col-span-2 border-t border-gray-200 mt-2 pt-3">
                        <p className="text-xs text-secondary mb-1">Medications</p>
                        <p className="font-semibold text-main">{MOCK_ONBOARDING.currentMedications.join(", ")}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Recent Readings</h3>
                      <button className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                        <History size={14} /> Full Log
                      </button>
                    </div>
                    <div className="bg-white border border-border rounded-xl divide-y divide-border overflow-hidden">
                      {MOCK_READINGS.slice(0, 3).map((rdg) => (
                        <div key={rdg.id} className="p-3 flex justify-between items-center">
                          <span className="font-medium text-sm text-main">{rdg.readingDate}</span>
                          <div className="flex gap-4">
                            <span className="text-sm"><span className="text-secondary text-xs mr-1">FBS</span><span className="font-bold">{rdg.fastingBloodSugar}</span></span>
                            <span className="text-sm"><span className="text-secondary text-xs mr-1">BP</span><span className="font-bold">{rdg.bloodPressureSystolic}/{rdg.bloodPressureDiastolic}</span></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-3">Guide Actions</h3>
                    <Button 
                      variant="outline" 
                      className="w-full h-12 font-semibold border-primary/30 text-primary hover:bg-primary-light/50"
                      onClick={() => router.push(`/admin/patients/${params.id}/guide`)}
                    >
                      <PencilLine size={16} className="mr-2" /> Modify Patient Guide
                    </Button>
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
