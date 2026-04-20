import { NextRequest, NextResponse } from "next/server";
import { mapPatientGuideRow, type PatientGuideRow } from "@/lib/guide/map-db-row";
import { parseGuideWritePayload } from "@/lib/guide/validate-payload";
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
 * Fetches a patient's guide for the admin UI.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ patientId: string }> }
): Promise<NextResponse> {
  const authShell = NextResponse.json({ ok: true });
  const user = await getAdminUserForRequest(request, authShell);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { patientId } = await context.params;
  if (!isUuid(patientId)) {
    return NextResponse.json({ error: "Invalid patient id" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("patient_guides")
    .select("*")
    .eq("patient_id", patientId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  const out = NextResponse.json({
    guide: data ? mapPatientGuideRow(data as PatientGuideRow) : null,
  });
  mergeSupabaseCookies(authShell, out);
  return out;
}

/**
 * Creates or replaces a patient's guide (admin only).
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ patientId: string }> }
): Promise<NextResponse> {
  const authShell = NextResponse.json({ ok: true });
  const user = await getAdminUserForRequest(request, authShell);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { patientId } = await context.params;
  if (!isUuid(patientId)) {
    return NextResponse.json({ error: "Invalid patient id" }, { status: 400 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = parseGuideWritePayload(raw);
  if (!payload) {
    return NextResponse.json({ error: "Invalid guide payload" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const patientCheck = await supabase.from("patients").select("id").eq("id", patientId).maybeSingle();
  if (patientCheck.error || !patientCheck.data) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const row = {
    patient_id: patientId,
    title: payload.title,
    no_list: payload.noList,
    yes_categories: payload.yesCategories,
    snacks: payload.snacks,
    replacements: payload.replacements,
    portions: payload.portions,
    cooking_methods: payload.cookingMethods,
    additional_sections: payload.additionalSections,
  };

  const upserted = await supabase
    .from("patient_guides")
    .upsert(row, { onConflict: "patient_id" })
    .select("*")
    .single();

  if (upserted.error || !upserted.data) {
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }

  const out = NextResponse.json({ guide: mapPatientGuideRow(upserted.data as PatientGuideRow) });
  mergeSupabaseCookies(authShell, out);
  return out;
}
