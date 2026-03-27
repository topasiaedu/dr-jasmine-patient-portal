"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Printer } from "lucide-react";
import { PatientPageLayout } from "@/components/patient/PatientPageLayout";
import { MotionStagger } from "@/components/motion/MotionStagger";
import { MotionItem } from "@/components/motion/MotionItem";
import { Button } from "@/components/ui/button";
import { MOCK_CONSULTATION_GUIDES, MOCK_PATIENT, PatientGuide } from "@/lib/mock-data";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

/** Labels for each consultation tab button. */
const CONSULT_LABELS = [
  "Consult 1",
  "Consult 2",
  "Consult 3",
  "Consult 4",
  "Consult 5",
];

/**
 * Guide page — patient's personalised dietary guide with premium document layout.
 * Shows five consultation tabs; each tab renders the guide issued after that session.
 * Uses DM Serif Display for the branded header.
 */
export default function GuidePage() {
  /**
   * selectedIndex: which consultation is active (0–4).
   * Defaults to the latest (index 4) which is the most recent guide.
   */
  const [selectedIndex, setSelectedIndex] = useState<number>(4);

  /**
   * guide: the PatientGuide data for the selected consultation.
   * Loaded from localStorage if overridden, otherwise from MOCK_CONSULTATION_GUIDES.
   */
  const [guides, setGuides] = useState<PatientGuide[]>(MOCK_CONSULTATION_GUIDES);

  useEffect(() => {
    /**
     * Check if localStorage has a custom guide for the latest consultation.
     * If so, replace index 4 with the stored guide to preserve compatibility
     * with the admin guide-editor flow.
     */
    const local = localStorage.getItem("demo_patient_guide");
    if (local) {
      try {
        const parsed: PatientGuide = JSON.parse(local);
        setGuides((prev) => {
          const updated = [...prev];
          updated[4] = parsed;
          return updated;
        });
      } catch (e: unknown) {
        console.error("Failed to parse localStorage guide:", e);
      }
    }
  }, []);

  const activeGuide = guides[selectedIndex];

  const handlePrint = () => {
    window.print();
  };

  if (!activeGuide) return null;

  return (
    <PatientPageLayout activePath="/p/demo/guide">
      {/* Sticky toolbar: consultation selector + export button */}
      <div className="print:hidden sticky top-0 z-10 bg-bg-main border-b border-depth">
        {/* Top row: label + export */}
        <div className="flex items-center justify-between px-6 py-3">
          <p className="text-sm text-text-secondary font-medium">Dietary Guide</p>
          <Button variant="outline" size="patient" onClick={handlePrint}>
            <Printer size={16} className="mr-2" />
            Export as PDF
          </Button>
        </div>

        {/* Consultation selector — horizontal scroll row of 5 buttons */}
        <div
          className="flex gap-2 px-6 pb-3 overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          role="tablist"
          aria-label="Select consultation"
        >
          {CONSULT_LABELS.map((label, idx) => (
            <button
              key={label}
              role="tab"
              aria-selected={selectedIndex === idx}
              aria-controls="guide-panel"
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border whitespace-nowrap",
                selectedIndex === idx
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-surface text-text-secondary border-border hover:border-primary/40 hover:text-text-primary"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Guide content panel */}
      <div
        id="guide-panel"
        role="tabpanel"
        aria-label={`${CONSULT_LABELS[selectedIndex]} guide`}
        className="w-full max-w-2xl mx-auto px-6 pb-8 space-y-12"
      >
        <MotionStagger key={selectedIndex}>
          <MotionItem>
            <div className="pt-8 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-tertiary">
                {CONSULT_LABELS[selectedIndex]}
              </p>
              <h1 className="text-[28px] font-display text-main">Your Guide</h1>
              <h2 className="text-[24px] font-display text-main">{activeGuide.title}</h2>
              <p className="text-sm text-text-tertiary">
                Last updated: {format(parseISO(activeGuide.updatedAt), "MMMM yyyy")} &middot; {MOCK_PATIENT.fullName}
              </p>
            </div>
          </MotionItem>
        </MotionStagger>

        <RevealSection>
          <SectionHeader title="FOODS TO AVOID" />
          <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-2xl p-6 border-l-4 border-l-[#DC2626]">
            <div className="flex flex-wrap gap-3">
              {activeGuide.noList.map((item) => (
                <span
                  key={item}
                  className="inline-block rounded-full px-3 py-1.5 text-sm bg-surface text-main border border-[#FECACA]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </RevealSection>

        <RevealSection>
          <SectionHeader title="FOODS YOU CAN EAT" />
          <div className="bg-primary-light border border-primary/20 rounded-2xl p-6 border-l-4 border-l-primary space-y-5">
            {activeGuide.yesCategories.map((cat) => (
              <div key={cat.name} className="space-y-2">
                <p className="font-semibold text-main">{cat.name}</p>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <span
                      key={`${cat.name}-${item}`}
                      className="inline-block rounded-full px-3 py-1.5 text-sm bg-surface border border-primary/20 text-main"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </RevealSection>

        <RevealSection>
          <SectionHeader title="SMART REPLACEMENTS" />
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="space-y-3">
              {activeGuide.replacements.map((rep, idx) => (
                <div
                  key={`${rep.original}-${rep.replacement}-${idx}`}
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm py-2 border-b border-depth last:border-b-0"
                >
                  <span className="text-text-secondary">{rep.original}</span>
                  <span className="text-primary font-semibold">&rarr;</span>
                  <span className="text-main font-medium">{rep.replacement}</span>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>

        <RevealSection>
          <SectionHeader title="PORTION GUIDANCE" />
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-3">
            {activeGuide.portions.map((portion, idx) => (
              <div
                key={`${portion.label}-${idx}`}
                className="flex items-center justify-between border-b border-depth pb-2 last:border-b-0"
              >
                <span className="text-text-secondary">{portion.label}</span>
                <span className="text-main font-semibold">{portion.fraction}</span>
              </div>
            ))}
          </div>
        </RevealSection>
      </div>
    </PatientPageLayout>
  );
}

/**
 * Section title using the prompt's typography and border treatment.
 */
function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-[13px] font-medium uppercase tracking-[0.1em] text-text-secondary border-b border-border pb-2 mb-4">
      {title}
    </h3>
  );
}

/**
 * Fade-up reveal wrapper triggered when section enters viewport.
 */
function RevealSection({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={sectionRef}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
