"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";
import {
  MOCK_PATIENT,
  MOCK_APPOINTMENT,
  MOCK_AVAILABILITY_WINDOWS,
  MOCK_BLOCKED_SLOTS,
} from "@/lib/mock-data";
import { parseISO, format } from "date-fns";
import { useRouter } from "next/navigation";

type CalendarEventInput = {
  id?: string;
  title?: string;
  start?: string | Date;
  end?: string | Date;
  display?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
};

export default function AdminCalendarPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<CalendarEventInput[]>([]);

  useEffect(() => {
    setMounted(true);

    const blockedEvents = MOCK_BLOCKED_SLOTS.map((b) => ({
      start: b.startsAt,
      end: b.endsAt,
      display: "background",
      color: "#D1C8C0", // Slightly darker grey for blocked
    }));

    const activeApptEvents: CalendarEventInput[] = [
      {
        id: "mock1",
        title: `Session ${MOCK_APPOINTMENT.sessionNumber}: ${MOCK_PATIENT.fullName}`,
        start: MOCK_APPOINTMENT.startsAt,
        end: MOCK_APPOINTMENT.endsAt,
        backgroundColor: "#2D5E4C",
        borderColor: "#2D5E4C",
        textColor: "#ffffff",
      },
    ];

    function parseDateAndTime(dateStr: string, timeStr: string) {
      const d = parseISO(dateStr);
      const [time, modifier] = timeStr.split(" ");
      const [h, m] = time.split(":");
      let hNum = parseInt(h);
      if (modifier === "PM" && hNum < 12) hNum += 12;
      if (modifier === "AM" && hNum === 12) hNum = 0;
      d.setHours(hNum, parseInt(m), 0, 0);
      return d;
    }

    const demoAppt = localStorage.getItem("demo_appointment");
    if (demoAppt) {
      try {
        const { date, time } = JSON.parse(demoAppt);
        const startDate = parseDateAndTime(date, time);
        const endDate = new Date(startDate.getTime() + 30 * 60000);
        activeApptEvents.push({
          id: "demo_appt",
          title: `Session 1: ${MOCK_PATIENT.fullName}`,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          backgroundColor: "#B8860B", // Accent color for outstanding booking
          borderColor: "#B8860B",
          textColor: "#ffffff",
        });
      } catch {
        // ignore malformed localStorage entry
      }
    }

    const demoNextAppt = localStorage.getItem("demo_next_appointment");
    if (demoNextAppt) {
      try {
        const { date, time } = JSON.parse(demoNextAppt);
        const startDate = parseDateAndTime(date, time);
        const endDate = new Date(startDate.getTime() + 30 * 60000);
        const nextSessionNum = MOCK_PATIENT.sessionsCompleted + 2; 
        activeApptEvents.push({
          id: "demo_next_appt",
          title: `Session ${nextSessionNum}: ${MOCK_PATIENT.fullName}`,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          backgroundColor: "#128C7E", // WhatsApp green tint for newly admin booked
          borderColor: "#128C7E",
          textColor: "#ffffff",
        });
      } catch {
        // ignore malformed localStorage entry
      }
    }

    setEvents([...blockedEvents, ...activeApptEvents]);
  }, []);

  if (!mounted) {
    return (
      <AdminLayout>
        <AdminPageSkeleton />
      </AdminLayout>
    );
  }

  const businessHours = MOCK_AVAILABILITY_WINDOWS.map((w) => ({
    daysOfWeek: [w.dayOfWeek],
    startTime: w.startTime,
    endTime: w.endTime,
  }));

  // Setup initial view focus close to the MOCK_APPOINTMENT if we are far away
  // or just use default start
  const mockDateStr = format(parseISO(MOCK_APPOINTMENT.startsAt), "yyyy-MM-dd");

  return (
    <AdminLayout fullBleed>
      <style dangerouslySetInnerHTML={{ __html: `
        .fc {
          --fc-page-bg-color: #ffffff;
          --fc-neutral-bg-color: #F7F5F2;
          --fc-border-color: #E5DFD8;
          --fc-button-text-color: #2D5E4C;
          --fc-button-bg-color: #ffffff;
          --fc-button-border-color: #E5DFD8;
          --fc-button-hover-bg-color: #F7F5F2;
          --fc-button-hover-border-color: #2D5E4C;
          --fc-button-active-bg-color: #2D5E4C;
          --fc-button-active-border-color: #2D5E4C;
          --fc-button-active-text-color: #ffffff;
          --fc-today-bg-color: rgba(45, 94, 76, 0.05);
          --fc-non-business-color: rgba(0, 0, 0, 0.02);
          --fc-event-bg-color: #2D5E4C;
          --fc-event-border-color: #2D5E4C;
          height: 100%;
        }
        .fc-theme-standard th {
          padding: 10px 0;
          font-weight: 600;
          color: #5C5247;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.05em;
        }
        .fc-event {
          cursor: pointer;
          border-radius: 6px;
          padding: 2px 4px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          border: none;
        }
        .fc-bg-event {
          opacity: 0.8 !important;
          border-radius: 0;
        }
        .fc-timegrid-slot-label {
          font-weight: 500;
          color: #5C5247;
        }
        .fc-header-toolbar {
          padding: 1rem 1.5rem !important;
          margin-bottom: 0 !important;
          border-bottom: 1px solid var(--fc-border-color);
          background: #ffffff;
        }
        .fc-toolbar-title {
          font-family: var(--font-display), serif;
          font-size: 1.5rem !important;
          color: #2C2825;
        }
        .fc-button {
          font-weight: 600 !important;
          border-radius: 8px !important;
          text-transform: capitalize;
        }
        .calendar-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #ffffff;
        }
        .fc-view-harness {
          background: #ffffff;
        }
      ` }} />

      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          initialDate={mockDateStr} // Start on the week of our mock appointment so we see *something* if it's far
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          businessHours={businessHours}
          events={events}
          height="100%"
          eventClick={(info) => {
            if (info.event.id && info.event.id !== "bg") {
              router.push(`/admin/patients/demo/consult`);
            }
          }}
          nowIndicator={true}
          slotDuration="00:30:00"
          expandRows={true}
        />
      </div>
    </AdminLayout>
  );
}
