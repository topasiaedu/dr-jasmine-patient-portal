"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";
import {
  MOCK_PATIENT,
  MOCK_READINGS,
  MOCK_ONBOARDING,
  MOCK_CONSULTATION_NOTES,
  DailyReading,
  ConsultationNote,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Save,
  PencilLine,
  ChevronDown,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";

/**
 * Safely format an ISO date string, returning fallback on failure.
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
 * Validate that a reading has every field the UI touches.
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

/**
 * Consultation workspace — Dr. Jasmine runs this alongside Zoom in a separate tab.
 * Side-by-side layout: patient context on the left, clinical notes on the right.
 * Full-bleed layout that fills all available horizontal space.
 */
export default function ConsultationPanel() {
  const router = useRouter();
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [readings, setReadings] = useState<DailyReading[]>(MOCK_READINGS);
  const [notes, setNotes] = useState<ConsultationNote[]>(MOCK_CONSULTATION_NOTES);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<Date>(new Date());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem("admin_auth")) {
      router.replace("/admin/login");
      return;
    }

    // Load localStorage readings
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

    // Load localStorage notes
    const localNotes = localStorage.getItem("demo_consultation_notes");
    if (localNotes) {
      try {
        const parsed: unknown = JSON.parse(localNotes);
        if (Array.isArray(parsed)) setNotes(parsed as ConsultationNote[]);
      } catch (e: unknown) {
        console.error("Failed to parse notes:", e);
      }
    }
  }, [router]);

  // Session timer — ticks every second
  useEffect(() => {
    if (!mounted) return;
    startTimeRef.current = new Date();
    const interval = setInterval(() => {
      const now = new Date();
      setElapsedSeconds(
        Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) {
    return (
      <AdminLayout fullBleed>
        <AdminPageSkeleton />
      </AdminLayout>
    );
  }

  /** Format elapsed seconds as mm:ss. */
  const formatTimer = (secs: number): string => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  /** End session and navigate back to patient profile. */
  const handleEndSession = () => {
    router.push(`/admin/patients/${params.id}`);
  };

  /** Save note, persist to localStorage, and clear the textarea. */
  const handleSaveNote = () => {
    if (!noteContent.trim()) return;

    const newNote: ConsultationNote = {
      id: `note-${Date.now()}`,
      patientId: "demo",
      appointmentId: null,
      content: noteContent.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem("demo_consultation_notes", JSON.stringify(updated));
    setNoteContent("");
    toast.success("Note saved.");
    textareaRef.current?.focus();
  };

  // Latest reading for the vitals strip
  const latestReading = readings[0];

  /** Determine whether a fasting value is elevated. */
  const isFastingHigh = (val: number): boolean => val > 7.0;

  /** Determine whether systolic BP is elevated. */
  const isBpHigh = (sys: number): boolean => sys > 135;

  const wordCount = noteContent
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return (
    <AdminLayout fullBleed>
      <div className="flex flex-col h-screen overflow-hidden">
        {/* ── Session Header Bar ── */}
        <header className="shrink-0 flex items-center justify-between px-6 h-14 bg-white border-b-2 border-primary/20">
          {/* Left: patient identity */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <h1 className="text-[15px] font-bold text-main truncate">
              {MOCK_PATIENT.fullName}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-200 uppercase tracking-widest shrink-0">
              Active
            </span>
          </div>

          {/* Center: consultation label + timer */}
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold text-main hidden sm:inline">
              Consultation #5
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs text-text-secondary bg-[#F5F3F0] px-2.5 py-1 rounded-lg">
              <Clock size={12} />
              {formatTimer(elapsedSeconds)}
            </div>
          </div>

          {/* Right: end session */}
          <Button
            variant="outline"
            onClick={handleEndSession}
            className="h-9 text-sm font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 rounded-lg gap-2"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">End Session</span>
          </Button>
        </header>

        {/* ── Two-Panel Workspace ── */}
        <div className="flex-1 flex min-h-0">
          {/* ──── LEFT PANEL: Patient Context ──── */}
          <aside className="w-[380px] shrink-0 bg-[#F7F5F2] border-r border-border flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {/* Quick Vitals Strip */}
              {latestReading && (
                <div className="p-5 border-b border-border">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-3">
                    Latest Readings &middot;{" "}
                    {safeFormat(latestReading.readingDate, "d MMM yyyy")}
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    <VitalCard
                      label="Fasting"
                      value={latestReading.fastingBloodSugar.toString()}
                      unit="mmol/L"
                      alert={isFastingHigh(latestReading.fastingBloodSugar)}
                    />
                    <VitalCard
                      label="Blood Pressure"
                      value={`${latestReading.bloodPressureSystolic}/${latestReading.bloodPressureDiastolic}`}
                      unit="mmHg"
                      alert={isBpHigh(latestReading.bloodPressureSystolic)}
                    />
                    <VitalCard
                      label="Weight"
                      value={latestReading.weightKg.toString()}
                      unit="kg"
                    />
                  </div>
                </div>
              )}

              {/* Medical Info */}
              <div className="p-5 border-b border-border space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-2">
                    Conditions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {MOCK_ONBOARDING.existingConditions.map((cond) => (
                      <span
                        key={cond}
                        className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs font-semibold border border-red-100"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-2">
                    Medications
                  </p>
                  <ul className="text-sm text-main font-medium space-y-0.5">
                    {MOCK_ONBOARDING.currentMedications.map((med) => (
                      <li key={med} className="flex items-baseline gap-2">
                        <span className="w-1 h-1 rounded-full bg-text-secondary shrink-0 mt-1.5" />
                        {med}
                      </li>
                    ))}
                  </ul>
                </div>
                {MOCK_ONBOARDING.allergies.length > 0 && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <AlertTriangle
                      size={14}
                      className="text-amber-600 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.15em] mb-0.5">
                        Allergies
                      </p>
                      <p className="text-sm font-bold text-amber-900">
                        {MOCK_ONBOARDING.allergies.join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Readings Table */}
              <div className="p-5 border-b border-border">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-3">
                  Recent Readings
                </p>
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
                          <td className="py-2 px-3 font-medium text-main">
                            {safeFormat(rdg.readingDate, "d MMM")}
                          </td>
                          <td
                            className={cn(
                              "py-2 px-3 text-right font-bold",
                              isFastingHigh(rdg.fastingBloodSugar)
                                ? "text-red-600"
                                : "text-main"
                            )}
                          >
                            {rdg.fastingBloodSugar}
                          </td>
                          <td
                            className={cn(
                              "py-2 px-3 text-right font-bold",
                              isBpHigh(rdg.bloodPressureSystolic)
                                ? "text-red-600"
                                : "text-main"
                            )}
                          >
                            {rdg.bloodPressureSystolic}/{rdg.bloodPressureDiastolic}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-main">
                            {rdg.weightKg}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Previous Consultation Notes */}
              <div className="p-5">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-3">
                  Previous Notes
                </p>
                {notes.length === 0 ? (
                  <p className="text-sm text-text-secondary italic">
                    No previous notes.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {notes.map((note) => {
                      const isOpen = expandedNoteId === note.id;
                      return (
                        <div
                          key={note.id}
                          className="rounded-lg border border-border bg-white overflow-hidden"
                        >
                          <button
                            onClick={() =>
                              setExpandedNoteId(isOpen ? null : note.id)
                            }
                            className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[#FAFAF8] transition-colors"
                          >
                            <span className="text-xs font-semibold text-main">
                              {safeFormat(note.createdAt, "d MMM yyyy, h:mm a")}
                            </span>
                            <ChevronDown
                              size={14}
                              className={cn(
                                "text-text-secondary transition-transform",
                                isOpen && "rotate-180"
                              )}
                            />
                          </button>
                          {isOpen && (
                            <div className="px-3 pb-3 border-t border-border">
                              <p className="text-sm text-main leading-relaxed pt-2.5">
                                {note.content}
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

            {/* Bottom action: Modify Guide */}
            <div className="shrink-0 p-4 border-t border-border bg-[#F7F5F2]">
              <Button
                variant="outline"
                className="w-full h-10 text-sm font-semibold border-primary/30 text-primary hover:bg-primary/5 rounded-lg gap-2"
                onClick={() =>
                  router.push(`/admin/patients/${params.id}/guide`)
                }
              >
                <PencilLine size={14} /> Modify Patient Guide
              </Button>
            </div>
          </aside>

          {/* ──── RIGHT PANEL: Clinical Notes ──── */}
          <section className="flex-1 flex flex-col bg-white min-w-0">
            {/* Notes header */}
            <div className="shrink-0 flex items-center justify-between px-8 py-4 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-main">Session Notes</h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  {format(new Date(), "EEEE, d MMMM yyyy")}
                </p>
              </div>
              {wordCount > 0 && (
                <span className="text-xs text-text-secondary font-medium">
                  {wordCount} {wordCount === 1 ? "word" : "words"}
                </span>
              )}
            </div>

            {/* Writing surface */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-8 py-6 h-full">
                <textarea
                  ref={textareaRef}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full h-full resize-none outline-none text-main text-[16px] leading-[1.8] placeholder:text-[#C8C3BC] bg-transparent"
                  placeholder="Start writing your clinical assessment...

E.g. Patient reports feeling less bloated. Fasting readings improved from 7.1 to 6.2 over the past week. Blood pressure trending down. Advised to continue current LCHF plan with no changes. Will review again in 2 weeks."
                />
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="shrink-0 border-t border-border px-8 py-4 flex items-center justify-end gap-4 bg-[#FDFCFB]">
              <Button
                onClick={handleSaveNote}
                disabled={!noteContent.trim()}
                className="h-10 px-6 rounded-lg gap-2 font-bold bg-primary hover:bg-primary-hover disabled:opacity-40"
              >
                <Save size={15} /> Save Note
              </Button>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}

/**
 * Small vital stat card for the context panel.
 * Shows label, large value, unit, and an optional alert tint.
 */
function VitalCard({
  label,
  value,
  unit,
  alert = false,
}: {
  label: string;
  value: string;
  unit: string;
  alert?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg p-2.5 border text-center",
        alert
          ? "bg-red-50 border-red-200"
          : "bg-white border-border"
      )}
    >
      <p
        className={cn(
          "text-[10px] font-bold uppercase tracking-[0.1em] mb-1",
          alert ? "text-red-500" : "text-text-secondary"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "text-lg font-bold leading-none",
          alert ? "text-red-700" : "text-main"
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          "text-[10px] mt-0.5",
          alert ? "text-red-400" : "text-text-secondary"
        )}
      >
        {unit}
      </p>
    </div>
  );
}
