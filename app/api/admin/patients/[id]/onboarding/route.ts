import { NextRequest, NextResponse } from "next/server";
import { getAdminUserForRequest } from "@/lib/supabase/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

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
 * Latest onboarding response for a patient (admin only).
 */
export interface AdminOnboardingJson {
  id: string;
  patient_id: string;
  chief_complaint: string;
  existing_conditions: string[];
  current_medications: string[];
  allergies: string[];
  smoking_status: string;
  alcohol_use: string;
  activity_level: string;
  dietary_notes: string;
  additional_notes: string;
  submitted_at: string;
}

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
    .from("onboarding_responses")
    .select(
      "id, patient_id, chief_complaint, existing_conditions, current_medications, allergies, smoking_status, alcohol_use, activity_level, dietary_notes, additional_notes, submitted_at"
    )
    .eq("patient_id", id)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  const out = NextResponse.json({ onboarding: data });
  mergeSupabaseCookies(authShell, out);
  return out;
}
