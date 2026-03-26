"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PatientPageLayout } from "@/components/patient/PatientPageLayout";
import { MOCK_PATIENT, Appointment } from "@/lib/mock-data";
import { format, parseISO } from "date-fns";
import { CheckCircle2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MotionStagger } from "@/components/motion/MotionStagger";
import { MotionItem } from "@/components/motion/MotionItem";
import { Card, CardContent } from "@/components/ui/card";

/** Patient home page — hero greeting, task card, and appointment card. */
export default function PatientHomePage() {
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [apptInfo, setApptInfo] = useState<
    Appointment | { date: string; time: string } | null
  >(null);
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    // Determine time-of-day greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Check if reading was logged today
    const storedDate = localStorage.getItem("demo_reading_today");
    if (storedDate === new Date().toDateString()) {
      setHasLoggedToday(true);
    }

    // Load appointment info
    const localAppt = localStorage.getItem("demo_appointment");
    if (localAppt) {
      try {
        setApptInfo(JSON.parse(localAppt));
      } catch (e: unknown) {
        console.error("Failed to parse localStorage:", e);
      }
    } else {
      setApptInfo(null);
    }
  }, []);

  const firstName = MOCK_PATIENT.fullName.split(" ")[0];

  /** Task card — shows "done" state or "Log my readings" CTA. */
  const renderTaskCard = () => {
    if (hasLoggedToday) {
      return (
        <Card variant="tinted" className="p-6">
          <CardContent className="px-0">
            <h2 className="text-[20px] font-semibold text-text-primary mb-2 flex items-center gap-2">
              <CheckCircle2 className="text-primary" size={22} />
              All done for today
            </h2>
            <p className="text-text-secondary text-base">
              Great work. Dr. Jasmine will review your readings shortly.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        variant="elevated"
        className="p-6 before:top-6 before:bottom-6 before:left-0 before:w-[4px] before:rounded-full before:bg-primary"
      >
        <CardContent className="px-0">
          <div className="text-xs font-medium uppercase tracking-[0.1em] text-[#B8860B] mb-3">
          Today&apos;s Task
          </div>
          <h2 className="text-[20px] font-semibold text-text-primary mb-6">
            Have you logged your readings today?
          </h2>
          <Link href="/p/demo/log" className="block w-full">
            <Button variant="default" size="patient" className="w-full">
              Log my readings →
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  };

  /** Appointment card — displays upcoming appointment summary. */
  const renderApptCard = () => {
    if (!apptInfo) {
      return (
        <Card className="p-6">
          <CardContent className="px-0">
            <p className="text-text-primary font-medium text-lg mb-3">
            No appointment booked.
            </p>
            <Link href="/p/demo/book">
              <Button variant="default" size="patient" className="w-full">
                Book a consultation →
              </Button>
            </Link>
          </CardContent>
        </Card>
      );
    }

    let displayDate = "";
    let displayTime = "";

    if ("date" in apptInfo) {
      displayDate = format(parseISO(apptInfo.date), "EEEE, dd MMMM yyyy");
      displayTime = apptInfo.time;
    } else {
      const date = parseISO(apptInfo.startsAt);
      displayDate = format(date, "EEEE, dd MMMM yyyy");
      displayTime = format(date, "hh:mm a");
    }

    return (
      <Card className="p-6">
        <CardContent className="px-0">
          <h3 className="text-xl font-semibold text-text-primary mb-1">
            {displayDate}
          </h3>
          <p className="text-base text-text-secondary mb-4">{displayTime}</p>
          <div className="flex items-center gap-2 text-text-secondary font-medium mb-4">
            <Video size={16} />
            <span>Video call with Dr. Jasmine</span>
          </div>
          <Button variant="default" size="patient" disabled className="w-full">
            Join on Zoom
          </Button>
          <p className="text-sm text-center text-text-secondary font-medium mt-2">
            Available 15 minutes before appointment.
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <PatientPageLayout activePath="/p/demo/home">
      <MotionStagger className="px-6 pt-8 pb-8 space-y-10 bg-bg-app min-h-[calc(100vh-72px)]">
        <MotionItem>
          <p className="text-text-secondary text-lg font-normal">{greeting},</p>
          <h1 className="font-display text-[40px] font-normal tracking-[-0.03em] text-text-primary leading-tight">
            {firstName}
          </h1>
          <p className="text-text-secondary text-base mt-2">
            Welcome to your health portal.
          </p>
        </MotionItem>

        <MotionItem>{renderTaskCard()}</MotionItem>

        <MotionItem>
          <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-text-secondary mb-3">
            Upcoming Appointment
          </h2>
          {renderApptCard()}
        </MotionItem>
      </MotionStagger>
    </PatientPageLayout>
  );
}
