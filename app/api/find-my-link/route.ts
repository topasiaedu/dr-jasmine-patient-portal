import { NextRequest, NextResponse } from "next/server";
import { ghlSearchContacts } from "@/lib/integrations/ghl-v2";
import { rateLimit } from "@/lib/rate-limit";

interface FindBody {
  email?: string;
}

/**
 * Phase 1: does not trigger GHL workflows or send email from this app. Performs a
 * best-effort lookup for logging only; response is always generic to avoid email
 * enumeration.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limited = rateLimit(`findlink:${ip}`, 15, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: FindBody;
  try {
    body = (await request.json()) as FindBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length === 0 || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    await ghlSearchContacts(email);
  } catch {
    /* ignore lookup failures — same user-facing message */
  }

  return NextResponse.json({
    ok: true,
    message:
      "If we have an account for this email, please use the portal link from your Metanova email or contact the clinic for help.",
  });
}
