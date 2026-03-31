"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Download } from "lucide-react";
import { PatientPageLayout } from "@/components/patient/PatientPageLayout";
import {
  MOCK_CONSULTATION_NOTES,
  MOCK_GUIDE_VERSIONS,
  MOCK_PATIENT,
  ConsultationNote,
  GuideVersion,
} from "@/lib/mock-data";
import { format, parseISO } from "date-fns";

/** Active guide = the version not yet superseded by a newer phase. */
function getActiveGuide(versions: GuideVersion[]): GuideVersion | undefined {
  return (
    versions.find((v) => v.supersededAt === null) ??
    (versions.length > 0 ? versions[versions.length - 1] : undefined)
  );
}

/** Merge mock notes with anything saved by the consult panel. */
function loadPatientFacingNotes(): ConsultationNote[] {
  const base = [...MOCK_CONSULTATION_NOTES];
  const raw = localStorage.getItem("demo_consultation_notes");
  if (!raw) return base;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return base;
    const byId = new Map<string, ConsultationNote>(base.map((n) => [n.id, n]));
    for (const n of parsed as ConsultationNote[]) {
      if (n && typeof n.id === "string" && typeof n.patientNote === "string") {
        byId.set(n.id, n);
      }
    }
    return Array.from(byId.values());
  } catch {
    return base;
  }
}

