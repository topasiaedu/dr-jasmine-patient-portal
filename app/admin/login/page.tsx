"use client";

import { Suspense, useState, type FormEvent, type ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * Inner form — wrapped in Suspense because `useSearchParams` is dynamic on the client.
 */
function AdminLoginForm(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
        return;
      }
      await router.refresh();
      const redirect = searchParams.get("redirect");
      const dest =
        typeof redirect === "string" &&
        redirect.startsWith("/admin") &&
        !redirect.startsWith("/admin/login")
          ? redirect
          : "/admin/dashboard";
      router.push(dest);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-[20px] shadow-card-elevated border border-[rgba(28,25,23,0.06)] p-8 md:p-10">
      <div className="text-center mb-8">
        <h1
          className="mb-1 text-[32px] leading-none text-[#2D5E4C]"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Dr. Jasmine
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#A8A29E] mb-4">
          Metanova Health
        </p>
        <p className="text-[#78716C] text-base">Sign in to manage your patients.</p>
      </div>

      <form onSubmit={(ev) => void handleLogin(ev)} className="space-y-4">
        {errorMsg ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
            role="alert"
          >
            {errorMsg}
          </div>
        ) : null}
        <div>
          <label className="block text-sm font-semibold text-[#1C1917] mb-1.5" htmlFor="admin-email">
            Email
          </label>
          <Input
            id="admin-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            placeholder="drjasmine@clinic.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1C1917] mb-1.5" htmlFor="admin-password">
            Password
          </label>
          <div className="relative">
            <Input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              placeholder="••••••••"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button type="submit" variant="default" size="patient" className="w-full mt-2" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign In"}
        </Button>
      </form>
    </div>
  );
}

function LoginFallback(): ReactElement {
  return (
    <div className="w-full max-w-md bg-white rounded-[20px] shadow-card-elevated border border-[rgba(28,25,23,0.06)] p-12 text-center text-[#78716C]">
      Loading…
    </div>
  );
}

/** Admin login — Supabase Auth (email + password). */
export default function AdminLoginPage(): ReactElement {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
      <Suspense fallback={<LoginFallback />}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
