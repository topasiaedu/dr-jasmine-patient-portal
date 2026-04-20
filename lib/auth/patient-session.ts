import { SignJWT, jwtVerify } from "jose";
import { PATIENT_SESSION_COOKIE_NAME } from "@/lib/constants/cookies";

/** Signed cookie payload per docs/03-authentication.md */
export interface PatientSessionPayload {
  ghlContactId: string;
  patientId: string;
  issuedAt: number;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.COOKIE_SECRET;
  if (typeof secret !== "string" || secret.length < 32) {
    throw new Error("COOKIE_SECRET must be set and at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Creates a compact signed JWT for the patient session cookie.
 */
export async function signPatientSession(payload: PatientSessionPayload): Promise<string> {
  const key = getSecretKey();
  return new SignJWT({
    ghlContactId: payload.ghlContactId,
    patientId: payload.patientId,
    issuedAt: payload.issuedAt,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(key);
}

/**
 * Verifies JWT and returns payload, or null if invalid / expired.
 */
export async function verifyPatientSession(
  token: string
): Promise<PatientSessionPayload | null> {
  try {
    const key = getSecretKey();
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    const ghlContactId = payload["ghlContactId"];
    const patientId = payload["patientId"];
    const issuedAt = payload["issuedAt"];
    if (
      typeof ghlContactId !== "string" ||
      typeof patientId !== "string" ||
      typeof issuedAt !== "number"
    ) {
      return null;
    }
    return { ghlContactId, patientId, issuedAt };
  } catch {
    return null;
  }
}

export function patientSessionCookieName(): typeof PATIENT_SESSION_COOKIE_NAME {
  return PATIENT_SESSION_COOKIE_NAME;
}

/**
 * Build Set-Cookie header value attributes (name=value handled by caller).
 *
 * Path must be **`/`** so the browser includes this cookie on **`/api/*`** requests
 * (`/api/patient/me`, `/api/readings`, `/api/guides/me`). A path like `/p/<id>` would
 * exclude `/api` and break patient APIs. URL + JWT `ghlContactId` still prevent
 * cross-patient access in middleware and handlers.
 */
export function patientSessionCookieOptions(): {
  path: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict";
  maxAge: number;
} {
  const secure =
    process.env.PATIENT_COOKIE_SECURE !== "false" &&
    process.env.NODE_ENV === "production";
  return {
    path: "/",
    httpOnly: true,
    secure,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 365,
  };
}
