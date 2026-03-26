"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

/** Admin login page — warm branded design with DM Serif Display header. */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("admin_auth", "true");
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
      {/* Branded login card */}
      <div className="w-full max-w-md bg-white rounded-[20px] shadow-card-elevated border border-[rgba(28,25,23,0.06)] p-8 md:p-10">
        {/* Brand moment — DM Serif Display */}
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
          <p className="text-[#78716C] text-base">
            Sign in to manage your patients.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1C1917] mb-1.5">
              Email
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="drjasmine@clinic.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1C1917] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Teal gradient sign-in button */}
          <Button
            type="submit"
            variant="default"
            size="patient"
            className="w-full mt-2"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-[#78716C] bg-[#EDE8E1] p-3 rounded-xl border border-[#E5DFD8]">
          <p className="font-semibold text-[#1C1917] mb-0.5">Demo Mode</p>
          <p>Any email/password will work.</p>
        </div>
      </div>
    </div>
  );
}
