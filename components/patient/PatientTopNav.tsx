"use client";

import Link from "next/link";
import {
  Home,
  ClipboardList,
  Calendar,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientTopNavProps {
  activePath: string;
}

/** Tab configuration — mirrors BottomNav for consistency. */
const TABS = [
  { label: "Home", href: "/p/demo/home", icon: Home },
  { label: "Log", href: "/p/demo/log", icon: ClipboardList },
  { label: "Appointment", href: "/p/demo/appointment", icon: Calendar },
  { label: "Guide", href: "/p/demo/guide", icon: BookOpen },
  { label: "Help", href: "/p/demo/faq", icon: HelpCircle },
];

/**
 * Desktop-only top navigation bar with Dr. Jasmine brand on the left
 * and horizontal nav tabs on the right. Hidden on mobile (md:flex).
 * Matches the patient portal warm-ivory / forest-green design language.
 */
export function PatientTopNav({ activePath }: PatientTopNavProps) {
  return (
    <header
      className="hidden md:flex items-center justify-between px-8 h-16 sticky top-0 z-40 border-b border-depth"
      style={{
        background: "rgba(250, 248, 245, 0.90)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      {/* Brand block — Dr. Jasmine in display font + METANOVA HEALTH sub-label */}
      <div className="flex flex-col justify-center leading-none select-none">
        <span
          className="text-[20px] text-primary leading-none"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Dr. Jasmine
        </span>
        <span className="text-[9px] font-semibold text-text-tertiary mt-1 uppercase tracking-[0.2em]">
          METANOVA HEALTH
        </span>
      </div>

      {/* Navigation tabs */}
      <nav aria-label="Top Navigation" className="flex items-center gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activePath.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-depth"
              )}
            >
              <Icon
                size={16}
                strokeWidth={isActive ? 2.5 : 2}
                aria-hidden="true"
              />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
