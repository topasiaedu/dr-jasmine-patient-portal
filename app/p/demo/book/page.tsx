"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DemoControls } from "@/components/demo/DemoControls";
import { Button } from "@/components/ui/button";
import { addDays, format, isWeekend, startOfToday } from "date-fns";
import { MOCK_PATIENT } from "@/lib/mock-data";
import { MotionItem } from "@/components/motion/MotionItem";
import { MotionStagger } from "@/components/motion/MotionStagger";

/** Booking page — date and time slot selection for a consultation. */
export default function BookPage() {
  const router = useRouter();
  const today = startOfToday();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Generate next 14 weekdays available for booking
  const next14Days = Array.from({ length: 14 }).map((_, i) =>
    addDays(today, i)
  );
  const availableDates = next14Days.filter((d) => !isWeekend(d));

  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
  ];

  /**
   * Returns true for hardcoded unavailable slots — simulates real availability.
   */
  const isUnavailable = (date: Date, time: string): boolean => {
    const day = date.getDay();
    if (day === 1 && time === "10:00 AM") return true;
    if (day === 3 && time === "02:30 PM") return true;
    if (day === 5 && time === "11:00 AM") return true;
    return false;
  };

  /** Saves selection to localStorage and navigates to the pending screen. */
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
              Book Your Consultation
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
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
              {availableDates.map((date, idx) => {
                const isSelected = selectedDate?.getTime() === date.getTime();
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedTime(null);
                    }}
                    className={[
                      "snap-start flex flex-col items-center justify-center min-w-[72px] h-[90px] rounded-2xl border transition-all",
                      isSelected
                        ? "bg-primary border-primary text-white shadow-btn-primary scale-105"
                        : "bg-white border-border text-text-primary hover:border-primary/30",
                    ].join(" ")}
                  >
                    <span className={`text-xs font-semibold uppercase ${isSelected ? "text-white/70" : "text-text-secondary"}`}>
                      {format(date, "EEE")}
                    </span>
                    <span className="text-2xl font-bold mt-1">
                      {format(date, "d")}
                    </span>
                    <span className={`text-[10px] uppercase font-bold mt-1 ${isSelected ? "text-white/70" : "text-text-secondary"}`}>
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
                      className={[
                        "h-14 rounded-[14px] border font-semibold transition-all flex items-center justify-center text-sm",
                        unavailable
                          ? "bg-surface-depth border-border text-text-tertiary cursor-not-allowed"
                          : isSelected
                            ? "bg-primary border-primary text-white shadow-btn-primary ring-2 ring-primary/20 ring-offset-2"
                            : "bg-white border-border text-text-primary hover:border-primary/40 hover:bg-primary-light",
                      ].join(" ")}
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
