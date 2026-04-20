"use client";

import { useEffect, useState, type ReactElement } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";
import type { AdminReadingJson } from "@/lib/types/admin-reading";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  AlertTriangle,
  ArrowLeft,
  Check,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";

interface AdminPatientBasic {
  id: string;
  ghl_contact_id: string;
  full_name: string;
  phone: string;
  status: string;
}

interface AdminOnboarding {
  chief_complaint: string;
  existing_conditions: string[];
  current_medications: string[];
  allergies: string[];
  dietary_notes: string;
  additional_notes: string;
}

interface ConsultNote {
  id: string;
  patientId: string;
  appointmentId: string | null;
  privateContent: string;
  forPatientContent: string;
  createdAt: string;
  updatedAt: string;
}

function safeFormat(
  dateStr: string | undefined | null,
  formatStr: string,
  fallback = "—"
): string {
  if (!dateStr) {
    return fallback;
  }
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, formatStr) : fallback;
  } catch {
    return fallback;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(obj: Record<string, unknown>, key: string): string {
  const v = Reflect.get(obj, key);
  return typeof v === "string" ? v : "";
}

export default function ConsultationPanel(): ReactElement {
  const router = useRouter();
  const params = useParams();
  const patientId = typeof params?.id === "string" ? params.id : "";

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [patient, setPatient] = useState<AdminPatientBasic | null>(null);

  const [readings, setReadings] = useState<AdminReadingJson[]>([]);
  const [onboarding, setOnboarding] = useState<AdminOnboarding | null>(null);
  const [notes, setNotes] = useState<ConsultNote[]>([]);

  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [onboardingExpanded, setOnboardingExpanded] = useState(false);

  const [notePrivate, setNotePrivate] = useState("");
  const [notePatient, setNotePatient] = useState("");
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [patientNoteSent, setPatientNoteSent] = useState(false);
  const [sessionMarked, setSessionMarked] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || patientId.length === 0) {
      return;
    }

    let cancelled = false;

    const load = async (): Promise<void> => {
      setLoading(true);
      setLoadError(null);

      const [pRes, rRes, oRes, nRes] = await Promise.all([
        fetch(`/api/admin/patients/${patientId}`, { credentials: "include" }),
        fetch(`/api/admin/patients/${patientId}/readings`, { credentials: "include" }),
        fetch(`/api/admin/patients/${patientId}/onboarding`, { credentials: "include" }),
        fetch(`/api/admin/patients/${patientId}/notes`, { credentials: "include" }),
      ]);

      if (cancelled) {
        return;
      }

      if (pRes.status === 401) {
        router.replace("/admin/login");
        return;
      }

      if (!pRes.ok) {
        setPatient(null);
        setLoadError(pRes.status === 404 ? "Patient not found." : "Could not load patient.");
        setLoading(false);
        return;
      }

      const pBody: unknown = await pRes.json();
      const patientUnknown =
        typeof pBody === "object" && pBody !== null && "patient" in pBody
          ? Reflect.get(pBody, "patient")
          : null;

      if (!isRecord(patientUnknown)) {
        setLoadError("Invalid patient response.");
        setLoading(false);
        return;
      }

      setPatient({
        id: readString(patientUnknown, "id"),
        ghl_contact_id: readString(patientUnknown, "ghl_contact_id"),
        full_name: readString(patientUnknown, "full_name"),
        phone: readString(patientUnknown, "phone"),
        status: readString(patientUnknown, "status"),
      });

      if (rRes.ok) {
        const rBody: unknown = await rRes.json();
        const rawReadings =
          isRecord(rBody) && Array.isArray(Reflect.get(rBody, "readings"))
            ? Reflect.get(rBody, "readings")
            : [];
        const list: AdminReadingJson[] = [];
        if (Array.isArray(rawReadings)) {
          for (const row of rawReadings) {
            if (!isRecord(row)) {
              continue;
            }
            list.push({
              id: readString(row, "id"),
              patientId: readString(row, "patientId"),
              readingDate: readString(row, "readingDate"),
              fastingBloodSugar: Number(Reflect.get(row, "fastingBloodSugar")),
              postDinnerBloodSugar: Number(Reflect.get(row, "postDinnerBloodSugar")),
              bloodPressureSystolic: Number(Reflect.get(row, "bloodPressureSystolic")),
              bloodPressureDiastolic: Number(Reflect.get(row, "bloodPressureDiastolic")),
              pulseRate: Number(Reflect.get(row, "pulseRate")),
              weightKg: Number(Reflect.get(row, "weightKg")),
              waistlineCm: Number(Reflect.get(row, "waistlineCm")),
              entryMethod:
                Reflect.get(row, "entryMethod") === "photo_extracted" ? "photo_extracted" : "manual",
              submittedAt: readString(row, "submittedAt"),
            });
          }
        }
        setReadings(list);
      } else {
        setReadings([]);
      }

      if (oRes.ok) {
        const oBody: unknown = await oRes.json();
        const ob = isRecord(oBody) ? Reflect.get(oBody, "onboarding") : null;
        if (ob !== null && isRecord(ob)) {
          const ec = Reflect.get(ob, "existing_conditions");
          const meds = Reflect.get(ob, "current_medications");
          const alle = Reflect.get(ob, "allergies");
          setOnboarding({
            chief_complaint: readString(ob, "chief_complaint"),
            existing_conditions: Array.isArray(ec) ? ec.filter((x): x is string => typeof x === "string") : [],
            current_medications: Array.isArray(meds)
              ? meds.filter((x): x is string => typeof x === "string")
              : [],
            allergies: Array.isArray(alle) ? alle.filter((x): x is string => typeof x === "string") : [],
            dietary_notes: readString(ob, "dietary_notes"),
            additional_notes: readString(ob, "additional_notes"),
          });
        } else {
          setOnboarding(null);
        }
      } else {
        setOnboarding(null);
      }

      if (nRes.ok) {
        const nBody: unknown = await nRes.json();
        const rawNotes =
          isRecord(nBody) && Array.isArray(Reflect.get(nBody, "notes"))
            ? (Reflect.get(nBody, "notes") as unknown[])
            : [];
        const parsedNotes: ConsultNote[] = [];
        for (const row of rawNotes) {
          if (!isRecord(row)) {
            continue;
          }
          parsedNotes.push({
            id: readString(row, "id"),
            patientId: readString(row, "patientId"),
            appointmentId:
              Reflect.get(row, "appointmentId") === null ? null : readString(row, "appointmentId"),
            privateContent: readString(row, "privateContent"),
            forPatientContent: readString(row, "forPatientContent"),
            createdAt: readString(row, "createdAt"),
            updatedAt: readString(row, "updatedAt"),
          });
        }
        setNotes(parsedNotes);
        // Always start with a blank note for the current session.
        // Previous notes are read-only history shown in the sidebar.
        setNotePrivate("");
        setNotePatient("");
        setCurrentNoteId(null);
        setPatientNoteSent(false);
      } else {
        setNotes([]);
      }

      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [mounted, patientId, router]);

  const handleSaveNote = async (): Promise<void> => {
    const res = await fetch(`/api/admin/patients/${patientId}/notes`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        privateContent: notePrivate,
        ...(currentNoteId !== null ? { noteId: currentNoteId } : {}),
      }),
    });

    if (!res.ok) {
      toast.error("Could not save notes.");
      return;
    }

    const bodyUnknown: unknown = await res.json();
    const noteRaw = isRecord(bodyUnknown) ? Reflect.get(bodyUnknown, "note") : undefined;
    if (isRecord(noteRaw)) {
      const nid = readString(noteRaw, "id");
      if (nid.length > 0) {
        setCurrentNoteId(nid);
      }
    }

    await refreshNotes();
    toast.success("Notes saved.");
  };

  const handleSendToPatient = async (): Promise<void> => {
    if (!notePatient.trim() || patientNoteSent) {
      return;
    }

    // Always inserts a NEW row — the patient-facing note is intentionally
    // separate from the private session note so they appear as distinct
    // entries in the Previous Notes list.
    const res = await fetch(`/api/admin/patients/${patientId}/notes`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        forPatientContent: notePatient,
      }),
    });

    if (!res.ok) {
      toast.error("Could not save note.");
      return;
    }

    const bodyUnknown: unknown = await res.json();
    // Intentionally not storing the returned note id — patient notes
    // are one-shot inserts and do not need to be referenced again.
    void bodyUnknown;

    await refreshNotes();
    setPatientNoteSent(true);
    toast.success("Note saved. WhatsApp delivery will be added in Phase 2.");
  };

  const refreshNotes = async (): Promise<void> => {
    const nRes = await fetch(`/api/admin/patients/${patientId}/notes`, { credentials: "include" });
    if (!nRes.ok) {
      return;
    }
    const nBody: unknown = await nRes.json();
    const rawNotes =
      isRecord(nBody) && Array.isArray(Reflect.get(nBody, "notes"))
        ? (Reflect.get(nBody, "notes") as unknown[])
        : [];
    const parsedNotes: ConsultNote[] = [];
    for (const row of rawNotes) {
      if (!isRecord(row)) {
        continue;
      }
      parsedNotes.push({
        id: readString(row, "id"),
        patientId: readString(row, "patientId"),
        appointmentId:
          Reflect.get(row, "appointmentId") === null ? null : readString(row, "appointmentId"),
        privateContent: readString(row, "privateContent"),
        forPatientContent: readString(row, "forPatientContent"),
        createdAt: readString(row, "createdAt"),
        updatedAt: readString(row, "updatedAt"),
      });
    }
    setNotes(parsedNotes);
  };

  const handleMarkSessionComplete = (): void => {
    setSessionMarked(true);
    toast.success("Session marked as reviewed.");
  };

  if (!mounted || loading) {
    return (
      <AdminLayout fullBleed>
        <AdminPageSkeleton />
      </AdminLayout>
    );
  }

  if (loadError || !patient) {
    return (
      <AdminLayout fullBleed>
        <div className="max-w-3xl mx-auto p-8 space-y-4">
          <Link href="/admin/patients" className="inline-flex items-center gap-2 text-sm text-secondary hover:text-main">
            <ArrowLeft size={16} /> Back to directory
          </Link>
          <p className="text-main font-semibold">{loadError ?? "Patient not found."}</p>
        </div>
      </AdminLayout>
    );
  }

  const latestReading = readings[0];
  const isFastingHigh = (val: number): boolean => val > 7.0;
  const isBpHigh = (sys: number): boolean => sys > 135;
  const wordCount = notePrivate.trim().split(/\s+/).filter((w) => w.length > 0).length;

  const conditions = onboarding?.existing_conditions ?? [];
  const medications = onboarding?.current_medications ?? [];
  const allergies = onboarding?.allergies ?? [];

  return (
    <AdminLayout fullBleed>
      <div className="flex flex-col h-screen overflow-hidden">
        <header className="shrink-0 flex items-center justify-between px-6 h-14 bg-white border-b-2 border-primary/20">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/patients/${patientId}`}
              className="text-secondary hover:text-main transition-colors flex items-center gap-1.5 text-sm font-semibold"
            >
              <ArrowLeft size={16} /> {patient.full_name}
            </Link>
          </div>
          <div />
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
              {sessionMarked ? (
                <>
                  <Check size={14} /> ✓ Completed
                </>
              ) : (
                "Mark Session Complete"
              )}
            </Button>
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
          <aside className="w-[380px] shrink-0 bg-[#F7F5F2] border-r border-border flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {latestReading && (
                <div className="p-5 border-b border-border">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-3">
                    Latest Readings &middot; {safeFormat(latestReading.readingDate, "d MMM yyyy")}
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
                    <VitalCard label="Weight" value={latestReading.weightKg.toString()} unit="kg" />
                  </div>
                </div>
              )}

              <div className="p-5 border-b border-border space-y-4">
                {!onboarding ? (
                  <p className="text-sm text-text-secondary italic">No onboarding data yet.</p>
                ) : (
                  <>
                    <div>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-2">
                        Conditions
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {conditions.map((cond) => (
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
                        {medications.map((med) => (
                          <li key={med} className="flex items-baseline gap-2">
                            <span className="w-1 h-1 rounded-full bg-text-secondary shrink-0 mt-1.5" />
                            {med}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {allergies.length > 0 && (
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.15em] mb-0.5">
                            Allergies
                          </p>
                          <p className="text-sm font-bold text-amber-900">{allergies.join(", ")}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setOnboardingExpanded(!onboardingExpanded)}
                  className="w-full h-12 px-5 flex items-center justify-between text-[11px] font-bold text-text-secondary uppercase tracking-[0.15em] hover:bg-[#EFECE8] transition-colors"
                >
                  Chief Complaint <ChevronDown size={14} className={cn("transition-transform duration-200", onboardingExpanded && "rotate-180")} />
                </button>
                {onboardingExpanded && (
                  <div className="px-5 pb-5 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-text-secondary mb-1">Chief Complaint</p>
                      <p className="text-sm text-main">
                        {onboarding?.chief_complaint && onboarding.chief_complaint.length > 0
                          ? onboarding.chief_complaint
                          : "None"}
                      </p>
                    </div>
                    <Link
                      href={`/admin/patients/${patientId}`}
                      className="inline-block mt-2 text-primary text-xs font-semibold hover:underline"
                    >
                      View full onboarding →
                    </Link>
                  </div>
                )}
              </div>

              <div className="p-5 border-b border-border">
                <div className="flex items-baseline justify-between mb-3">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em]">
                    All Readings
                  </p>
                  <span className="text-[10px] text-text-secondary">{readings.length} total</span>
                </div>
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
                      {readings.map((rdg) => (
                        <tr key={rdg.id} className="hover:bg-[#FAFAF8]">
                          <td className="py-2 px-3 font-medium text-main">{safeFormat(rdg.readingDate, "d MMM yyyy")}</td>
                          <td
                            className={cn(
                              "py-2 px-3 text-right font-bold",
                              isFastingHigh(rdg.fastingBloodSugar) ? "text-red-600" : "text-main"
                            )}
                          >
                            {rdg.fastingBloodSugar}
                          </td>
                          <td
                            className={cn(
                              "py-2 px-3 text-right font-bold",
                              isBpHigh(rdg.bloodPressureSystolic) ? "text-red-600" : "text-main"
                            )}
                          >
                            {rdg.bloodPressureSystolic}/{rdg.bloodPressureDiastolic}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-main">{rdg.weightKg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-5">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-3">
                  Previous Notes
                </p>
                {notes.length === 0 ? (
                  <p className="text-sm text-text-secondary italic">No previous notes.</p>
                ) : (
                  <div className="space-y-2">
                    {notes.map((note) => {
                      const isOpen = expandedNoteId === note.id;
                      return (
                        <div key={note.id} className="rounded-lg border border-border bg-white overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setExpandedNoteId(isOpen ? null : note.id)}
                            className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[#FAFAF8] transition-colors"
                          >
                            <span className="text-xs font-semibold text-main">
                              {safeFormat(note.createdAt, "d MMM yyyy")}
                              {note.forPatientContent.length > 0 ? (
                                <span className="text-green-600 ml-1">· Sent to patient ✓</span>
                              ) : null}
                            </span>
                            <ChevronDown size={14} className={cn("text-text-secondary transition-transform", isOpen && "rotate-180")} />
                          </button>
                          {isOpen && (
                            <div className="px-3 pb-3 border-t border-border">
                              <p
                                className={cn(
                                  "text-sm leading-relaxed pt-2.5",
                                  !note.privateContent ? "text-text-secondary italic" : "text-main"
                                )}
                              >
                                {note.privateContent || "(No private note)"}
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

          <section className="flex-1 flex flex-col bg-[#FDFCFB] min-w-0">
            <div className="flex-1 overflow-y-auto w-full">
              <div className="p-8 border-b border-border bg-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-[13px] font-bold text-main uppercase tracking-widest">SESSION NOTES</h2>
                    <p className="text-xs text-text-secondary mt-1">Only you can see this · each save creates a new entry</p>
                  </div>
                  {wordCount > 0 && <span className="text-xs text-text-secondary font-medium">{wordCount} words</span>}
                </div>
                <textarea
                  value={notePrivate}
                  onChange={(e) => setNotePrivate(e.target.value)}
                  className="w-full min-h-[200px] resize-y outline-none text-main text-[15px] leading-[1.7] placeholder:text-[#C8C3BC] bg-transparent"
                  placeholder={`Paste or type your session notes here...
These are private and will never be shown to the patient.`}
                />
                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => void handleSaveNote()}
                    variant="outline"
                    className="border-border text-main font-semibold gap-2"
                  >
                    <Save size={14} /> Save Notes
                  </Button>
                </div>
              </div>

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
                  placeholder={`Write the summary you'd like to send...
E.g. Great session! Continue your current plan. Next steps: ...`}
                />
                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => void handleSendToPatient()}
                    disabled={!notePatient.trim() || patientNoteSent}
                    className="font-bold gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white disabled:opacity-50 disabled:bg-[#25D366]"
                  >
                    {patientNoteSent ? <>✓ Sent</> : <>Send to Patient via WhatsApp ↗</>}
                  </Button>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-border px-8 py-5 flex items-center justify-start bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
              <Button
                type="button"
                variant="outline"
                className="h-10 px-5 text-sm font-semibold rounded-lg gap-2"
                onClick={() => router.push(`/admin/patients/${patientId}/guide`)}
              >
                ← Update Guide
              </Button>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}

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
}): ReactElement {
  return (
    <div
      className={cn(
        "rounded-lg p-2.5 border text-center",
        alert ? "bg-red-50 border-red-200" : "bg-white border-border"
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
      <p className={cn("text-lg font-bold leading-none", alert ? "text-red-700" : "text-main")}>{value}</p>
      <p className={cn("text-[10px] mt-0.5", alert ? "text-red-400" : "text-text-secondary")}>{unit}</p>
    </div>
  );
}
