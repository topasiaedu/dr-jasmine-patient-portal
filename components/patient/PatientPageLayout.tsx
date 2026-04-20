import {
  BookOpen,
  Calendar,
  ClipboardList,
  HelpCircle,
  Home,
} from "lucide-react";
import { BottomNav } from "./BottomNav";
import { PatientTopNav } from "./PatientTopNav";
import { DemoControls } from "../demo/DemoControls";
import { MotionStagger } from "@/components/motion/MotionStagger";
import type { PatientNavTab } from "@/lib/types/patient-nav";

const DEMO_NAV_TABS: PatientNavTab[] = [
  { label: "Home", href: "/p/demo/home", icon: Home },
  { label: "Log", href: "/p/demo/log", icon: ClipboardList },
  { label: "Appointment", href: "/p/demo/appointment", icon: Calendar },
  { label: "Guide", href: "/p/demo/guide", icon: BookOpen },
  { label: "Help", href: "/p/demo/faq", icon: HelpCircle },
];

interface PatientPageLayoutProps {
  children: React.ReactNode;
  activePath: string;
  /** When omitted, legacy `/p/demo/*` tabs are used. */
  tabs?: PatientNavTab[];
  showDemoControls?: boolean;
}

/**
 * Patient page layout wrapper with quiet-luxury spacing and motion.
 * Mobile: compact brand header strip + bottom navigation.
 * Desktop: full-width top nav bar (PatientTopNav) replacing the bottom nav.
 */
export function PatientPageLayout({
  children,
  activePath,
  tabs = DEMO_NAV_TABS,
  showDemoControls = true,
}: PatientPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#2D5E4C] focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      <PatientTopNav activePath={activePath} tabs={tabs} />

      <div
        className="md:hidden flex items-center px-6 h-14 sticky top-0 z-40 border-b border-depth"
        style={{
          background: "rgba(250, 248, 245, 0.90)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
        }}
      >
        <div className="flex flex-col justify-center leading-none select-none">
          <span
            className="text-[18px] text-primary leading-none"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Dr. Jasmine
          </span>
          <span className="text-[9px] font-semibold text-text-tertiary mt-1 uppercase tracking-[0.2em]">
            METANOVA HEALTH
          </span>
        </div>
      </div>

      <main
        id="main-content"
        className="relative mx-auto min-h-[calc(100vh-56px)] max-w-md md:max-w-5xl bg-[#FAF8F5] pb-[92px] md:pb-10 md:min-h-[calc(100vh-64px)]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-[#EEF5F1] to-transparent"
        />
        <MotionStagger className="relative z-10">{children}</MotionStagger>
      </main>

      {showDemoControls ? <DemoControls /> : null}

      <BottomNav activePath={activePath} tabs={tabs} />
    </div>
  );
}
