"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * First-visit provisioning: creates Supabase patient from GHL (if needed) and sets session cookie.
 */
export default function PatientSetupPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const ghlContactId = typeof params?.ghlContactId === "string" ? params.ghlContactId : "";
  const [message, setMessage] = useState("We are getting things ready for you…");

  useEffect(() => {
    if (ghlContactId.length === 0) {
      toast.error("Invalid link.");
      return;
    }

    let cancelled = false;

    const run = async (): Promise<void> => {
      const res = await fetch("/api/patient/establish-session", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ghlContactId }),
      });
      if (cancelled) {
        return;
      }
      if (!res.ok) {
        const bodyUnknown: unknown = await res.json().catch(() => ({}));
        const err =
          typeof bodyUnknown === "object" &&
          bodyUnknown !== null &&
          "error" in bodyUnknown &&
          typeof (bodyUnknown as { error: unknown }).error === "string"
            ? (bodyUnknown as { error: string }).error
            : "We could not open your portal yet. Please try again or contact the clinic.";
        setMessage(err);
        toast.error(err);
        return;
      }
      router.replace(`/p/${ghlContactId}/home`);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [ghlContactId, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] px-6 text-center">
      <div
        className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin mb-6"
        aria-hidden="true"
      />
      <p className="text-lg text-[#44403C] max-w-sm leading-relaxed">{message}</p>
    </div>
  );
}