export default function GuidePage() {
  const [activeGuide, setActiveGuide] = useState<GuideVersion | undefined>(undefined);
  const [patientNotes, setPatientNotes] = useState<ConsultationNote[]>([]);

  useEffect(() => {
    const raw =
      localStorage.getItem("demo_guide_versions") ??
      localStorage.getItem("demo_patient_guides");
    let loaded = MOCK_GUIDE_VERSIONS;
    if (raw) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loaded = parsed as GuideVersion[];
        }
      } catch (e: unknown) {
        console.error("Failed to parse localStorage guides:", e);
      }
    }
    setActiveGuide(getActiveGuide(loaded));
    setPatientNotes(loadPatientFacingNotes());
  }, []);

  const sortedNotes = useMemo(
    () =>
      patientNotes
        .filter((n) => n.patientNote.trim().length > 0)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [patientNotes]
  );

  if (!activeGuide) {
    return (
      <PatientPageLayout activePath="/p/demo/guide">
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/[0.08] flex items-center justify-center mb-6">
            <span className="text-3xl">📋</span>
          </div>
          <p className="font-display text-[22px] text-text-primary mb-2">
            Your guide is on its way
          </p>
          <p className="text-text-secondary text-base leading-relaxed max-w-xs">
            Dr. Jasmine will add your personalised plan after your first
            consultation.
          </p>
        </div>
      </PatientPageLayout>
    );
  }

  return (
    <PatientPageLayout activePath="/p/demo/guide">
      {/* ── Sticky top bar ── */}
      <div className="print:hidden sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-6 h-12">
          <span className="text-sm font-medium text-text-secondary truncate max-w-[60%]">
            {activeGuide.protocolName}
          </span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <Download size={14} />
            Save PDF
          </button>
        </div>
      </div>

      <div className="w-full max-w-xl mx-auto px-5 pb-24">

        {/* ── Hero ── */}
        <Reveal>
          <div className="pt-10 pb-2">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-3">
              Your personalised plan
            </p>
            <h1
              className="font-display text-[34px] leading-tight text-text-primary mb-3"
              style={{ letterSpacing: "-0.02em" }}
            >
              {activeGuide.protocolName}
            </h1>
            <p className="text-sm text-text-tertiary">
              {MOCK_PATIENT.fullName} ·{" "}
              {format(parseISO(activeGuide.updatedAt), "MMMM yyyy")}
            </p>
          </div>
        </Reveal>

        {/* ── Avoid ── */}
        <Reveal>
          <section className="mt-10">
            <Label color="red">Do not eat</Label>
            <div className="mt-3 rounded-2xl bg-[#FEF2F2] border border-[#FEE2E2] p-5">
              <div className="flex flex-wrap gap-2">
                {activeGuide.noList.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-[#B91C1C] bg-white border border-[#FECACA]"
                  >
                    <span className="text-[10px]">✕</span>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* ── Can eat ── */}
        <Reveal>
          <section className="mt-10">
            <Label color="green">You can eat</Label>
            <div className="mt-3 space-y-5">
              {activeGuide.yesCategories.map((cat) => (
                <div key={cat.name}>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary mb-2">
                    {cat.name}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {cat.items.map((item) => (
                      <span
                        key={`${cat.name}-${item}`}
                        className="inline-block rounded-full px-3 py-1.5 text-sm font-medium text-main bg-white border border-primary/20"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  {cat.notes.length > 0 && (
                    <ul className="text-sm text-text-secondary space-y-0.5 pl-1">
                      {cat.notes.map((note) => (
                        <li key={note} className="flex gap-2">
                          <span className="mt-1 w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ── Snacks (conditional) ── */}
        {activeGuide.snacks.length > 0 && (
          <Reveal>
            <section className="mt-10">
              <Label color="green">Snacks</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeGuide.snacks.map((item) => (
                  <span
                    key={item}
                    className="inline-block rounded-full px-3 py-1.5 text-sm font-medium text-main bg-white border border-primary/20"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* ── Replacements ── */}
        {activeGuide.replacements.length > 0 && (
          <Reveal>
            <section className="mt-10">
              <Label color="neutral">Smart swaps</Label>
              <div className="mt-3 rounded-2xl bg-[#F7F5F2] border border-border overflow-hidden">
                {activeGuide.replacements.map((rep, idx) => (
                  <div
                    key={`${rep.original}-${idx}`}
                    className="grid grid-cols-[1fr_28px_1fr] items-center gap-2 px-5 py-3.5 border-b border-border/60 last:border-b-0 text-sm"
                  >
                    <span className="text-text-secondary">{rep.original}</span>
                    <span className="text-primary font-bold text-center">→</span>
                    <span className="text-main font-medium">{rep.replacement}</span>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* ── Portions ── */}
        {activeGuide.portions.length > 0 && (
          <Reveal>
            <section className="mt-10">
              <Label color="neutral">Your plate</Label>
              <div className="mt-3 rounded-2xl bg-[#F7F5F2] border border-border overflow-hidden">
                {activeGuide.portions.map((portion, idx) => (
                  <div
                    key={`${portion.label}-${idx}`}
                    className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 last:border-b-0"
                  >
                    <span className="text-sm text-text-secondary">{portion.label}</span>
                    <span className="text-base font-bold text-main">{portion.fraction}</span>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* ── Cooking methods (conditional) ── */}
        {activeGuide.cookingMethods.length > 0 && (
          <Reveal>
            <section className="mt-10">
              <Label color="neutral">How to cook</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeGuide.cookingMethods.map((method) => (
                  <span
                    key={method}
                    className="inline-block rounded-full px-3 py-1.5 text-sm font-medium text-main bg-[#F7F5F2] border border-border"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* ── Additional sections — render exactly what Dr. Jasmine added, nothing more ── */}
        {activeGuide.additionalSections.map((section) => (
          <Reveal key={section.title}>
            <section className="mt-10">
              <Label color="neutral">{section.title}</Label>
              <div className="mt-3 rounded-2xl bg-[#F7F5F2] border border-border px-5 py-4">
                <p className="text-main text-[15px] leading-[1.75] whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            </section>
          </Reveal>
        ))}

        {/* ── Notes from Dr. Jasmine ── */}
        {sortedNotes.length > 0 && (
          <Reveal>
            <section className="mt-14">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-border" />
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-tertiary shrink-0">
                  From Dr. Jasmine
                </p>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-4">
                {sortedNotes.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-2xl border border-border bg-white px-5 py-4 shadow-sm"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary mb-3">
                      {format(parseISO(note.createdAt), "d MMMM yyyy")}
                    </p>
                    <p className="text-main text-[15px] leading-[1.75]">
                      {note.patientNote}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </Reveal>
        )}
      </div>
    </PatientPageLayout>
  );
}

/** Coloured section label replacing the old underline header. */
function Label({
  children,
  color,
}: {
  children: ReactNode;
  color: "red" | "green" | "neutral";
}) {
  const colours = {
    red: "text-[#B91C1C]",
    green: "text-primary",
    neutral: "text-text-secondary",
  };
  return (
    <p
      className={`text-xs font-bold uppercase tracking-[0.14em] ${colours[color]}`}
    >
      {children}
    </p>
  );
}

/** Fade-up reveal wrapper triggered when the section enters the viewport. */
function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
