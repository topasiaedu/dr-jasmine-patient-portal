"use client";

import { useEffect, useState } from "react";
import { DemoControls } from "@/components/demo/DemoControls";
import { format, parseISO } from "date-fns";
import { CalendarCheck, Info } from "lucide-react";
import { MotionItem } from "@/components/motion/MotionItem";
import { MotionStagger } from "@/components/motion/MotionStagger";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_PATIENT } from "@/lib/mock-data";

export default function PendingPage() {
  const [apptInfo, setApptInfo] = useState<{
    date: string;
    time: string;
  } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("demo_appointment");
    if (raw) {
      try {
        setApptInfo(JSON.parse(raw));
      } catch (e: unknown) {
        console.error("Failed to parse localStorage:", e);
      }
    }
  }, []);

  const displayDate = apptInfo?.date
    ? format(parseISO(apptInfo.date), "EEEE, dd MMMM yyyy")
    : "Friday, 28 March 2026";

  const displayTime = apptInfo?.time ?? "10:00 AM";

  function addMinutes(timeStr: string, minutes: number): string {
    const [timePart, period] = timeStr.split(" ");
    const [hourStr, minStr] = timePart.split(":");
    let hour = parseInt(hourStr, 10);
    const min = parseInt(minStr, 10);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    const totalMin = hour * 60 + min + minutes;
    const newHour = Math.floor(totalMin / 60) % 24;
    const newMin = totalMin % 60;
    const newPeriod = newHour < 12 ? "AM" : "PM";
    const displayHour = newHour % 12 === 0 ? 12 : newHour % 12;
    return `${displayHour}:${String(newMin).padStart(2, "0")} ${newPeriod}`;
  }

  const TIPS = [
    "Have your glucometer and blood pressure monitor ready",
    "Write down any questions you'd like to ask Dr. Jasmine",
    "Make sure you're in a quiet spot with good internet for the video call",
    "Have a pen and paper handy for notes",
  ];

  return (
    <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center p-6 max-w-sm mx-auto relative overflow-hidden">
      <DemoControls />

      <svg
        aria-hidden="true"
        viewBox="0 0 400 300"
        className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.04]"
        fill="none"
        stroke="#2D5E4C"
        strokeWidth="28"
      >
        <path d="M-50,150 Q100,0 200,150 T450,150" />
        <path d="M-50,220 Q100,70 200,220 T450,220" />
      </svg>

      <MotionStagger className="w-full">
        <MotionItem className="w-20 h-20 bg-primary/[0.08] rounded-full flex items-center justify-center mb-6 shadow-card mx-auto">
          <CalendarCheck size={40} className="text-primary" />
        </MotionItem>

        <MotionItem>
          <h1 className="font-display text-[36px] font-normal text-text-primary mb-8 text-center tracking-[-0.03em]">
            Session {MOCK_PATIENT.sessionsCompleted + 1} Confirmed
          </h1>
        </MotionItem>

        <MotionItem>
          <Card variant="elevated" className="w-full overflow-hidden mb-6">
            <div className="bg-primary/[0.07] px-5 py-4 border-b border-primary/10">
              <h2 className="font-semibold text-primary text-lg">
                Your session is booked.
              </h2>
            </div>
            <CardContent className="p-5 flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  Date
                </p>
                <p className="text-lg font-bold text-text-primary">{displayDate}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  Time
                </p>
                <p className="text-lg font-bold text-text-primary">
                  {displayTime} – {addMinutes(displayTime, 30)}
                </p>
              </div>

              <div className="mt-2 flex flex-col items-center">
                <Button variant="default" size="patient" disabled className="w-full">
                  Join on Zoom
                </Button>
                <div className="flex items-center gap-1.5 mt-2 text-sm text-text-secondary font-medium">
                  <Info size={14} />
                  <span>This button will appear 15 minutes before your appointment</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionItem>

        <MotionItem>
          <Card className="w-full p-5 mb-6">
            <h3 className="font-semibold text-text-primary text-lg mb-4">
              How to Prepare
            </h3>
            <ul className="space-y-3">
              {TIPS.map((tip) => (
                <li key={tip} className="flex gap-2.5 items-start">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span className="text-sm text-text-secondary font-medium leading-relaxed">
                    {tip}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </MotionItem>

        <MotionItem className="w-full space-y-2 px-1 mb-8">
          <h3 className="font-semibold text-text-primary text-lg border-b border-border pb-2">
            What happens next?
          </h3>
          <p className="text-text-secondary leading-relaxed text-base">
            Dr. Jasmine will review your progress and discuss next steps during your consultation. You&apos;re all set for now!
          </p>
        </MotionItem>

        <MotionItem className="text-center">
          <a
            href="https://wa.me/60123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline transition-colors text-sm"
          >
            Need help? Contact us on WhatsApp
          </a>
        </MotionItem>
      </MotionStagger>
    </div>
  );
}
