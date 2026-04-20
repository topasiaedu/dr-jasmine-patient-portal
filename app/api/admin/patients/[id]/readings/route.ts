import { NextRequest, NextResponse } from "next/server";
import { getAdminUserForRequest } from "@/lib/supabase/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { AdminReadingJson } from "@/lib/types/admin-reading";

function mergeSupabaseCookies(from: NextResponse, to: NextResponse): void {
  from.cookies.getAll().forEach((c) => {
    to.cookies.set(c.name, c.value);
  });
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

/**
 * Lists daily readings for a patient (admin only).
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authShell = NextResponse.json({ ok: true });
  const user = await getAdminUserForRequest(request, authShell);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("daily_readings")
    .select(
      "id, patient_id, reading_date, fasting_blood_sugar, post_dinner_blood_sugar, blood_pressure_systolic, blood_pressure_diastolic, pulse_rate, weight_kg, waistline_cm, entry_method, submitted_at"
    )
    .eq("patient_id", id)
    .order("reading_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  const readings: AdminReadingJson[] = (data ?? []).map((row) => ({
    id: row.id,
    patientId: row.patient_id,
    readingDate: row.reading_date,
    fastingBloodSugar: Number(row.fasting_blood_sugar),
    postDinnerBloodSugar: Number(row.post_dinner_blood_sugar),
    bloodPressureSystolic: row.blood_pressure_systolic,
    bloodPressureDiastolic: row.blood_pressure_diastolic,
    pulseRate: row.pulse_rate,
    weightKg: Number(row.weight_kg),
    waistlineCm: Number(row.waistline_cm),
    entryMethod: row.entry_method === "photo_extracted" ? "photo_extracted" : "manual",
    submittedAt: row.submitted_at,
  }));

  const out = NextResponse.json({ readings });
  mergeSupabaseCookies(authShell, out);
  return out;
}
