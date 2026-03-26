"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Printer } from "lucide-react";
import { PatientPageLayout } from "@/components/patient/PatientPageLayout";
import { MotionStagger } from "@/components/motion/MotionStagger";
import { MotionItem } from "@/components/motion/MotionItem";
import { Button } from "@/components/ui/button";
import { MOCK_GUIDE, MOCK_PATIENT, PatientGuide } from "@/lib/mock-data";
import { format, parseISO } from "date-fns";

/**
 * Guide page — patient's personalised dietary guide with premium document layout.
 * Uses DM Serif Display for the branded header.
 */
export default function GuidePage() {
  const [guide, setGuide] = useState<PatientGuide | null>(null);

  useEffect(() => {
    const local = localStorage.getItem("demo_patient_guide");
    if (local) {
      try {
        setGuide(JSON.parse(local));
      } catch (e: unknown) {
        console.error("Failed to parse localStorage:", e);
      }
    } else {
      setGuide(MOCK_GUIDE);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!guide) return null;

  return (
    <PatientPageLayout activePath="/p/demo/guide">
      <div className="print:hidden flex items-center justify-between px-6 py-4 bg-bg-main sticky top-0 z-10 w-full border-b border-depth">
        <p className="text-sm text-text-secondary font-medium">Dietary Guide</p>
        <Button variant="outline" size="patient" onClick={handlePrint}>
          <Printer size={16} className="mr-2" />
          Export as PDF
        </Button>
      </div>

      <div className="w-full max-w-2xl mx-auto px-6 pb-8 space-y-12">
        <MotionStagger>
          <MotionItem>
            <div className="pt-8 space-y-2">
              <h1 className="text-[28px] font-display text-main">Your Guide</h1>
              <h2 className="text-[24px] font-display text-main">{guide.title}</h2>
              <p className="text-sm text-text-tertiary">
                Last updated: {format(parseISO(guide.updatedAt), "MMMM yyyy")} · {MOCK_PATIENT.fullName}
              </p>
            </div>
          </MotionItem>
        </MotionStagger>

        <RevealSection>
          <SectionHeader title="FOODS TO AVOID" />
          <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-2xl p-6 border-l-4 border-l-[#DC2626]">
            <div className="flex flex-wrap gap-3">
              {guide.noList.map((item) => (
                <span key={item} className="inline-block rounded-full px-3 py-1.5 text-sm bg-surface text-main border border-[#FECACA]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </RevealSection>

        <RevealSection>
          <SectionHeader title="FOODS YOU CAN EAT" />
          <div className="bg-primary-light border border-primary/20 rounded-2xl p-6 border-l-4 border-l-primary space-y-5">
            {guide.yesCategories.map((cat) => (
              <div key={cat.name} className="space-y-2">
                <p className="font-semibold text-main">{cat.name}</p>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <span key={`${cat.name}-${item}`} className="inline-block rounded-full px-3 py-1.5 text-sm bg-surface border border-primary/20 text-main">
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
              {guide.replacements.map((rep, idx) => (
                <div key={`${rep.original}-${rep.replacement}-${idx}`} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm py-2 border-b border-depth last:border-b-0">
                  <span className="text-text-secondary">{rep.original}</span>
                  <span className="text-primary font-semibold">→</span>
                  <span className="text-main font-medium">{rep.replacement}</span>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>

        <RevealSection>
          <SectionHeader title="PORTION GUIDANCE" />
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-3">
            {guide.portions.map((portion, idx) => (
              <div key={`${portion.label}-${idx}`} className="flex items-center justify-between border-b border-depth pb-2 last:border-b-0">
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
