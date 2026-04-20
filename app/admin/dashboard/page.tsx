"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";
import { Users, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityItem {
  id: string;
  patientId: string;
  patientName: string;
  readingDate: string;
  fastingBloodSugar: number;
  bloodPressureSystolic: number;
  submittedAt: string;
}

interface DashboardStats {
  activePatients: number;
  recentReadingsCount: number;
  recentActivity: RecentActivityItem[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readStr(obj: Record<string, unknown>, key: string): string {
  const v = Reflect.get(obj, key);
  return typeof v === "string" ? v : "";
}

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    activePatients: 0,
    recentReadingsCount: 0,
    recentActivity: [],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }
    let cancelled = false;
    const load = async (): Promise<void> => {
      try {
        const res = await fetch("/api/admin/stats", { credentials: "include" });
        if (cancelled || !res.ok) {
          return;
        }
        const bodyUnknown: unknown = await res.json();
        if (!isRecord(bodyUnknown)) {
          return;
        }
        const ap = Reflect.get(bodyUnknown, "activePatients");
        const rc = Reflect.get(bodyUnknown, "recentReadingsCount");
        const ra = Reflect.get(bodyUnknown, "recentActivity");
        const activityList: RecentActivityItem[] = [];
        if (Array.isArray(ra)) {
          for (const row of ra) {
            if (!isRecord(row)) {
              continue;
            }
            activityList.push({
              id: readStr(row, "id"),
              patientId: readStr(row, "patientId"),
              patientName: readStr(row, "patientName"),
              readingDate: readStr(row, "readingDate"),
              fastingBloodSugar: Number(Reflect.get(row, "fastingBloodSugar")),
              bloodPressureSystolic: Number(Reflect.get(row, "bloodPressureSystolic")),
              submittedAt: readStr(row, "submittedAt"),
            });
          }
        }
        setStats({
          activePatients: typeof ap === "number" && Number.isFinite(ap) ? ap : 0,
          recentReadingsCount: typeof rc === "number" && Number.isFinite(rc) ? rc : 0,
          recentActivity: activityList,
        });
      } catch {
        /* keep defaults */
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [mounted]);

  if (!mounted) {
    return (
      <AdminLayout>
        <AdminPageSkeleton />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1C1917]">Overview</h1>
          <p className="text-[#78716C] mt-1">Good morning, Dr. Jasmine. Here&apos;s what&apos;s happening today.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-[20px] border border-[rgba(28,25,23,0.06)] shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-150">
            <div className="w-10 h-10 bg-primary/[0.08] text-primary flex items-center justify-center rounded-xl mb-4">
              <Users size={20} />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <p className="text-[#78716C] font-medium text-sm">Total Active Patients</p>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-bold text-[#1C1917]">{stats.activePatients}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[20px] border border-[rgba(28,25,23,0.06)] shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-150">
            <div className="w-10 h-10 bg-primary/[0.08] text-primary flex items-center justify-center rounded-xl mb-4">
              <TrendingUp size={20} />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <p className="text-[#78716C] font-medium text-sm">Readings (7 days)</p>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-bold text-[#1C1917]">{stats.recentReadingsCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-[rgba(28,25,23,0.06)] overflow-hidden shadow-card">
          <div className="p-6 border-b border-[#E5DFD8] flex justify-between items-center bg-[#FAF8F5]">
            <h2 className="text-xl font-bold text-[#1C1917]">Recent Activity</h2>
            <Link href="/admin/patients" className="text-primary font-semibold text-sm hover:underline">
              View Directory &rarr;
            </Link>
          </div>
          <div className="divide-y divide-[#E5DFD8]">
            {stats.recentActivity.length === 0 ? (
              <div className="p-6 text-sm text-[#78716C]">No readings submitted yet.</div>
            ) : (
              stats.recentActivity.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/patients/${item.patientId}`}
                  className="block p-6 hover:bg-[#EDE8E1] transition-colors flex items-start gap-4 group"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[#1C1917] font-semibold group-hover:text-primary transition-colors">
                      {item.patientName}{" "}
                      <span className="text-[#78716C] font-normal ml-2">Logged a reading</span>
                    </p>
                    <p className="text-sm text-[#78716C] mt-1">
                      Fasting {item.fastingBloodSugar} mmol/L and BP {item.bloodPressureSystolic} mmHg
                    </p>
                    <p className="text-xs text-[#A8A29E] mt-2">
                      {item.submittedAt.length > 0
                        ? formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true })
                        : ""}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
