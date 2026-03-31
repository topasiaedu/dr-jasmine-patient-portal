"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";
import {
  MOCK_PATIENT,
  MOCK_READINGS,
  MOCK_ONBOARDING,
  MOCK_CONSULTATION_NOTES,
  MOCK_AVAILABILITY_WINDOWS,
  MOCK_APPOINTMENT,
  DailyReading,
  ConsultationNote,
  AvailabilityWindow
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ChevronDown,
  AlertTriangle,
  ArrowLeft,
  PencilLine,
  Check,
  Save,
  Send
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isValid, addDays, startOfToday } from "date-fns";
import { cn } from "@/lib/utils";

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

export default function ConsultationPanel() {
  const router = useRouter();
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [readings, setReadings] = useState<DailyReading[]>(MOCK_READINGS);
  const [notes, setNotes] = useState<ConsultationNote[]>([]);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [onboardingExpanded, setOnboardingExpanded] = useState(false);

  const [notePrivate, setNotePrivate] = useState("");
  const [notePatient, setNotePatient] = useState("");
  const [patientNoteSent, setPatientNoteSent] = useState(false);
  const [sessionMarked, setSessionMarked] = useState(false);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem("admin_auth")) {
      router.replace("/admin/login");
      return;
    }

    const localReadings = localStorage.getItem("demo_readings_history");
    if (localReadings) {
      try {
        const parsed: unknown = JSON.parse(localReadings);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(isValidReading);
          if (valid.length > 0) setReadings(valid);
        }
      } catch (e: unknown) {
        console.error("Failed to parse readings:", e);
      }
    }

    const localNotes = localStorage.getItem("demo_consultation_notes");
    let loadedNotes = MOCK_CONSULTATION_NOTES;
    if (localNotes) {
      try {
        const parsed = JSON.parse(localNotes);
        if (Array.isArray(parsed)) loadedNotes = parsed as ConsultationNote[];
      } catch (e: unknown) {
        console.error("Failed to parse notes:", e);
      }
    }
    setNotes(loadedNotes);

    if (loadedNotes.length > 0) {
      setNotePrivate(loadedNotes[0].privateNotes || "");
      setPatientNoteSent(!!loadedNotes[0].patientNoteSentAt);
    }

    const localWindows = localStorage.getItem("admin_availability_windows");
    if (localWindows) {
      try {
        setWindows(JSON.parse(localWindows));
      } catch {}
    } else {
      setWindows(MOCK_AVAILABILITY_WINDOWS);
    }
  }, [router]);

  if (!mounted) {
    return (
      <AdminLayout fullBleed>
        <AdminPageSkeleton />
      </AdminLayout>
    );
  }

  const handleSaveNote = () => {
    if (!notePrivate.trim()) return;

    const updatedNotes = [...notes];
    if (updatedNotes.length > 0) {
      updatedNotes[0].privateNotes = notePrivate.trim();
    } else {
      updatedNotes.push({
        id: `note-${Date.now()}`,
        patientId: "demo",
        appointmentId: null,
        privateNotes: notePrivate.trim(),
        patientNote: "",
        patientNoteSentAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setNotes(updatedNotes);
    localStorage.setItem("demo_consultation_notes", JSON.stringify(updatedNotes));
    toast.success("Notes saved.");
  };

  const handleSendToPatient = () => {
    if (!notePatient.trim() || patientNoteSent) return;

    const updatedNotes = [...notes];
    const now = new Date().toISOString();
    if (updatedNotes.length > 0) {
      updatedNotes[0].patientNote = notePatient.trim();
      updatedNotes[0].patientNoteSentAt = now;
    } else {
      updatedNotes.push({
        id: `note-${Date.now()}`,
        patientId: "demo",
        appointmentId: null,
        privateNotes: notePrivate.trim(),
        patientNote: notePatient.trim(),
        patientNoteSentAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }
    setNotes(updatedNotes);
    localStorage.setItem("demo_consultation_notes", JSON.stringify(updatedNotes));
    setPatientNoteSent(true);
    toast.success(`Note sent to ${MOCK_PATIENT.fullName} via WhatsApp.`);
  };

  const handleMarkSessionComplete = () => {
    setSessionMarked(true);
    toast.success("Session marked complete.");
  };

  const today = startOfToday();
  const next14Days = Array.from({ length: 14 }).map((_, i) => addDays(today, i));
  const availableDates = next14Days.filter(d => 
    windows.some(w => w.dayOfWeek === d.getDay())
  );

  const timeSlots: string[] = [];
  if (selectedDate) {
    const day = selectedDate.getDay();
    const dayWindows = windows.filter(w => w.dayOfWeek === day);
    dayWindows.forEach(w => {
      const startMs = parseTime(w.startTime);
      const endMs = parseTime(w.endTime);
      let currentMs = startMs;
      while (currentMs < endMs) {
        timeSlots.push(formatTime(currentMs));
        currentMs += 30 * 60 * 1000;
      }
    });
  }

  function parseTime(timeStr: string) {
    const [h, m] = timeStr.split(":");
    return (parseInt(h) * 60 + parseInt(m)) * 60 * 1000;
  }
  
  function formatTime(ms: number) {
    const totalMinutes = Math.floor(ms / (60 * 1000));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const date = new Date(0, 0, 0, hours, mins);
    return format(date, "hh:mm a");
  }

  const isUnavailable = (date: Date, timeStr: string) => {
    const slotStart = new Date(date);
    const [time, modifier] = timeStr.split(" ");
    let [h, m] = time.split(":");
    let hNum = parseInt(h);
    if (modifier === "PM" && hNum < 12) hNum += 12;
    if (modifier === "AM" && hNum === 12) hNum = 0;
    slotStart.setHours(hNum, parseInt(m), 0, 0);
    const slotEnd = new Date(slotStart.getTime() + 30 * 60000);

    const mockApptStart = new Date(MOCK_APPOINTMENT.startsAt);
    const mockApptEnd = new Date(MOCK_APPOINTMENT.endsAt);
    if (slotStart < mockApptEnd && slotEnd > mockApptStart) return true;

    const checks = ["demo_appointment", "demo_next_appointment"];
    for (const key of checks) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const { date: d, time: t } = JSON.parse(stored);
          if (format(date, "yyyy-MM-dd") === d && timeStr === t) return true;
        } catch (e) {}
      }
    }
    return false;
  };

  const handleConfirmSchedule = () => {
    if (!selectedDate || !selectedTime) return;
    const appointmentDateStr = format(selectedDate, "yyyy-MM-dd");
    const newAppt = {
      date: appointmentDateStr,
      time: selectedTime,
    };
    localStorage.setItem("demo_next_appointment", JSON.stringify(newAppt));
    toast.success(`Session ${MOCK_PATIENT.sessionsCompleted + 2} booked. WhatsApp confirmation sent to Lily Tan.`);
    setScheduleModalOpen(false);
  };

  const latestReading = readings[0];
  const isFastingHigh = (val: number): boolean => val > 7.0;
  const isBpHigh = (sys: number): boolean => sys > 135;
  const wordCount = notePrivate.trim().split(/\s+/).filter((w) => w.length > 0).length;

  return (
    <AdminLayout fullBleed>
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="shrink-0 flex items-center justify-between px-6 h-14 bg-white border-b-2 border-primary/20">
          <div className="flex items-center gap-3">
            <Link href={`/admin/patients/${params.id}`} className="text-secondary hover:text-main transition-colors flex items-center gap-1.5 text-sm font-semibold">
              <ArrowLeft size={16} /> Lily Tan
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-main px-3 py-1 bg-[#F5F3F0] rounded-lg text-sm hidden sm:inline">
              Session {MOCK_PATIENT.sessionsCompleted + 1} of {MOCK_PATIENT.sessionsEntitled}
            </span>
          </div>
          <div>
            <Button
              variant="outline"
              disabled={sessionMarked}
              onClick={handleMarkSessionComplete}
              className={cn(
                "h-9 text-sm font-semibold rounded-lg gap-2 transition-colors",
                sessionMarked
                  ? "border-green-200 text-green-700 bg-green-50"
                  : "border-primary/30 text-primary hover:bg-primary/5"
              )}
            >
              {sessionMarked ? <><Check size={14} /> ✓ Completed</> : "Mark Session Complete"}
            </Button>
          </div>
        </header>

        {/* Two-Panel Workspace */}
        <div className="flex-1 flex min-h-0">
          
          {/* LEFT PANEL */}
          <aside className="w-[380px] shrink-0 bg-[#F7F5F2] border-r border-border flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {/* Quick Vitals Strip */}
              {latestReading && (
                <div className="p-5 border-b border-border">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-3">
                    Latest Readings &middot; {safeFormat(latestReading.readingDate, "d MMM yyyy")}
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    <VitalCard label="Fasting" value={latestReading.fastingBloodSugar.toString()} unit="mmol/L" alert={isFastingHigh(latestReading.fastingBloodSugar)} />
                    <VitalCard label="Blood Pressure" value={`${latestReading.bloodPressureSystolic}/${latestReading.bloodPressureDiastolic}`} unit="mmHg" alert={isBpHigh(latestReading.bloodPressureSystolic)} />
                    <VitalCard label="Weight" value={latestReading.weightKg.toString()} unit="kg" />
                  </div>
                </div>
              )}

              {/* Medical Info */}
              <div className="p-5 border-b border-border space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-2">Conditions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {MOCK_ONBOARDING.existingConditions.map((cond) => (
                      <span key={cond} className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs font-semibold border border-red-100">{cond}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-2">Medications</p>
                  <ul className="text-sm text-main font-medium space-y-0.5">
                    {MOCK_ONBOARDING.currentMedications.map((med) => (
                      <li key={med} className="flex items-baseline gap-2">
                        <span className="w-1 h-1 rounded-full bg-text-secondary shrink-0 mt-1.5" />{med}
                      </li>
                    ))}
                  </ul>
                </div>
                {MOCK_ONBOARDING.allergies.length > 0 && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.15em] mb-0.5">Allergies</p>
                      <p className="text-sm font-bold text-amber-900">{MOCK_ONBOARDING.allergies.join(", ")}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Onboarding Summary (New) */}
              <div className="border-b border-border">
                <button
                  onClick={() => setOnboardingExpanded(!onboardingExpanded)}
                  className="w-full h-12 px-5 flex items-center justify-between text-[11px] font-bold text-text-secondary uppercase tracking-[0.15em] hover:bg-[#EFECE8] transition-colors"
                >
                  Chief Complaint &amp; Symptoms <ChevronDown size={14} className={cn("transition-transform duration-200", onboardingExpanded && "rotate-180")} />
                </button>
                {onboardingExpanded && (
                  <div className="px-5 pb-5 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-text-secondary mb-1">Chief Complaint</p>
                      <p className="text-sm text-main">{MOCK_ONBOARDING.chiefComplaint || "None"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-secondary mb-1">Symptoms</p>
                      <p className="text-sm text-main">
                        {MOCK_ONBOARDING.symptoms && MOCK_ONBOARDING.symptoms.length > 0 
                          ? MOCK_ONBOARDING.symptoms.join(", ") 
                          : "None reported"}
                      </p>
                    </div>
                    <Link href={`/admin/patients/${params.id}`} className="inline-block mt-2 text-primary text-xs font-semibold hover:underline">
                      View full onboarding →
                    </Link>
                  </div>
                )}
              </div>

              {/* Recent Readings Table */}
              <div className="p-5 border-b border-border">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-3">Recent Readings</p>
                <div className="rounded-lg border border-border overflow-hidden bg-white">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#F5F3F0] text-text-secondary font-bold uppercase tracking-wider">
                        <th className="text-left py-2 px-3">Date</th>
                        <th className="text-right py-2 px-3">FBS</th>
                        <th className="text-right py-2 px-3">BP</th>
                        <th className="text-right py-2 px-3">Wt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {readings.slice(0, 5).map((rdg) => (
                        <tr key={rdg.id} className="hover:bg-[#FAFAF8]">
                          <td className="py-2 px-3 font-medium text-main">{safeFormat(rdg.readingDate, "d MMM")}</td>
                          <td className={cn("py-2 px-3 text-right font-bold", isFastingHigh(rdg.fastingBloodSugar) ? "text-red-600" : "text-main")}>{rdg.fastingBloodSugar}</td>
                          <td className={cn("py-2 px-3 text-right font-bold", isBpHigh(rdg.bloodPressureSystolic) ? "text-red-600" : "text-main")}>{rdg.bloodPressureSystolic}/{rdg.bloodPressureDiastolic}</td>
                          <td className="py-2 px-3 text-right font-bold text-main">{rdg.weightKg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Previous Notes */}
              <div className="p-5">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-3">Previous Notes</p>
                {notes.length === 0 ? (
                  <p className="text-sm text-text-secondary italic">No previous notes.</p>
                ) : (
                  <div className="space-y-2">
                    {notes.map((note) => {
                      const isOpen = expandedNoteId === note.id;
                      return (
                        <div key={note.id} className="rounded-lg border border-border bg-white overflow-hidden">
                          <button
                            onClick={() => setExpandedNoteId(isOpen ? null : note.id)}
                            className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[#FAFAF8] transition-colors"
                          >
                            <span className="text-xs font-semibold text-main">
                              {safeFormat(note.createdAt, "d MMM yyyy")}
                              {note.patientNoteSentAt && <span className="text-green-600 ml-1">· Sent to patient ✓</span>}
                            </span>
                            <ChevronDown size={14} className={cn("text-text-secondary transition-transform", isOpen && "rotate-180")} />
                          </button>
                          {isOpen && (
                            <div className="px-3 pb-3 border-t border-border">
                              <p className={cn("text-sm leading-relaxed pt-2.5", !note.patientNote ? "text-text-secondary italic" : "text-main")}>
                                {note.patientNote || "(No patient note was sent)"}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* RIGHT PANEL */}
          <section className="flex-1 flex flex-col bg-[#FDFCFB] min-w-0">
            {/* Split right panel into two large text areas vertically */}
            <div className="flex-1 overflow-y-auto w-full">
              {/* Section A: Private Notes */}
              <div className="p-8 border-b border-border bg-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-[13px] font-bold text-main uppercase tracking-widest">MY NOTES</h2>
                    <p className="text-xs text-text-secondary mt-1">Only you can see this</p>
                  </div>
                  {wordCount > 0 && <span className="text-xs text-text-secondary font-medium">{wordCount} words</span>}
                </div>
                <textarea
                  value={notePrivate}
                  onChange={(e) => setNotePrivate(e.target.value)}
                  className="w-full min-h-[200px] resize-y outline-none text-main text-[15px] leading-[1.7] placeholder:text-[#C8C3BC] bg-transparent"
                  placeholder="Paste or type your session notes here...
These are private and will never be shown to the patient."
                />
                <div className="mt-4 flex justify-end">
                  <Button onClick={handleSaveNote} variant="outline" className="border-border text-main font-semibold gap-2">
                    <Save size={14} /> Save Notes
                  </Button>
                </div>
              </div>

              {/* Section B: Patient Note */}
              <div className="p-8">
                <div className="mb-4">
                  <h2 className="text-[13px] font-bold text-main uppercase tracking-widest">NOTE FOR PATIENT</h2>
                  <p className="text-xs text-text-secondary mt-1">This will be sent to the patient via WhatsApp</p>
                </div>
                <textarea
                  disabled={patientNoteSent}
                  value={notePatient}
                  onChange={(e) => setNotePatient(e.target.value)}
                  className="w-full min-h-[160px] resize-y outline-none text-main text-[15px] leading-[1.7] placeholder:text-[#C8C3BC] bg-transparent disabled:opacity-70 disabled:cursor-not-allowed"
                  placeholder="Write the summary you'd like to send...
E.g. Great session! Continue your current plan. Next steps: ..."
                />
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={handleSendToPatient} 
                    disabled={!notePatient.trim() || patientNoteSent}
                    className="font-bold gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white disabled:opacity-50 disabled:bg-[#25D366]"
                  >
                    {patientNoteSent ? (
                      <>✓ Sent</>
                    ) : (
                      <>Send to Patient via WhatsApp ↗</>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom action row */}
            <div className="shrink-0 border-t border-border px-8 py-5 flex items-center justify-between bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
              <Button
                variant="outline"
                className="h-10 px-5 text-sm font-semibold rounded-lg gap-2"
                onClick={() => router.push(`/admin/patients/${params.id}/guide`)}
              >
                ← Update Guide
              </Button>
              <Button
                variant="outline"
                className="h-10 px-5 text-sm font-semibold border-primary/30 text-primary hover:bg-primary/5 rounded-lg gap-2"
                onClick={() => setScheduleModalOpen(true)}
              >
                Schedule Next Session →
              </Button>
            </div>
          </section>
        </div>
      </div>

      {/* Schedule Next Session Modal */}
      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Next Session for Lily Tan</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-5 max-h-[60vh] overflow-y-auto">
            
            {/* Date Selection */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-3 uppercase tracking-wider">Select Date</label>
              <div className="flex gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar">
                {availableDates.map((date, idx) => {
                  const isSelected = selectedDate?.getTime() === date.getTime();
                  return (
                    <button
                      key={idx}
                      onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                      className={cn(
                        "snap-start flex flex-col items-center justify-center min-w-[64px] h-[80px] rounded-xl border transition-all",
                        isSelected
                          ? "bg-primary border-primary text-white shadow-sm scale-105"
                          : "bg-white border-border text-text-primary hover:border-primary/30"
                      )}
                    >
                      <span className={cn("text-[10px] font-semibold uppercase", isSelected ? "text-white/80" : "text-text-secondary")}>
                        {format(date, "EEE")}
                      </span>
                      <span className="text-xl font-bold mt-0.5">{format(date, "d")}</span>
                      <span className={cn("text-[9px] uppercase font-bold", isSelected ? "text-white/80" : "text-text-secondary")}>
                        {format(date, "MMM")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-3 uppercase tracking-wider">Select Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => {
                    const unavailable = isUnavailable(selectedDate, time);
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        disabled={unavailable}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "h-10 rounded-[10px] border font-semibold transition-all flex items-center justify-center text-xs",
                          unavailable
                            ? "bg-surface-depth border-border text-text-tertiary cursor-not-allowed opacity-50"
                            : isSelected
                              ? "bg-primary border-primary text-white"
                              : "bg-white border-border text-text-primary hover:border-primary/40 hover:bg-primary/5"
                        )}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {selectedDate && selectedTime && (
               <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                 <p className="text-sm font-medium text-main text-center">
                   Selected: {format(selectedDate, "EEEE d MMMM yyyy")} &mdash; {selectedTime} (30 min)
                 </p>
               </div>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
             <Button variant="outline" onClick={() => setScheduleModalOpen(false)}>Cancel</Button>
             <Button disabled={!selectedDate || !selectedTime} onClick={handleConfirmSchedule}>
               Confirm &amp; Notify Patient
             </Button>
          </div>
        </DialogContent>
      </Dialog>

    </AdminLayout>
  );
}

function VitalCard({ label, value, unit, alert = false }: { label: string; value: string; unit: string; alert?: boolean; }) {
  return (
    <div className={cn("rounded-lg p-2.5 border text-center", alert ? "bg-red-50 border-red-200" : "bg-white border-border")}>
      <p className={cn("text-[10px] font-bold uppercase tracking-[0.1em] mb-1", alert ? "text-red-500" : "text-text-secondary")}>{label}</p>
      <p className={cn("text-lg font-bold leading-none", alert ? "text-red-700" : "text-main")}>{value}</p>
      <p className={cn("text-[10px] mt-0.5", alert ? "text-red-400" : "text-text-secondary")}>{unit}</p>
    </div>
  );
}
