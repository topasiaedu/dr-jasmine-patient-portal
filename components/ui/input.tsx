import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

/**
 * Input component with premium warm-tone styling.
 * Resting: warm ivory background with subtle warm border.
 * Focus: white background, forest border, soft forest ring.
 * Sized at h-14 (56px) for patient-facing touch targets.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // Layout & shape
        "h-14 w-full min-w-0 rounded-[14px] px-4 py-1",
        // Warm ivory resting state
        "border-[1.5px] border-[rgba(28,25,23,0.1)] bg-[#FAF8F5]",
        // Typography — 16px minimum to prevent iOS auto-zoom
        "text-base text-[#1C1917] placeholder:text-[#A8A29E]",
        // Transitions & outline reset
        "transition-colors outline-none",
        // Focus — white bg, forest border, soft forest ring
        "focus-visible:border-[#2D5E4C] focus-visible:bg-white focus-visible:ring-3 focus-visible:ring-[rgba(45,94,76,0.08)]",
        // File input
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Validation
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  );
}

export { Input };
