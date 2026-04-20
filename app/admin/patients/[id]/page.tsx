"use client";

import { useEffect, useState, type ReactElement } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";
import { ArrowLeft, Phone, Mail, FileText, Copy, Camera } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { AdminReadingJson } from "@/lib/types/admin-reading";

interface AdminPatientDetail {
  id: string;
  ghl_contact_id: string;
  full_name: string;
  email: string;
  phone: string;
  reading_cadence_note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function safeFormat(dateStr: string | undefined | null, formatStr: string, fallback = "—"): string {
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

function formatPortalBase(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return raw.replace(/\/$/, "");
}

/**
 * Admin patient profile — Supabase + recent readings (Phase 1).
 */
export default function AdminPatientProfilePage(): ReactElement {
  const params = useParams();
  const patientId = typeof params?.id === "string" ? params.id : "";

  const [mounted, setMounted] = useState(false);
  /** Starts true so we do not flash “not found” before the first fetch completes. */
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<AdminPatientDetail | null>(null);
  const [readings, setReadings] = useState<AdminReadingJson[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }
    if (patientId.length === 0) {
      setLoading(false);
      setError("Invalid patient id.");
      return;
    }
    let cancelled = false;
    const load = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      const [pRes, rRes] = await Promise.all([
        fetch(`/api/admin/patients/${patientId}`, { credentials: "include" }),
        fetch(`/api/admin/patients/${patientId}/readings`, { credentials: "include" }),
      ]);
      if (cancelled) {
        return;
      }
      if (!pRes.ok) {
        setError(pRes.status === 404 ? "Patient not found." : "Could not load patient.");
        setPatient(null);
        setReadings([]);
        setLoading(false);
        return;
      }
      const pBody: unknown = await pRes.json();
      const pat =
        typeof pBody === "object" && pBody !== null && "patient" in pBody
          ? (pBody as { patient: AdminPatientDetail }).patient
          : null;
      setPatient(pat);

      if (rRes.ok) {
        const rBody: unknown = await rRes.json();
        const list =
          typeof rBody === "object" && rBody !== null && "readings" in rBody && Array.isArray((rBody as { readings: unknown }).readings)
            ? (rBody as { readings: AdminReadingJson[] }).readings
            : [];
        setReadings(list);
      } else {
        setReadings([]);
      }
      setLoading(false);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [mounted, patientId]);

  const copyPortalLink = (): void => {
    if (!patient) {
      return;
    }
    const base = formatPortalBase();
    const url = base.length > 0 ? `${base}/p/${patient.ghl_contact_id}` : `/p/${patient.ghl_contact_id}`;
    void navigator.clipboard.writeText(url);
    toast.success("Portal link copied.");
  };

  if (!mounted) {
    return (
      <AdminLayout>
        <AdminPageSkeleton />
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <AdminPageSkeleton />
      </AdminLayout>
    );
  }

  if (error || !patient) {
    return (
      <AdminLayout>
        <div className="max-w-3xl mx-auto p-8 space-y-4">
          <Link href="/admin/patients" className="inline-flex items-center gap-2 text-sm text-secondary hover:text-main">
            <ArrowLeft size={16} /> Back to directory
          </Link>
          <p className="text-main font-semibold">{error ?? "Patient not found."}</p>
        </div>
      </AdminLayout>
    );
  }

  const statusLabel =
    patient.status === "active" ? "Active" : patient.status === "booked" ? "Booked" : "Onboarding";
  const statusPillClass =
    patient.status === "active"
      ? "bg-green-100 text-green-800 border-green-200"
      : patient.status === "booked"
        ? "bg-amber-100 text-amber-800 border-amber-200"
        : "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <Link
              href="/admin/patients"
              className="p-2 bg-white border border-border rounded-xl hover:bg-gray-50 text-main mt-1 self-start"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-main">{patient.full_name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-widest ${statusPillClass}`}>
                  {statusLabel}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-secondary font-medium">
                <span className="flex items-center gap-1.5">
                  <Phone size={14} /> {patient.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail size={14} /> {patient.email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/patients/${patient.id}/consult`}
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-11 rounded-xl inline-flex items-center px-4 font-semibold"
              )}
            >
              Open Consult Workspace
            </Link>
            <Link
              href={`/admin/patients/${patient.id}/guide`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 rounded-xl inline-flex items-center px-4"
              )}
            >
              <FileText size={16} className="mr-2" /> Edit guide
            </Link>
            <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={copyPortalLink}>
              <Copy size={16} className="mr-2" /> Copy portal link
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-6 mt-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-main">Patient info</h2>

              <div>
                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                  Reading cadence
                </p>
                <p className="text-sm text-main whitespace-pre-wrap">
                  {patient.reading_cadence_note && patient.reading_cadence_note.length > 0
                    ? patient.reading_cadence_note
                    : <span className="text-text-secondary italic">No note saved.</span>}
                </p>
              </div>

              <p className="text-xs text-text-secondary border-t border-border pt-4">
                Joined {safeFormat(patient.created_at, "d MMM yyyy")}
              </p>
            </div>
          </div>

          <div className="md:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <h2 className="text-xl font-bold text-main mb-4">All readings</h2>
              {readings.length === 0 ? (
                <p className="text-sm text-secondary">No readings logged yet.</p>
              ) : (
                <>
                  {readings.length > 20 ? (
                    <p className="text-xs text-text-secondary mb-3">Showing all {readings.length} readings</p>
                  ) : null}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-[#F7F5F2] text-left">
                          <th className="px-3 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-3 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider">
                            Fasting
                          </th>
                          <th className="px-3 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider">
                            Post-Din
                          </th>
                          <th className="px-3 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider">BP</th>
                          <th className="px-3 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider">
                            Pulse
                          </th>
                          <th className="px-3 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider">
                            Weight
                          </th>
                          <th className="px-3 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider">
                            Waist
                          </th>
                          <th className="px-3 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider">Via</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {readings.map((rdg) => {
                          const fastingAlert = rdg.fastingBloodSugar > 7.0;
                          const bpAlert = rdg.bloodPressureSystolic > 135;
                          return (
                            <tr key={rdg.id}>
                              <td className="px-3 py-2 text-main">{safeFormat(rdg.readingDate, "d MMM")}</td>
                              <td
                                className={cn(
                                  "px-3 py-2",
                                  fastingAlert ? "text-danger font-bold" : "text-main"
                                )}
                              >
                                {rdg.fastingBloodSugar}{" "}
                                <span className="text-[10px] text-text-secondary font-normal">mmol</span>
                              </td>
                              <td className="px-3 py-2 text-main">
                                {rdg.postDinnerBloodSugar}{" "}
                                <span className="text-[10px] text-text-secondary font-normal">mmol</span>
                              </td>
                              <td
                                className={cn(
                                  "px-3 py-2",
                                  bpAlert ? "text-danger font-bold" : "text-main"
                                )}
                              >
                                {`${rdg.bloodPressureSystolic}/${rdg.bloodPressureDiastolic}`}
                              </td>
                              <td className="px-3 py-2 text-main">
                                {rdg.pulseRate}{" "}
                                <span className="text-[10px] text-text-secondary font-normal">bpm</span>
                              </td>
                              <td className="px-3 py-2 text-main">
                                {rdg.weightKg}{" "}
                                <span className="text-[10px] text-text-secondary font-normal">kg</span>
                              </td>
                              <td className="px-3 py-2 text-main">
                                {rdg.waistlineCm}{" "}
                                <span className="text-[10px] text-text-secondary font-normal">cm</span>
                              </td>
                              <td className="px-3 py-2 text-center text-text-secondary">
                                {rdg.entryMethod === "photo_extracted" ? (
                                  <Camera size={16} className="inline text-main" aria-label="Photo entry" />
                                ) : null}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
