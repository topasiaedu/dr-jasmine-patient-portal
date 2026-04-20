"use client";

import { useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MotionItem } from "@/components/motion/MotionItem";
import { MotionStagger } from "@/components/motion/MotionStagger";
import { format, parseISO } from "date-fns";
import { ClipboardList, BookOpen } from "lucide-react";

interface PatientMe {
  id: string;
  full_name: string;
}

/**
 * Patient home — Phase 1: readings + guide entry points; copy avoids assuming daily logging.
 */
export default function PatientHomePage(): ReactElement {
  const params = useParams();
  const ghlContactId = typeof params?.ghlContactId === "string" ? params.ghlContactId : "";
  const base = ghlContactId.length > 0 ? `/p/${ghlContactId}` : "/p";

  const [patient, setPatient] = useState<PatientMe | null>(null);
  const [lastReadingDate, setLastReadingDate] = useState<string | null>(null);
  const [readingsThisMonth, setReadingsThisMonth] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<void> => {
      const res = await fetch("/api/patient/me", { credentials: "include" });
      if (cancelled) {
        return;
      }
      if (!res.ok) {
        setLoadError("We could not load your profile.");
        return;
      }
      const dataUnknown: unknown = await res.json();
      const patientUnknown =
        typeof dataUnknown === "object" &&
        dataUnknown !== null &&
        "patient" in dataUnknown
          ? (dataUnknown as { patient: unknown }).patient
          : null;

      let lastDate: string | null = null;
      let monthCount = 0;
      if (typeof dataUnknown === "object" && dataUnknown !== null) {
        const raw = dataUnknown as { lastReadingDate?: unknown; readingsThisMonth?: unknown };
        if (typeof raw.lastReadingDate === "string") {
          lastDate = raw.lastReadingDate;
        } else if (raw.lastReadingDate === null) {
          lastDate = null;
        }
        if (typeof raw.readingsThisMonth === "number" && Number.isFinite(raw.readingsThisMonth)) {
          monthCount = raw.readingsThisMonth;
        }
      }

      if (
        patientUnknown &&
        typeof patientUnknown === "object" &&
        patientUnknown !== null &&
        "id" in patientUnknown &&
        "full_name" in patientUnknown
      ) {
        const p = patientUnknown as { id: string; full_name?: string };
        setPatient({
          id: p.id,
          full_name: typeof p.full_name === "string" ? p.full_name : "",
        });
      }
      setLastReadingDate(lastDate);
      setReadingsThisMonth(monthCount);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = patient?.full_name.split(" ")[0] ?? "there";

  if (loadError) {
    return (
      <div className="px-6 py-16 text-center text-secondary">
        <p>{loadError}</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="px-6 py-16 text-center text-secondary">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <MotionStagger className="px-6 py-8 space-y-8">
      <MotionItem>
        <p className="text-sm text-text-secondary">Welcome back,</p>
        <h1
          className="text-[32px] text-primary leading-tight mt-1"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          {firstName}
        </h1>
      </MotionItem>

      <MotionItem>
        <Card variant="tinted" className="p-6">
          <CardContent className="px-0 space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">Your readings</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              When you are ready, log the readings you agreed with Dr. Jasmine.
            </p>
            <Link
              href={`${base}/log`}
              className={cn(
                buttonVariants({ variant: "default", size: "patient" }),
                "w-full rounded-xl font-semibold"
              )}
            >
              <ClipboardList className="mr-2 h-5 w-5" aria-hidden="true" />
              Log my readings
            </Link>
            {lastReadingDate !== null && (
              <p className="text-xs text-text-tertiary font-medium text-center pt-1">
                {readingsThisMonth > 0
                  ? `Last logged: ${format(parseISO(lastReadingDate), "EEE, d MMM")}  ·  ${readingsThisMonth} reading${readingsThisMonth === 1 ? "" : "s"} this month`
                  : `Last logged: ${format(parseISO(lastReadingDate), "EEE, d MMM")}`}
              </p>
            )}
          </CardContent>
        </Card>
      </MotionItem>

      <MotionItem>
        <Card className="p-6 border border-border shadow-card">
          <CardContent className="px-0 space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">Your guide</h2>
            <p className="text-text-secondary text-sm">
              View the personalised plan from Dr. Jasmine.
            </p>
            <Link
              href={`${base}/guide`}
              className={cn(
                buttonVariants({ variant: "outline", size: "patient" }),
                "w-full rounded-xl font-semibold"
              )}
            >
              <BookOpen className="mr-2 h-5 w-5" aria-hidden="true" />
              Open my guide
            </Link>
          </CardContent>
        </Card>
      </MotionItem>
    </MotionStagger>
  );
}
