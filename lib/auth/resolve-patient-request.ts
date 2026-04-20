import type { NextRequest } from "next/server";
import { PATIENT_SESSION_COOKIE_NAME } from "@/lib/constants/cookies";
import { verifyPatientSession } from "@/lib/auth/patient-session";

export interface ResolvedPatient {
  patientId: string;
  ghlContactId: string;
}

/**
 * Reads and verifies the patient session cookie from an incoming Route Handler request.
 */
export async function resolvePatientFromRequest(
  request: NextRequest
): Promise<ResolvedPatient | null> {
  const raw = request.cookies.get(PATIENT_SESSION_COOKIE_NAME)?.value;
  if (typeof raw !== "string" || raw.length === 0) {
    return null;
  }
  const session = await verifyPatientSession(raw);
  if (!session) {
    return null;
  }
  return { patientId: session.patientId, ghlContactId: session.ghlContactId };
}
