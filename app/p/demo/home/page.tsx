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

const MOTIVATIONAL_QUOTES: { text: string; author: string }[] = [
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "The groundwork of all happiness is health.", author: "Leigh Hunt" },
  { text: "Every small step forward is a victory worth celebrating.", author: "Dr. Jasmine" },
  { text: "The first wealth is health.", author: "Ralph Waldo Emerson" },
  { text: "Small, consistent actions lead to extraordinary results.", author: "Anonymous" },
  { text: "Your body hears everything your mind says. Stay positive.", author: "Naomi Judd" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Healing is not linear. Every good day is a step in the right direction.", author: "Dr. Jasmine" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Your health is an investment, not an expense.", author: "Anonymous" },
];

export default function PatientHomePage() {
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [apptInfo, setApptInfo] = useState<Appointment | { date: string; time: string } | null>(null);
  const [isNextAppt, setIsNextAppt] = useState(false);
  const [greeting, setGreeting] = useState("Good morning");
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const storedDate = localStorage.getItem("demo_reading_today");
    if (storedDate === new Date().toDateString()) {
      setHasLoggedToday(true);
    }

    const nextAppt = localStorage.getItem("demo_next_appointment");
    if (nextAppt) {
      try {
        setApptInfo(JSON.parse(nextAppt));
        setIsNextAppt(true);
      } catch (e: unknown) {
        console.error("Failed to parse demo_next_appointment:", e);
      }
    } else {
      const localAppt = localStorage.getItem("demo_appointment");
      if (localAppt) {
        try {
          setApptInfo(JSON.parse(localAppt));
        } catch (e: unknown) {
          console.error("Failed to parse demo_appointment:", e);
        }
      } else {
        setApptInfo(null);
      }
    }

    const storedSessions = localStorage.getItem("demo_sessions_completed");
    if (storedSessions) {
      setSessionsCompleted(parseInt(storedSessions, 10));
    } else {
      setSessionsCompleted(0);
    }
  }, []);

  const firstName = MOCK_PATIENT.fullName.split(" ")[0];

  const dailyQuote = (() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
  })();

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

  const pendingSessionNum = MOCK_PATIENT.sessionsCompleted + (isNextAppt ? 2 : 1);

  const renderApptCard = () => {
    if (!apptInfo) {
      return (
        <Card className="p-6">
          <CardContent className="px-0">
            {sessionsCompleted === 0 ? (
              <>
                <p className="text-text-primary font-medium text-lg mb-3">
                  No appointment booked.
                </p>
                <Link href="/p/demo/book">
                  <Button variant="default" size="patient" className="w-full">
                    Book a consultation →
                  </Button>
                </Link>
              </>
            ) : (
              <p className="text-text-secondary text-center">
                Dr. Jasmine will schedule your next session during your consultation.
              </p>
            )}
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

  const completedPct = Math.round((MOCK_PATIENT.sessionsCompleted / MOCK_PATIENT.sessionsEntitled) * 100);

  return (
    <PatientPageLayout activePath="/p/demo/home">
      <MotionStagger className="px-6 pt-8 pb-8 space-y-10 bg-bg-app min-h-[calc(100vh-72px)]">
        <MotionItem>
          <p className="text-text-secondary text-lg font-normal">{greeting},</p>
          <h1 className="font-display text-[40px] font-normal tracking-[-0.03em] text-text-primary leading-tight">
            {firstName}
          </h1>
          
          <div className="mt-6 bg-white p-4 rounded-2xl border border-border shadow-sm">
            <div className="flex justify-between items-end mb-2">
              <p className="text-sm font-semibold text-main">Consultation Progress</p>
              <p className="text-sm font-bold text-primary">
                {MOCK_PATIENT.sessionsCompleted} of {MOCK_PATIENT.sessionsEntitled} Completed
              </p>
            </div>
            <div className="h-2 w-full bg-[#E5DFD8] rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${completedPct}%` }}
              />
            </div>
          </div>
        </MotionItem>

        <MotionItem>{renderTaskCard()}</MotionItem>

        <MotionItem>
          <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary mb-3">
            Next Consultation (Session {pendingSessionNum})
          </h2>
          {renderApptCard()}
        </MotionItem>

        <MotionItem>
          <div className="border-l-2 border-primary/30 pl-4 py-1">
            <p
              className="text-[17px] leading-relaxed text-text-primary italic"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              &ldquo;{dailyQuote.text}&rdquo;
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-text-tertiary">
              &mdash; {dailyQuote.author}
            </p>
          </div>
        </MotionItem>
      </MotionStagger>
    </PatientPageLayout>
  );
}
