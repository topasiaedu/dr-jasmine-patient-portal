"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";
import { MOCK_PATIENT } from "@/lib/mock-data";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

export default function AdminPatientsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem("admin_auth")) {
      router.replace("/admin/login");
    }
  }, [router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const closeMenu = () => setOpenMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText("https://jasmine-portal.demo.net/p/demo");
    toast.success("Copied to clipboard!");
    setOpenMenu(null);
  };

  const handleEditStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info("Coming soon");
    setOpenMenu(null);
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

        <div className="bg-white rounded-[20px] border border-[rgba(28,25,23,0.06)] shadow-card overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-border flex gap-4 bg-bg-main/80">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input
                type="text"
                placeholder="Search name, phone or email..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <select className="bg-white border border-border rounded-xl text-sm px-3 py-2 text-main font-medium focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option>All Status</option>
              <option>Pending Intake</option>
              <option>Active</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-border">
                {/* Active Demo Patient */}
                <tr
                  className="hover:bg-depth transition-colors group cursor-pointer"
                  onClick={() => router.push(`/admin/patients/${MOCK_PATIENT.id}`)}
                >
                  <td className="p-4 pl-6">
                    <span className="font-bold text-main group-hover:text-primary transition-colors">
                      {MOCK_PATIENT.fullName}
                    </span>
                  </td>
                  <td className="p-4">
                    <a href={`tel:${MOCK_PATIENT.phone}`} onClick={(e) => e.stopPropagation()} className="text-sm font-medium text-main hover:text-primary">{MOCK_PATIENT.phone}</a>
                    <p className="text-xs text-text-secondary">{MOCK_PATIENT.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                      Active
                    </span>
                  </td>
                  <td className="p-4 text-sm text-text-secondary">18 Mar 2026</td>
                  <td className="p-4 text-center text-secondary relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === "demo" ? null : "demo"); }}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {openMenu === "demo" && (
                      <div className="absolute right-8 top-10 w-48 bg-white rounded-xl shadow-lg border border-border z-10 py-1 text-left">
                        <button onClick={(e) => { e.stopPropagation(); router.push(`/admin/patients/${MOCK_PATIENT.id}`); }} className="w-full text-left px-4 py-2 text-sm text-main hover:bg-gray-50">View Profile</button>
                        <button onClick={handleCopyLink} className="w-full text-left px-4 py-2 text-sm text-main hover:bg-gray-50">Copy Portal Link</button>
                        <button onClick={handleEditStatus} className="w-full text-left px-4 py-2 text-sm text-main hover:bg-gray-50">Edit Status</button>
                      </div>
                    )}
                  </td>
                </tr>

                {/* Dummy Row */}
                <tr
                  className="hover:bg-depth transition-colors opacity-60 cursor-pointer relative"
                  onClick={() => router.push("/admin/patients/demo")}
                >
                  <td className="p-4 pl-6 font-bold text-main">Robert Chen</td>
                  <td className="p-4">
                    <a href="tel:+601344455555" onClick={(e) => e.stopPropagation()} className="text-sm font-medium text-main hover:text-primary">+60 13 444 5555</a>
                    <p className="text-xs text-text-secondary">robert.c@example.com</p>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                      Pending
                    </span>
                  </td>
                  <td className="p-4 text-sm text-text-secondary">25 Mar 2026</td>
                  <td className="p-4 text-center text-secondary relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === "robert" ? null : "robert"); }}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {openMenu === "robert" && (
                      <div className="absolute right-8 top-10 w-48 bg-white rounded-xl shadow-lg border border-border z-10 py-1 text-left">
                        <button onClick={(e) => { e.stopPropagation(); router.push("/admin/patients/demo"); }} className="w-full text-left px-4 py-2 text-sm text-main hover:bg-gray-50">View Profile</button>
                        <button onClick={handleCopyLink} className="w-full text-left px-4 py-2 text-sm text-main hover:bg-gray-50">Copy Portal Link</button>
                        <button onClick={handleEditStatus} className="w-full text-left px-4 py-2 text-sm text-main hover:bg-gray-50">Edit Status</button>
                      </div>
                    )}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
