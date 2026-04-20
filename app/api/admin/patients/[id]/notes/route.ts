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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export interface ConsultNoteJson {
  id: string;
  patientId: string;
  appointmentId: string | null;
  privateContent: string;
  forPatientContent: string;
  createdAt: string;
  updatedAt: string;
}

function parseStoredContent(raw: string): { private: string; forPatient: string } {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isRecord(parsed) && "private" in parsed) {
      const priv = Reflect.get(parsed, "private");
      const fp = Reflect.get(parsed, "forPatient");
      return {
        private: typeof priv === "string" ? priv : "",
        forPatient: typeof fp === "string" ? fp : "",
      };
    }
  } catch {
    /* legacy plain text */
  }
  return { private: raw, forPatient: "" };
}

function rowToJson(row: {
  id: string;
  patient_id: string;
  appointment_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}): ConsultNoteJson {
  const parsed = parseStoredContent(row.content);
  return {
    id: row.id,
    patientId: row.patient_id,
    appointmentId: row.appointment_id,
    privateContent: parsed.private,
    forPatientContent: parsed.forPatient,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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
    .from("consultation_notes")
    .select("id, patient_id, appointment_id, content, created_at, updated_at")
    .eq("patient_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  const notes: ConsultNoteJson[] = (data ?? []).map((row) =>
    rowToJson({
      id: row.id,
      patient_id: row.patient_id,
      appointment_id: row.appointment_id,
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })
  );

  const out = NextResponse.json({ notes });
  mergeSupabaseCookies(authShell, out);
  return out;
}

export async function POST(
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

  let bodyUnknown: unknown;
  try {
    bodyUnknown = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isRecord(bodyUnknown)) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const privateRaw = Reflect.get(bodyUnknown, "privateContent");
  const patientRaw = Reflect.get(bodyUnknown, "forPatientContent");
  const noteIdRaw = Reflect.get(bodyUnknown, "noteId");

  /** Only update a field when it was explicitly included in the request body. */
  const hasPrivate = "privateContent" in (bodyUnknown as object);
  const hasForPatient = "forPatientContent" in (bodyUnknown as object);

  const privateContent = typeof privateRaw === "string" ? privateRaw : "";
  const forPatientContent = typeof patientRaw === "string" ? patientRaw : "";

  const noteId =
    typeof noteIdRaw === "string" && isUuid(noteIdRaw) ? noteIdRaw : undefined;

  const supabase = createServiceRoleClient();

  if (noteId !== undefined) {
    const { data: existing, error: fetchErr } = await supabase
      .from("consultation_notes")
      .select("id, patient_id, content")
      .eq("id", noteId)
      .maybeSingle();

    if (fetchErr) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    if (!existing || existing.patient_id !== id) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Merge: only overwrite the fields that were present in this request.
    const stored = parseStoredContent(existing.content);
    const mergedPrivate = hasPrivate ? privateContent : stored.private;
    const mergedForPatient = hasForPatient ? forPatientContent : stored.forPatient;

    const contentJson = JSON.stringify({
      private: mergedPrivate,
      forPatient: mergedForPatient,
    });

    const { data: updated, error: updErr } = await supabase
      .from("consultation_notes")
      .update({ content: contentJson })
      .eq("id", noteId)
      .select("id, patient_id, appointment_id, content, created_at, updated_at")
      .single();

    if (updErr || !updated) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    const note = rowToJson({
      id: updated.id,
      patient_id: updated.patient_id,
      appointment_id: updated.appointment_id,
      content: updated.content,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    });

    const out = NextResponse.json({ note });
    mergeSupabaseCookies(authShell, out);
    return out;
  }

  // New note — use the provided values (default to "").
  const insertContentJson = JSON.stringify({
    private: hasPrivate ? privateContent : "",
    forPatient: hasForPatient ? forPatientContent : "",
  });

  const { data: inserted, error: insErr } = await supabase
    .from("consultation_notes")
    .insert({
      patient_id: id,
      appointment_id: null,
      content: insertContentJson,
    })
    .select("id, patient_id, appointment_id, content, created_at, updated_at")
    .single();

  if (insErr || !inserted) {
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  const note = rowToJson({
    id: inserted.id,
    patient_id: inserted.patient_id,
    appointment_id: inserted.appointment_id,
    content: inserted.content,
    created_at: inserted.created_at,
    updated_at: inserted.updated_at,
  });

  const out = NextResponse.json({ note });
  mergeSupabaseCookies(authShell, out);
  return out;
}
