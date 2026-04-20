import { NextRequest, NextResponse } from "next/server";
import {
  patientSessionCookieName,
  patientSessionCookieOptions,
  signPatientSession,
} from "@/lib/auth/patient-session";
import { ghlGetContact } from "@/lib/integrations/ghl-v2";
import { rateLimit } from "@/lib/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  isServiceRoleEnvConfigured,
  serviceRoleEnvMissingResponse,
} from "@/lib/supabase/service-role-env";
interface EstablishBody {
  ghlContactId?: string;
}

/**
 * Creates or loads the Supabase patient row for a GHL contact id, then sets the signed
 * patient session cookie. Phase 1: no GHL workflows or outbound email from this app.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limited = rateLimit(`establish:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: EstablishBody;
  try {
    body = (await request.json()) as EstablishBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ghlContactId = body.ghlContactId;
  if (typeof ghlContactId !== "string" || ghlContactId.length === 0) {
    return NextResponse.json({ error: "Missing ghlContactId" }, { status: 400 });
  }

  if (!isServiceRoleEnvConfigured()) {
    return serviceRoleEnvMissingResponse();
  }

  const supabase = createServiceRoleClient();

  const existing = await supabase
    .from("patients")
    .select("id")
    .eq("ghl_contact_id", ghlContactId)
    .maybeSingle();

  if (existing.error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  let patientId: string;

  if (existing.data?.id) {
    patientId = existing.data.id;
  } else {
    let contact;
    try {
      contact = await ghlGetContact(ghlContactId);
    } catch (e) {
      const message = e instanceof Error ? e.message : "GHL error";
      return NextResponse.json({ error: message }, { status: 502 });
    }
    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const fullName = `${contact.firstName} ${contact.lastName}`.trim() || "Patient";
    const email =
      typeof contact.email === "string" && contact.email.length > 0
        ? contact.email
        : `contact-${ghlContactId}@patients.placeholder.drjasmine`;
    const phone = typeof contact.phone === "string" ? contact.phone : "";

    const inserted = await supabase
      .from("patients")
      .insert({
        ghl_contact_id: ghlContactId,
        full_name: fullName,
        email,
        phone,
        status: "active",
      })
      .select("id")
      .single();

    if (inserted.error || !inserted.data?.id) {
      return NextResponse.json({ error: "Could not create patient record" }, { status: 500 });
    }
    patientId = inserted.data.id;
  }

  let token: string;
  try {
    token = await signPatientSession({
      ghlContactId,
      patientId,
      issuedAt: Date.now(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Session error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true, patientId });
  const cookieOpts = patientSessionCookieOptions();
  res.cookies.set(patientSessionCookieName(), token, cookieOpts);
  return res;
}
