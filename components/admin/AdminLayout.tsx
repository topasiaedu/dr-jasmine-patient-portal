"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarDays, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Patients", href: "/admin/patients", icon: Users },
  { label: "Schedule", href: "/admin/schedule", icon: CalendarDays },
];

/**
 * Admin sidebar content — warm near-black background, DM Serif Display brand,
 * warm pill active states and hover effects.
 */
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-[#1C1917] text-white w-60">
      {/* Brand header — "Dr. Jasmine" in serif + METANOVA subtext */}
      <div className="p-6 border-b border-[#292524]">
        <h1
          className="text-[22px] text-white leading-none"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Dr. Jasmine
        </h1>
        <p className="text-[10px] font-semibold text-[#78716C] mt-1.5 uppercase tracking-[0.2em]">
          METANOVA HEALTH
        </p>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/25 text-white"
                  : "text-[#D6D3D1] hover:text-white hover:bg-primary/20"
              )}
              onClick={onClose}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User badge in footer */}
      <div className="p-4 border-t border-[#292524]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
            DJ
          </div>
          <div className="text-sm font-medium text-[#D6D3D1]">Dr. Jasmine</div>
        </div>
      </div>
    </div>
  );
}

interface AdminLayoutProps {
  children: React.ReactNode;
  /** When true, removes padding and max-width for full-bleed workspace pages. */
  fullBleed?: boolean;
}

/**
 * Admin layout — warm near-black sidebar + warm ivory content area.
 * Desktop: fixed sidebar; Mobile: hamburger drawer.
 */
export function AdminLayout({ children, fullBleed = false }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg-main">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#2D5E4C] focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold z-[100]"
      >
        Skip to main content
      </a>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#1C1917] text-white">
        <div>
          <h1
            className="text-[18px] text-white leading-none"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Dr. Jasmine
          </h1>
          <p className="text-[11px] text-[#78716C] uppercase tracking-[0.2em]">
            Admin
          </p>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 -mr-2 text-[#D6D3D1] hover:text-white"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-1 max-w-xs w-full bg-[#1C1917]">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar — hidden on mobile, flex on desktop */}
      <div className="hidden md:flex flex-col w-60 fixed inset-y-0 z-10 border-r border-[#292524]">
        <SidebarContent />
      </div>

      {/* Main Content Area — warm ivory background */}
      <main
        id="main-content"
        className={cn(
          "flex-1 md:pl-60 bg-bg-main border-l border-border",
          fullBleed ? "" : "pb-10"
        )}
      >
        <div className={fullBleed ? "" : "p-4 md:p-8 max-w-6xl mx-auto"}>
          {children}
        </div>
      </main>
    </div>
  );
}
