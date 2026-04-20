import { endOfMonth, format, startOfMonth } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { resolvePatientFromRequest } from "@/lib/auth/resolve-patient-request";
import { createServiceRoleClient } from "@/lib/supabase/admin";

/**
 * Returns the authenticated patient row (from cookie session).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const resolved = await resolvePatientFromRequest(request);
  if (!resolved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("patients")
    .select(
      "id, ghl_contact_id, full_name, email, phone, reading_cadence_note, status, created_at, updated_at"
    )
    .eq("id", resolved.patientId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let lastReadingDate: string | null = null;
  let readingsThisMonth = 0;

  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

  try {
    const [latestRes, countRes] = await Promise.all([
      supabase
        .from("daily_readings")
        .select("reading_date")
        .eq("patient_id", resolved.patientId)
        .order("reading_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("daily_readings")
        .select("*", { count: "exact", head: true })
        .eq("patient_id", resolved.patientId)
        .gte("reading_date", monthStart)
        .lte("reading_date", monthEnd),
    ]);

    if (!latestRes.error && latestRes.data?.reading_date !== undefined && latestRes.data.reading_date !== null) {
      const rd = latestRes.data.reading_date;
      lastReadingDate = typeof rd === "string" ? rd : format(new Date(rd), "yyyy-MM-dd");
    }

    if (!countRes.error && countRes.count !== null) {
      readingsThisMonth = countRes.count;
    }
  } catch {
    lastReadingDate = null;
    readingsThisMonth = 0;
  }

  return NextResponse.json({
    patient: data,
    lastReadingDate,
    readingsThisMonth,
  });
}
