"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

/** Log success page — shown after patient submits daily readings. */
export default function LogSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const ghlContactId = typeof params?.ghlContactId === "string" ? params.ghlContactId : "";
  const homeHref = ghlContactId.length > 0 ? `/p/${ghlContactId}/home` : "/";
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const delay = setTimeout(() => {
      const int = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(int);
            router.replace(homeHref);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(int);
    }, 600);

    return () => clearTimeout(delay);
  }, [router, homeHref]);

  /** Four-direction confetti anchors for quiet luxury celebration burst. */
  const confettiDots = [
    {
      id: "top",
      x: 0,
      y: -12,
      className: "top-0 left-1/2 -translate-x-1/2 -translate-y-2 bg-primary",
      delay: 0,
    },
    {
      id: "right",
      x: 12,
      y: 0,
      className: "top-1/2 right-0 translate-x-2 -translate-y-1/2 bg-[color:var(--color-accent-gold)]",
      delay: 0.06,
    },
    {
      id: "bottom",
      x: 0,
      y: 12,
      className: "bottom-0 left-1/2 -translate-x-1/2 translate-y-2 bg-primary",
      delay: 0.12,
    },
    {
      id: "left",
      x: -12,
      y: 0,
      className: "top-1/2 left-0 -translate-x-2 -translate-y-1/2 bg-[color:var(--color-accent-gold)]",
      delay: 0.18,
    },
  ];

  return (
    <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center p-6 max-w-sm mx-auto text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="relative w-24 h-24 mb-6 rounded-full bg-primary-light flex items-center justify-center shadow-card"
      >
        <CheckCircle2 size={64} className="text-primary" />
        {confettiDots.map((dot) => (
          <motion.div
            key={dot.id}
            className={`absolute h-[3px] w-[3px] rounded-full ${dot.className}`}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1, 1], x: dot.x, y: dot.y }}
            transition={{ duration: 0.7, ease: "easeOut", delay: dot.delay }}
          />
        ))}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="text-[40px] leading-none font-display text-main mb-3"
      >
        Done!
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.4 }}
        className="text-text-secondary text-lg mb-12"
      >
        Dr. Jasmine will review your readings.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 0.85, y: 0 }}
        transition={{ duration: 0.35, delay: 0.6 }}
        className="text-text-tertiary text-sm font-medium mb-6"
      >
        Returning home in {countdown}s...
      </motion.div>

      <Link
        href={homeHref}
        className="text-primary font-medium hover:underline"
      >
        Go home now
      </Link>
    </div>
  );
}
