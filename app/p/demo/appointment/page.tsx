"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PatientPageLayout } from "@/components/patient/PatientPageLayout";
import { MotionItem } from "@/components/motion/MotionItem";
import { MotionStagger } from "@/components/motion/MotionStagger";
import { MOCK_APPOINTMENT, Appointment } from "@/lib/mock-data";
import { format, parseISO } from "date-fns";
import { Calendar, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/** Patient appointment page — view current appointment and booking actions. */
export default function AppointmentPage() {
  const [apptInfo, setApptInfo] = useState<
    Appointment | { date: string; time: string } | null
  >(null);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    const localAppt = localStorage.getItem("demo_appointment");
    if (localAppt) {
      try {
        setApptInfo(JSON.parse(localAppt));
      } catch (e: unknown) {
        console.error("Failed to parse localStorage:", e);
      }
    } else {
      setApptInfo(MOCK_APPOINTMENT);
    }
    
    const storedSessions = localStorage.getItem("demo_sessions_completed");
    if (storedSessions) {
      setSessionsCompleted(parseInt(storedSessions, 10));
    } else {
      setSessionsCompleted(0);
    }
  }, []);

  const handleReschedule = () => {
    toast.info("Opening WhatsApp...");
    window.open("https://wa.me/60123456789", "_blank");
  };

  /* No appointment state */
  if (!apptInfo) {
    return (
      <PatientPageLayout activePath="/p/demo/appointment">
        <div className="px-6 pt-8 pb-8">
          <MotionStagger>
            <MotionItem>
              <h1 className="text-[28px] font-display text-main mb-6">Your Appointment</h1>
            </MotionItem>
            <MotionItem>
              <div className="bg-surface rounded-2xl border border-border p-6 shadow-card text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
                  <Calendar size={22} />
                </div>
                {sessionsCompleted === 0 ? (
                  <>
                    <p className="text-main font-medium text-lg mb-4">You do not have an appointment booked yet.</p>
                    <Link href="/p/demo/book">
                      <Button variant="default" size="patient" className="w-full">
                        Book a consultation
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-main font-medium text-lg leading-relaxed mb-6">
                      Your next session will be scheduled by Dr. Jasmine during your consultation. No action needed on your end.
                    </p>
                    <p className="text-sm text-text-secondary font-medium mb-3">Need to get in touch?</p>
                    <Button variant="outline" size="patient" className="w-full" onClick={handleReschedule}>
                      WhatsApp Dr. Jasmine&apos;s clinic →
                    </Button>
                  </>
                )}
              </div>
            </MotionItem>
          </MotionStagger>
        </div>
      </PatientPageLayout>
    );
  }

  let displayDate = "";
  let displayTime = "";
  let durationMinutes = 30;

  if ("date" in apptInfo) {
    const dateObj = parseISO(apptInfo.date);
    displayDate = format(dateObj, "EEEE, dd MMMM yyyy");
    displayTime = apptInfo.time;
    durationMinutes = 30; // default for local local book
  } else {
    const dateObj = parseISO(apptInfo.startsAt);
    displayDate = format(dateObj, "EEEE, dd MMMM yyyy");
    displayTime = format(dateObj, "hh:mm a");
    durationMinutes = apptInfo.durationMinutes || 30;
  }

  const [dayOfWeek, dateAndMonth] = displayDate.split(", ");

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

  return (
    <PatientPageLayout activePath="/p/demo/appointment">
      <div className="px-6 pt-8 pb-8">
        <MotionStagger>
          <MotionItem>
            <h1 className="text-[28px] font-display text-main">Your Appointment</h1>
          </MotionItem>

          <MotionItem>
            <div className="bg-surface rounded-2xl border border-border p-6 shadow-card-elevated">
              <h2 className="text-[13px] font-medium uppercase tracking-[0.1em] text-text-secondary mb-4">Next appointment</h2>
              <h3 className="text-[20px] font-semibold text-main leading-tight mb-1">
                {dayOfWeek}
                <br />
                {dateAndMonth}
              </h3>
              <p className="text-xl font-semibold text-primary mb-1">{displayTime} - {addMinutes(displayTime, durationMinutes)}</p>
              <p className="text-text-secondary font-medium mb-4">Duration: {durationMinutes} minutes</p>

              <div className="flex items-center gap-2 text-main font-medium mb-6 bg-primary-light px-3 py-2 rounded-xl">
                <Video size={18} className="text-primary" />
                <span>Video call with Dr. Jasmine</span>
              </div>

              <div className="space-y-2">
                <Button variant="default" size="patient" className="w-full" disabled>
                  Join on Zoom
                </Button>
                <p className="text-sm text-center text-text-secondary">(The Join button activates 15 minutes before your call)</p>
              </div>
            </div>
          </MotionItem>

          <MotionItem>
            <div className="space-y-3 pt-3">
              <Button variant="outline" size="patient" className="w-full" onClick={handleReschedule}>
                Reschedule
              </Button>
            </div>
          </MotionItem>
        </MotionStagger>
      </div>
    </PatientPageLayout>
  );
}
