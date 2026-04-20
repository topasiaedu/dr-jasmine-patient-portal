"use client";

import { useEffect, useMemo, useState, type MouseEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";
import { Copy, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

interface PatientListRow {
  id: string;
  ghl_contact_id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  last_reading_date: string | null;
}

function formatPortalBase(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return raw.replace(/\/$/, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readStringKey(obj: Record<string, unknown>, key: string): string {
  const v = Reflect.get(obj, key);
  return typeof v === "string" ? v : "";
}

export default function AdminPatientsPage(): ReactElement {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [patients, setPatients] = useState<PatientListRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }
    let cancelled = false;
    const load = async (): Promise<void> => {
      const res = await fetch("/api/admin/patients", { credentials: "include" });
      if (cancelled) {
        return;
      }
      if (!res.ok) {
        setLoadError("Could not load patients.");
        setPatients([]);
        return;
      }
      const bodyUnknown: unknown = await res.json();
      const rawPatients = isRecord(bodyUnknown) ? Reflect.get(bodyUnknown, "patients") : undefined;
      const rawList = Array.isArray(rawPatients) ? rawPatients : [];

      const parsed: PatientListRow[] = [];
      for (const item of rawList) {
        if (!isRecord(item)) {
          continue;
        }
        const lastRaw = Reflect.get(item, "last_reading_date");
        const lastReading = typeof lastRaw === "string" ? lastRaw : lastRaw === null ? null : null;
        parsed.push({
          id: readStringKey(item, "id"),
          ghl_contact_id: readStringKey(item, "ghl_contact_id"),
          full_name: readStringKey(item, "full_name"),
          email: readStringKey(item, "email"),
          phone: readStringKey(item, "phone"),
          status: readStringKey(item, "status"),
          created_at: readStringKey(item, "created_at"),
          last_reading_date: lastReading,
        });
      }
      setPatients(parsed);
      setLoadError(null);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [mounted]);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        p.full_name.toLowerCase().includes(q) ||
        p.phone.includes(searchQuery.trim()) ||
        p.email.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [patients, searchQuery, statusFilter]);

  const handleCopyLink = (e: MouseEvent, ghlContactId: string): void => {
    e.stopPropagation();
    const base = formatPortalBase();
    const url = base.length > 0 ? `${base}/p/${ghlContactId}` : `/p/${ghlContactId}`;
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

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-main">Patient Directory</h1>
            <p className="text-secondary mt-1">Manage and track your patients safely.</p>
          </div>

          <Link
            href="/admin/patients/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-primary-muted to-primary px-5 py-2.5 font-semibold text-white shadow-btn-primary transition-colors"
          >
            <Plus size={18} />
            Add Patient
          </Link>
        </div>

        {loadError ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {loadError}
          </div>
        ) : null}

        <div className="bg-white rounded-[20px] border border-[rgba(28,25,23,0.06)] shadow-card overflow-hidden">
          <div className="p-4 border-b border-border flex gap-4 bg-bg-main/80">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input
                type="text"
                placeholder="Search name, phone or email…"
                className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="bg-white border border-border rounded-xl text-sm px-3 py-2 text-main font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="booked">Booked</option>
              <option value="onboarding">Onboarding</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F5F2] text-left border-b border-border">
                  <th className="px-6 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Last reading
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPatients.length === 0 && !loadError ? (
                  <tr>
                    <td className="p-8 text-secondary text-sm" colSpan={5}>
                      {patients.length === 0 ? (
                        <>
                          No patients yet. Use <strong>Add Patient</strong> to create one in Supabase and GoHighLevel.
                        </>
                      ) : (
                        "No patients match your search or filter."
                      )}
                    </td>
                  </tr>
                ) : null}
                {filteredPatients.map((p) => {
                  const statusLabel =
                    p.status === "active"
                      ? "Active"
                      : p.status === "booked"
                        ? "Booked"
                        : "Onboarding";
                  const statusClass =
                    p.status === "active"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : p.status === "booked"
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-gray-100 text-gray-800 border-gray-200";

                  const lastReadingDisplay =
                    p.last_reading_date !== null ? (
                      format(parseISO(p.last_reading_date), "d MMM")
                    ) : (
                      <span className="text-text-secondary">No readings yet</span>
                    );

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-depth transition-colors group cursor-pointer"
                      onClick={() => router.push(`/admin/patients/${p.id}`)}
                    >
                      <td className="p-4 pl-6">
                        <span className="font-bold text-main group-hover:text-primary transition-colors">
                          {p.full_name}
                        </span>
                      </td>
                      <td className="p-4">
                        <a
                          href={`tel:${p.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm font-medium text-main hover:text-primary"
                        >
                          {p.phone}
                        </a>
                        <p className="text-xs text-text-secondary">{p.email}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusClass}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-text-secondary">{lastReadingDisplay}</td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(e, p.ghl_contact_id)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-secondary hover:text-main inline-flex"
                          aria-label="Copy portal link"
                        >
                          <Copy size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
