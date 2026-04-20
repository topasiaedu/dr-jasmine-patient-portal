"use client";

import { usePathname } from "next/navigation";
import { BookOpen, ClipboardList, Home } from "lucide-react";
import { PatientPageLayout } from "@/components/patient/PatientPageLayout";

interface PatientPortalChromeProps {
  ghlContactId: string;
  children: React.ReactNode;
}

/**
 * Wraps authenticated patient routes with shared chrome; `/setup` stays minimal (no nav).
 */
export function PatientPortalChrome({
  ghlContactId,
  children,
}: PatientPortalChromeProps): React.ReactElement {
  const pathname = usePathname() ?? "";
  const base = `/p/${ghlContactId}`;
  if (pathname === `${base}/setup` || pathname.startsWith(`${base}/setup/`)) {
    return <>{children}</>;
  }

  const tabs = [
    { label: "Home", href: `${base}/home`, icon: Home },
    { label: "Log", href: `${base}/log`, icon: ClipboardList },
    { label: "Guide", href: `${base}/guide`, icon: BookOpen },
  ];

  return (
    <PatientPageLayout activePath={pathname} tabs={tabs} showDemoControls={false}>
      {children}
    </PatientPageLayout>
  );
}
