"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MotionStepProps {
  children: React.ReactNode;
  className?: string;
  direction: 1 | -1;
  stepKey: string | number;
}

/**
 * Handles directional transitions for multi-step flows.
 */
export function MotionStep({
  children,
  className,
  direction,
  stepKey,
}: MotionStepProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={{ x: direction === 1 ? 80 : -80, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1,
          transition: { type: "spring", stiffness: 300, damping: 30 },
        }}
        exit={{
          x: direction === 1 ? -80 : 80,
          opacity: 0,
          transition: { type: "spring", stiffness: 300, damping: 30 },
        }}
        className={cn(className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
