"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DemoPatientEntry() {
  const router = useRouter();

  useEffect(() => {
    const status = localStorage.getItem("demo_patient_status") || "onboarding";
    
    if (status === "onboarding") {
      router.replace("/p/demo/onboarding");
    } else if (status === "booked") {
      router.replace("/p/demo/pending");
    } else if (status === "active") {
      router.replace("/p/demo/home");
    } else {
      router.replace("/p/demo/onboarding");
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-app">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-secondary text-sm">Loading demo...</p>
      </div>
    </div>
  );
}
