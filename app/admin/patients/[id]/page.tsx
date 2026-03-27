"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";
import { 
  MOCK_PATIENT, 
  MOCK_ONBOARDING, 
  MOCK_READINGS, 
  MOCK_TIMELINE_EVENTS,
  TimelineEvent,
  DailyReading
} from "@/lib/mock-data";
import { 
  ArrowLeft, 
  Video, 
  Phone, 
  Mail, 
  PencilLine, 
  Activity,
  FileText,
  CalendarCheck,
  ClipboardList,
  MessageSquare
} from "lucide-react";
import { Camera, PenLine } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
// parseISO is used inside safeFormat — kept as a named import
import { Button } from "@/components/ui/button";

/**
 * Safely parse and format an ISO date string.
 * Returns the fallback string if the value is missing or not a valid date,
 * preventing RangeError crashes from stale / malformed localStorage entries.
 */
function safeFormat(
  dateStr: string | undefined | null,
  formatStr: string,
  fallback = "—"
): string {
  if (!dateStr) return fallback;
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, formatStr) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Return true only if the reading object has every field the UI depends on.
 * Filters out entries saved by older versions of the log page.
 */
function isValidReading(r: unknown): r is DailyReading {
  if (!r || typeof r !== "object") return false;
  const obj = r as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.readingDate === "string" &&
    typeof obj.fastingBloodSugar === "number" &&
    typeof obj.bloodPressureSystolic === "number" &&
    typeof obj.bloodPressureDiastolic === "number" &&
    typeof obj.weightKg === "number"
  );
}

