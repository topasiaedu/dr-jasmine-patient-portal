import { NextRequest, NextResponse } from "next/server";
import { getAdminUserForRequest } from "@/lib/supabase/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

function mergeSupabaseCookies(from: NextResponse, to: NextResponse): void {
  from.cookies.getAll().forEach((c) => {
    to.cookies.set(c.name, c.value);
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export interface RecentActivityItem {
  id: string;
  patientId: string;
  patientName: string;
  readingDate: string;
  fastingBloodSugar: number;
  bloodPressureSystolic: number;
  submittedAt: string;
}

export interface AdminStatsJson {
  activePatients: number;
  recentReadingsCount: number;
  recentActivity: RecentActivityItem[];
}

/**
 * Admin dashboard aggregate stats.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authShell = NextResponse.json({ ok: true });
  const user = await getAdminUserForRequest(request, authShell);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [activeRes, recentRes, activityRes] = await Promise.all([
    supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("daily_readings")
      .select("*", { count: "exact", head: true })
      .gte("submitted_at", sevenDaysAgo.toISOString()),
    supabase
      .from("daily_readings")
      .select("id, patient_id, reading_date, fasting_blood_sugar, blood_pressure_systolic, submitted_at, patients(id, full_name)")
      .order("submitted_at", { ascending: false })
      .limit(5),
  ]);

  const activePatients = activeRes.count !== null && activeRes.count !== undefined ? activeRes.count : 0;
  const recentReadingsCount =
    recentRes.count !== null && recentRes.count !== undefined ? recentRes.count : 0;

  const recentActivity: RecentActivityItem[] = [];
  if (!activityRes.error && activityRes.data) {
    for (const row of activityRes.data) {
      const patientsVal = isRecord(row) ? Reflect.get(row, "patients") : null;
      let patientName = "Unknown";
      if (isRecord(patientsVal)) {
        const n = Reflect.get(patientsVal, "full_name");
        if (typeof n === "string" && n.length > 0) {
          patientName = n;
        }
      }
      if (!isRecord(row)) {
        continue;
      }
      const id = Reflect.get(row, "id");
      const patientId = Reflect.get(row, "patient_id");
      const readingDate = Reflect.get(row, "reading_date");
      const fbs = Reflect.get(row, "fasting_blood_sugar");
      const bps = Reflect.get(row, "blood_pressure_systolic");
      const sub = Reflect.get(row, "submitted_at");
      if (
        typeof id === "string" &&
        typeof patientId === "string" &&
        typeof readingDate === "string" &&
        (typeof fbs === "number" || typeof fbs === "string") &&
        (typeof bps === "number" || typeof bps === "string") &&
        typeof sub === "string"
      ) {
        recentActivity.push({
          id,
          patientId,
          patientName,
          readingDate,
          fastingBloodSugar: Number(fbs),
          bloodPressureSystolic: Number(bps),
          submittedAt: sub,
        });
      }
    }
  }

  const payload: AdminStatsJson = {
    activePatients,
    recentReadingsCount,
    recentActivity,
  };

  const out = NextResponse.json(payload);
  mergeSupabaseCookies(authShell, out);
  return out;
}
