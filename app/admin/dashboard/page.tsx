"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";
import { Users, AlertCircle, Calendar, LineChart } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const reviewCount = 7;

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

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
        
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1C1917]">Overview</h1>
          <p className="text-[#78716C] mt-1">Good morning, Dr. Jasmine. Here&apos;s what&apos;s happening today.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="bg-white p-6 rounded-[20px] border border-[rgba(28,25,23,0.06)] shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-150">
            <div className="w-10 h-10 bg-primary/[0.08] text-primary flex items-center justify-center rounded-xl mb-4">
              <Users size={20} />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <p className="text-[#78716C] font-medium text-sm">Total Active Patients</p>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-bold text-[#1C1917]">42</p>
              <span className="text-sm font-semibold text-green-600">↑ 3 this week</span>
            </div>
          </div>
          <div className={`p-6 rounded-[20px] border border-[rgba(28,25,23,0.06)] shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-150 ${reviewCount > 0 ? "bg-[#FAF0D6] border-[#B8860B]/20" : "bg-white"}`}>
            <div className="w-10 h-10 bg-[#FAF0D6] text-[#B8860B] flex items-center justify-center rounded-xl mb-4">
              <AlertCircle size={20} />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#B8860B]" />
              <p className="text-[#78716C] font-medium text-sm">
                Readings to Review
                {reviewCount > 0 && <span className="inline-block w-2 h-2 rounded-full bg-[#B8860B] animate-pulse ml-1" />}
              </p>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <p className={`font-bold text-[#1C1917] ${reviewCount > 0 ? "text-4xl font-extrabold" : "text-3xl"}`}>{reviewCount}</p>
              <span className="text-sm font-semibold text-amber-600">2 new today</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[20px] border border-[rgba(28,25,23,0.06)] shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-150">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl mb-4">
              <Calendar size={20} />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <p className="text-[#78716C] font-medium text-sm">Meetings Today</p>
            </div>
            <p className="text-3xl font-bold text-[#1C1917] mt-1">3</p>
          </div>
          <div className="bg-white p-6 rounded-[20px] border border-[rgba(28,25,23,0.06)] shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-150">
            <div className="w-10 h-10 bg-green-50 text-green-600 flex items-center justify-center rounded-xl mb-4">
              <LineChart size={20} />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-[#78716C] font-medium text-sm">Guide Adherence</p>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-bold text-[#1C1917]">84%</p>
              <span className="text-sm font-semibold text-green-600">↑ 2% from last month</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-[20px] border border-[rgba(28,25,23,0.06)] overflow-hidden shadow-card">
          <div className="p-6 border-b border-[#E5DFD8] flex justify-between items-center bg-[#FAF8F5]">
            <h2 className="text-xl font-bold text-[#1C1917]">Recent Activity</h2>
            <Link href="/admin/patients" className="text-primary font-semibold text-sm hover:underline">
              View Directory &rarr;
            </Link>
          </div>
          <div className="divide-y divide-[#E5DFD8]">
            <Link href="/admin/patients/demo" className="block p-6 hover:bg-[#EDE8E1] transition-colors flex items-start gap-4 group">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[#1C1917] font-semibold group-hover:text-primary transition-colors">Lily Tan <span className="text-[#78716C] font-normal ml-2">Logged daily reading</span></p>
                <p className="text-sm text-[#78716C] mt-1">Fasting 6.2 mmol/L. Systolic 128 mmHg.</p>
                <p className="text-xs text-[#A8A29E] mt-2">10 minutes ago</p>
              </div>
            </Link>
            <Link href="/admin/patients#" className="block p-6 hover:bg-[#EDE8E1] transition-colors flex items-start gap-4 group opacity-70">
              <div className="w-2 h-2 rounded-full bg-[#B8860B] mt-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[#1C1917] font-semibold group-hover:text-primary transition-colors">Robert Chen <span className="text-[#78716C] font-normal ml-2">Booked consultation</span></p>
                <p className="text-sm text-[#78716C] mt-1">March 28, 2:00 PM</p>
                <p className="text-xs text-[#A8A29E] mt-2">2 hours ago</p>
              </div>
            </Link>
            <Link href="/admin/patients#" className="block p-6 hover:bg-[#EDE8E1] transition-colors flex items-start gap-4 group opacity-70">
              <div className="w-2 h-2 rounded-full bg-[#78716C] mt-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[#1C1917] font-semibold group-hover:text-primary transition-colors">Sarah Lim <span className="text-[#78716C] font-normal ml-2">Completed Onboarding</span></p>
                <p className="text-sm text-[#78716C] mt-1">Awaiting guide creation.</p>
                <p className="text-xs text-[#A8A29E] mt-2">Yesterday</p>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
