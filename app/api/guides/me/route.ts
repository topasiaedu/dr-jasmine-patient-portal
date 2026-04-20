import { NextRequest, NextResponse } from "next/server";
import { resolvePatientFromRequest } from "@/lib/auth/resolve-patient-request";
import { mapPatientGuideRow, type PatientGuideRow } from "@/lib/guide/map-db-row";
import { createServiceRoleClient } from "@/lib/supabase/admin";

/**
 * Returns the authenticated patient's guide, or `{ guide: null }` if none exists yet.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const resolved = await resolvePatientFromRequest(request);
  if (!resolved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("patient_guides")
    .select("*")
    .eq("patient_id", resolved.patientId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ guide: null });
  }

  const guide = mapPatientGuideRow(data as PatientGuideRow);
  return NextResponse.json({ guide });
}
