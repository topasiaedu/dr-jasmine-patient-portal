import { BottomNav } from "./BottomNav";
import { DemoControls } from "../demo/DemoControls";
import { MotionStagger } from "@/components/motion/MotionStagger";

interface PatientPageLayoutProps {
  children: React.ReactNode;
  activePath: string;
}

/**
 * Patient page layout wrapper with quiet-luxury spacing and motion.
 */
export function PatientPageLayout({
  children,
  activePath,
}: PatientPageLayoutProps) {
  return (
    /* Outer: sets min-height and warm background */
    <div className="min-h-screen bg-[#FAF8F5]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#2D5E4C] focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>
      <main id="main-content" className="relative mx-auto min-h-screen max-w-md bg-[#FAF8F5] pb-[92px]">
        {/* Subtle tinted header zone to replace the old radial glow. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-[#EEF5F1] to-transparent"
        />
        <MotionStagger className="relative z-10">{children}</MotionStagger>
      </main>
      <DemoControls />
      <BottomNav activePath={activePath} />
    </div>
  );
}
