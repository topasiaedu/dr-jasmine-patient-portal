"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, User, Link as LinkIcon, AlertCircle } from "lucide-react";
import Link from "next/link";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { MOCK_PATIENT } from "@/lib/mock-data";

type AppointmentStatus = "Scheduled" | "Completed" | "Cancelled";

interface MockAppointment {
  id: string;
  patientId: string;
  patientName: string;
  dateTime: Date;
  durationMinutes: number;
  status: AppointmentStatus;
}

export default function SchedulePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [appointments, setAppointments] = useState<MockAppointment[]>([]);

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (!auth) {
      router.push("/admin/login");
      return;
    }
    setMounted(true);

    // Generate mock appointments relative to today
    const now = new Date();
    const mockAppts: MockAppointment[] = [
      {
        id: "apt-1",
        patientId: MOCK_PATIENT.id,
        patientName: MOCK_PATIENT.fullName,
        dateTime: setMinutes(setHours(addDays(now, 1), 10), 0), // Tomorrow 10:00 AM
        durationMinutes: 30,
        status: "Scheduled",
      },
      {
        id: "apt-2",
        patientId: "usr_robert_chen",
        patientName: "Robert Chen",
        dateTime: setMinutes(setHours(addDays(now, 2), 14), 30), // Day after tomorrow 2:30 PM
        durationMinutes: 30,
        status: "Scheduled",
      },
      {
        id: "apt-3",
        patientId: MOCK_PATIENT.id,
        patientName: MOCK_PATIENT.fullName,
        dateTime: setMinutes(setHours(now, 9), 0), // Today 9:00 AM
        durationMinutes: 30,
        status: "Completed",
      },
      {
        id: "apt-4",
        patientId: "usr_sarah_wong",
        patientName: "Sarah Wong",
        dateTime: setMinutes(setHours(addDays(now, -1), 11), 0), // Yesterday 11:00 AM
        durationMinutes: 30,
        status: "Cancelled",
      },
    ];
    setAppointments(mockAppts.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()));

  }, [router]);

  if (!mounted) {
    return (
      <AdminLayout>
        <AdminPageSkeleton />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground">Your upcoming consultations.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Upcoming & Recent</h2>
            {appointments.map((appt) => (
              <Card key={appt.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-border shadow-sm rounded-2xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-150">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold text-lg">{appt.patientName}</span>
                    <Badge
                      variant={
                        appt.status === "Scheduled"
                          ? "default"
                          : appt.status === "Completed"
                          ? "secondary"
                          : "outline"
                      }
                      className={
                        appt.status === "Scheduled"
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-none"
                          : appt.status === "Completed"
                          ? "bg-green-100 text-green-700 hover:bg-green-100 border-none"
                          : "text-muted-foreground"
                      }
                    >
                      {appt.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4" />
                      {format(appt.dateTime, "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {format(appt.dateTime, "h:mm a")} ({appt.durationMinutes} min)
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link href={`/admin/patients/${appt.patientId}`}>
                    <Button variant="outline" className="rounded-xl">
                      View Profile
                    </Button>
                  </Link>
                  {appt.status === "Scheduled" && (
                    <Link
                      href={`/admin/patients/${appt.patientId}/consult`}
                      className="rounded-lg border border-[#2D5E4C] px-3 py-1.5 text-sm font-semibold text-[#2D5E4C] transition-colors hover:bg-[#EEF5F1]"
                    >
                      Start Consultation
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Integrations</h2>
            <Card className="p-6 border-dashed border-2 bg-muted/30 shadow-none rounded-2xl flex flex-col items-center justify-center text-center space-y-4 min-h-[200px] hover:-translate-y-0.5 hover:shadow-md transition-all duration-150">
              <div className="p-3 bg-muted rounded-full">
                <AlertCircle className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">Cal.com Not Connected</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Calendar sync will appear here when Cal.com is connected.
                </p>
              </div>
              <Button variant="outline" className="mt-2 rounded-xl" disabled>
                <LinkIcon className="w-4 h-4 mr-2" />
                Connect Calendar
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
