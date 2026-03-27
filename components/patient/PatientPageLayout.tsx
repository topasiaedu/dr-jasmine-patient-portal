import { BottomNav } from "./BottomNav";
import { PatientTopNav } from "./PatientTopNav";
import { DemoControls } from "../demo/DemoControls";
import { MotionStagger } from "@/components/motion/MotionStagger";

interface PatientPageLayoutProps {
  children: React.ReactNode;
  activePath: string;
}

/**
 * Patient page layout wrapper with quiet-luxury spacing and motion.
 * Mobile: compact brand header strip + bottom navigation.
 * Desktop: full-width top nav bar (PatientTopNav) replacing the bottom nav.
 */
export function PatientPageLayout({
  children,
  activePath,
}: PatientPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#2D5E4C] focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      {/* Desktop top nav — includes brand + tabs, hidden on mobile */}
      <PatientTopNav activePath={activePath} />

      {/* Mobile brand strip — visible only on mobile (hidden on md+) */}
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

      {/*
        Main content area:
        - Mobile: narrow (max-w-md), bottom padding for BottomNav (92px) + top brand strip (56px)
        - Desktop: wider (max-w-5xl), standard bottom padding, no extra top padding needed
          because PatientTopNav is sticky and flows in document order
      */}
      <main
        id="main-content"
        className="relative mx-auto min-h-[calc(100vh-56px)] max-w-md md:max-w-5xl bg-[#FAF8F5] pb-[92px] md:pb-10 md:min-h-[calc(100vh-64px)]"
      >
        {/* Subtle tinted header zone gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-[#EEF5F1] to-transparent"
        />
        <MotionStagger className="relative z-10">{children}</MotionStagger>
      </main>

      <DemoControls />

      {/* Bottom nav — visible on mobile only */}
      <BottomNav activePath={activePath} />
    </div>
  );
}
