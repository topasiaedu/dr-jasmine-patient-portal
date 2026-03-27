"use client";

import Link from "next/link";
import {
  Home,
  ClipboardList,
  Calendar,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activePath: string;
}

/** Tab configuration for the patient bottom navigation. */
const TABS = [
  { label: "Home", href: "/p/demo/home", icon: Home },
  { label: "Log", href: "/p/demo/log", icon: ClipboardList },
  { label: "Appointment", href: "/p/demo/appointment", icon: Calendar },
  { label: "Guide", href: "/p/demo/guide", icon: BookOpen },
  { label: "Help", href: "/p/demo/faq", icon: HelpCircle },
];

/**
 * Patient bottom navigation bar with frosted glass effect.
 * Active tab is highlighted with a forest-tinted animated pill.
 */
export function BottomNav({ activePath }: BottomNavProps) {
  return (
    <nav
      aria-label="Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex h-[72px] items-center justify-around px-1 shadow-nav-float"
      style={{
        background: "rgba(255, 255, 255, 0.82)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activePath.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            aria-label={tab.label}
            className="flex flex-1 flex-col items-center justify-center h-full"
          >
            <motion.span
              layout
              layoutId={isActive ? "nav-pill" : undefined}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-[#78716C] hover:text-[#1C1917]"
              )}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            >
              {isActive ? (
                <motion.span
                  layoutId="active-tab-pill"
                  className="absolute inset-0 rounded-xl bg-[rgba(45,94,76,0.08)]"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              ) : null}
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
              <span className="relative z-10 text-[12px] font-medium leading-none">
                {tab.label}
              </span>
            </motion.span>
          </Link>
        );
      })}
    </nav>
  );
}
