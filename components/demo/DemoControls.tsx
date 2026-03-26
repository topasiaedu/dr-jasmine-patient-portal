"use client";

import { useState, useEffect } from "react";
import { Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function DemoControls() {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<string>("onboarding");

  useEffect(() => {
    // Read current status
    const current = localStorage.getItem("demo_patient_status") || "onboarding";
    setStatus(current);
  }, []);

  const handleStatusChange = (newStatus: string) => {
    localStorage.setItem("demo_patient_status", newStatus);
    setStatus(newStatus);
    window.location.href = "/p/demo";
  };

  const handleReset = () => {
    localStorage.clear();
    window.location.href = "/p/demo";
  };

  if (expanded) {
    return (
      <div className="fixed bottom-20 right-4 z-50 w-64 bg-white rounded-xl shadow-xl border border-border p-4 animate-in slide-in-from-bottom-2 fade-in">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold uppercase tracking-wider text-secondary">
            Demo Controls
          </span>
          <button
            onClick={() => setExpanded(false)}
            className="text-secondary hover:text-main"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-xs font-medium text-main mb-1">Patient Status</p>
          <div className="grid grid-cols-1 gap-2">
            {["onboarding", "booked", "active"].map((s) => (
              <Button
                key={s}
                variant={status === s ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusChange(s)}
                className={cn("justify-start capitalize", status === s && "bg-primary hover:bg-primary-hover")}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-border">
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={handleReset}
          >
            Reset All Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setExpanded(true)}
      className="fixed bottom-20 right-4 z-50 flex items-center gap-2 bg-white rounded-full shadow-lg border border-border px-4 py-2 text-sm font-semibold text-main hover:bg-gray-50 transition-colors"
    >
      <span>Demo</span>
      <Settings size={16} />
    </button>
  );
}
