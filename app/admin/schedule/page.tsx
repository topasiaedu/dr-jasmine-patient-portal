"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { MOCK_PATIENT, MOCK_AVAILABILITY_WINDOWS, MOCK_BLOCKED_SLOTS, MOCK_APPOINTMENT, AvailabilityWindow, BlockedSlot, Appointment } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { parseISO, format } from "date-fns";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventInput } from "@fullcalendar/core";

type CalendarEvent = {
  id?: string;
  title?: string;
  start?: string;
  end?: string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  display?: string;
  daysOfWeek?: number[];
  startTime?: string;
  endTime?: string;
  extendedProps: {
    type: "appointment" | "blocked" | "availability";
    privateLabel?: string;
    patientId?: string;
    sessionNumber?: number;
    durationMinutes?: number;
  };
};

export default function SchedulePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [availabilityWindows, setAvailabilityWindows] = useState<AvailabilityWindow[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockModalSelection, setBlockModalSelection] = useState<{ start: string; end: string } | null>(null);
  const [blockModalLabel, setBlockModalLabel] = useState("");
  const [blockModalAllDay, setBlockModalAllDay] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [blockedPopoverOpen, setBlockedPopoverOpen] = useState(false);

  const [availabilitySheetOpen, setAvailabilitySheetOpen] = useState(false);
  const [editingWindows, setEditingWindows] = useState<AvailabilityWindow[]>([]);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem("admin_auth")) {
      router.replace("/admin/login");
      return;
    }

    // Load Availability
    const savedAvail = localStorage.getItem("admin_availability_windows");
    if (savedAvail) {
      try {
        setAvailabilityWindows(JSON.parse(savedAvail));
      } catch {
        setAvailabilityWindows(MOCK_AVAILABILITY_WINDOWS);
      }
    } else {
      setAvailabilityWindows(MOCK_AVAILABILITY_WINDOWS);
    }

    // Load Blocked Slots
    const savedBlocked = localStorage.getItem("admin_blocked_slots");
    if (savedBlocked) {
      try {
        setBlockedSlots(JSON.parse(savedBlocked));
      } catch {
        setBlockedSlots(MOCK_BLOCKED_SLOTS);
      }
    } else {
      setBlockedSlots(MOCK_BLOCKED_SLOTS);
    }

    // Load Appointments
    const apptsList: Appointment[] = [MOCK_APPOINTMENT];
    const nextApptStr = localStorage.getItem("demo_next_appointment");
    if (nextApptStr) {
      try {
        apptsList.push(JSON.parse(nextApptStr));
      } catch (e) {
        console.error("Failed parsing next_appointment", e);
      }
    }
    setAppointments(apptsList);
  }, [router]);

  const computedEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Background events
    availabilityWindows.forEach(window => {
      events.push({
        daysOfWeek: [window.dayOfWeek],
        startTime: window.startTime,
        endTime: window.endTime,
        display: "background",
        backgroundColor: "rgba(45, 94, 76, 0.07)",
        extendedProps: { type: "availability" }
      });
    });

    // Blocked slots
    blockedSlots.forEach(slot => {
      events.push({
        id: slot.id,
        title: "Unavailable",
        start: slot.startsAt,
        end: slot.endsAt,
        allDay: slot.isAllDay,
        backgroundColor: "#D1C8C0",
        borderColor: "#B5ADA5",
        textColor: "#5C5650",
        extendedProps: { type: "blocked", privateLabel: slot.privateLabel }
      });
    });

    // Appointments
    appointments.forEach(appt => {
      events.push({
        id: appt.id,
        title: `${MOCK_PATIENT.fullName} — Session ${appt.sessionNumber}`,
        start: appt.startsAt,
        end: appt.endsAt,
        backgroundColor: "#2D5E4C",
        borderColor: "#2D5E4C",
        textColor: "#FFFFFF",
        extendedProps: { 
          type: "appointment", 
          patientId: appt.patientId, 
          sessionNumber: appt.sessionNumber,
          durationMinutes: appt.durationMinutes
        }
      });
    });

    return events;
  }, [availabilityWindows, blockedSlots, appointments]);

  if (!mounted) {
    return (
      <AdminLayout>
        <AdminPageSkeleton />
      </AdminLayout>
    );
  }

  const handleSelect = (info: DateSelectArg) => {
    setBlockModalSelection({ start: info.startStr, end: info.endStr });
    setBlockModalAllDay(info.allDay);
    setBlockModalLabel("");
    setBlockModalOpen(true);
  };

  const handleCreateBlock = () => {
    if (!blockModalSelection) return;
    const newSlot: BlockedSlot = {
      id: `blk-${Date.now()}`,
      startsAt: blockModalSelection.start,
      endsAt: blockModalSelection.end,
      isAllDay: blockModalAllDay,
      privateLabel: blockModalLabel
    };
    const newSlots = [...blockedSlots, newSlot];
    setBlockedSlots(newSlots);
    localStorage.setItem("admin_blocked_slots", JSON.stringify(newSlots));
    setBlockModalOpen(false);
    toast.success("Time blocked successfully.");
  };

  const handleEventClick = (info: EventClickArg) => {
    const props = info.event.extendedProps as CalendarEvent["extendedProps"];
    const evt: CalendarEvent = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr,
      extendedProps: props,
    };
    setSelectedEvent(evt);

    if (props.type === "appointment") {
      setPopoverOpen(true);
    } else if (props.type === "blocked") {
      setBlockedPopoverOpen(true);
    }
  };

  const removeBlockedSlot = () => {
    if (!selectedEvent?.id) return;
    const newSlots = blockedSlots.filter(s => s.id !== selectedEvent.id);
    setBlockedSlots(newSlots);
    localStorage.setItem("admin_blocked_slots", JSON.stringify(newSlots));
    setBlockedPopoverOpen(false);
    toast.success("Block removed.");
  };

  const openManageAvailability = () => {
    setEditingWindows(JSON.parse(JSON.stringify(availabilityWindows)));
    setAvailabilitySheetOpen(true);
  };

  const saveAvailability = () => {
    setAvailabilityWindows(editingWindows);
    localStorage.setItem("admin_availability_windows", JSON.stringify(editingWindows));
    setAvailabilitySheetOpen(false);
    toast.success("Availability updated.");
  };

  const DAYS = [
    { name: "Sunday", index: 0 },
    { name: "Monday", index: 1 },
    { name: "Tuesday", index: 2 },
    { name: "Wednesday", index: 3 },
    { name: "Thursday", index: 4 },
    { name: "Friday", index: 5 },
    { name: "Saturday", index: 6 },
  ];

  const updateWindow = (idx: number, field: "startTime" | "endTime", value: string) => {
    const w = [...editingWindows];
    w[idx] = { ...w[idx], [field]: value };
    setEditingWindows(w);
  };

  const addWindow = (dayIndex: 0|1|2|3|4|5|6) => {
    setEditingWindows([...editingWindows, { id: `win-${Date.now()}`, dayOfWeek: dayIndex, startTime: "09:00", endTime: "12:00" }]);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-full min-h-[calc(100vh-2rem)] pb-10">
        
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-main">Schedule</h1>
          <Button onClick={openManageAvailability} variant="outline" className="border-border">Manage Availability</Button>
        </div>

        {/* Calendar Card */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-border shadow-sm flex-1 min-h-[600px] cal-wrapper">
          <FullCalendar
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "timeGridDay,timeGridWeek,dayGridMonth"
            }}
            slotMinTime="07:00:00"
            slotMaxTime="19:00:00"
            firstDay={1}
            selectable={true}
            selectMirror={true}
            eventClick={handleEventClick}
            select={handleSelect}
            events={computedEvents as EventInput[]}
            height="auto"
          />
        </div>

      </div>

      <style jsx global>{`
        .cal-wrapper .fc-theme-standard td, .cal-wrapper .fc-theme-standard th {
          border-color: #E5DFD8;
        }
        .cal-wrapper .fc-timegrid-slot {
          height: 3em; 
        }
        .cal-wrapper .fc-col-header-cell-cushion, .cal-wrapper .fc-daygrid-day-number {
          color: #2D5E4C;
        }
        .cal-wrapper .fc-day-today {
          background-color: rgba(45, 94, 76, 0.04) !important;
        }
        .cal-wrapper .fc-button-primary {
          background-color: #2D5E4C;
          border-color: #2D5E4C;
        }
        .cal-wrapper .fc-button-primary:not(:disabled):active, 
        .cal-wrapper .fc-button-primary:not(:disabled).fc-button-active {
          background-color: #1a382d;
          border-color: #1a382d;
        }
      `}</style>

      {/* Block Time Dialog */}
      <Dialog open={blockModalOpen} onOpenChange={setBlockModalOpen}>
        <DialogContent className="sm:max-w-md border-0 p-0 overflow-hidden bg-bg-app rounded-2xl">
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-display text-main font-semibold">Block This Time</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-secondary">
                {blockModalSelection && `${format(parseISO(blockModalSelection.start), "MMM d, h:mm a")} — ${format(parseISO(blockModalSelection.end), "h:mm a")}`}
              </p>
              <div>
                <label className="block text-sm font-semibold text-main mb-1.5">Label (private — only you see this)</label>
                <Input 
                  value={blockModalLabel} 
                  onChange={e => setBlockModalLabel(e.target.value)} 
                  placeholder="E.g. Dental appointment"
                  className="rounded-xl"
                />
              </div>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={blockModalAllDay}
                  onChange={e => setBlockModalAllDay(e.target.checked)} 
                  className="rounded border-border"
                />
                <span className="text-sm font-medium text-main">All Day Block</span>
              </label>
            </div>
            <div className="flex gap-3 mt-8 justify-end">
              <Button variant="outline" onClick={() => setBlockModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateBlock} className="bg-primary hover:bg-primary-hover text-white">Block This Time</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Appt Event Popover */}
      <Dialog open={popoverOpen} onOpenChange={setPopoverOpen}>
        <DialogContent className="sm:max-w-sm rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-main">{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-secondary">
              {selectedEvent?.start && format(parseISO(selectedEvent.start), "EEEE, dd MMM yyyy 'at' h:mm a")}
            </p>
            <p className="text-sm text-secondary font-medium">Duration: {selectedEvent?.extendedProps.durationMinutes || 30} min</p>
            
            <Button 
              className="w-full mt-4 bg-primary text-white" 
              onClick={() => router.push(`/admin/patients/${selectedEvent?.extendedProps.patientId}/consult`)}
            >
              Open Patient Workspace →
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Blocked Event Popover */}
      <Dialog open={blockedPopoverOpen} onOpenChange={setBlockedPopoverOpen}>
        <DialogContent className="sm:max-w-sm rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-main">Blocked Time</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-secondary">
              {selectedEvent?.start && format(parseISO(selectedEvent.start), "EEEE, dd MMM yyyy, h:mm a")}
            </p>
            <div>
              <p className="text-xs uppercase font-semibold text-tertiary">Label:</p>
              <p className="text-sm font-medium text-main">{selectedEvent?.extendedProps.privateLabel || "(None)"}</p>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 text-danger border-red-200 hover:bg-red-50" onClick={removeBlockedSlot}>Remove Block</Button>
              <Button variant="outline" className="flex-1" onClick={() => setBlockedPopoverOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Availability Sheet */}
      <Sheet open={availabilitySheetOpen} onOpenChange={setAvailabilitySheetOpen}>
        <SheetContent className="bg-bg-app w-full sm:max-w-none md:w-[500px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-display text-main">Consultation Hours</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6">
            {DAYS.map(day => {
              const dayWindows = editingWindows.filter(w => w.dayOfWeek === day.index);
              const enabled = dayWindows.length > 0;
              
              return (
                <div key={day.index} className="border-b border-border pb-4 last:border-0">
                  <div className="flex items-center gap-3 mb-3">
                    <input 
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => {
                        if (e.target.checked) addWindow(day.index as 0|1|2|3|4|5|6);
                        else setEditingWindows(editingWindows.filter(w => w.dayOfWeek !== day.index));
                      }}
                      className="w-4 h-4 rounded appearance-none border border-border bg-white checked:bg-primary checked:border-primary relative
                        after:content-[''] after:absolute after:top-[2px] after:left-[5px] after:w-[4px] after:h-[8px] 
                        after:border-r-2 after:border-b-2 after:border-white after:rotate-45 after:scale-0 checked:after:scale-100"
                    />
                    <span className="font-semibold text-main w-32">{day.name}</span>
                  </div>

                  {enabled && (
                    <div className="pl-7 space-y-2">
                      {editingWindows.map((w, idx) => {
                        if (w.dayOfWeek !== day.index) return null;
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <Input 
                              type="time" 
                              value={w.startTime} 
                              onChange={(e) => updateWindow(idx, "startTime", e.target.value)}
                              className="w-[110px] h-9"
                              step="1800"
                            />
                            <span className="text-secondary text-sm">to</span>
                            <Input 
                              type="time" 
                              value={w.endTime} 
                              onChange={(e) => updateWindow(idx, "endTime", e.target.value)}
                              className="w-[110px] h-9"
                              step="1800"
                            />
                            <button 
                              onClick={() => setEditingWindows(editingWindows.filter((_, i) => i !== idx))}
                              className="p-1.5 text-secondary hover:bg-gray-200 rounded-full"
                            >
                              <X size={14}/>
                            </button>
                          </div>
                        );
                      })}
                      <button 
                        onClick={() => addWindow(day.index as 0|1|2|3|4|5|6)}
                        className="text-xs font-semibold text-primary hover:underline mt-1"
                      >
                        + Add window
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-6">
              <Button onClick={saveAvailability} className="w-full h-12 bg-primary text-white rounded-xl">Save Availability</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

    </AdminLayout>
  );
}
