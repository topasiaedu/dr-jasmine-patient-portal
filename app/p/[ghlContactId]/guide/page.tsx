"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, useInView } from "framer-motion";
import { Download } from "lucide-react";
import { format, parseISO } from "date-fns";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PatientGuideContent } from "@/lib/types/patient-guide";
import type { ConsultationNote } from "@/lib/mock-data";
import { GuidePdfDownloadButton } from "@/components/patient/GuidePdfDownloadButton";

/** Active guide = loaded API content (Phase 1: one guide per patient). */
function getActiveGuide(g: PatientGuideContent | null): PatientGuideContent | undefined {
  return g ?? undefined;
}

/**
 * Patient guide — restored quiet-luxury layout from `/p/demo/guide`, data from `/api/guides/me`.
 */
export default function PatientGuidePage(): ReactElement {
  const params = useParams();
  const ghlContactId = typeof params?.ghlContactId === "string" ? params.ghlContactId : "";
  const base = ghlContactId.length > 0 ? `/p/${ghlContactId}` : "/p";

  const [patientName, setPatientName] = useState<string>("");
  const [guide, setGuide] = useState<PatientGuideContent | null | undefined>(undefined);
  const [patientNotes, setPatientNotes] = useState<ConsultationNote[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<void> => {
      const [gRes, pRes] = await Promise.all([
        fetch("/api/guides/me", { credentials: "include" }),
        fetch("/api/patient/me", { credentials: "include" }),
      ]);
      if (cancelled) {
        return;
      }
      if (!gRes.ok) {
        setError("Could not load your guide.");
        setGuide(null);
        return;
      }
      const gBody: unknown = await gRes.json();
      const g =
        typeof gBody === "object" && gBody !== null && "guide" in gBody
          ? (gBody as { guide: PatientGuideContent | null }).guide
          : null;
      setGuide(g);

      if (pRes.ok) {
        const pBody: unknown = await pRes.json();
        const fn =
          typeof pBody === "object" &&
          pBody !== null &&
          "patient" in pBody &&
          typeof (pBody as { patient: { full_name?: string } }).patient?.full_name === "string"
            ? (pBody as { patient: { full_name: string } }).patient.full_name
            : "";
        setPatientName(fn);
      }

      /** Phase 1: consultation notes to patient are not wired to API yet — empty until Phase 2. */
      setPatientNotes([]);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeGuide = getActiveGuide(guide ?? null);

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

  if (error) {
    return (
      <div className="px-6 py-12 text-center text-secondary">
        <p>{error}</p>
        <Link href={`${base}/home`} className={cn(buttonVariants({ variant: "outline" }), "mt-4 inline-flex")}>
          Back to home
        </Link>
      </div>
    );
  }

  if (guide === undefined) {
    return <div className="px-6 py-12 text-center text-secondary">Loading…</div>;
  }

  if (!activeGuide) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/[0.08] flex items-center justify-center mb-6">
          <span className="text-3xl">📋</span>
        </div>
        <p className="font-display text-[22px] text-text-primary mb-2">Your guide is on its way</p>
        <p className="text-text-secondary text-base leading-relaxed max-w-xs">
          Dr. Jasmine will add your personalised plan after your first consultation.
        </p>
        <Link href={`${base}/home`} className={cn(buttonVariants({ variant: "outline" }), "mt-8 inline-flex")}>
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="print:hidden sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-6 h-12">
          <span className="text-sm font-medium text-text-secondary truncate max-w-[60%]">
            {activeGuide.title.length > 0 ? activeGuide.title : "Your plan"}
          </span>
          <div className="flex items-center gap-3">
            <GuidePdfDownloadButton guide={activeGuide} />
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <Download size={14} />
              Print
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xl mx-auto px-5 pb-24">
        <Reveal>
          <div className="pt-10 pb-2">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-3">Your personalised plan</p>
            <h1
              className="font-display text-[34px] leading-tight text-text-primary mb-3"
              style={{ letterSpacing: "-0.02em" }}
            >
              {activeGuide.title.length > 0 ? activeGuide.title : "Personalised plan"}
            </h1>
            <p className="text-sm text-text-tertiary">
              {patientName.length > 0 ? patientName : "Patient"} ·{" "}
              {format(parseISO(activeGuide.updatedAt), "MMMM yyyy")}
            </p>
          </div>
        </Reveal>

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

        <Reveal>
          <section className="mt-10">
            <Label color="green">You can eat</Label>
            <div className="mt-3 space-y-5">
              {activeGuide.yesCategories.map((cat) => (
                <div key={cat.name}>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary mb-2">{cat.name}</p>
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

        {activeGuide.additionalSections.map((section) => (
          <Reveal key={section.title}>
            <section className="mt-10">
              <Label color="neutral">{section.title}</Label>
              <div className="mt-3 rounded-2xl bg-[#F7F5F2] border border-border px-5 py-4">
                <p className="text-main text-[15px] leading-[1.75] whitespace-pre-line">{section.content}</p>
              </div>
            </section>
          </Reveal>
        ))}

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
                    <p className="text-main text-[15px] leading-[1.75]">{note.patientNote}</p>
                  </article>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        <div className="mt-12 flex flex-col gap-3 sm:flex-row print:hidden">
          <Link
            href={`${base}/home`}
            className={cn(buttonVariants({ variant: "outline" }), "flex-1 justify-center")}
          >
            Home
          </Link>
          <Link href={`${base}/log`} className={cn(buttonVariants({ variant: "default" }), "flex-1 justify-center")}>
            Log readings
          </Link>
        </div>
      </div>
    </>
  );
}

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
    <p className={`text-xs font-bold uppercase tracking-[0.14em] ${colours[color]}`}>{children}</p>
  );
}

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
