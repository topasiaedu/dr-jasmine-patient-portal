import { NextRequest, NextResponse } from "next/server";
import { resolvePatientFromRequest } from "@/lib/auth/resolve-patient-request";
import { createServiceRoleClient } from "@/lib/supabase/admin";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Submits one daily reading set for the authenticated patient.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const resolved = await resolvePatientFromRequest(request);
  if (!resolved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let bodyUnknown: unknown;
  try {
    bodyUnknown = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isRecord(bodyUnknown)) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const readingDate = bodyUnknown.readingDate;
  if (typeof readingDate !== "string" || !isValidDateString(readingDate)) {
    return NextResponse.json({ error: "Invalid readingDate" }, { status: 400 });
  }

  const numericKeys = [
    "fastingBloodSugar",
    "postDinnerBloodSugar",
    "bloodPressureSystolic",
    "bloodPressureDiastolic",
    "pulseRate",
    "weightKg",
    "waistlineCm",
  ] as const;

  const nums: Record<(typeof numericKeys)[number], number> = {
    fastingBloodSugar: 0,
    postDinnerBloodSugar: 0,
    bloodPressureSystolic: 0,
    bloodPressureDiastolic: 0,
    pulseRate: 0,
    weightKg: 0,
    waistlineCm: 0,
  };

  for (const key of numericKeys) {
    const value = bodyUnknown[key];
    if (typeof value !== "number" || Number.isNaN(value)) {
      return NextResponse.json({ error: "Invalid numeric field" }, { status: 400 });
    }
    nums[key] = value;
  }

  const overwrite = bodyUnknown.overwrite === true;
  const entryMethodRaw = bodyUnknown.entryMethod;
  const entryMethod: "manual" | "photo_extracted" =
    entryMethodRaw === "photo_extracted" ? "photo_extracted" : "manual";

  const supabase = createServiceRoleClient();

  const existing = await supabase
    .from("daily_readings")
    .select("id")
    .eq("patient_id", resolved.patientId)
    .eq("reading_date", readingDate)
    .maybeSingle();

  if (existing.error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  if (existing.data?.id && overwrite !== true) {
    return NextResponse.json(
      { error: "Duplicate date", code: "duplicate" },
      { status: 409 }
    );
  }

  const row = {
    patient_id: resolved.patientId,
    reading_date: readingDate,
    fasting_blood_sugar: nums.fastingBloodSugar,
    post_dinner_blood_sugar: nums.postDinnerBloodSugar,
    blood_pressure_systolic: nums.bloodPressureSystolic,
    blood_pressure_diastolic: nums.bloodPressureDiastolic,
    pulse_rate: nums.pulseRate,
    weight_kg: nums.weightKg,
    waistline_cm: nums.waistlineCm,
    entry_method: entryMethod,
  };

  if (existing.data?.id && overwrite === true) {
    const updated = await supabase
      .from("daily_readings")
      .update({
        fasting_blood_sugar: row.fasting_blood_sugar,
        post_dinner_blood_sugar: row.post_dinner_blood_sugar,
        blood_pressure_systolic: row.blood_pressure_systolic,
        blood_pressure_diastolic: row.blood_pressure_diastolic,
        pulse_rate: row.pulse_rate,
        weight_kg: row.weight_kg,
        waistline_cm: row.waistline_cm,
        entry_method: entryMethod,
      })
      .eq("id", existing.data.id)
      .select("id")
      .single();
    if (updated.error || !updated.data) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: updated.data.id, mode: "updated" });
  }

  const inserted = await supabase.from("daily_readings").insert(row).select("id").single();
  if (inserted.error || !inserted.data) {
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: inserted.data.id, mode: "created" });
}
