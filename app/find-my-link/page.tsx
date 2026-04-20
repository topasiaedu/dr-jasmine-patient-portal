"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Link recovery — Phase 1: informational response only (no app-triggered GHL workflows).
 */
export default function FindMyLinkPage(): React.ReactElement {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/find-my-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const dataUnknown: unknown = await res.json().catch(() => ({}));
      const msg =
        typeof dataUnknown === "object" &&
        dataUnknown !== null &&
        "message" in dataUnknown &&
        typeof (dataUnknown as { message: unknown }).message === "string"
          ? (dataUnknown as { message: string }).message
          : "If we have an account for this email, please check your inbox or contact the clinic.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[20px] shadow-card border border-[rgba(28,25,23,0.06)] p-8">
        <h1
          className="text-2xl text-primary text-center mb-2"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Find my link
        </h1>
        <p className="text-sm text-text-secondary text-center mb-6">
          Enter the email we have on file. We will show next steps (no password required).
        </p>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-12"
            autoComplete="email"
          />
          <Button type="submit" className="w-full h-12 font-semibold" disabled={loading}>
            {loading ? "Please wait…" : "Continue"}
          </Button>
        </form>
        {message ? (
          <p className="mt-6 text-sm text-text-secondary text-center leading-relaxed">{message}</p>
        ) : null}
        <p className="mt-8 text-center text-sm">
          <Link href="/" className="text-primary font-medium hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
