import { NextRequest, NextResponse } from "next/server";
import { ghlCreateContact } from "@/lib/integrations/ghl-v2";
import { splitFullName } from "@/lib/patient/split-full-name";
import { getAdminUserForRequest } from "@/lib/supabase/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

interface CreatePatientBody {
  fullName?: string;
  phone?: string;
  email?: string;
  readingCadenceNote?: string;
}

function mergeSupabaseCookies(from: NextResponse, to: NextResponse): void {
  from.cookies.getAll().forEach((c) => {
    to.cookies.set(c.name, c.value);
  });
}

/**
 * Lists patients (admin only).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authShell = NextResponse.json({ ok: true });
  const user = await getAdminUserForRequest(request, authShell);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("patients")
    .select(
      "id, ghl_contact_id, full_name, email, phone, reading_cadence_note, status, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  const { data: readingsRows } = await supabase
    .from("daily_readings")
    .select("patient_id, reading_date")
    .order("reading_date", { ascending: false });

  const latestByPatient = new Map<string, string>();
  if (readingsRows) {
    for (const row of readingsRows) {
      const pid = row.patient_id;
      const rd = row.reading_date;
      if (typeof pid !== "string") {
        continue;
      }
      if (latestByPatient.has(pid)) {
        continue;
      }
      if (typeof rd === "string") {
        latestByPatient.set(pid, rd);
      } else if (rd instanceof Date) {
        latestByPatient.set(pid, rd.toISOString().slice(0, 10));
      }
    }
  }

  const merged = (data ?? []).map((row) => {
    const id = typeof row.id === "string" ? row.id : "";
    const last = id.length > 0 ? latestByPatient.get(id) : undefined;
    return {
      ...row,
      last_reading_date: last ?? null,
    };
  });

  const out = NextResponse.json({ patients: merged });
  mergeSupabaseCookies(authShell, out);
  return out;
}

/**
 * Creates GHL contact + Supabase patient (admin only).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authShell = NextResponse.json({ ok: true });
  const user = await getAdminUserForRequest(request, authShell);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreatePatientBody;
  try {
    body = (await request.json()) as CreatePatientBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const emailRaw = typeof body.email === "string" ? body.email.trim() : "";

  if (fullName.length === 0 || phone.length === 0) {
    return NextResponse.json({ error: "fullName and phone are required" }, { status: 400 });
  }

  const email =
    emailRaw.length > 0
      ? emailRaw
      : `patient-${Date.now()}@patients.placeholder.drjasmine`;

  const { firstName, lastName } = splitFullName(fullName);

  let contact;
  try {
    contact = await ghlCreateContact({ firstName, lastName, email, phone });
  } catch (e) {
    const message = e instanceof Error ? e.message : "GHL error";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const readingCadenceNote =
    typeof body.readingCadenceNote === "string" && body.readingCadenceNote.trim().length > 0
      ? body.readingCadenceNote.trim()
      : null;

  const supabase = createServiceRoleClient();
  const inserted = await supabase
    .from("patients")
    .insert({
      ghl_contact_id: contact.id,
      full_name: fullName,
      email,
      phone,
      reading_cadence_note: readingCadenceNote,
      status: "active",
    })
    .select("id, ghl_contact_id, full_name, email, phone, status, created_at")
    .single();

  if (inserted.error || !inserted.data) {
    return NextResponse.json({ error: "Could not save patient" }, { status: 500 });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const portalUrl = `${base}/p/${inserted.data.ghl_contact_id}`;

  const out = NextResponse.json({
    patient: inserted.data,
    portalUrl,
  });
  mergeSupabaseCookies(authShell, out);
  return out;
}
