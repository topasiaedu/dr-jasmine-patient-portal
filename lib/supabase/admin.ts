import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client with service role. Bypasses RLS — use only in Route Handlers
 * or Server Actions after auth checks.
 */
export function createServiceRoleClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (typeof url !== "string" || url.length === 0) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  if (typeof key !== "string" || key.length === 0) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