export default function AdminPatientProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [readings, setReadings] = useState<DailyReading[]>(MOCK_READINGS);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem("admin_auth")) {
      router.replace("/admin/login");
    }

    const localReadings = localStorage.getItem("demo_readings_history");
    if (localReadings) {
      try {
        const parsed: unknown = JSON.parse(localReadings);
        if (Array.isArray(parsed)) {
          // Discard any entries that don't match the expected shape so stale
          // data from older demo versions never crashes the page.
          const valid = parsed.filter(isValidReading);
          if (valid.length > 0) setReadings(valid);
        }
      } catch (e: unknown) {
        console.error("Failed to parse demo_readings_history:", e);
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

  const getTimelineIcon = (type: string) => {
    switch(type) {
      case "reading_submitted": return <Activity size={16} className="text-blue-600" />;
      case "patient_created": return <ClipboardList size={16} className="text-gray-500" />;
      case "onboarding_completed": return <FileText size={16} className="text-purple-600" />;
      case "appointment_booked": return <CalendarCheck size={16} className="text-amber-600" />;
      case "note_added": return <MessageSquare size={16} className="text-teal-600" />;
      case "guide_created": return <PencilLine size={16} className="text-primary" />;
      default: return <div className="w-2 h-2 rounded-full bg-gray-400" />;
    }
  };

  const formatTimelineTitle = (evt: TimelineEvent) => {
    switch(evt.type) {
      case "reading_submitted": 
        if (evt.metadata && evt.metadata.fasting) {
          return `Logged Daily Reading (Fasting: ${evt.metadata.fasting})`;
        }
        return "Logged Daily Reading";
      case "patient_created": return "Patient profile created manually";
      case "onboarding_completed": return "Completed Intake Form";
      case "appointment_booked": return "Booked First Consultation";
      case "note_added": return "Consultation Note Added by Dr Jasmine";
      case "guide_created": return "Personalised Diet Guide Created";
      case "patient_activated": return "Patient Status Changed to Active";
      default: return evt.type;
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-20">
        
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/patients" className="p-2 bg-white border border-border rounded-xl hover:bg-gray-50 text-main mt-1 self-start">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-main">{MOCK_PATIENT.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 uppercase tracking-widest">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-secondary font-medium">
                <span className="flex items-center gap-1.5"><Phone size={14} /> {MOCK_PATIENT.phone}</span>
                <span className="flex items-center gap-1.5"><Mail size={14} /> {MOCK_PATIENT.email}</span>
                <span className="capitalize">{MOCK_ONBOARDING.gender}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="h-11 rounded-xl bg-white shadow-sm font-semibold border-gray-200">
              <PencilLine size={16} className="mr-2" /> Edit Profile
            </Button>
            <Button onClick={() => router.push(`/admin/patients/${params.id}/consult`)} className="h-11 rounded-xl bg-accent hover:bg-accent-hover text-white shadow-sm font-semibold">
              <Video size={16} className="mr-2" /> Start Consultation
            </Button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid md:grid-cols-5 gap-6 mt-6">
          
          {/* LEFT COL: Timeline */}
          <div className="md:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-150">
              <h2 className="text-xl font-bold text-main mb-6">Patient Journey Timeline</h2>
              
              <div className="relative pl-6 border-l-2 border-gray-100 space-y-8">
                {MOCK_TIMELINE_EVENTS.map((evt) => (
                  <div key={evt.id} className="relative">
                    {/* Circle Indicator */}
                    <div className="absolute -left-[35px] top-0 w-8 h-8 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center shadow-sm">
                      {getTimelineIcon(evt.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="pt-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-main text-[15px]">{formatTimelineTitle(evt)}</p>
                        <span className="text-xs text-secondary font-medium whitespace-nowrap ml-4">
                          {safeFormat(evt.occurredAt, "d MMM, h:mm a")}
                        </span>
                      </div>
                      
                      {evt.metadata?.preview && (
                        <div className="mt-2 text-sm text-secondary bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                           &quot;{evt.metadata.preview}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* RIGHT COL: Readings & Vitals */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Vitals Summary */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-150">
              <h2 className="text-lg font-bold text-main mb-4">Current Vitals Overview</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_ONBOARDING.existingConditions.map((cond, i) => (
                      <span key={i} className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-semibold border border-red-100">{cond}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Current Medications</p>
                  <ul className="text-sm text-main font-medium list-disc list-inside">
                    {MOCK_ONBOARDING.currentMedications.map((med, i) => <li key={i}>{med}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Allergies</p>
                  <p className="text-sm text-main font-bold">{MOCK_ONBOARDING.allergies.join(", ")}</p>
                </div>
              </div>
            </div>

            {/* Readings History */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-150">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-main">Recent Readings</h2>
                <button className="text-primary text-sm font-semibold hover:underline">View All</button>
              </div>
              
              <div className="space-y-3">
                {readings.slice(0, 5).map((rdg) => {
                  const isHighAlert = rdg.fastingBloodSugar > 7.0 || rdg.bloodPressureSystolic > 140;
                  
                  return (
                    <div key={rdg.id} className={`p-4 rounded-xl border ${isHighAlert ? 'bg-red-50/50 border-red-100' : 'bg-gray-50 border-gray-100'} flex justify-between items-center`}>
                      <div>
                        <p className="text-sm font-bold text-main">{safeFormat(rdg.readingDate, "EEE, d MMM")}</p>
                        <div className="flex gap-3 text-xs text-secondary mt-1 font-medium">
                          <span className={rdg.fastingBloodSugar > 7.0 ? "text-danger" : ""}>FBS {rdg.fastingBloodSugar}</span>
                          <span>&middot;</span>
                          <span className={rdg.bloodPressureSystolic > 135 ? "text-danger" : ""}>BP {rdg.bloodPressureSystolic}/{rdg.bloodPressureDiastolic}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-main">{rdg.weightKg} kg</p>
                        <p className="text-[10px] text-secondary uppercase mt-0.5 flex items-center justify-end gap-1">
                          {rdg.entryMethod === "photo_extracted" ? <Camera size={12} /> : <PenLine size={12} />}
                          {rdg.entryMethod === "photo_extracted" ? "Auto" : "Manual"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
