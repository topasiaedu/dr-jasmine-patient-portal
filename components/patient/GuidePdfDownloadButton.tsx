"use client";

import { useState, type ReactElement } from "react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import type { PatientGuideContent } from "@/lib/types/patient-guide";
import { GuidePdfDocument } from "@/components/patient/GuidePdfDocument";

export interface GuidePdfDownloadButtonProps {
  guide: PatientGuideContent;
}

/**
 * Builds a PDF in the browser and triggers a download.
 */
export function GuidePdfDownloadButton({ guide }: GuidePdfDownloadButtonProps): ReactElement {
  const [busy, setBusy] = useState(false);

  const handleClick = async (): Promise<void> => {
    setBusy(true);
    try {
      const blob = await pdf(<GuidePdfDocument guide={guide} />).toBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const safeDate = guide.updatedAt.slice(0, 10);
      anchor.download = `dr-jasmine-guide-${safeDate}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button type="button" variant="outline" onClick={() => void handleClick()} disabled={busy}>
      {busy ? "Preparing PDF…" : "Download PDF"}
    </Button>
  );
}
