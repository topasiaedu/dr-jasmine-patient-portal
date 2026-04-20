import { NextResponse } from "next/server";

/**
 * Returns true when service-role API routes can call `createServiceRoleClient()`.
 * Used to avoid throwing before JSON error responses when `.env.local` is incomplete.
 */
export function isServiceRoleEnvConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return typeof url === "string" && url.length > 0 && typeof key === "string" && key.length > 0;
}

/**
 * JSON response when DB env vars are missing (local dev or misconfigured deploy).
 */
export function serviceRoleEnvMissingResponse(): NextResponse {
  return NextResponse.json(
    {
      error:
        "Portal database is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local (see .env.example).",
    },
    { status: 503 }
  );
}
