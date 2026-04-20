import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  patientSessionCookieName,
  verifyPatientSession,
} from "@/lib/auth/patient-session";

/**
 * Refreshes Supabase auth cookies for the admin session and enforces admin + patient access.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  /** Legacy demo routes — redirect to canonical demo GHL id path for local testing. */
  if (pathname === "/p/demo" || pathname.startsWith("/p/demo/")) {
    const suffix = pathname.replace(/^\/p\/demo/, "") || "/home";
    const url = request.nextUrl.clone();
    url.pathname = `/p/ghl-demo${suffix}`;
    return NextResponse.redirect(url);
  }

  const supabaseResponse = NextResponse.next({ request });

  if (pathname.startsWith("/admin")) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (typeof url !== "string" || typeof anon !== "string") {
      return supabaseResponse;
    }

    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    await supabase.auth.getUser();

    if (pathname !== "/admin/login" && pathname.startsWith("/admin")) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/admin/login";
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    if (pathname === "/admin/login") {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const dash = request.nextUrl.clone();
        dash.pathname = "/admin/dashboard";
        return NextResponse.redirect(dash);
      }
    }

    return supabaseResponse;
  }

  if (pathname.startsWith("/p/")) {
    const segments = pathname.split("/").filter(Boolean);
    const ghlContactId = segments[1];
    if (!ghlContactId || ghlContactId.length === 0) {
      return NextResponse.next();
    }

    const isSetup = pathname === `/p/${ghlContactId}/setup` || pathname.startsWith(`/p/${ghlContactId}/setup/`);

    if (isSetup) {
      return supabaseResponse;
    }

    const cookieName = patientSessionCookieName();
    const raw = request.cookies.get(cookieName)?.value;
    if (!raw) {
      const setupUrl = request.nextUrl.clone();
      setupUrl.pathname = `/p/${ghlContactId}/setup`;
      setupUrl.search = "";
      return NextResponse.redirect(setupUrl);
    }

    const session = await verifyPatientSession(raw);
    if (!session || session.ghlContactId !== ghlContactId) {
      const setupUrl = request.nextUrl.clone();
      setupUrl.pathname = `/p/${ghlContactId}/setup`;
      setupUrl.search = "";
      const res = NextResponse.redirect(setupUrl);
      res.cookies.delete(cookieName);
      return res;
    }

    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/p/:path*",
  ],
};
