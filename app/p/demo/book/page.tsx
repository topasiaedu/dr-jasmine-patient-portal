"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DemoControls } from "@/components/demo/DemoControls";
import { Button } from "@/components/ui/button";
import { addDays, format, startOfToday } from "date-fns";
import { MOCK_PATIENT, MOCK_AVAILABILITY_WINDOWS, MOCK_APPOINTMENT, AvailabilityWindow } from "@/lib/mock-data";
import { MotionItem } from "@/components/motion/MotionItem";
import { MotionStagger } from "@/components/motion/MotionStagger";
import { cn } from "@/lib/utils";

export default function BookPage() {
  const router = useRouter();
  const today = startOfToday();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [windows, setWindows] = useState<AvailabilityWindow[]>(MOCK_AVAILABILITY_WINDOWS);

  useEffect(() => {
    const localWindows = localStorage.getItem("admin_availability_windows");
    if (localWindows) {
      try {
        setWindows(JSON.parse(localWindows));
      } catch {}
    }
  }, []);

  const next14Days = Array.from({ length: 14 }).map((_, i) => addDays(today, i));
  const availableDates = next14Days.filter(d => 
    windows.some(w => w.dayOfWeek === d.getDay())
  );

  const timeSlots: string[] = [];
  if (selectedDate) {
    const day = selectedDate.getDay();
    const dayWindows = windows.filter(w => w.dayOfWeek === day);
    dayWindows.forEach(w => {
      const startMs = parseTime(w.startTime);
      const endMs = parseTime(w.endTime);
      let currentMs = startMs;
      while (currentMs < endMs) {
        timeSlots.push(formatTime(currentMs));
        currentMs += 30 * 60 * 1000;
      }
    });
  }

  function parseTime(timeStr: string) {
    const [h, m] = timeStr.split(":");
    return (parseInt(h) * 60 + parseInt(m)) * 60 * 1000;
  }
  
  function formatTime(ms: number) {
    const totalMinutes = Math.floor(ms / (60 * 1000));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const date = new Date(0, 0, 0, hours, mins);
    return format(date, "hh:mm a");
  }

  const isUnavailable = (date: Date, timeStr: string) => {
    const slotStart = new Date(date);
    const [time, modifier] = timeStr.split(" ");
    let [h, m] = time.split(":");
    let hNum = parseInt(h);
    if (modifier === "PM" && hNum < 12) hNum += 12;
    if (modifier === "AM" && hNum === 12) hNum = 0;
    slotStart.setHours(hNum, parseInt(m), 0, 0);
    const slotEnd = new Date(slotStart.getTime() + 30 * 60000);

    const mockApptStart = new Date(MOCK_APPOINTMENT.startsAt);
    const mockApptEnd = new Date(MOCK_APPOINTMENT.endsAt);
    if (slotStart < mockApptEnd && slotEnd > mockApptStart) return true;

    const checks = ["demo_appointment", "demo_next_appointment"];
    for (const key of checks) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const { date: d, time: t } = JSON.parse(stored);
          if (format(date, "yyyy-MM-dd") === d && timeStr === t) return true;
        } catch (e) {}
      }
    }
    return false;
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return;
    const appointmentDateStr = format(selectedDate, "yyyy-MM-dd");
    localStorage.setItem(
      "demo_appointment",
      JSON.stringify({ date: appointmentDateStr, time: selectedTime })
    );
    localStorage.setItem("demo_patient_status", "booked");
    router.push("/p/demo/pending");
  };

  const bookingSessionNumber = MOCK_PATIENT.sessionsCompleted + 1;

  return (
    <div className="min-h-screen bg-bg-app flex flex-col max-w-md mx-auto relative pb-32">
      <DemoControls />

      <MotionStagger className="contents">
        <MotionItem className="px-5 pt-6 pb-4 flex items-start gap-3">
          <Link
            href="/p/demo"
            className="shrink-0 mt-1 p-2 border border-border bg-white rounded-xl hover:bg-surface-depth text-primary transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-[28px] font-normal text-text-primary leading-tight tracking-[-0.02em]">
              Book Session {bookingSessionNumber}
            </h1>
            <p className="text-text-secondary text-base mt-1">
              Pick a time that works for you.
            </p>
          </div>
        </MotionItem>

        <div className="flex-1 px-5 mt-2 overflow-y-auto space-y-6">
          <MotionItem className="bg-white rounded-[20px] border border-border shadow-card p-5">
            <label className="block text-sm font-bold text-text-secondary mb-4 uppercase tracking-wider">
              Select Date
            </label>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
              {availableDates.map((date, idx) => {
                const isSelected = selectedDate?.getTime() === date.getTime();
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedTime(null);
                    }}
                    className={cn(
                      "snap-start flex flex-col items-center justify-center flex-shrink-0 min-w-[72px] h-[90px] rounded-2xl border transition-all",
                      isSelected
                        ? "bg-primary border-primary text-white shadow-btn-primary scale-105"
                        : "bg-white border-border text-text-primary hover:border-primary/30"
                    )}
                  >
                    <span className={cn("text-xs font-semibold uppercase", isSelected ? "text-white/70" : "text-text-secondary")}>
                      {format(date, "EEE")}
                    </span>
                    <span className="text-2xl font-bold mt-1">
                      {format(date, "d")}
                    </span>
                    <span className={cn("text-[10px] uppercase font-bold mt-1", isSelected ? "text-white/70" : "text-text-secondary")}>
                      {format(date, "MMM")}
                    </span>
                  </button>
                );
              })}
            </div>
          </MotionItem>

          {selectedDate && (
            <MotionItem className="bg-white rounded-[20px] border border-border shadow-card p-5">
              <label className="block text-sm font-bold text-text-secondary mb-4 uppercase tracking-wider">
              Select Time
              </label>
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map((time) => {
                  const unavailable = isUnavailable(selectedDate, time);
                  const isSelected = selectedTime === time;

                  return (
                    <button
                      key={time}
                      disabled={unavailable}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "h-14 rounded-[14px] border font-semibold transition-all flex items-center justify-center text-sm",
                        unavailable
                          ? "bg-surface-depth border-border text-text-tertiary cursor-not-allowed opacity-50"
                          : isSelected
                            ? "bg-primary border-primary text-white shadow-btn-primary ring-2 ring-primary/20 ring-offset-2"
                            : "bg-white border-border text-text-primary hover:border-primary/40 hover:bg-primary-light"
                      )}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </MotionItem>
          )}
        </div>
      </MotionStagger>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-border p-4 z-40 max-w-md mx-auto">
        <Button
          variant="default"
          size="patient"
          className="w-full mb-2"
          disabled={!selectedDate || !selectedTime}
          onClick={handleConfirm}
        >
          Confirm Booking
        </Button>
        <div className="text-center text-xs text-text-secondary font-medium px-2 pb-1">
          Booking for: {MOCK_PATIENT.fullName} &middot; {MOCK_PATIENT.email}
        </div>
      </div>
    </div>
  );
}
